"use client";

import * as React from "react";
import * as THREE from "three";
import { createPortal, useFrame } from "@react-three/fiber";
import { OUTFITS, buildPose, type ArmPose, type AvatarConfig, type LegPose } from "./rig";
import { loadAvatar } from "./avatar/loadAvatar";
import { buildBody } from "./avatar/bodyModel";
import { B, BONE_COUNT, P, restWorld } from "./avatar/proportions";
import { toGeometry } from "./avatar/geo";
import { createFabricMaterial, createLeatherMaterial, createSkinMaterial } from "./avatar/materials";
import Head from "./avatar/Head";
import Hand from "./avatar/Hand";

/* eslint-disable react-hooks/immutability --
   three.js ობიექტები (ძვლები, მეშები) განზრახ მუტირებადია: ისინი იცვლება
   მხოლოდ effect-ებსა და useFrame-ში, არასდროს render-ის დროს. */

/* ------------------------------------------------------------------
   ჩონჩხი — ერთხელ იქმნება; bind-ინვერსიები ანალიტიკურად (მოსვენებისას
   ძვლები მხოლოდ გადაადგილებულია, ბრუნვის გარეშე)
------------------------------------------------------------------- */

function createBodyRig() {
  const bones: THREE.Bone[] = Array.from({ length: BONE_COUNT }, (_, i) => {
    const b = new THREE.Bone();
    b.name = `body-${i}`;
    return b;
  });
  const link = (parent: number, child: number, pos: [number, number, number]) => {
    bones[child].position.set(...pos);
    bones[parent].add(bones[child]);
  };
  bones[B.hips].position.set(0, P.hipY, 0);
  link(B.hips, B.spine, [0, P.spineUp, 0]);
  link(B.spine, B.chest, [0, P.chestUp, 0]);
  link(B.chest, B.neck, [0, P.neckUp, P.neckZ]);
  link(B.neck, B.head, [0, P.neckLen, 0]);
  for (const [s, up, tw, lo, fa, ha] of [
    [-1, B.upA, B.twA, B.loA, B.faA, B.haA],
    [1, B.upB, B.twB, B.loB, B.faB, B.haB],
  ] as const) {
    link(B.chest, up, [s * P.shoulderX, P.shoulderY, P.shoulderZ]);
    link(up, tw, [0, 0, 0]);
    link(tw, lo, [0, -P.upperArm, 0]);
    link(lo, fa, [0, -P.lowerArm / 2, 0]);
    link(fa, ha, [0, -P.lowerArm / 2, 0]);
  }
  link(B.hips, B.thA, [-P.hipX, -P.hipDown, 0]);
  link(B.thA, B.shA, [0, -P.thigh, 0]);
  link(B.hips, B.thB, [P.hipX, -P.hipDown, 0]);
  link(B.thB, B.shB, [0, -P.thigh, 0]);

  const rest = restWorld();
  const inverses = rest.map((p) => new THREE.Matrix4().makeTranslation(-p[0], -p[1], -p[2]));
  const skeleton = new THREE.Skeleton(bones, inverses);
  return { bones, skeleton, rest };
}

