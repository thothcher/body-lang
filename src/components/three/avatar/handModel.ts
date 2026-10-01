/**
 * მტევნის მოდელი — SDF სკულპტურა + 16-ძვლიანი ჩონჩხი.
 *
 * ლოკალური სივრცე (მარჯვენა ხელი, მხარე A): საწყისი = მაჯის სახსარი,
 * თითები −Y-ით, ხელის გული +X-ისკენ (სხეულისკენ), ცერი +Z-ისკენ (წინ).
 * მეორე ხელი სარკისებური ასლია.
 */
import * as THREE from "three";
import { capsule, capsuleT, clamp, ellipsoid, meshSDF, roundBox, smin, softWeights, ssub, sphere, type V3 } from "./sdf";
import { fromGeometry, type GeoData } from "./geo";

/* ------------------------------------------------------------------
   ჩონჩხი
------------------------------------------------------------------- */

export interface FingerDef {
  name: string;
  /** MCP სახსარი */
  base: V3;
  /** გაშლის კუთხე (რად.) Y-Z სიბრტყეში; + = ცერისკენ */
  spread: number;
  len: [number, number, number];
  r: [number, number, number, number];
}

export const FINGERS: FingerDef[] = [
  { name: "index", base: [0.0, -0.0985, 0.0255], spread: 0.11, len: [0.044, 0.0255, 0.0205], r: [0.0094, 0.0085, 0.0076, 0.0068] },
  { name: "middle", base: [0.0, -0.1025, 0.0075], spread: 0.02, len: [0.0475, 0.0295, 0.0225], r: [0.0097, 0.0088, 0.0078, 0.007] },
  { name: "ring", base: [0.0, -0.099, -0.0105], spread: -0.08, len: [0.0445, 0.0278, 0.0218], r: [0.0091, 0.0082, 0.0073, 0.0066] },
  { name: "pinky", base: [0.0005, -0.0915, -0.0272], spread: -0.2, len: [0.0345, 0.0205, 0.0188], r: [0.0079, 0.0071, 0.0064, 0.0058] },
];

export const THUMB = {
  base: [0.0075, -0.021, 0.0215] as V3,
  /** მეტაკარპის მიმართულება (CMC → MCP) */
  dir: new THREE.Vector3(0.24, -0.8, 0.56).normalize(),
  /** მოხრის მიმართულება — ხელის გულისა და ნეკისკენ */
  bend: new THREE.Vector3(0.62, 0.0, -0.78).normalize(),
  len: [0.044, 0.0315, 0.0265] as [number, number, number],
  r: [0.0118, 0.0106, 0.0096, 0.0086],
};

export interface BoneRest {
  parent: number;
  /** პოზიცია მშობლის ლოკალურ სივრცეში */
  position: V3;
  /** ლოკალური ბრუნვა (მოსვენების პოზა) */
  quaternion: [number, number, number, number];
}

/** ძვლის ბაზისი: local −Y = d, rotation.z (+) ხრის d-ს m-ისკენ */
function frameQuat(d: THREE.Vector3, m: THREE.Vector3) {
  const Y = d.clone().negate();
  const Z = new THREE.Vector3().crossVectors(d, m).normalize();
  const X = new THREE.Vector3().crossVectors(Y, Z).normalize();
  const mat = new THREE.Matrix4().makeBasis(X, Y, Z);
  return new THREE.Quaternion().setFromRotationMatrix(mat);
}

function fingerDir(f: FingerDef) {
  return new THREE.Vector3(0, -Math.cos(f.spread), Math.sin(f.spread));
}

