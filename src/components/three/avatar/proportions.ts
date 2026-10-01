/**
 * სხეულის პროპორციები (მეტრი; სიმაღლე ≈ 1.73 მ) და ჩონჩხის იერარქია.
 *
 * hips → spine → chest → { neck → head, shoulders → upper → twist → lower → foreTwist → hand }
 *      → thighs → shins (→ ფეხსაცმელი)
 */

export const P = {
  hipY: 0.93,
  spineUp: 0.08,
  chestUp: 0.22,
  shoulderX: 0.176,
  shoulderY: 0.172,
  shoulderZ: -0.01,
  neckUp: 0.232,
  neckZ: -0.012,
  neckLen: 0.098,
  /** თავის ცენტრი თავის სახსრიდან (atlas) */
  headCenter: [0, 0.058, 0.016] as [number, number, number],
  upperArm: 0.295,
  lowerArm: 0.255,
  hipX: 0.087,
  hipDown: 0.055,
  thigh: 0.42,
  shin: 0.38,
};

/** სახსრების სიმაღლეები მოსვენების პოზაში (მსოფლიო Y) */
export const Y = {
  hips: P.hipY,
  spine: P.hipY + P.spineUp,
  chest: P.hipY + P.spineUp + P.chestUp,
  shoulder: P.hipY + P.spineUp + P.chestUp + P.shoulderY,
  neck: P.hipY + P.spineUp + P.chestUp + P.neckUp,
  head: P.hipY + P.spineUp + P.chestUp + P.neckUp + P.neckLen,
  elbow: P.hipY + P.spineUp + P.chestUp + P.shoulderY - P.upperArm,
  foreMid: P.hipY + P.spineUp + P.chestUp + P.shoulderY - P.upperArm - P.lowerArm / 2,
  wrist: P.hipY + P.spineUp + P.chestUp + P.shoulderY - P.upperArm - P.lowerArm,
  hipJoint: P.hipY - P.hipDown,
  knee: P.hipY - P.hipDown - P.thigh,
  ankle: P.hipY - P.hipDown - P.thigh - P.shin,
};

/** სხეულის ჩონჩხის ძვლების ინდექსები */
export const B = {
  hips: 0,
  spine: 1,
  chest: 2,
  neck: 3,
  head: 4,
  upA: 5,
  twA: 6,
  loA: 7,
  faA: 8,
  haA: 9,
  upB: 10,
  twB: 11,
  loB: 12,
  faB: 13,
  haB: 14,
  thA: 15,
  shA: 16,
  thB: 17,
  shB: 18,
} as const;

export const BONE_COUNT = 19;

/** თითოეული ძვლის მოსვენების პოზიცია მსოფლიოში (ბრუნვის გარეშე) */
export function restWorld(): [number, number, number][] {
  const sx = P.shoulderX;
  const out: [number, number, number][] = [];
  out[B.hips] = [0, Y.hips, 0];
  out[B.spine] = [0, Y.spine, 0];
  out[B.chest] = [0, Y.chest, 0];
  out[B.neck] = [0, Y.neck, P.neckZ];
  out[B.head] = [0, Y.head, P.neckZ];
  for (const [s, up, tw, lo, fa, ha] of [
    [-1, B.upA, B.twA, B.loA, B.faA, B.haA],
    [1, B.upB, B.twB, B.loB, B.faB, B.haB],
  ] as const) {
    out[up] = [s * sx, Y.shoulder, P.shoulderZ];
    out[tw] = [s * sx, Y.shoulder, P.shoulderZ];
    out[lo] = [s * sx, Y.elbow, P.shoulderZ];
    out[fa] = [s * sx, Y.foreMid, P.shoulderZ];
    out[ha] = [s * sx, Y.wrist, P.shoulderZ];
  }
  out[B.thA] = [-P.hipX, Y.hipJoint, 0];
  out[B.shA] = [-P.hipX, Y.knee, 0];
  out[B.thB] = [P.hipX, Y.hipJoint, 0];
  out[B.shB] = [P.hipX, Y.knee, 0];
  return out;
}