const damp = (cur: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.damp(cur, target, lambda, dt);

/* ------------------------------------------------------------------
   ავატარი
------------------------------------------------------------------- */

export interface AvatarProps {
  config: AvatarConfig;
  idle?: boolean;
}

const HAIR = "#2f241c";

export default function Avatar({ config, idle = true }: AvatarProps) {
  const data = React.use(loadAvatar());
  const outfit = OUTFITS.find((o) => o.id === config.outfit) ?? OUTFITS[0];
  const formal = outfit.formal;
  const skin = config.skin;

  const rig = React.useMemo(() => createBodyRig(), []);
  const pose = React.useMemo(() => buildPose(config), [config]);

  /* --- მასალები ---------------------------------------------------- */
  const mats = React.useMemo(
    () => ({
      skin: createSkinMaterial(skin, { repeat: 2 }),
      nail: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(skin).lerp(new THREE.Color("#f3d6cf"), 0.55),
        roughness: 0.22,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
      }),
    }),
    [skin],
  );
  const cloth = React.useMemo(() => {
    const top = createFabricMaterial(outfit.top, formal ? "wool" : "knit", formal ? 2 : 3);
    const bottom = createFabricMaterial(outfit.bottom, formal ? "wool" : "twill", 2.5);
    const trim = createFabricMaterial(formal ? "#f1f0eb" : outfit.top, formal ? "twill" : "knit", 6);
    const shirt = createFabricMaterial("#f1f0eb", "twill", 5);
    shirt.side = THREE.DoubleSide;
    const lapel = createFabricMaterial(outfit.top, "wool", 2);
    lapel.side = THREE.DoubleSide;
    lapel.sheen = 0.9;
    const tie = new THREE.MeshPhysicalMaterial({
      color: "#7d2f33",
      roughness: 0.38,
      sheen: 1,
      sheenColor: new THREE.Color("#d97a7a"),
      sheenRoughness: 0.3,
      side: THREE.DoubleSide,
    });
    const button = new THREE.MeshPhysicalMaterial({ color: "#14151a", roughness: 0.25, clearcoat: 1 });
    const shoe = createLeatherMaterial(outfit.shoes, formal);
    const sole = new THREE.MeshStandardMaterial({ color: formal ? "#16161a" : "#e9e5dc", roughness: formal ? 0.55 : 0.8 });
    return { top, bottom, trim, shirt, lapel, tie, button, shoe, sole };
  }, [outfit, formal]);

  React.useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose());
    },
    [mats],
  );
  React.useEffect(
    () => () => {
      Object.values(cloth).forEach((m) => m.dispose());
    },
    [cloth],
  );

  /* --- სხეულის მეშები (კანი + ტანსაცმელი) --------------------------- */
  const body = React.useMemo(() => {
    const g = buildBody(formal);
    const identity = new THREE.Matrix4();
    const make = (geo: THREE.BufferGeometry, name: string) => {
      const m = new THREE.SkinnedMesh(geo);
      m.name = name;
      m.bind(rig.skeleton, identity);
      m.frustumCulled = false;
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    };
    return {
      torso: make(g.torso, "torso"),
      pelvis: make(g.pelvis, "pelvis"),
      legs: g.legs.map((l, i) => make(l, `leg${i}`)),
      arms: g.arms.map((a, i) => make(a, `arm${i}`)),
      sleeves: g.sleeves.map((s, i) => make(s, `sleeve${i}`)),
      neck: make(g.neck, "neck"),
      trim: make(g.trim, "trim"),
      shirtFront: g.shirtFront ? make(g.shirtFront, "shirtFront") : null,
      lapels: g.lapels ? make(g.lapels, "lapels") : null,
      tie: g.tie ? make(g.tie, "tie") : null,
      buttons: g.buttons ? make(g.buttons, "buttons") : null,
    };
  }, [formal, rig]);

  // მასალების მინიჭება (მეშები არ იქმნება თავიდან ფერის შეცვლისას)
  React.useLayoutEffect(() => {
    body.torso.material = cloth.top;
    body.sleeves.forEach((s) => (s.material = cloth.top));
    body.pelvis.material = cloth.bottom;
    body.legs.forEach((l) => (l.material = cloth.bottom));
    body.arms.forEach((a) => (a.material = mats.skin));
    body.neck.material = mats.skin;
    body.trim.material = cloth.trim;
    if (body.shirtFront) body.shirtFront.material = cloth.shirt;
    if (body.lapels) body.lapels.material = cloth.lapel;
    if (body.tie) body.tie.material = cloth.tie;
    if (body.buttons) body.buttons.material = cloth.button;
  }, [body, cloth, mats]);

  const shoeGeo = React.useMemo(() => {
    const s = formal ? data.shoes.formal : data.shoes.casual;
    const upper = toGeometry(s.upper);
    const sole = toGeometry(s.sole);
    const mirror = (g: THREE.BufferGeometry) => {
      const c = g.clone();
      c.scale(-1, 1, 1);
      // არეკვლისას სამკუთხედების რიგი ბრუნდება
      const idx = c.getIndex()!;
      for (let i = 0; i < idx.count; i += 3) {
        const t = idx.getX(i + 1);
        idx.setX(i + 1, idx.getX(i + 2));
        idx.setX(i + 2, t);
      }
      return c;
    };
    return { A: { upper, sole }, B: { upper: mirror(upper), sole: mirror(sole) } };
  }, [data, formal]);

  /* --- ანიმაცია ------------------------------------------------------ */
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const L = 6;
    const t = state.clock.elapsedTime;
    const breath = idle ? Math.sin(t * 1.1) * 0.0055 : 0;
    const sway = idle ? Math.sin(t * 0.58) * 0.011 : 0;
    const b = rig.bones;

    const hips = b[B.hips];
    hips.position.y = damp(hips.position.y, P.hipY + pose.hipY + breath * 0.4, L, dt);
    hips.rotation.z = damp(hips.rotation.z, pose.hipRotZ, L, dt);

    const spine = b[B.spine];
    spine.rotation.x = damp(spine.rotation.x, pose.spine.x, L, dt);
    spine.rotation.y = damp(spine.rotation.y, pose.spine.y + sway * 0.5, L, dt);
    spine.rotation.z = damp(spine.rotation.z, pose.spine.z + sway * 0.25, L, dt);

    const chest = b[B.chest];
    chest.rotation.x = damp(chest.rotation.x, pose.chest.x + breath, L, dt);
    chest.rotation.z = damp(chest.rotation.z, pose.chest.z, L, dt);
    chest.position.y = damp(chest.position.y, P.chestUp + pose.shoulderLift, L, dt);

    b[B.neck].rotation.x = damp(b[B.neck].rotation.x, pose.neck.x, L, dt);
    const head = b[B.head];
    head.rotation.x = damp(head.rotation.x, pose.head.x, L, dt);
    head.rotation.y = damp(head.rotation.y, pose.head.y + sway * 0.35, L, dt);
    head.rotation.z = damp(head.rotation.z, pose.head.z, L, dt);

    const applyArm = (up: number, tw: number, lo: number, fa: number, ha: number, p: ArmPose, side: number) => {
      b[up].rotation.x = damp(b[up].rotation.x, -p.swing, L, dt);
      b[up].rotation.z = damp(b[up].rotation.z, side * p.spread, L, dt);
      b[up].rotation.y = damp(b[up].rotation.y, -side * p.yaw, L, dt);
      b[tw].rotation.y = damp(b[tw].rotation.y, side * (p.upTwist ?? 0), L, dt);
      b[lo].rotation.x = damp(b[lo].rotation.x, -p.elbow, L, dt);
      b[lo].rotation.y = damp(b[lo].rotation.y, side * (p.twist ?? 0), L, dt);
      // წინამხრის ბრუნვა ორ ძვალზე ნაწილდება — კანი არ „იგრიხება“
      const pron = p.palmUp ? side * 1.45 : 0;
      b[fa].rotation.y = damp(b[fa].rotation.y, pron * 0.5, L, dt);
      b[ha].rotation.y = damp(b[ha].rotation.y, pron * 0.5, L, dt);
      b[ha].rotation.x = damp(b[ha].rotation.x, p.wrist ?? 0, L, dt);
      b[ha].rotation.z = damp(b[ha].rotation.z, p.palmUp ? side * -0.12 : 0, L, dt);
    };
    applyArm(B.upA, B.twA, B.loA, B.faA, B.haA, pose.armA, -1);
    applyArm(B.upB, B.twB, B.loB, B.faB, B.haB, pose.armB, 1);

    const applyLeg = (th: number, sh: number, p: LegPose, side: number) => {
      b[th].rotation.x = damp(b[th].rotation.x, p.thigh.x, L, dt);
      b[th].rotation.z = damp(b[th].rotation.z, p.thigh.z, L, dt);
      b[th].rotation.y = damp(b[th].rotation.y, side * (p.thigh.y ?? 0), L, dt);
      b[sh].rotation.x = damp(b[sh].rotation.x, p.shin.x, L, dt);
    };
    applyLeg(B.thA, B.shA, pose.legA, -1);
    applyLeg(B.thB, B.shB, pose.legB, 1);
  });

  const face = React.useMemo(
    () => ({ gaze: pose.gaze, lids: pose.lids, brow: pose.brow, mouth: pose.mouth }),
    [pose],
  );

  const meshes = [
    body.torso,
    body.pelvis,
    ...body.legs,
    ...body.arms,
    ...body.sleeves,
    body.neck,
    body.trim,
    body.shirtFront,
    body.lapels,
    body.tie,
    body.buttons,
  ].filter(Boolean) as THREE.SkinnedMesh[];

  return (
    <group>
      <primitive object={rig.bones[B.hips]} />
      {meshes.map((m) => (
        <primitive key={m.uuid} object={m} />
      ))}

      {createPortal(
        <group position={P.headCenter}>
          <Head data={data} skin={skin} hair={HAIR} face={face} idle={idle} />
        </group>,
        rig.bones[B.head],
      )}
      {createPortal(
        <Hand
          data={data.handA}
          side={-1}
          wrist={rig.bones[B.haA]}
          restWrist={rig.rest[B.haA]}
          shape={pose.armA.hand ?? "relaxed"}
          skin={mats.skin}
          nail={mats.nail}
        />,
        rig.bones[B.haA],
      )}
      {createPortal(
        <Hand
          data={data.handB}
          side={1}
          wrist={rig.bones[B.haB]}
          restWrist={rig.rest[B.haB]}
          shape={pose.armB.hand ?? "relaxed"}
          skin={mats.skin}
          nail={mats.nail}
        />,
        rig.bones[B.haB],
      )}
      {createPortal(<Shoe g={shoeGeo.A} upper={cloth.shoe} sole={cloth.sole} />, rig.bones[B.shA])}
      {createPortal(<Shoe g={shoeGeo.B} upper={cloth.shoe} sole={cloth.sole} />, rig.bones[B.shB])}
    </group>
  );
}

function Shoe({
  g,
  upper,
  sole,
}: {
  g: { upper: THREE.BufferGeometry; sole: THREE.BufferGeometry };
  upper: THREE.Material;
  sole: THREE.Material;
}) {
  return (
    <group position={[0, -P.shin, 0]}>
      <mesh geometry={g.upper} material={upper} castShadow receiveShadow />
      <mesh geometry={g.sole} material={sole} castShadow receiveShadow />
    </group>
  );
}