/** ძვლები: 0 = მტევანი, 1..12 = თითები (3 თითოეულზე), 13..15 = ცერი */
export function handBones(): BoneRest[] {
  const bones: BoneRest[] = [{ parent: -1, position: [0, 0, 0], quaternion: [0, 0, 0, 1] }];
  const palmN = new THREE.Vector3(1, 0, 0);
  for (const f of FINGERS) {
    const q = frameQuat(fingerDir(f), palmN);
    const p0 = bones.length;
    bones.push({ parent: 0, position: f.base, quaternion: [q.x, q.y, q.z, q.w] });
    bones.push({ parent: p0, position: [0, -f.len[0], 0], quaternion: [0, 0, 0, 1] });
    bones.push({ parent: p0 + 1, position: [0, -f.len[1], 0], quaternion: [0, 0, 0, 1] });
  }
  const q = frameQuat(THUMB.dir, THUMB.bend);
  const t0 = bones.length;
  bones.push({ parent: 0, position: THUMB.base, quaternion: [q.x, q.y, q.z, q.w] });
  bones.push({ parent: t0, position: [0, -THUMB.len[0], 0], quaternion: [0, 0, 0, 1] });
  bones.push({ parent: t0 + 1, position: [0, -THUMB.len[1], 0], quaternion: [0, 0, 0, 1] });
  return bones;
}

/** სახსრების წერტილები მოსვენების პოზაში (მტევნის სივრცეში) */
function joints() {
  const fingers = FINGERS.map((f) => {
    const d = fingerDir(f);
    const p0 = new THREE.Vector3(...f.base);
    const p1 = p0.clone().addScaledVector(d, f.len[0]);
    const p2 = p1.clone().addScaledVector(d, f.len[1]);
    const p3 = p2.clone().addScaledVector(d, f.len[2]);
    return [p0, p1, p2, p3].map((v) => v.toArray() as V3);
  });
  const t0 = new THREE.Vector3(...THUMB.base);
  const t1 = t0.clone().addScaledVector(THUMB.dir, THUMB.len[0]);
  const t2 = t1.clone().addScaledVector(THUMB.dir, THUMB.len[1]);
  const t3 = t2.clone().addScaledVector(THUMB.dir, THUMB.len[2]);
  return { fingers, thumb: [t0, t1, t2, t3].map((v) => v.toArray() as V3) };
}

/* ------------------------------------------------------------------
   SDF: თითოეული ძვლის „საკუთარი“ ფორმა + საერთო გაერთიანება
------------------------------------------------------------------- */

const J = joints();

/** თითის ფალანგა — ოდნავ გაბრტყელებული (ხელის გულის მიმართულებით) */
function phalanx(x: number, y: number, z: number, a: V3, b: V3, ra: number, rb: number) {
  // X-ით შეკუმშვა → განივკვეთი ელიფსური
  const k = 1.12;
  return capsule((x - (a[0] + b[0]) / 2) * k + (a[0] + b[0]) / 2, y, z, a, b, ra, rb) / k;
}

/** ბოლო ფალანგას ბალიში — ხელის გულის მხარეს ოდნავ სქელი */
function fingertip(x: number, y: number, z: number, a: V3, b: V3, ra: number, rb: number) {
  let d = phalanx(x, y, z, a, b, ra, rb);
  const t = capsuleT(x, y, z, a, b);
  const pad: V3 = [a[0] + (b[0] - a[0]) * 0.62 + rb * 0.32, a[1] + (b[1] - a[1]) * 0.62, a[2] + (b[2] - a[2]) * 0.62];
  d = smin(d, sphere(x, y, z, pad, rb * 0.9), 0.003 * (0.5 + t));
  return d;
}

function palmSDF(x: number, y: number, z: number) {
  // ძირითადი მასა
  let d = roundBox(x, y, z, [0.0005, -0.056, 0.0], [0.0115, 0.047, 0.036], 0.0095);
  // მაჯა
  d = smin(d, roundBox(x, y, z, [0, 0.012, 0.0005], [0.0175, 0.03, 0.0265], 0.0145), 0.012);
  // ჰიპოთენარი (ნეკის მხარე)
  d = smin(d, ellipsoid(x, y, z, [0.0095, -0.052, -0.023], [0.0095, 0.03, 0.0105]), 0.008);
  // მუშტის ძვლები (dorsal knuckles)
  for (const f of J.fingers) {
    const p = f[0];
    d = smin(d, sphere(x, y, z, [p[0] - 0.0045, p[1] + 0.002, p[2]], 0.0094), 0.007);
  }
  // ხელის გულის ჩაღრმავება
  d = ssub(d, ellipsoid(x, y, z, [0.0215, -0.06, 0.0015], [0.0075, 0.021, 0.0165]), 0.009);
  // ხელის გულის თითის ძირის ბალიშები
  d = smin(d, ellipsoid(x, y, z, [0.0085, -0.093, 0.0], [0.007, 0.008, 0.033]), 0.007);
  return d;
}

