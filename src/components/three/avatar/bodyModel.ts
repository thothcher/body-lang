/**
 * სხეული და ტანსაცმელი — ლოფტები ძვლების წონებით (ერთიანი, „უნაკერო“ კანი).
 * ყველა ზომა მოსვენების პოზაშია: ხელები პირდაპირ ქვემოთ, ფეხები პარალელურად.
 */
import * as THREE from "three";
import { buildLoft, chainWeights, surfacePoint, type LoftOptions, type Ring, type WeightFn } from "./loft";
import { B, P, Y } from "./proportions";

const ss = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/* ------------------------------------------------------------------
   წონები
------------------------------------------------------------------- */

const spineChain = chainWeights([
  { bone: B.chest, y: 0, blend: 0 },
  { bone: B.spine, y: Y.chest - 0.01, blend: 0.07 },
  { bone: B.hips, y: Y.spine - 0.01, blend: 0.05 },
]);

/** ტანი + მხრების ნაწილი, რომელიც ხელს მიჰყვება */
const torsoWeights: WeightFn = (x, y, z) => {
  const base = spineChain(x, y, z);
  const wArm = ss(0.125, 0.2, Math.abs(x)) * ss(1.3, 1.39, y) * 0.6;
  if (wArm <= 0) return base;
  return [...base.map(([b, w]) => [b, w * (1 - wArm)] as [number, number]), [x < 0 ? B.twA : B.twB, wArm]];
};

const pelvisWeights: WeightFn = (x, y) => {
  const top = ss(Y.spine - 0.04, Y.spine + 0.03, y);
  const thigh = ss(0.865, 0.79, y) * ss(0.02, 0.07, Math.abs(x)) * 0.55;
  const hips = Math.max(0, 1 - top - thigh);
  const out: [number, number][] = [[B.hips, hips]];
  if (top > 0) out.push([B.spine, top]);
  if (thigh > 0) out.push([x < 0 ? B.thA : B.thB, thigh]);
  return out;
};

function armWeights(side: -1 | 1, topBlend = 0.045): WeightFn {
  const A = side < 0;
  return chainWeights([
    { bone: B.chest, y: 0, blend: 0 },
    { bone: A ? B.twA : B.twB, y: Y.shoulder + 0.012, blend: topBlend },
    { bone: A ? B.loA : B.loB, y: Y.elbow, blend: 0.03 },
    { bone: A ? B.faA : B.faB, y: Y.foreMid, blend: 0.055 },
    { bone: A ? B.haA : B.haB, y: Y.wrist + 0.004, blend: 0.012 },
  ]);
}

function legWeights(side: -1 | 1): WeightFn {
  const A = side < 0;
  return chainWeights([
    { bone: B.hips, y: 0, blend: 0 },
    { bone: A ? B.thA : B.thB, y: Y.hipJoint, blend: 0.06 },
    { bone: A ? B.shA : B.shB, y: Y.knee, blend: 0.035 },
  ]);
}

const neckWeights = chainWeights([
  { bone: B.head, y: 0, blend: 0 },
  { bone: B.neck, y: Y.head + 0.012, blend: 0.026 },
  { bone: B.chest, y: Y.neck, blend: 0.022 },
]);

/* ------------------------------------------------------------------
   პროფილები
------------------------------------------------------------------- */

const SHIRT: Ring[] = [
  { y: 0.893, rx: 0.183, rzF: 0.123, rzB: 0.129, n: 2.2 },
  { y: 0.93, rx: 0.178, rzF: 0.119, rzB: 0.125, n: 2.2 },
  { y: 0.99, rx: 0.168, rzF: 0.113, rzB: 0.117 },
  { y: 1.04, rx: 0.162, rzF: 0.112, rzB: 0.112 },
  { y: 1.1, rx: 0.165, rzF: 0.117, rzB: 0.113 },
  { y: 1.17, rx: 0.172, rzF: 0.124, rzB: 0.115, n: 2.2 },
  { y: 1.24, rx: 0.18, rzF: 0.131, rzB: 0.116, cz: 0.003, n: 2.3 },
  { y: 1.3, rx: 0.186, rzF: 0.129, rzB: 0.114, n: 2.4 },
  { y: 1.35, rx: 0.199, rzF: 0.119, rzB: 0.11, n: 2.6 },
  { y: 1.39, rx: 0.213, rzF: 0.104, rzB: 0.103, cz: -0.004, n: 2.9 },
  { y: 1.425, rx: 0.197, rzF: 0.088, rzB: 0.092, cz: -0.008, n: 2.6 },
  { y: 1.45, rx: 0.138, rzF: 0.074, rzB: 0.08, cz: -0.01, n: 2.2 },
  { y: 1.467, rx: 0.08, rzF: 0.068, rzB: 0.07, cz: -0.012, n: 2 },
  { y: 1.474, rx: 0.067, rzF: 0.062, rzB: 0.065, cz: -0.012, n: 2 },
];

