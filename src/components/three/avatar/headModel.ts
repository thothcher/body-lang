/**
 * თავის მოდელი — SDF სკულპტურა.
 *
 * კოორდინატები თავის ლოკალურ სივრცეშია (მეტრი): საწყისი = თავის ცენტრი
 * (ნიკაპსა და კეფას შორის შუაში), +Z = სახე, +Y = ზემოთ.
 * ნიშნულები ზრდასრული ადამიანის საშუალო ანთროპომეტრიას მიჰყვება.
 */
import * as THREE from "three";
import {
  capsule,
  clamp,
  ellipsoid,
  meshSDF,
  mix,
  smin,
  smoothstep,
  sphere,
  ssub,
  sint,
  type V3,
} from "./sdf";
import { rng } from "./textures";
import { fromGeometry, type GeoData } from "./geo";

/* ------------------------------------------------------------------
   თვალი და ქუთუთოები — საერთო პარამეტრები (Head.tsx-იც იყენებს)
------------------------------------------------------------------- */

export const EYE = {
  x: 0.0318,
  y: 0.0045,
  z: 0.0668,
  /** თვალის კაკლის რადიუსი */
  r: 0.0121,
  /** ფერადი გარსის კუთხური რადიუსი */
  iris: 0.5,
  /** სტატიკური ქუთუთოს გარსი */
  lidIn: 0.0133,
  lidOut: 0.0159,
  /** მოძრავი ქუთუთო (ხამხამი) */
  blinkR: 0.01265,
};

const U_INNER = 1.02;
const U_OUTER = 1.14;
const TILT = 0.05;

/** u (ლატერალური კუთხე, + = საფეთქლისკენ) → t ∈ [−1, 1] */
export function lidT(u: number) {
  return u < 0 ? u / U_INNER : u / U_OUTER;
}
function lidShape(u: number) {
  const t = clamp(lidT(u), -1, 1);
  return Math.pow(Math.cos((t * Math.PI) / 2), 0.62);
}
/** ზედა ქუთუთოს კიდის ვერტიკალური კუთხე */
export function lidUpper(u: number) {
  return 0.4 * lidShape(u) + TILT * u - 0.02;
}
/** ქვედა ქუთუთოს კიდე */
export function lidLower(u: number) {
  return -0.4 * lidShape(u) + TILT * u + 0.005;
}
export const LID_U = { inner: -U_INNER, outer: U_OUTER };

/* ------------------------------------------------------------------
   დამხმარე ფორმები
------------------------------------------------------------------- */

/** კაფსულების ჯაჭვი (min) */
function chain(x: number, y: number, z: number, pts: V3[], r: number | number[]) {
  let d = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const ra = Array.isArray(r) ? r[i] : r;
    const rb = Array.isArray(r) ? r[i + 1] : r;
    d = Math.min(d, capsule(x, y, z, pts[i], pts[i + 1], ra, rb));
  }
  return d;
}

/** მოხრილი ელიფსოიდი ტუჩებისთვის — მიჰყვება კბილების რკალს */
function lip(x: number, y: number, z: number, y0: number, z0: number, r: V3, bend = 21) {
  return ellipsoid(x, y - y0, z - (z0 - bend * x * x), [0, 0, 0], r);
}

/** სიმეტრიული ჯაჭვი: X-ის ორივე მხარეს — შუა ხაზზე „ნაკერის“ გარეშე */
function mirrorPts(half: V3[]): V3[] {
  const left = half.map(([x, y, z]) => [-x, y, z] as V3).reverse();
  return [...left, ...half];
}

const JAW = mirrorPts([
  [0.006, -0.1, 0.073],
  [0.019, -0.098, 0.066],
  [0.031, -0.0945, 0.05],
  [0.0405, -0.087, 0.027],
  [0.0462, -0.075, -0.002],
]);
const JAW_R = [0.0105, 0.0102, 0.0098, 0.0094, 0.009].reverse().concat([0.0105, 0.0102, 0.0098, 0.0094, 0.009]);

const BROW = mirrorPts([
  [0.008, 0.0245, 0.0835],
  [0.026, 0.026, 0.0785],
  [0.044, 0.0235, 0.07],
  [0.058, 0.017, 0.054],
]);

/* ------------------------------------------------------------------
   ყური — ლოკალური ბაზისი
------------------------------------------------------------------- */