function thenarSDF(x: number, y: number, z: number) {
  const t = J.thumb;
  let d = ellipsoid(x, y, z, [0.012, -0.041, 0.021], [0.0115, 0.026, 0.0135]);
  d = smin(d, phalanx(x, y, z, t[0], t[1], THUMB.r[0], THUMB.r[1]), 0.01);
  return d;
}

/** თითოეული ძვლის SDF (ინდექსი = ძვლის ინდექსი) */
function boneSDF(i: number, x: number, y: number, z: number): number {
  if (i === 0) return palmSDF(x, y, z);
  if (i <= 12) {
    const fi = Math.floor((i - 1) / 3);
    const k = (i - 1) % 3;
    const f = FINGERS[fi];
    const p = J.fingers[fi];
    if (k === 2) return fingertip(x, y, z, p[2], p[3], f.r[2], f.r[3]);
    return phalanx(x, y, z, p[k], p[k + 1], f.r[k], f.r[k + 1]);
  }
  const k = i - 13;
  if (k === 0) return thenarSDF(x, y, z);
  if (k === 2) return fingertip(x, y, z, J.thumb[2], J.thumb[3], THUMB.r[2], THUMB.r[3]);
  return phalanx(x, y, z, J.thumb[1], J.thumb[2], THUMB.r[1], THUMB.r[2]);
}

/** თითის „შემომსაზღვრელი“ კაფსულა — შორს მყოფ წერტილებზე ზუსტ გამოთვლას ვტოვებთ */
const FINGER_BOUNDS = J.fingers.map((p, fi) => ({ a: p[0], b: p[3], r: FINGERS[fi].r[0] + 0.001 }));
const THUMB_BOUND = { a: J.thumb[0], b: J.thumb[3], r: THUMB.r[0] + 0.02 };

export function handSDF(x: number, y: number, z: number) {
  let d = boneSDF(0, x, y, z);
  // თითები — ფალანგები ერთმანეთთან რბილად, ხელის გულთან აპკით
  for (let fi = 0; fi < 4; fi++) {
    const fb = FINGER_BOUNDS[fi];
    // smin(d, f, k) უცვლელია, როცა f > d + k — ზუსტი მანძილი აღარ გვჭირდება
    if (capsule(x, y, z, fb.a, fb.b, fb.r, fb.r) > d + 0.0065) continue;
    let fd = Infinity;
    for (let k = 0; k < 3; k++) fd = smin(fd, boneSDF(1 + fi * 3 + k, x, y, z), 0.0025);
    d = smin(d, fd, 0.0065);
  }
  if (capsule(x, y, z, THUMB_BOUND.a, THUMB_BOUND.b, THUMB_BOUND.r, THUMB_BOUND.r) < d + 0.007) {
    let td = boneSDF(13, x, y, z);
    td = smin(td, boneSDF(14, x, y, z), 0.003);
    td = smin(td, boneSDF(15, x, y, z), 0.0025);
    d = smin(d, td, 0.007);
  }
  // სახსრების ნაოჭები ხელის გულის მხარეს
  for (let fi = 0; fi < 4; fi++) {
    const p = J.fingers[fi];
    for (let k = 1; k <= 2; k++) {
      const c = p[k];
      const cx = c[0] + FINGERS[fi].r[k] * 1.02;
      if (Math.abs(y - c[1]) > 0.006 || Math.abs(z - c[2]) > 0.009 || Math.abs(x - cx) > 0.006) continue;
      d = ssub(d, ellipsoid(x, y, z, [cx, c[1], c[2]], [0.0011, 0.0007, 0.006]), 0.0012);
    }
  }
  return d;
}