const JACKET: Ring[] = [
  { y: 0.8, rx: 0.19, rzF: 0.131, rzB: 0.137, n: 2.2 },
  { y: 0.86, rx: 0.187, rzF: 0.129, rzB: 0.135, n: 2.2 },
  { y: 0.93, rx: 0.181, rzF: 0.125, rzB: 0.129 },
  { y: 1.0, rx: 0.171, rzF: 0.12, rzB: 0.121 },
  { y: 1.05, rx: 0.167, rzF: 0.12, rzB: 0.118 },
  { y: 1.12, rx: 0.171, rzF: 0.126, rzB: 0.119 },
  { y: 1.2, rx: 0.181, rzF: 0.134, rzB: 0.121, n: 2.3 },
  { y: 1.28, rx: 0.191, rzF: 0.136, rzB: 0.119, n: 2.5 },
  { y: 1.34, rx: 0.205, rzF: 0.126, rzB: 0.115, n: 2.8 },
  { y: 1.39, rx: 0.224, rzF: 0.11, rzB: 0.109, cz: -0.004, n: 3 },
  { y: 1.425, rx: 0.208, rzF: 0.091, rzB: 0.095, cz: -0.008, n: 2.7 },
  { y: 1.45, rx: 0.146, rzF: 0.078, rzB: 0.083, cz: -0.01, n: 2.2 },
  { y: 1.468, rx: 0.083, rzF: 0.071, rzB: 0.073, cz: -0.012 },
  { y: 1.477, rx: 0.071, rzF: 0.067, rzB: 0.069, cz: -0.012 },
];

const PELVIS: Ring[] = [
  { y: 0.775, rx: 0.1, rzF: 0.06, rzB: 0.07, cz: -0.005 },
  { y: 0.8, rx: 0.155, rzF: 0.09, rzB: 0.115, cz: -0.01 },
  { y: 0.84, rx: 0.172, rzF: 0.104, rzB: 0.127, cz: -0.012 },
  { y: 0.88, rx: 0.178, rzF: 0.11, rzB: 0.13, cz: -0.012 },
  { y: 0.925, rx: 0.17, rzF: 0.108, rzB: 0.121, cz: -0.008 },
  { y: 0.98, rx: 0.157, rzF: 0.103, rzB: 0.109 },
  { y: 1.03, rx: 0.151, rzF: 0.102, rzB: 0.104 },
  { y: 1.05, rx: 0.149, rzF: 0.101, rzB: 0.102 },
];

function legRings(side: -1 | 1, formal: boolean): Ring[] {
  const cx = side * P.hipX;
  const hemR = formal ? 0.056 : 0.054;
  return [
    { y: 0.062, rx: hemR, rzF: hemR + 0.004, rzB: hemR, cx, cz: 0.004 },
    { y: 0.12, rx: 0.054, rzF: 0.056, rzB: 0.055, cx, cz: 0.002 },
    { y: 0.22, rx: 0.055, rzF: 0.054, rzB: 0.059, cx },
    { y: 0.32, rx: 0.058, rzF: 0.055, rzB: 0.063, cx },
    { y: 0.4, rx: 0.059, rzF: 0.057, rzB: 0.06, cx },
    { y: Y.knee, rx: 0.06, rzF: 0.059, rzB: 0.058, cx },
    { y: 0.55, rx: 0.066, rzF: 0.066, rzB: 0.064, cx },
    { y: 0.65, rx: 0.072, rzF: 0.073, rzB: 0.071, cx },
    { y: 0.75, rx: 0.079, rzF: 0.079, rzB: 0.08, cx },
    { y: 0.85, rx: 0.086, rzF: 0.084, rzB: 0.088, cx },
    { y: 0.93, rx: 0.085, rzF: 0.084, rzB: 0.088, cx: side * 0.083 },
    { y: 0.99, rx: 0.078, rzF: 0.078, rzB: 0.08, cx: side * 0.075 },
  ];
}

