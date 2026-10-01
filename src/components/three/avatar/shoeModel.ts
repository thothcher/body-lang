/**
 * ფეხსაცმელი — SDF. ლოკალური სივრცე: საწყისი = კოჭის სახსარი,
 * +Z = წინ, ძირი y = −ANKLE-ზე (იატაკი).
 */
import { capsule, ellipsoid, meshSDF, roundBox, sint, smin, smoothstep, ssub, type V3 } from "./sdf";
import type { GeoData } from "./geo";

export const ANKLE_H = 0.075;

function upperSDF(formal: boolean) {
  return (x: number, y: number, z: number) => {
    // ქუსლის ნაწილი
    let d = ellipsoid(x, y, z, [0, -0.04, -0.022], [0.037, 0.04, 0.046]);
    // შუა ნაწილი
    d = smin(d, ellipsoid(x, y, z, [0.002, -0.048, 0.052], [0.043, 0.032, 0.07]), 0.03);
    // ცხვირი — ფორმალურზე უფრო წაგრძელებული და ბრტყელი
    d = smin(
      d,
      ellipsoid(x, y, z, [0.004, -0.057, formal ? 0.135 : 0.128], formal ? [0.04, 0.019, 0.075] : [0.044, 0.024, 0.072]),
      0.03,
    );
    // ზედა ნაწილი — ტერფის ამოწეულობა
    d = smin(d, capsule(x, y, z, [0, -0.018, 0.0], [0.002, -0.038, 0.09], 0.03, 0.022), 0.02);
    // ძირი ბრტყელი
    d = sint(d, -(y + ANKLE_H - 0.008), 0.004);
    // ყელის ღიობი
    const collar = capsule(x, y, z, [0, 0.02, -0.01], [0, -0.012, 0.02], 0.026, 0.024);
    d = ssub(d, collar, 0.006);
    // ზოლი / ნაკერი — შეღრმავება გვერდზე (sneaker)
    if (!formal) {
      const stripe = Math.abs(y + 0.045 - (z - 0.03) * 0.35) - 0.0012;
      d += smoothstep(0.002, -0.002, stripe) * smoothstep(0.03, 0.044, Math.abs(x)) * 0.0006;
    }
    return d;
  };
}

function soleSDF(formal: boolean) {
  return (x: number, y: number, z: number) => {
    const h = formal ? 0.0055 : 0.011;
    const yc = -ANKLE_H + h;
    // ფორმა ფეხის კონტურს მიჰყვება: ქუსლი ვიწრო, თათი განიერი
    const wz = smoothstep(-0.06, 0.12, z);
    const halfW = 0.036 + wz * 0.012 - smoothstep(0.15, 0.21, z) * 0.02;
    let d = roundBox(x - 0.002, y, z, [0, yc, 0.07], [halfW + 0.003, h, 0.142], h * 0.9);
    // ქუსლი ფორმალურზე
    if (formal) d = smin(d, roundBox(x, y, z, [0, -ANKLE_H + 0.012, -0.035], [0.034, 0.012, 0.032], 0.006), 0.004);
    return d;
  };
}

function toData(m: { positions: Float32Array; normals: Float32Array; indices: Uint32Array }, uvScale: number): GeoData {
  const uv = new Float32Array((m.positions.length / 3) * 2);
  for (let v = 0; v < m.positions.length / 3; v++) {
    uv[v * 2] = (m.positions[v * 3 + 2] + m.positions[v * 3]) * uvScale;
    uv[v * 2 + 1] = m.positions[v * 3 + 1] * uvScale;
  }
  return {
    attributes: {
      position: { array: m.positions, itemSize: 3 },
      normal: { array: m.normals, itemSize: 3 },
      uv: { array: uv, itemSize: 2 },
    },
    index: m.indices,
  };
}

export interface ShoeData {
  upper: GeoData;
  sole: GeoData;
}

export function buildShoeData(formal: boolean): ShoeData {
  const box = { min: [-0.06, -0.08, -0.085] as V3, max: [0.062, 0.03, 0.225] as V3 };
  const upper = meshSDF(upperSDF(formal), { ...box, step: 0.0022, lipschitz: 1.5, project: 1 });
  const sole = meshSDF(soleSDF(formal), { ...box, step: 0.0018, lipschitz: 1.5, project: 1 });
  return { upper: toData(upper, 12), sole: toData(sole, 12) };
}