/* ------------------------------------------------------------------
   ფრჩხილები
------------------------------------------------------------------- */

/** ფრჩხილების ლოკალური ბაზისები — ერთხელ ითვლება */
const NAILS = [
  ...J.fingers.map((p, fi) => ({ a: p[2], b: p[3], r: FINGERS[fi].r[3], thumb: false })),
  { a: J.thumb[2], b: J.thumb[3], r: THUMB.r[3], thumb: true },
].map(({ a, b, r, thumb }) => {
  const dir = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize();
  // ფრჩხილი — ზურგის მხარეს (−X); ცერზე ზურგი ბრუნავს
  const back = thumb ? THUMB.bend.clone().negate() : new THREE.Vector3(-1, 0, 0);
  back.addScaledVector(dir, -back.dot(dir)).normalize();
  const c = new THREE.Vector3(...b).addScaledVector(dir, -r * 1.05).addScaledVector(back, r * 0.78);
  const side = new THREE.Vector3().crossVectors(dir, back);
  return { c, dir, back, side, r, radii: [r * 0.95, r * 0.78, 0.0011] as V3 };
});
const ORIGIN: V3 = [0, 0, 0];

function nailSDF(x: number, y: number, z: number) {
  let d = Infinity;
  for (const n of NAILS) {
    const px = x - n.c.x;
    const py = y - n.c.y;
    const pz = z - n.c.z;
    if (px * px + py * py + pz * pz > 0.0004) {
      d = Math.min(d, Math.sqrt(px * px + py * py + pz * pz) - n.r);
      continue;
    }
    const u = px * n.dir.x + py * n.dir.y + pz * n.dir.z;
    const v = px * n.side.x + py * n.side.y + pz * n.side.z;
    const w = px * n.back.x + py * n.back.y + pz * n.back.z;
    // მოხრილი ფირფიტა
    const bend = (v * v) / (n.r * 1.6);
    d = Math.min(d, ellipsoid(u, v, w + bend, ORIGIN, n.radii));
  }
  return d;
}

/* ------------------------------------------------------------------
   აგება
------------------------------------------------------------------- */

const BOX = { min: [-0.032, -0.216, -0.05] as V3, max: [0.047, 0.04, 0.097] as V3 };
const NAIL_BOX = { min: [-0.03, -0.216, -0.045] as V3, max: [0.047, -0.088, 0.097] as V3 };

function skinWeightsFor(pos: Float32Array, boneFilter?: (i: number) => boolean) {
  return softWeights(
    pos,
    16,
    (x, y, z, out) => {
      for (let i = 0; i < 16; i++) out[i] = boneFilter && !boneFilter(i) ? 1 : Math.max(boneSDF(i, x, y, z), -0.02);
    },
    0.0012,
  );
}

export interface HandData {
  skin: GeoData;
  nails: GeoData;
}