const EAR_C: V3 = [0.0728, -0.006, -0.014];
const earN = new THREE.Vector3(1, 0, -0.2).normalize(); // გარეთ და ოდნავ უკან
const earV = new THREE.Vector3(0, 1, -0.24).normalize(); // ზემოთ, ზედა ნაწილი უკან
const earU = new THREE.Vector3().crossVectors(earV, earN).normalize(); // წინ
earV.crossVectors(earN, earU).normalize();

function earSDF(ax: number, y: number, z: number) {
  const px = ax - EAR_C[0];
  const py = y - EAR_C[1];
  const pz = z - EAR_C[2];
  const u = px * earU.x + py * earU.y + pz * earU.z;
  const v = px * earV.x + py * earV.y + pz * earV.z;
  const w = px * earN.x + py * earN.y + pz * earN.z;
  // ფირფიტა — უკანა კიდისკენ თხელდება და შორდება თავს
  const lift = smoothstep(0.012, -0.018, u) * 0.0035;
  let d = ellipsoid(u, v, w - lift, [-0.003, 0.001, 0.002], [0.0155, 0.03, 0.0042]);
  // ხვეული (helix)
  d = smin(
    d,
    chain(u, v, w - lift, [
      [0.008, 0.008, 0.004],
      [0.004, 0.021, 0.0055],
      [-0.006, 0.0285, 0.0065],
      [-0.0155, 0.023, 0.007],
      [-0.019, 0.01, 0.0072],
      [-0.0175, -0.006, 0.0068],
      [-0.012, -0.0175, 0.006],
    ], [0.0022, 0.0029, 0.0032, 0.0032, 0.0031, 0.003, 0.0028]),
    0.0022,
  );
  // ანტიჰელიქსი
  d = smin(
    d,
    chain(u, v, w - lift, [
      [-0.004, 0.019, 0.0052],
      [-0.0095, 0.007, 0.006],
      [-0.0085, -0.006, 0.0058],
      [-0.0035, -0.0125, 0.005],
    ], 0.0019),
    0.002,
  );
  // ნიჟარა (concha) — ჩაღრმავება
  d = ssub(d, ellipsoid(u, v, w, [0.0005, -0.0035, 0.0078 + lift * 0.5], [0.0075, 0.0105, 0.0048]), 0.0018);
  // ბიბილო
  d = smin(d, ellipsoid(u, v, w - lift, [-0.0055, -0.0235, 0.0035], [0.0078, 0.0085, 0.0042]), 0.003);
  // ტრაგუსი
  d = smin(d, sphere(u, v, w, [0.0085, -0.0045, 0.0052], 0.0029), 0.0025);
  return d;
}

/* ------------------------------------------------------------------
   თვალის ბუდე და ქუთუთოები (SDF)
------------------------------------------------------------------- */

/** ქუთუთოს ჭრილის კუთხური მანძილი (უარყოფითი = ჭრილის შიგნით) */
function openingSDF(ax: number, y: number, z: number) {
  const dx = ax - EYE.x;
  const dy = y - EYE.y;
  const dz = z - EYE.z;
  const u = Math.atan2(dx, dz);
  const v = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));
  const t = lidT(u);
  return Math.max((Math.abs(t) - 1) * 1.05, v - lidUpper(u), lidLower(u) - v) * EYE.lidOut;
}

function lidShellSDF(ax: number, y: number, z: number) {
  const dist = sphere(ax, y, z, [EYE.x, EYE.y, EYE.z], 0);
  const mid = (EYE.lidIn + EYE.lidOut) / 2;
  const half = (EYE.lidOut - EYE.lidIn) / 2;
  const shell = Math.abs(dist - mid) - half;
  return Math.max(shell, -openingSDF(ax, y, z));
}

/* ------------------------------------------------------------------
   სრული თავის SDF
------------------------------------------------------------------- */

function craniumSDF(x: number, y: number, z: number) {
  let d = ellipsoid(x, y, z, [0, 0.02, -0.01], [0.0732, 0.097, 0.0975]);
  // შუბლი — წინ და ოდნავ მაღლა
  d = smin(d, ellipsoid(x, y, z, [0, 0.048, 0.028], [0.06, 0.058, 0.062]), 0.024);
  // კეფის ბორცვი
  d = smin(d, ellipsoid(x, y, z, [0, -0.012, -0.05], [0.058, 0.06, 0.056]), 0.03);
  return d;
}

