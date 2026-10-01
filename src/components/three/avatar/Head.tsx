"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { AvatarData } from "./buildAll";
import { toGeometry } from "./geo";
import { EYE, EXPRS, LID_U, lidLower, lidUpper, paintHead } from "./headModel";
import { createHairMaterial, createSkinMaterial } from "./materials";
import { eyeTexture, rng, strandAlpha } from "./textures";

/* ------------------------------------------------------------------
   ქუთუთო + წამწამები — CPU-ზე განახლებადი გეომეტრია
------------------------------------------------------------------- */

const NU = 30;
const NV = 9;
const LASHES = 64;
const LASH_SEG = 3;
const U0 = LID_U.inner - 0.22;
const U1 = LID_U.outer + 0.22;

function eyePoint(side: number, u: number, v: number, r: number, out: THREE.Vector3) {
  return out.set(side * r * Math.cos(v) * Math.sin(u), r * Math.sin(v), r * Math.cos(v) * Math.cos(u));
}

function clampU(u: number) {
  return Math.min(LID_U.outer, Math.max(LID_U.inner, u));
}

/** ზედა ქუთუთოს კიდე დახურვის მიხედვით */
function edgeV(u: number, close: number) {
  const uc = clampU(u);
  const open = lidUpper(uc) + 0.012;
  const shut = lidLower(uc) + 0.035;
  return open + (shut - open) * close;
}

class LidRig {
  lid = new THREE.BufferGeometry();
  lashes = new THREE.BufferGeometry();
  shade = new THREE.BufferGeometry();
  private lashInfo: { u: number; len: number; tilt: number }[] = [];
  private tmp = new THREE.Vector3();
  private last = -1;