export function buildHandData(step = 0.0014): HandData {
  const m = meshSDF(handSDF, { ...BOX, step, lipschitz: 1.5, project: 1 });
  const { skinIndex, skinWeight } = skinWeightsFor(m.positions);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(m.positions, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(m.normals, 3));
  g.setAttribute("skinIndex", new THREE.BufferAttribute(skinIndex, 4));
  g.setAttribute("skinWeight", new THREE.BufferAttribute(skinWeight, 4));
  // UV: ცილინდრული — ფორების რუკისთვის საკმარისი
  const uv = new Float32Array((m.positions.length / 3) * 2);
  for (let v = 0; v < m.positions.length / 3; v++) {
    uv[v * 2] = Math.atan2(m.positions[v * 3 + 2], m.positions[v * 3]) * 0.02 * 8;
    uv[v * 2 + 1] = m.positions[v * 3 + 1] * 8;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setIndex(new THREE.BufferAttribute(m.indices, 1));

  const n = meshSDF(nailSDF, { ...NAIL_BOX, step: 0.0007, lipschitz: 1.5, project: 1 });
  // ფრჩხილები — მხოლოდ ბოლო ფალანგებზე
  const tipBones = new Set([3, 6, 9, 12, 15]);
  const nw = skinWeightsFor(n.positions, (i) => tipBones.has(i));
  const ng = new THREE.BufferGeometry();
  ng.setAttribute("position", new THREE.BufferAttribute(n.positions, 3));
  ng.setAttribute("normal", new THREE.BufferAttribute(n.normals, 3));
  ng.setAttribute("skinIndex", new THREE.BufferAttribute(nw.skinIndex, 4));
  ng.setAttribute("skinWeight", new THREE.BufferAttribute(nw.skinWeight, 4));
  ng.setIndex(new THREE.BufferAttribute(n.indices, 1));

  return { skin: fromGeometry(g), nails: fromGeometry(ng) };
}

/* ------------------------------------------------------------------
   ხელის ფორმები (მოხრის კუთხეები)
------------------------------------------------------------------- */

export type HandShape = "relaxed" | "open" | "fist" | "point" | "steeple" | "grip" | "cup" | "touch";

export interface HandCurl {
  /** [MCP, PIP, DIP] თითოეული თითისთვის */
  fingers: [number, number, number][];
  /** დამატებითი გაშლა (რად.) */
  spread: number;
  /** ცერი: [CMC მოხრა, CMC მოპირისპირება, MCP, IP] */
  thumb: [number, number, number, number];
}

const c3 = (a: number, b: number, c: number): [number, number, number] => [a, b, c];

export const HAND_SHAPES: Record<HandShape, HandCurl> = {
  relaxed: {
    fingers: [c3(0.22, 0.32, 0.18), c3(0.3, 0.42, 0.22), c3(0.36, 0.48, 0.26), c3(0.44, 0.55, 0.3)],
    spread: 0,
    thumb: [0.12, 0.22, 0.18, 0.16],
  },
  open: {
    fingers: [c3(0.04, 0.07, 0.04), c3(0.05, 0.08, 0.05), c3(0.07, 0.1, 0.06), c3(0.1, 0.12, 0.08)],
    spread: 0.08,
    thumb: [-0.1, 0.02, 0.06, 0.06],
  },
  fist: {
    fingers: [c3(1.42, 1.62, 0.92), c3(1.48, 1.66, 0.95), c3(1.5, 1.66, 0.95), c3(1.52, 1.62, 0.9)],
    spread: -0.06,
    thumb: [0.38, 0.72, 0.62, 0.42],
  },
  point: {
    fingers: [c3(0.0, 0.04, 0.03), c3(1.45, 1.65, 0.92), c3(1.5, 1.66, 0.95), c3(1.52, 1.62, 0.9)],
    spread: -0.04,
    thumb: [0.34, 0.66, 0.5, 0.32],
  },
  steeple: {
    fingers: [c3(0.12, 0.1, 0.06), c3(0.12, 0.1, 0.06), c3(0.14, 0.12, 0.08), c3(0.16, 0.14, 0.1)],
    spread: 0.12,
    thumb: [-0.18, 0.12, 0.1, 0.06],
  },
  grip: {
    fingers: [c3(0.42, 0.55, 0.32), c3(0.46, 0.6, 0.35), c3(0.5, 0.62, 0.36), c3(0.55, 0.65, 0.38)],
    spread: -0.02,
    thumb: [-0.05, 0.1, 0.12, 0.1],
  },
  cup: {
    fingers: [c3(0.55, 0.7, 0.4), c3(0.6, 0.75, 0.42), c3(0.64, 0.78, 0.44), c3(0.68, 0.8, 0.45)],
    spread: -0.03,
    thumb: [0.2, 0.42, 0.3, 0.25],
  },
  touch: {
    fingers: [c3(0.18, 0.25, 0.14), c3(0.85, 1.05, 0.62), c3(1.0, 1.15, 0.7), c3(1.1, 1.2, 0.72)],
    spread: 0,
    thumb: [0.2, 0.42, 0.3, 0.22],
  },
};

export const clampCurl = (v: number) => clamp(v, -0.4, 1.8);