export function headSDF(x: number, y: number, z: number): number {
  const ax = Math.abs(x);
  let d = craniumSDF(x, y, z);

  // --- სახის ქვედა მასა: ლოყებიდან ყბამდე ერთიანი, ამოზნექილი ფორმა
  d = smin(d, ellipsoid(x, y, z, [0, -0.05, 0.016], [0.0535, 0.06, 0.072]), 0.03);
  // ზედა ყბა (ტუჩების საყრდენი)
  d = smin(d, ellipsoid(x, y, z, [0, -0.045, 0.047], [0.039, 0.041, 0.047]), 0.02);
  // --- ქვედა ყბა
  if (y < -0.03 && z > -0.04) {
    d = smin(d, chain(x, y, z, JAW, JAW_R), 0.018);
    d = smin(d, ellipsoid(x, y, z, [0, -0.096, 0.077], [0.0165, 0.013, 0.0135]), 0.011);
  }
  // ნიკაპის ქვეშ → კისერი
  d = smin(d, ellipsoid(x, y, z, [0, -0.088, 0.02], [0.038, 0.017, 0.042]), 0.018);

  // --- ლოყები და ყვრიმალები
  d = smin(d, ellipsoid(ax, y, z, [0.039, -0.024, 0.057], [0.02, 0.022, 0.02]), 0.026);
  d = smin(d, ellipsoid(ax, y, z, [0.05, -0.004, 0.054], [0.022, 0.0115, 0.02]), 0.014);
  d = smin(d, capsule(ax, y, z, [0.056, -0.004, 0.048], [0.067, -0.007, 0.004], 0.0068, 0.0058), 0.012);

  // --- წარბის რკალი
  if (y > 0.0 && z > 0.03) d = smin(d, chain(x, y, z, BROW, 0.0078), 0.013);

  // --- ცხვირი
  if (ax < 0.03 && y > -0.055 && y < 0.03 && z > 0.07) {
    d = smin(d, capsule(x, y, z, [0, 0.013, 0.0855], [0, -0.023, 0.1065], 0.005, 0.0068), 0.01);
    d = smin(d, capsule(ax, y, z, [0.007, 0.002, 0.083], [0.0098, -0.027, 0.0955], 0.0052, 0.0064), 0.008);
    d = smin(d, sphere(x, y, z, [0, -0.0282, 0.1075], 0.0088), 0.0065);
    d = smin(d, sphere(ax, y, z, [0.0128, -0.0358, 0.0952], 0.0071), 0.0055);
    d = smin(d, capsule(x, y, z, [0, -0.031, 0.1045], [0, -0.0418, 0.0968], 0.0034, 0.0032), 0.004);
    // ნესტოები
    d = ssub(d, ellipsoid(ax, y, z, [0.0072, -0.0403, 0.0995], [0.0037, 0.0019, 0.0052]), 0.0014);
  }

  // --- ტუჩები
  if (ax < 0.04 && y > -0.083 && y < -0.042 && z > 0.06) {
    d = smin(d, lip(x, y, z, -0.0572, 0.0942, [0.0242, 0.005, 0.006]), 0.0045);
    d = smin(d, lip(x, y, z, -0.0683, 0.093, [0.0212, 0.0059, 0.0066]), 0.0045);
    // პირის ხაზი
    d = ssub(d, lip(x, y, z, -0.0628, 0.0975, [0.0248, 0.00055, 0.0085]), 0.001);
    // ნიკაპ-ტუჩის ნაკეცი
    d = ssub(d, lip(x, y, z, -0.08, 0.094, [0.015, 0.0014, 0.0032], 14), 0.004);
  }

  // --- თვალის ბუდე + ქუთუთოები
  if (ax > 0.008 && ax < 0.06 && y > -0.022 && y < 0.032 && z > 0.035) {
    const rec = sphere(ax, y, z, [EYE.x, EYE.y, EYE.z], EYE.lidOut + 0.0002);
    d = ssub(d, rec, 0.0035);
    d = smin(d, lidShellSDF(ax, y, z), 0.0042);
  }

  // --- ყურები
  if (ax > 0.045 && Math.abs(y - EAR_C[1]) < 0.045 && Math.abs(z - EAR_C[2]) < 0.04) {
    d = smin(d, earSDF(ax, y, z), 0.0045);
  }
  return d;
}