function armRings(side: -1 | 1): Ring[] {
  const cx = side * P.shoulderX;
  const cz = P.shoulderZ;
  const w = Y.wrist;
  return [
    { y: w - 0.008, rx: 0.017, rzF: 0.025, cx, cz },
    { y: w + 0.012, rx: 0.0195, rzF: 0.0272, cx, cz },
    { y: w + 0.05, rx: 0.0245, rzF: 0.031, cx, cz },
    { y: w + 0.1, rx: 0.0305, rzF: 0.0355, cx, cz },
    { y: w + 0.15, rx: 0.0355, rzF: 0.039, cx, cz },
    { y: w + 0.2, rx: 0.0385, rzF: 0.0408, cx, cz },
    { y: Y.elbow - 0.018, rx: 0.0365, rzF: 0.0375, cx, cz },
    { y: Y.elbow + 0.03, rx: 0.0372, rzF: 0.0395, rzB: 0.038, cx, cz },
    { y: Y.elbow + 0.1, rx: 0.0405, rzF: 0.0455, rzB: 0.042, cx, cz },
    { y: Y.elbow + 0.17, rx: 0.0435, rzF: 0.0465, rzB: 0.045, cx, cz },
    { y: Y.shoulder - 0.07, rx: 0.048, rzF: 0.049, cx, cz },
    { y: Y.shoulder - 0.025, rx: 0.049, rzF: 0.049, cx, cz },
    { y: Y.shoulder + 0.004, rx: 0.042, rzF: 0.042, cx, cz },
    { y: Y.shoulder + 0.024, rx: 0.022, rzF: 0.022, cx, cz },
  ];
}

function sleeveRings(side: -1 | 1, formal: boolean): Ring[] {
  const cx = side * P.shoulderX;
  const cz = P.shoulderZ;
  if (!formal) {
    return [
      { y: 1.25, rx: 0.056, rzF: 0.058, cx, cz },
      { y: 1.29, rx: 0.0575, rzF: 0.0595, cx, cz },
      { y: 1.34, rx: 0.0615, rzF: 0.0625, cx, cz },
      { y: 1.38, rx: 0.0625, rzF: 0.062, cx, cz },
      { y: 1.41, rx: 0.056, rzF: 0.056, cx, cz },
      { y: 1.435, rx: 0.034, rzF: 0.034, cx, cz },
    ];
  }
  const w = Y.wrist;
  return [
    { y: w + 0.032, rx: 0.034, rzF: 0.04, cx, cz },
    { y: w + 0.1, rx: 0.04, rzF: 0.045, cx, cz },
    { y: w + 0.2, rx: 0.048, rzF: 0.051, cx, cz },
    { y: Y.elbow, rx: 0.05, rzF: 0.052, cx, cz },
    { y: Y.elbow + 0.09, rx: 0.054, rzF: 0.057, cx, cz },
    { y: Y.elbow + 0.19, rx: 0.059, rzF: 0.061, cx, cz },
    { y: 1.38, rx: 0.064, rzF: 0.063, cx, cz },
    { y: 1.41, rx: 0.058, rzF: 0.058, cx, cz },
    { y: 1.435, rx: 0.036, rzF: 0.036, cx, cz },
  ];
}

const NECK: Ring[] = [
  { y: 1.4, rx: 0.05, rzF: 0.05, cz: -0.022 },
  { y: 1.46, rx: 0.054, rzF: 0.055, rzB: 0.056, cz: -0.018 },
  { y: 1.5, rx: 0.0525, rzF: 0.054, rzB: 0.056, cz: -0.013 },
  { y: 1.54, rx: 0.0545, rzF: 0.055, rzB: 0.058, cz: -0.008 },
  { y: 1.58, rx: 0.058, rzF: 0.058, rzB: 0.06, cz: -0.005 },
  { y: 1.625, rx: 0.048, rzF: 0.048, cz: -0.002 },
];

/* ------------------------------------------------------------------
   ზედაპირის დეტალები
------------------------------------------------------------------- */