  constructor(private side: number) {
    // ქუთუთო: (NU+1)×(NV+2) — ბოლო რიგი = კიდის სისქე
    const rows = NV + 2;
    this.lid.setAttribute("position", new THREE.BufferAttribute(new Float32Array((NU + 1) * rows * 3), 3));
    const idx: number[] = [];
    for (let j = 0; j < rows - 1; j++)
      for (let i = 0; i < NU; i++) {
        const a = j * (NU + 1) + i;
        const b = a + NU + 1;
        if (side > 0) idx.push(a, b, a + 1, a + 1, b, b + 1);
        else idx.push(a, a + 1, b, a + 1, b + 1, b);
      }
    this.lid.setIndex(idx);

    // ჩრდილი თვალის კაკალზე (ქუთუთოს ქვეშ) — RGBA ფერებით
    const sRows = 6;
    this.shade.setAttribute("position", new THREE.BufferAttribute(new Float32Array((NU + 1) * sRows * 3), 3));
    this.shade.setAttribute("color", new THREE.BufferAttribute(new Float32Array((NU + 1) * sRows * 4), 4));
    const sIdx: number[] = [];
    for (let j = 0; j < sRows - 1; j++)
      for (let i = 0; i < NU; i++) {
        const a = j * (NU + 1) + i;
        const b = a + NU + 1;
        if (side > 0) sIdx.push(a, a + 1, b, a + 1, b + 1, b);
        else sIdx.push(a, b, a + 1, a + 1, b, b + 1);
      }
    this.shade.setIndex(sIdx);

    // წამწამები
    const r = rng(side > 0 ? 17 : 23);
    for (let k = 0; k < LASHES; k++) {
      const t = (k + r() * 0.8) / LASHES;
      const u = LID_U.inner * 0.92 + (LID_U.outer * 0.98 - LID_U.inner * 0.92) * t;
      const center = 1 - Math.pow(Math.abs(t - 0.62) / 0.62, 2);
      this.lashInfo.push({ u, len: 0.0058 + center * 0.0042 + r() * 0.0012, tilt: (r() - 0.5) * 0.25 });
    }
    const lv = LASHES * (LASH_SEG + 1) * 2;
    this.lashes.setAttribute("position", new THREE.BufferAttribute(new Float32Array(lv * 3), 3));
    this.lashes.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(lv * 3), 3));
    const luv = new Float32Array(lv * 2);
    const lIdx: number[] = [];
    for (let k = 0; k < LASHES; k++) {
      for (let s = 0; s <= LASH_SEG; s++) {
        const o = (k * (LASH_SEG + 1) + s) * 2;
        luv.set([0, 1 - s / LASH_SEG, 1, 1 - s / LASH_SEG], o * 2);
        if (s < LASH_SEG) lIdx.push(o, o + 1, o + 3, o, o + 3, o + 2);
      }
    }
    this.lashes.setAttribute("uv", new THREE.BufferAttribute(luv, 2));
    this.lashes.setIndex(lIdx);
    this.update(0);
  }

  update(close: number) {
    if (Math.abs(close - this.last) < 0.0008) return;
    this.last = close;
    const s = this.side;
    const p = this.tmp;
    const R = EYE.blinkR;

    // --- ქუთუთო
    const pos = this.lid.getAttribute("position") as THREE.BufferAttribute;
    const rows = NV + 2;
    for (let i = 0; i <= NU; i++) {
      const u = U0 + ((U1 - U0) * i) / NU;
      const ve = edgeV(u, close);
      const vTop = 1.25;
      for (let j = 0; j < rows; j++) {
        let v: number;
        let rad = R;
        if (j <= NV) v = vTop + ((ve - vTop) * j) / NV;
        else {
          // კიდის სისქე — ოდნავ შიგნით, თვალის კაკალთან
          v = ve - 0.012;
          rad = EYE.r + 0.00025;
        }
        eyePoint(s, u, v, rad, p);
        pos.setXYZ(j * (NU + 1) + i, p.x, p.y, p.z);
      }
    }
    pos.needsUpdate = true;
    this.lid.computeVertexNormals();
    this.lid.computeBoundingSphere();

    // --- ჩრდილი
    const sp = this.shade.getAttribute("position") as THREE.BufferAttribute;
    const sc = this.shade.getAttribute("color") as THREE.BufferAttribute;
    const sRows = 6;
    for (let i = 0; i <= NU; i++) {
      const u = U0 + ((U1 - U0) * i) / NU;
      const ve = edgeV(u, close);
      const tEdge = Math.abs(clampU(u)) / (u < 0 ? -LID_U.inner : LID_U.outer);
      const corner = Math.pow(Math.min(1, tEdge), 3);
      for (let j = 0; j < sRows; j++) {
        const f = j / (sRows - 1);
        const v = ve + 0.02 - f * 0.42;
        eyePoint(s, u, v, EYE.r + 0.00012, p);
        sp.setXYZ(j * (NU + 1) + i, p.x, p.y, p.z);
        const a = Math.pow(1 - f, 1.8) * 0.62 + corner * 0.35 * (1 - f * 0.5);
        sc.setXYZW(j * (NU + 1) + i, 0, 0, 0, Math.min(0.85, a));
      }
    }
    sp.needsUpdate = true;
    sc.needsUpdate = true;
    this.shade.computeBoundingSphere();

    // --- წამწამები
    const lp = this.lashes.getAttribute("position") as THREE.BufferAttribute;
    const ln = this.lashes.getAttribute("normal") as THREE.BufferAttribute;
    const n = new THREE.Vector3();
    const up = new THREE.Vector3();
    const side = new THREE.Vector3();
    const root = new THREE.Vector3();
    const c = new THREE.Vector3();
    this.lashInfo.forEach((L, k) => {
      const v = edgeV(L.u, close) - 0.004;
      eyePoint(s, L.u, v, R + 0.0002, root);
      n.copy(root).normalize();
      // მხები v-ის ზრდის მიმართულებით
      up.set(-s * Math.sin(v) * Math.sin(L.u), Math.cos(v), -Math.sin(v) * Math.cos(L.u)).normalize();
      side.crossVectors(n, up).normalize();
      // ახლოს დახურვისას წამწამი ქვემოთ იყურება
      const lift = 0.55 - close * 0.9;
      for (let seg = 0; seg <= LASH_SEG; seg++) {
        const t = seg / LASH_SEG;
        c.copy(root)
          .addScaledVector(n, L.len * t * 0.9)
          .addScaledVector(up, L.len * (lift * t * t + 0.1 * t))
          .addScaledVector(side, L.tilt * L.len * t);
        const w = 0.00036 * (1 - t * 0.8);
        const o = (k * (LASH_SEG + 1) + seg) * 2;
        lp.setXYZ(o, c.x - side.x * w, c.y - side.y * w, c.z - side.z * w);
        lp.setXYZ(o + 1, c.x + side.x * w, c.y + side.y * w, c.z + side.z * w);
        ln.setXYZ(o, up.x, up.y, up.z);
        ln.setXYZ(o + 1, up.x, up.y, up.z);
      }
    });
    lp.needsUpdate = true;
    ln.needsUpdate = true;
    this.lashes.computeBoundingSphere();
  }
}