/* ------------------------------------------------------------------
   გამომეტყველება — სივრცითი გადაადგილების ველები (morph targets)
------------------------------------------------------------------- */

export type Expr = "smile" | "frown" | "browUp" | "browDown";
export const EXPRS: Expr[] = ["smile", "frown", "browUp", "browDown"];

const g2 = (dx: number, dy: number, s: number) => Math.exp(-(dx * dx + dy * dy) / (2 * s * s));

export function exprDelta(x: number, y: number, z: number, e: Expr): V3 {
  const front = smoothstep(0.03, 0.07, z);
  if (front <= 0) return [0, 0, 0];
  const sx = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  switch (e) {
    case "smile": {
      const c = g2(ax - 0.026, y + 0.063, 0.0085) * front;
      const ch = g2(ax - 0.038, y + 0.031, 0.014) * front;
      const lipS = g2(ax - 0.012, y + 0.063, 0.012) * front;
      return [sx * (0.0024 * c + 0.0006 * lipS), 0.0034 * c + 0.0021 * ch + 0.0006 * lipS, -0.0014 * c + 0.0014 * ch];
    }
    case "frown": {
      const c = g2(ax - 0.026, y + 0.065, 0.009) * front;
      const ll = g2(ax, y + 0.072, 0.009) * front;
      const chin = g2(ax, y + 0.097, 0.012) * front;
      return [sx * -0.0008 * c, -0.0032 * c + 0.0011 * ll + 0.0012 * chin, -0.0006 * c + 0.0009 * ll + 0.0006 * chin];
    }
    case "browUp": {
      const b = Math.exp(-Math.pow((y - 0.027) / 0.016, 2)) * smoothstep(0.068, 0.04, ax) * front;
      const lid = g2(ax - EYE.x, y - 0.016, 0.008) * front;
      return [0, 0.0044 * b + 0.0012 * lid, 0.0004 * b];
    }
    case "browDown": {
      const b = g2(ax - 0.019, y - 0.025, 0.011) * front;
      const mid = g2(ax, y - 0.02, 0.008) * front;
      return [sx * -0.0016 * b, -0.0032 * b - 0.0008 * mid, 0.0012 * b];
    }
  }
}

/* ------------------------------------------------------------------
   კანის ფერის ვარიაციები (ვერტექს-ფერები)
------------------------------------------------------------------- */

/** ფერის ნიღბები თითო წვეროზე — ერთხელ ითვლება, კანის ტონი კი მერე იცვლება */
export const MASKS = ["lip", "cheek", "nose", "ala", "ear", "under", "lid", "brow", "beard", "scalp", "ao", "mottle", "mole"] as const;

/** 3D value-noise — კანის არათანაბარი ტონისთვის (ლაქები, კაპილარები) */
function hash3(x: number, y: number, z: number) {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return h - Math.floor(h);
}
function noise3(x: number, y: number, z: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = x - xi;
  const yf = y - yi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const w = zf * zf * (3 - 2 * zf);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  return l(
    l(l(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), u), l(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), u), v),
    l(l(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), u), l(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), u), v),
    w,
  );
}

/** რამდენიმე ხალი — პატარა, ბუნებრივი დეტალი */
const MOLES: [number, number, number, number][] = [
  [0.036, -0.044, 0.072, 0.0011],
  [-0.047, 0.012, 0.064, 0.0009],
  [0.019, 0.058, 0.084, 0.0008],
];