/** მაისურის რბილი ნაოჭები: წელთან და იღლიებთან */
const shirtFolds = (x: number, y: number, _z: number, theta: number) => {
  const waist = Math.exp(-Math.pow((y - 1.0) / 0.07, 2));
  const pit = Math.exp(-Math.pow((y - 1.33) / 0.05, 2)) * ss(0.13, 0.19, Math.abs(x));
  return (
    0.0016 * waist * Math.sin(theta * 11 + y * 30) +
    0.0012 * pit * Math.sin(y * 140 + Math.abs(theta) * 4) -
    0.002 * ss(0.95, 0.9, y) * Math.sin(theta * 7) * 0.5
  );
};

/** ადამის ვაშლი და მკერდ-ლავიწ-დვრილისებრი კუნთები */
const neckDetail = (_x: number, y: number, _z: number, theta: number) => {
  const front = Math.exp(-Math.pow(theta / 0.28, 2));
  const apple = Math.exp(-Math.pow((y - 1.515) / 0.012, 2)) * front * 0.0035;
  const scm = Math.exp(-Math.pow((Math.abs(theta) - 0.7 + (y - 1.47) * 4) / 0.22, 2)) * ss(1.44, 1.5, y) * ss(1.6, 1.54, y) * 0.0022;
  return apple + scm;
};

/** შარვლის წინა ნაკეცი (ოფიციალური) */
const crease = (_x: number, _y: number, _z: number, theta: number) =>
  0.0016 * Math.exp(-Math.pow(theta / 0.05, 2)) + 0.0008 * Math.exp(-Math.pow((Math.abs(theta) - Math.PI) / 0.05, 2));

/** ჯინსის გვერდითი ნაკერები */
const seams = (_x: number, y: number, _z: number, theta: number) =>
  0.0007 * Math.exp(-Math.pow((Math.abs(theta) - Math.PI / 2) / 0.04, 2)) +
  0.0012 * ss(0.2, 0.06, y) * Math.sin(theta * 6 + y * 60);

/* ------------------------------------------------------------------
   დეკალები ტანზე (პიჯაკის საყელო, პერანგი, ჰალსტუხი)
------------------------------------------------------------------- */

interface StripOpts {
  loft: LoftOptions;
  y0: number;
  y1: number;
  /** θ-ს დიაპაზონი სიმაღლეზე */
  range: (y: number) => [number, number];
  offset: number;
  /** შიდა კიდის „კედელი“ (ლაცკანი) — ქვედა offset */
  wallFrom?: number;
  rows?: number;
  cols?: number;
}

function stripGeometry(o: StripOpts): THREE.BufferGeometry {
  const rows = o.rows ?? 40;
  const cols = o.cols ?? 10;
  const pos: number[] = [];
  const idx: number[] = [];
  const grid = (offset: (i: number) => number, colsN: number, thetaAt: (y: number, i: number) => number) => {
    const start = pos.length / 3;
    for (let j = 0; j <= rows; j++) {
      const y = o.y0 + ((o.y1 - o.y0) * j) / rows;
      for (let i = 0; i <= colsN; i++) {
        const p = surfacePoint(o.loft, y, thetaAt(y, i), offset(i));
        pos.push(p.x, p.y, p.z);
      }
    }
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < colsN; i++) {
        const a = start + j * (colsN + 1) + i;
        const b = a + colsN + 1;
        idx.push(a, a + 1, b + 1, a, b + 1, b);
      }
    return start;
  };
  // ზედა ზედაპირი
  grid(
    () => o.offset,
    cols,
    (y, i) => {
      const [t0, t1] = o.range(y);
      return t0 + ((t1 - t0) * i) / cols;
    },
  );
  // შიდა კიდის კედელი
  if (o.wallFrom !== undefined) {
    const wf = o.wallFrom;
    const off = o.offset;
    grid(
      (i) => (i === 0 ? wf : off),
      1,
      (y) => o.range(y)[0],
    );
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  // ორივე მხარე ჩანს — ნორმალი რომ არ „ჩაბრუნდეს“, θ ზრდით ვაგებთ
  return g;
}

