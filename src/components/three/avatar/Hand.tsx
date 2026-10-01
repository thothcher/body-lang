"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { HandData } from "./handModel";
import { HAND_SHAPES, handBones, type HandShape } from "./handModel";
import { toGeometry } from "./geo";

/* eslint-disable react-hooks/immutability --
   ძვლები და SkinnedMesh განზრახ მუტირებადია; იცვლება მხოლოდ effect-სა და useFrame-ში. */

const SPREAD_K = [1, 0.25, -0.6, -1.25];

/** X-სიბრტყეში არეკვლილი ბრუნვა (მარჯვენა ხელი → მარცხენა) */
function mirrorQ(q: THREE.Quaternion) {
  return q.set(q.x, -q.y, -q.z, q.w);
}

interface Props {
  data: HandData;
  /** −1 = A (მარჯვენა, x < 0), 1 = B */
  side: -1 | 1;
  /** მკლავის მტევნის ძვალი, რომელზეც თითები მიემაგრება */
  wrist: THREE.Bone;
  /** მტევნის ძვლის მსოფლიო პოზიცია მოსვენებისას */
  restWrist: [number, number, number];
  shape: HandShape;
  skin: THREE.Material;
  nail: THREE.Material;
}

export default function Hand({ data, side, wrist, restWrist, shape, skin, nail }: Props) {
  const rig = React.useMemo(() => {
    const rest = handBones();
    const bones: THREE.Bone[] = [wrist];
    // მოსვენების ბრუნვები A-ს (მარჯვენა ხელის) სივრცეში
    const restQ: THREE.Quaternion[] = [new THREE.Quaternion()];
    for (let i = 1; i < rest.length; i++) {
      const r = rest[i];
      const b = new THREE.Bone();
      b.name = `hand${side}-${i}`;
      b.position.set(side > 0 ? -r.position[0] : r.position[0], r.position[1], r.position[2]);
      const q = new THREE.Quaternion(...r.quaternion);
      restQ.push(q.clone());
      if (side > 0) mirrorQ(q);
      b.quaternion.copy(q);
      bones.push(b);
      if (r.parent > 0) bones[r.parent].add(b);
    }
    const roots = rest.map((r, i) => (r.parent === 0 ? bones[i] : null)).filter(Boolean) as THREE.Bone[];

    // ანალიტიკური bind-ინვერსიები: მოსვენებისას მტევანი მხოლოდ გადაადგილებულია
    const wristM = new THREE.Matrix4().makeTranslation(...restWrist);
    const worlds: THREE.Matrix4[] = [wristM];
    for (let i = 1; i < rest.length; i++) {
      const b = bones[i];
      const local = new THREE.Matrix4().compose(b.position, b.quaternion, new THREE.Vector3(1, 1, 1));
      worlds.push(new THREE.Matrix4().multiplyMatrices(worlds[rest[i].parent], local));
    }
    const skeleton = new THREE.Skeleton(
      bones,
      worlds.map((m) => m.clone().invert()),
    );

    const make = (d: HandData["skin"], mat: THREE.Material) => {
      const m = new THREE.SkinnedMesh(toGeometry(d), mat);
      m.bind(skeleton, wristM);
      m.frustumCulled = false;
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    };
    return { bones, roots, restQ, skin: make(data.skin, skin), nails: make(data.nails, nail) };
    // მასალები ცალკე ახლდება ქვემოთ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, side, wrist, restWrist]);

  React.useEffect(() => {
    rig.skin.material = skin;
    rig.nails.material = nail;
  }, [rig, skin, nail]);

  React.useEffect(
    () => () => {
      rig.skin.geometry.dispose();
      rig.nails.geometry.dispose();
    },
    [rig],
  );

  // თითოეული სახსრის მიმდინარე კუთხე (გლუვი გადასვლისთვის)
  const cur = React.useRef<number[] | null>(null);
  const q = React.useMemo(() => new THREE.Quaternion(), []);
  const qa = React.useMemo(() => new THREE.Quaternion(), []);
  const X = React.useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const Yv = React.useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const Z = React.useMemo(() => new THREE.Vector3(0, 0, 1), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const target = HAND_SHAPES[shape] ?? HAND_SHAPES.relaxed;
    const flat = [
      ...target.fingers.flat(),
      target.spread,
      ...target.thumb,
    ];
    if (!cur.current) cur.current = flat.slice();
    const c = cur.current;
    for (let i = 0; i < c.length; i++) c[i] = THREE.MathUtils.damp(c[i], flat[i], 7, dt);

    const spread = c[12];
    for (let f = 0; f < 4; f++) {
      for (let k = 0; k < 3; k++) {
        const bi = 1 + f * 3 + k;
        const bone = rig.bones[bi];
        // A-ს სივრცეში ვითვლით, B-სთვის ვირეკლავთ
        q.setFromAxisAngle(Z, c[f * 3 + k]);
        if (k === 0) {
          qa.setFromAxisAngle(X, -spread * SPREAD_K[f]);
          q.premultiply(qa).premultiply(rig.restQ[bi]);
        }
        if (side > 0) mirrorQ(q);
        bone.quaternion.copy(q);
      }
    }
    // ცერი
    const [tFlex, tOpp, tMcp, tIp] = c.slice(13, 17);
    const t0 = rig.bones[13];
    q.setFromAxisAngle(Z, tFlex);
    qa.setFromAxisAngle(Yv, -tOpp * 0.9);
    q.multiply(qa);
    q.premultiply(rig.restQ[13]);
    if (side > 0) mirrorQ(q);
    t0.quaternion.copy(q);
    for (const [bi, ang] of [
      [14, tMcp],
      [15, tIp],
    ] as const) {
      q.setFromAxisAngle(Z, ang);
      if (side > 0) mirrorQ(q);
      rig.bones[bi].quaternion.copy(q);
    }
  });

  return (
    <>
      {rig.roots.map((r) => (
        <primitive key={r.uuid} object={r} />
      ))}
      <primitive object={rig.skin} />
      <primitive object={rig.nails} />
    </>
  );
}