function masksAt(x: number, y: number, z: number, ao: number, out: Float32Array, o: number) {
  const ax = Math.abs(x);
  const front = smoothstep(0.02, 0.07, z);
  const lipU = lip(x, y, z, -0.0572, 0.0942, [0.0242, 0.005, 0.006]);
  const lipL = lip(x, y, z, -0.0683, 0.093, [0.0212, 0.0059, 0.0066]);
  const lipM = smoothstep(0.0032, 0.0002, Math.min(lipU, lipL)) * front * smoothstep(0.029, 0.021, ax);
  const browY = 0.027 - Math.pow((ax - 0.036) / 0.03, 2) * 0.004;
  const brow = Math.exp(-Math.pow((y - browY) / 0.0042, 2)) * smoothstep(0.064, 0.05, ax) * smoothstep(0.008, 0.016, ax);
  const beard =
    (smoothstep(-0.05, -0.075, y) * smoothstep(0.065, 0.045, ax) + g2(ax, y + 0.053, 0.012) * 0.8) *
    smoothstep(0.0, 0.03, z) *
    (1 - lipM);
  out[o] = lipM;
  out[o + 1] = g2(ax - 0.045, y + 0.026, 0.017) * front;
  out[o + 2] = g2(ax, y + 0.03, 0.012) * front;
  out[o + 3] = g2(ax - 0.014, y + 0.039, 0.007) * front;
  out[o + 4] = smoothstep(0.066, 0.08, ax) * smoothstep(0.03, 0.0, Math.abs(y + 0.007));
  out[o + 5] = g2(ax - EYE.x, y + 0.012, 0.0085) * front;
  out[o + 6] = g2(ax - EYE.x, y - 0.012, 0.0075) * front;
  out[o + 7] = brow * front;
  out[o + 8] = clamp(beard, 0, 1);
  out[o + 9] = smoothstep(-0.003, 0.009, hairlineDist(x, y, z));
  out[o + 10] = ao;
  // ფერის ვარიაცია ორ მასშტაბზე: −1 … 1
  out[o + 11] = (noise3(x * 90, y * 90, z * 90) - 0.5) * 1.3 + (noise3(x * 320, y * 320, z * 320) - 0.5) * 0.7;
  let mole = 0;
  for (const [mx, my, mz, mr] of MOLES) {
    const dd = Math.hypot(x - mx, y - my, z - mz);
    mole = Math.max(mole, smoothstep(mr, mr * 0.4, dd));
  }
  out[o + 12] = mole;
}

const hex = (h: string) => {
  const c = new THREE.Color(h);
  return [c.r, c.g, c.b];
};
const T_CHEEK = hex("#d4706a");
const T_NOSE = hex("#cf6e66");
const T_ALA = hex("#c8605c");
const T_EAR = hex("#c86560");
const T_UNDER = hex("#6f5560");
const T_LID = hex("#9a6a6a");
const T_BEARD = hex("#5a5560");
const T_LIP = hex("#a8505a");
const T_BLOTCH = hex("#c4625c");
const T_MOLE = hex("#5a3a2c");

/** ნიღბებიდან ვერტექს-ფერები (in-place) */
export function paintHead(colors: Float32Array, masks: Float32Array, skin: string, hair: string) {
  const b = hex(skin);
  const h = hex(hair);
  const lipC = [0, 1, 2].map((i) => (b[i] + (T_LIP[i] - b[i]) * 0.55) * 0.88);
  const M = MASKS.length;
  const n = colors.length / 3;
  for (let v = 0; v < n; v++) {
    const m = v * M;
    let r = b[0];
    let g = b[1];
    let bl = b[2];
    const mixTo = (t: number[], k: number) => {
      if (k <= 0) return;
      r += (t[0] - r) * k;
      g += (t[1] - g) * k;
      bl += (t[2] - bl) * k;
    };
    mixTo(lipC, masks[m] * 0.9);
    mixTo(T_CHEEK, masks[m + 1] * 0.22);
    mixTo(T_NOSE, masks[m + 2] * 0.16);
    mixTo(T_ALA, masks[m + 3] * 0.12);
    mixTo(T_EAR, masks[m + 4] * 0.18);
    mixTo(T_UNDER, masks[m + 5] * 0.16);
    mixTo(T_LID, masks[m + 6] * 0.14);
    mixTo(h, masks[m + 7] * 0.38);
    mixTo(T_BEARD, masks[m + 8] * 0.1);
    mixTo(h, masks[m + 9] * 0.32);
    const mot = masks[m + 11];
    if (mot > 0) mixTo(T_BLOTCH, mot * 0.07);
    else {
      r *= 1 + mot * 0.035;
      g *= 1 + mot * 0.035;
      bl *= 1 + mot * 0.035;
    }
    mixTo(T_MOLE, masks[m + 12] * 0.55);
    const ao = 0.42 + 0.58 * masks[m + 10];
    colors[v * 3] = r * ao;
    colors[v * 3 + 1] = g * ao;
    colors[v * 3 + 2] = bl * ao;
  }
}

/* ------------------------------------------------------------------
   თმის ხაზი და თმის SDF
------------------------------------------------------------------- */