/** სტატიკური გეომეტრიისთვის წონების მინიჭება */
function skin(g: THREE.BufferGeometry, w: WeightFn) {
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  const si = new Uint16Array(p.count * 4);
  const sw = new Float32Array(p.count * 4);
  for (let v = 0; v < p.count; v++) {
    const list = w(p.getX(v), p.getY(v), p.getZ(v)).slice(0, 4);
    const sum = list.reduce((a, b) => a + b[1], 0) || 1;
    list.forEach(([b, wt], k) => {
      si[v * 4 + k] = b;
      sw[v * 4 + k] = wt / sum;
    });
  }
  g.setAttribute("skinIndex", new THREE.BufferAttribute(si, 4));
  g.setAttribute("skinWeight", new THREE.BufferAttribute(sw, 4));
  return g;
}

function mergeAll(list: THREE.BufferGeometry[]) {
  const pos: number[] = [];
  const nor: number[] = [];
  const idx: number[] = [];
  for (const g of list) {
    const base = pos.length / 3;
    const ng = g.index ? g : g;
    const p = ng.getAttribute("position") as THREE.BufferAttribute;
    const n = ng.getAttribute("normal") as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      pos.push(p.getX(i), p.getY(i), p.getZ(i));
      nor.push(n.getX(i), n.getY(i), n.getZ(i));
    }
    const ix = ng.getIndex();
    if (ix) for (let i = 0; i < ix.count; i++) idx.push(base + ix.getX(i));
    else for (let i = 0; i < p.count; i++) idx.push(base + i);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

/* ------------------------------------------------------------------
   აგება
------------------------------------------------------------------- */

export interface BodyGeometries {
  torso: THREE.BufferGeometry;
  pelvis: THREE.BufferGeometry;
  legs: THREE.BufferGeometry[];
  arms: THREE.BufferGeometry[];
  sleeves: THREE.BufferGeometry[];
  neck: THREE.BufferGeometry;
  /** მაისურის საყელო / პერანგის საყელო და მანჟეტები */
  trim: THREE.BufferGeometry;
  /** მხოლოდ ოფიციალურზე: პერანგის წინა ნაწილი */
  shirtFront?: THREE.BufferGeometry;
  lapels?: THREE.BufferGeometry;
  tie?: THREE.BufferGeometry;
  buttons?: THREE.BufferGeometry;
}

const cache = new Map<string, BodyGeometries>();

export function buildBody(formal: boolean): BodyGeometries {
  const key = formal ? "formal" : "casual";
  const hit = cache.get(key);
  if (hit) return hit;

  const torsoLoft: LoftOptions = {
    rings: formal ? JACKET : SHIRT,
    radial: 96,
    density: 150,
    capTop: true,
    hemBottom: formal ? 0.004 : 0.003,
    displace: formal ? undefined : shirtFolds,
    weights: torsoWeights,
    uvScale: formal ? 0.12 : 0.1,
  };
  const torso = buildLoft(torsoLoft);

  const pelvis = buildLoft({
    rings: PELVIS,
    radial: 80,
    density: 150,
    capTop: true,
    capBottom: true,
    weights: pelvisWeights,
    uvScale: 0.14,
  });

  const legs = ([-1, 1] as const).map((s) =>
    buildLoft({
      rings: legRings(s, formal),
      radial: 56,
      density: 110,
      capTop: true,
      hemBottom: 0.003,
      displace: formal ? crease : seams,
      weights: legWeights(s),
      uvScale: 0.14,
    }),
  );

  const arms = ([-1, 1] as const).map((s) =>
    buildLoft({
      rings: armRings(s),
      radial: 48,
      density: 160,
      capTop: true,
      capBottom: true,
      weights: armWeights(s),
      uvScale: 0.05,
    }),
  );

  const sleeves = ([-1, 1] as const).map((s) =>
    buildLoft({
      rings: sleeveRings(s, formal),
      radial: 56,
      density: 140,
      capTop: true,
      hemBottom: 0.003,
      weights: armWeights(s, 0.06),
      uvScale: formal ? 0.12 : 0.1,
    }),
  );

  const neck = buildLoft({
    rings: NECK,
    radial: 56,
    density: 200,
    capTop: true,
    capBottom: true,
    displace: neckDetail,
    weights: neckWeights,
    uvScale: 0.05,
  });

  // --- საყელო / მანჟეტები
  const trimParts: THREE.BufferGeometry[] = [];
  if (!formal) {
    // მაისურის რეზინისებრი საყელო
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 64; i++) {
      const t = (i / 64) * Math.PI * 2;
      pts.push(surfacePoint(torsoLoft, 1.4685, t, 0.001));
    }
    trimParts.push(skin(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 96, 0.0042, 10, true), torsoWeights));
  } else {
    // პერანგის საყელო კისრის გარშემო
    trimParts.push(
      buildLoft({
        rings: [
          { y: 1.458, rx: 0.064, rzF: 0.062, rzB: 0.064, cz: -0.012 },
          { y: 1.478, rx: 0.062, rzF: 0.0605, rzB: 0.063, cz: -0.011 },
          { y: 1.5, rx: 0.0595, rzF: 0.058, rzB: 0.061, cz: -0.009 },
        ],
        radial: 64,
        density: 400,
        weights: (x, y, z) => (y > 1.48 ? neckWeights(x, y, z) : spineChain(x, y, z)),
      }),
    );
    // მანჟეტები
    for (const s of [-1, 1] as const) {
      const cx = s * P.shoulderX;
      trimParts.push(
        buildLoft({
          rings: [
            { y: Y.wrist + 0.012, rx: 0.026, rzF: 0.033, cx, cz: P.shoulderZ },
            { y: Y.wrist + 0.045, rx: 0.03, rzF: 0.036, cx, cz: P.shoulderZ },
          ],
          radial: 40,
          density: 300,
          hemBottom: 0.0025,
          weights: armWeights(s),
        }),
      );
    }
  }
  const trim = skin(mergeAll(trimParts), (x, y, z) => {
    if (!formal) return torsoWeights(x, y, z);
    if (Math.abs(x) > 0.12 && y < 1.2) return armWeights(x < 0 ? -1 : 1)(x, y, z);
    return y > 1.48 ? neckWeights(x, y, z) : spineChain(x, y, z);
  });

  const out: BodyGeometries = { torso, pelvis, legs, arms, sleeves, neck, trim };

  if (formal) {
    const vHalf = (y: number) => 0.44 * ss(1.085, 1.46, y) ** 0.9;
    // პერანგის წინა ნაწილი (V ღიობში)
    out.shirtFront = skin(
      stripGeometry({ loft: torsoLoft, y0: 1.08, y1: 1.468, range: (y) => [-vHalf(y) - 0.04, vHalf(y) + 0.04], offset: 0.0012, rows: 50, cols: 16 }),
      torsoWeights,
    );
    // ლაცკნები (ორივე მხარე)
    const lapelW = (y: number) => 0.06 + 0.26 * ss(1.1, 1.37, y) - 0.12 * ss(1.39, 1.46, y);
    const lapelParts = [1, -1].map((s) =>
      stripGeometry({
        loft: torsoLoft,
        y0: 1.095,
        y1: 1.462,
        range: (y) =>
          s > 0 ? [vHalf(y), vHalf(y) + lapelW(y)] : [-vHalf(y), -vHalf(y) - lapelW(y)],
        offset: 0.0034,
        wallFrom: 0.0008,
        rows: 50,
        cols: 12,
      }),
    );
    out.lapels = skin(mergeAll(lapelParts), torsoWeights);
    // ჰალსტუხი
    const tieHalf = (y: number) => (0.075 + (1.44 - y) * 0.42) * ss(1.084, 1.11, y);
    const tie = stripGeometry({
      loft: torsoLoft,
      y0: 1.084,
      y1: 1.448,
      range: (y) => [-tieHalf(y) * 0.45, tieHalf(y) * 0.45],
      offset: 0.0038,
      rows: 50,
      cols: 8,
    });
    const knot = stripGeometry({
      loft: torsoLoft,
      y0: 1.438,
      y1: 1.466,
      range: (y) => [-0.06 + (y - 1.438) * 0.6, 0.06 - (y - 1.438) * 0.6],
      offset: 0.0068,
      wallFrom: 0.002,
      rows: 6,
      cols: 8,
    });
    out.tie = skin(mergeAll([tie, knot]), torsoWeights);
    // ღილები
    const btns: THREE.BufferGeometry[] = [];
    for (const y of [1.07, 0.995]) {
      const p = surfacePoint(torsoLoft, y, 0, 0.0028);
      const c = new THREE.CylinderGeometry(0.0085, 0.0085, 0.0032, 20);
      c.rotateX(Math.PI / 2);
      c.translate(p.x, p.y, p.z);
      btns.push(c);
    }
    out.buttons = skin(mergeAll(btns), torsoWeights);
  }

  cache.set(key, out);
  return out;
}