/** ქვედა წამწამები — სტატიკური */
function lowerLashes(side: number) {
  const r = rng(side > 0 ? 71 : 73);
  const N = 22;
  const pos: number[] = [];
  const uv: number[] = [];
  const nor: number[] = [];
  const idx: number[] = [];
  const p = new THREE.Vector3();
  for (let k = 0; k < N; k++) {
    const u = LID_U.inner * 0.6 + (LID_U.outer * 0.95 - LID_U.inner * 0.6) * ((k + r()) / N);
    const v = lidLower(u) - 0.01;
    eyePoint(side, u, v, EYE.lidIn + 0.0005, p);
    const n = p.clone().normalize();
    const down = new THREE.Vector3(side * Math.sin(v) * Math.sin(u), -Math.cos(v), Math.sin(v) * Math.cos(u)).normalize();
    const sd = new THREE.Vector3().crossVectors(n, down).normalize();
    const len = 0.0018 + r() * 0.0012;
    const base = pos.length / 3;
    for (let s = 0; s <= 2; s++) {
      const t = s / 2;
      const c = p.clone().addScaledVector(n, len * t).addScaledVector(down, len * 0.45 * t * t);
      const w = 0.00016 * (1 - t * 0.8);
      pos.push(c.x - sd.x * w, c.y - sd.y * w, c.z - sd.z * w, c.x + sd.x * w, c.y + sd.y * w, c.z + sd.z * w);
      uv.push(0, 1 - t, 1, 1 - t);
      nor.push(n.x, n.y, n.z, n.x, n.y, n.z);
      if (s < 2) idx.push(base + s * 2, base + s * 2 + 1, base + s * 2 + 3, base + s * 2, base + s * 2 + 3, base + s * 2 + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

/* ------------------------------------------------------------------
   კომპონენტი
------------------------------------------------------------------- */

export interface FaceState {
  gaze: { x: number; y: number };
  lids: number;
  brow: number;
  mouth: number;
}

export default function Head({
  data,
  skin,
  hair,
  iris = "#5b3f2a",
  face,
  idle = true,
}: {
  data: AvatarData;
  skin: string;
  hair: string;
  iris?: string;
  face: FaceState;
  idle?: boolean;
}) {
  const headGeo = React.useMemo(() => toGeometry(data.head.geo), [data]);
  const hairGeo = React.useMemo(() => toGeometry(data.hair), [data]);
  const browGeo = React.useMemo(() => toGeometry(data.brows), [data]);
  const fuzzGeo = React.useMemo(() => toGeometry(data.fuzz), [data]);

  // კანის ტონი → ვერტექს-ფერები
  React.useLayoutEffect(() => {
    const col = headGeo.getAttribute("color") as THREE.BufferAttribute;
    paintHead(col.array as Float32Array, data.head.masks, skin, hair);
    col.needsUpdate = true;
  }, [headGeo, data, skin, hair]);

  const skinMat = React.useMemo(() => createSkinMaterial(skin, { vertexColors: true, repeat: 4 }), [skin]);
  const lidMat = React.useMemo(() => {
    const c = new THREE.Color(skin).lerp(new THREE.Color("#9a6a6a"), 0.12);
    const m = createSkinMaterial(`#${c.getHexString()}`, { repeat: 1 });
    m.side = THREE.DoubleSide;
    return m;
  }, [skin]);
  const hairMat = React.useMemo(() => createHairMaterial(hair), [hair]);
  const strandMat = React.useMemo(() => {
    const m = createHairMaterial(hair);
    m.map = null;
    m.normalMap = null;
    m.alphaMap = strandAlpha();
    m.alphaTest = 0.35;
    m.side = THREE.DoubleSide;
    m.color = new THREE.Color(hair).multiplyScalar(0.9);
    return m;
  }, [hair]);
  const browMat = React.useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hair).multiplyScalar(1.05),
      roughness: 0.55,
      alphaMap: strandAlpha(),
      alphaTest: 0.3,
      side: THREE.DoubleSide,
    });
    return m;
  }, [hair]);
  const lashMat = React.useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#120d0a",
        roughness: 0.5,
        alphaMap: strandAlpha(),
        alphaTest: 0.25,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const eyeMat = React.useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: eyeTexture(iris, EYE.iris),
        roughness: 0.35,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
      }),
    [iris],
  );
  const shadeMat = React.useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      }),
    [],
  );
  const caruncleMat = React.useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#d08a86", roughness: 0.3, clearcoat: 0.8 }),
    [],
  );

  const eyeGeo = React.useMemo(() => {
    const g = new THREE.SphereGeometry(EYE.r, 48, 32);
    g.rotateX(Math.PI / 2); // პოლუსი (გუგა) → +Z
    return g;
  }, []);

  const rigs = React.useMemo(() => [new LidRig(-1), new LidRig(1)], []);
  const lowers = React.useMemo(() => [lowerLashes(-1), lowerLashes(1)], []);

  const headMesh = React.useRef<THREE.Mesh>(null);
  const browMesh = React.useRef<THREE.Mesh>(null);
  const eyeL = React.useRef<THREE.Group>(null);
  const eyeR = React.useRef<THREE.Group>(null);

  React.useLayoutEffect(() => {
    headMesh.current?.updateMorphTargets();
    browMesh.current?.updateMorphTargets();
  }, [headGeo, browGeo]);

  React.useEffect(
    () => () => {
      [skinMat, lidMat, hairMat, strandMat, browMat, eyeMat].forEach((m) => m.dispose());
    },
    [skinMat, lidMat, hairMat, strandMat, browMat, eyeMat],
  );

  const st = React.useRef({
    brow: 0,
    mouth: 0,
    lids: 0,
    gx: 0,
    gy: 0,
    nextBlink: 2.5,
    blinkT: -1,
    sacc: { x: 0, y: 0 },
    nextSacc: 1.2,
  });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const s = st.current;
    const L = 6;
    s.brow = THREE.MathUtils.damp(s.brow, face.brow, L, dt);
    s.mouth = THREE.MathUtils.damp(s.mouth, face.mouth, L, dt);
    s.lids = THREE.MathUtils.damp(s.lids, face.lids, L, dt);

    // მიკრო-მოძრაობები (საკადები) — სიცოცხლისთვის
    if (idle && t > s.nextSacc) {
      s.sacc = { x: (Math.random() - 0.5) * 0.08, y: (Math.random() - 0.5) * 0.05 };
      s.nextSacc = t + 0.8 + Math.random() * 2.2;
    }
    s.gx = THREE.MathUtils.damp(s.gx, face.gaze.x + s.sacc.x, 14, dt);
    s.gy = THREE.MathUtils.damp(s.gy, face.gaze.y + s.sacc.y, 14, dt);
    for (const e of [eyeL.current, eyeR.current]) {
      if (!e) continue;
      e.rotation.y = s.gx * 0.36;
      e.rotation.x = -s.gy * 0.28;
    }

    // ხამხამი — რეალურ დროზე (და არა კადრებზე), რომ ნელ მოწყობილობაზეც 0.16 წმ გაგრძელდეს
    if (idle && t > s.nextBlink && s.blinkT < 0) s.blinkT = t;
    let blink = 0;
    if (s.blinkT >= 0) {
      const d = 0.16;
      const p = (t - s.blinkT) / d;
      blink = p < 1 ? Math.sin(p * Math.PI) : 0;
      if (p >= 1) {
        s.blinkT = -1;
        s.nextBlink = t + 2.2 + Math.random() * 3.8;
      }
    }
    // ზედა ქუთუთო თვალს მიჰყვება, როცა ქვემოთ იყურება
    const follow = Math.max(0, -s.gy) * 0.22;
    const close = Math.min(1, Math.max(s.lids, follow) + blink * (1 - s.lids));
    rigs.forEach((r) => r.update(close));

    const infl = [Math.max(0, s.mouth), Math.max(0, -s.mouth), Math.max(0, s.brow), Math.max(0, -s.brow)];
    for (const m of [headMesh.current, browMesh.current]) {
      if (!m?.morphTargetInfluences) continue;
      EXPRS.forEach((_, i) => (m.morphTargetInfluences![i] = infl[i]));
    }
  });

  return (
    <group>
      <mesh ref={headMesh} geometry={headGeo} material={skinMat} castShadow receiveShadow />
      <mesh geometry={hairGeo} material={hairMat} castShadow receiveShadow />
      <mesh geometry={fuzzGeo} material={strandMat} />
      <mesh ref={browMesh} geometry={browGeo} material={browMat} />

      {([-1, 1] as const).map((side, i) => (
        <group key={side} position={[side * EYE.x, EYE.y, EYE.z]}>
          <group ref={i === 0 ? eyeL : eyeR}>
            <mesh geometry={eyeGeo} material={eyeMat} />
          </group>
          <mesh geometry={rigs[i].shade} material={shadeMat} renderOrder={3} />
          <mesh geometry={rigs[i].lid} material={lidMat} castShadow />
          <mesh geometry={rigs[i].lashes} material={lashMat} />
          <mesh geometry={lowers[i]} material={lashMat} />
          {/* ცრემლის ხორცაკი შიდა კუთხეში */}
          <mesh
            position={[side * EYE.r * Math.sin(LID_U.inner * 0.98), EYE.r * Math.sin(-0.02), EYE.r * Math.cos(LID_U.inner * 0.98) * 0.98]}
            scale={[0.7, 1, 0.9]}
            material={caruncleMat}
          >
            <sphereGeometry args={[0.0022, 12, 10]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