const HAIRLINE: [number, number][] = [
  [0, 0.088],
  [0.32, 0.086],
  [0.58, 0.077],
  [0.82, 0.058],
  [1.08, 0.03],
  [1.3, -0.006],
  [1.42, -0.008],
  [1.52, 0.026],
  [1.76, 0.034],
  [2.0, 0.024],
  [2.2, -0.016],
  [2.6, -0.05],
  [Math.PI, -0.06],
];

function hairlineY(a: number) {
  for (let i = 0; i < HAIRLINE.length - 1; i++) {
    const [a0, y0] = HAIRLINE[i];
    const [a1, y1] = HAIRLINE[i + 1];
    if (a <= a1) {
      const t = (a - a0) / (a1 - a0);
      return mix(y0, y1, t * t * (3 - 2 * t));
    }
  }
  return HAIRLINE[HAIRLINE.length - 1][1];
}

/** დადებითი = თმის ხაზს ზემოთ (თმის არეში) */
export function hairlineDist(x: number, y: number, z: number) {
  const a = Math.abs(Math.atan2(x, z));
  return y - hairlineY(a);
}

export function hairSDF(x: number, y: number, z: number) {
  const above = hairlineDist(x, y, z);
  const taper = smoothstep(0.0, 0.03, above);
  const top = smoothstep(-0.01, 0.1, y);
  const back = smoothstep(0.0, -0.08, z);
  const thick = (0.0045 + 0.0085 * top + 0.0018 * back) * mix(0.42, 1, taper);
  const shell = craniumSDF(x, y, z) - thick;
  // ყურების გარშემო ოდნავ ამოჭრილი
  const ear = sphere(Math.abs(x), y, z, [0.074, -0.004, -0.013], 0.021);
  return ssub(sint(shell, -above, 0.0045), ear, 0.006);
}

/* ------------------------------------------------------------------
   გეომეტრიის აგება (Worker-ში)
------------------------------------------------------------------- */

/** SDF-ზე დაფუძნებული AO: ნორმალის გასწვრივ რამდენიმე ნიმუში */
function sdfAO(f: (x: number, y: number, z: number) => number, p: V3, n: V3) {
  let occ = 0;
  let w = 1;
  for (let i = 1; i <= 4; i++) {
    const h = 0.0018 * i * i;
    const d = f(p[0] + n[0] * h, p[1] + n[1] * h, p[2] + n[2] * h);
    occ += (h - Math.max(d, 0)) * w;
    w *= 0.6;
  }
  return clamp(1 - occ * 55, 0, 1);
}

/** სფერული UV თავის ცენტრიდან */
function sphericalUV(pos: Float32Array, scaleU = 1, scaleV = 1) {
  const uv = new Float32Array((pos.length / 3) * 2);
  for (let v = 0; v < pos.length / 3; v++) {
    const x = pos[v * 3];
    const y = pos[v * 3 + 1];
    const z = pos[v * 3 + 2];
    uv[v * 2] = (Math.atan2(x, z) / (Math.PI * 2) + 0.5) * scaleU;
    uv[v * 2 + 1] = (Math.atan2(y, Math.hypot(x, z)) / Math.PI + 0.5) * scaleV;
  }
  return uv;
}

export interface HeadData {
  geo: GeoData;
  /** MASKS.length მნიშვნელობა თითო წვეროზე */
  masks: Float32Array;
}

export function buildHeadData(step = 0.0016): HeadData {
  const m = meshSDF(headSDF, {
    min: [-0.092, -0.128, -0.118],
    max: [0.092, 0.128, 0.13],
    step,
    lipschitz: 1.6,
    project: 1,
  });
  const pos = m.positions;
  const nor = m.normals;
  const count = pos.length / 3;

  const M = MASKS.length;
  const masks = new Float32Array(count * M);
  for (let v = 0; v < count; v++) {
    const p: V3 = [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]];
    const ao = sdfAO(headSDF, p, [nor[v * 3], nor[v * 3 + 1], nor[v * 3 + 2]]);
    masksAt(p[0], p[1], p[2], ao, masks, v * M);
  }

  // morph targets (relative): პოზიციები და ნორმალების სხვაობა
  const tmp = new THREE.BufferGeometry();
  tmp.setIndex(new THREE.BufferAttribute(m.indices, 1));
  tmp.setAttribute("position", new THREE.BufferAttribute(pos.slice(), 3));
  tmp.computeVertexNormals();
  const baseN = ((tmp.getAttribute("normal") as THREE.BufferAttribute).array as Float32Array).slice();

  const morphPosition: Float32Array[] = [];
  const morphNormal: Float32Array[] = [];
  for (const e of EXPRS) {
    const dp = new Float32Array(pos.length);
    const moved = pos.slice();
    for (let v = 0; v < count; v++) {
      const [dx, dy, dz] = exprDelta(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2], e);
      dp[v * 3] = dx;
      dp[v * 3 + 1] = dy;
      dp[v * 3 + 2] = dz;
      moved[v * 3] += dx;
      moved[v * 3 + 1] += dy;
      moved[v * 3 + 2] += dz;
    }
    tmp.setAttribute("position", new THREE.BufferAttribute(moved, 3));
    tmp.computeVertexNormals();
    const mn = (tmp.getAttribute("normal") as THREE.BufferAttribute).array as Float32Array;
    const dn = new Float32Array(pos.length);
    for (let i = 0; i < dn.length; i++) dn[i] = mn[i] - baseN[i];
    morphPosition.push(dp);
    morphNormal.push(dn);
  }
  tmp.dispose();

  return {
    geo: {
      attributes: {
        position: { array: pos, itemSize: 3 },
        normal: { array: nor, itemSize: 3 },
        uv: { array: sphericalUV(pos, 3, 1.5), itemSize: 2 },
        color: { array: new Float32Array(pos.length), itemSize: 3 },
      },
      index: m.indices,
      morphPosition,
      morphNormal,
    },
    masks,
  };
}

export function buildHairData(step = 0.0021): GeoData {
  const m = meshSDF(hairSDF, {
    min: [-0.095, -0.08, -0.125],
    max: [0.095, 0.135, 0.115],
    step,
    lipschitz: 1.6,
    project: 1,
  });
  return {
    attributes: {
      position: { array: m.positions, itemSize: 3 },
      normal: { array: m.normals, itemSize: 3 },
      uv: { array: sphericalUV(m.positions, 4, 2), itemSize: 2 },
    },
    index: m.indices,
  };
}


/* ------------------------------------------------------------------
   ღეროები: წარბები და თმის ხაზის „ბუსუსი“
------------------------------------------------------------------- */

/** სხივის სვლა ზედაპირამდე: from + dir·t */
function march(f: (x: number, y: number, z: number) => number, from: V3, dir: V3): V3 | null {
  let t = 0;
  for (let i = 0; i < 80; i++) {
    const p: V3 = [from[0] + dir[0] * t, from[1] + dir[1] * t, from[2] + dir[2] * t];
    const d = f(p[0], p[1], p[2]);
    if (d < 0.00005) return p;
    t += Math.max(d * 0.8, 0.00005);
    if (t > 0.2) return null;
  }
  return null;
}

function gradient(f: (x: number, y: number, z: number) => number, p: V3): V3 {
  const e = 0.0003;
  const gx = f(p[0] + e, p[1], p[2]) - f(p[0] - e, p[1], p[2]);
  const gy = f(p[0], p[1] + e, p[2]) - f(p[0], p[1] - e, p[2]);
  const gz = f(p[0], p[1], p[2] + e) - f(p[0], p[1], p[2] - e);
  const l = Math.hypot(gx, gy, gz) || 1;
  return [gx / l, gy / l, gz / l];
}

interface StrandSpec {
  root: V3;
  normal: V3;
  dir: V3;
  len: number;
  width: number;
  lift: number;
  curl: number;
}

/** ღეროები → ვიწრო ლენტები (3 სეგმენტი), UV.v: 1 ფუძე → 0 წვერი */
function strandsGeometry(specs: StrandSpec[], withExpr: boolean) {
  const SEG = 3;
  const pos: number[] = [];
  const uv: number[] = [];
  const nor: number[] = [];
  const idx: number[] = [];
  for (const s of specs) {
    const n = new THREE.Vector3(...s.normal);
    const d = new THREE.Vector3(...s.dir);
    // მიმართულება ზედაპირის მხებ სიბრტყეში
    d.addScaledVector(n, -d.dot(n)).normalize();
    const side = new THREE.Vector3().crossVectors(d, n).normalize();
    const start = pos.length / 3;
    for (let k = 0; k <= SEG; k++) {
      const t = k / SEG;
      const along = s.len * t;
      const up = s.lift * (0.25 + t * 0.75) + s.curl * t * t * s.len;
      const c = new THREE.Vector3(...s.root).addScaledVector(d, along).addScaledVector(n, up);
      const w = s.width * (1 - t * 0.85);
      for (const sgn of [-1, 1]) {
        const p = c.clone().addScaledVector(side, (sgn * w) / 2);
        pos.push(p.x, p.y, p.z);
        uv.push(sgn < 0 ? 0 : 1, 1 - t);
        nor.push(n.x, n.y, n.z);
      }
    }
    for (let k = 0; k < SEG; k++) {
      const a = start + k * 2;
      idx.push(a, a + 1, a + 3, a, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  if (withExpr) {
    g.morphAttributes.position = EXPRS.map((e) => {
      const arr = new Float32Array(pos.length);
      for (let v = 0; v < pos.length / 3; v++) {
        const [dx, dy, dz] = exprDelta(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2], e);
        arr[v * 3] = dx;
        arr[v * 3 + 1] = dy;
        arr[v * 3 + 2] = dz;
      }
      return new THREE.BufferAttribute(arr, 3);
    });
    g.morphTargetsRelative = true;
  }
  return fromGeometry(g);
}

/** წარბები: ~320 ღერო თითოეულზე, ზრდის ბუნებრივი მიმართულებით */
export function buildBrowsData(): GeoData {
  const r = rng(314);
  const specs: StrandSpec[] = [];
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 330; i++) {
      // t: 0 = შიდა თავი, 1 = კუდი
      const t = Math.pow(r(), 0.85);
      const x = mix(0.0125, 0.06, t);
      const arch = 0.0262 + Math.sin(Math.min(1, t * 1.35) * Math.PI * 0.85) * 0.0042 - t * t * 0.0045;
      const thick = mix(0.0085, 0.0028, Math.pow(t, 1.3));
      const y = arch + (r() - 0.55) * thick;
      const root = march(headSDF, [sx * x, y, 0.13], [0, 0, -1]);
      if (!root) continue;
      const n = gradient(headSDF, root);
      // შიდა ღეროები ზემოთ, დანარჩენი — გარეთ, ოდნავ ზემოთ
      const upness = mix(1, 0.18, smoothstep(0.0, 0.35, t)) + (r() - 0.5) * 0.25;
      const dir: V3 = [sx * (1 - upness) + sx * (r() - 0.5) * 0.15, upness + (y < arch ? 0.1 : -0.15), 0];
      specs.push({
        root,
        normal: n,
        dir,
        len: mix(0.0055, 0.0085, r()) * (t > 0.85 ? 0.8 : 1),
        width: 0.00032,
        lift: 0.0004,
        curl: 0.08,
      });
    }
  }
  return strandsGeometry(specs, true);
}

/** თმის ხაზთან მოკლე ღეროები — „ჩაფხუტის“ ეფექტის გასაქრობად */
export function buildHairFuzzData(): GeoData {
  const r = rng(2718);
  const specs: StrandSpec[] = [];
  for (let i = 0; i < 1800; i++) {
    const a = (r() * 2 - 1) * Math.PI;
    const aa = Math.abs(a);
    const near = r() < 0.75;
    const yl = hairlineY(aa);
    const y = near ? yl + r() * 0.012 - 0.001 : yl + 0.01 + r() * 0.1;
    if (y > 0.112) continue;
    const dirH: V3 = [Math.sin(a), 0, Math.cos(a)];
    const root = march(hairSDF, [dirH[0] * 0.16, y, dirH[2] * 0.16], [-dirH[0], 0, -dirH[2]]);
    if (!root) continue;
    const n = gradient(hairSDF, root);
    // დავარცხნილი უკან და ქვემოთ; შუბლთან — ზემოთ და უკან
    const front = smoothstep(1.1, 0.2, aa);
    const dir: V3 = [
      Math.sin(a) * 0.3 * (1 - front) + (r() - 0.5) * 0.3,
      mix(-0.8, 0.7, front),
      -Math.cos(a) * 0.4 - 0.5 * front + (r() - 0.5) * 0.2,
    ];
    specs.push({
      root,
      normal: n,
      dir,
      len: near ? mix(0.005, 0.01, r()) : mix(0.01, 0.018, r()),
      width: near ? 0.00035 : 0.0007,
      lift: near ? 0.0004 : 0.0007,
      curl: -0.02,
    });
  }
  return strandsGeometry(specs, false);
}
