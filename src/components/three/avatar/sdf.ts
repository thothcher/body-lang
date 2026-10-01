/**
 * SDF ფორმირება + Surface Nets მეშერი.
 *
 * ანატომიური ფორმები (თავი, მტევანი, ფეხსაცმელი) აიგება როგორც signed
 * distance field — პრიმიტივების რბილი გაერთიანებით — და შემდეგ იქცევა
 * სამკუთხედების ბადედ. ორდონიანი ბადე: ჯერ უხეში ნაბიჯით ვპოულობთ
 * ზედაპირთან ახლოს მყოფ ბლოკებს და მხოლოდ იქ ვითვლით ზუსტად.
 */

export type V3 = [number, number, number];
export type SDF = (x: number, y: number, z: number) => number;

/* ------------------------------------------------------------------
   ვექტორული დამხმარეები
------------------------------------------------------------------- */

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

/* ------------------------------------------------------------------
   პრიმიტივები
------------------------------------------------------------------- */

/** რბილი გაერთიანება (polynomial smooth min) */
export function smin(a: number, b: number, k: number) {
  if (k <= 0) return Math.min(a, b);
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

/** რბილი გამოკლება: a − b */
export function ssub(a: number, b: number, k: number) {
  return -smin(-a, b, k);
}

/** რბილი თანაკვეთა */
export function sint(a: number, b: number, k: number) {
  return -smin(-a, -b, k);
}

export function sphere(x: number, y: number, z: number, c: V3, r: number) {
  const dx = x - c[0];
  const dy = y - c[1];
  const dz = z - c[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz) - r;
}

/** ელიფსოიდი (მიახლოებითი, მაგრამ სტაბილური მანძილი) */
export function ellipsoid(x: number, y: number, z: number, c: V3, r: V3) {
  const px = (x - c[0]) / r[0];
  const py = (y - c[1]) / r[1];
  const pz = (z - c[2]) / r[2];
  const k0 = Math.sqrt(px * px + py * py + pz * pz);
  const qx = px / r[0];
  const qy = py / r[1];
  const qz = pz / r[2];
  const k1 = Math.sqrt(qx * qx + qy * qy + qz * qz);
  if (k1 < 1e-9) return -Math.min(r[0], r[1], r[2]);
  return (k0 * (k0 - 1)) / k1;
}

/** კონუსური კაფსულა a → b, რადიუსები ra → rb */
export function capsule(x: number, y: number, z: number, a: V3, b: V3, ra: number, rb: number) {
  const bax = b[0] - a[0];
  const bay = b[1] - a[1];
  const baz = b[2] - a[2];
  const pax = x - a[0];
  const pay = y - a[1];
  const paz = z - a[2];
  const h = clamp((pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz), 0, 1);
  const dx = pax - bax * h;
  const dy = pay - bay * h;
  const dz = paz - baz * h;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) - mix(ra, rb, h);
}

/** კაფსულის პარამეტრი h (0 → a, 1 → b) — წონების გამოსათვლელად */
export function capsuleT(x: number, y: number, z: number, a: V3, b: V3) {
  const bax = b[0] - a[0];
  const bay = b[1] - a[1];
  const baz = b[2] - a[2];
  return clamp(
    ((x - a[0]) * bax + (y - a[1]) * bay + (z - a[2]) * baz) / (bax * bax + bay * bay + baz * baz),
    0,
    1,
  );
}

/** მომრგვალებული ყუთი */
export function roundBox(x: number, y: number, z: number, c: V3, half: V3, r: number) {
  const qx = Math.abs(x - c[0]) - half[0] + r;
  const qy = Math.abs(y - c[1]) - half[1] + r;
  const qz = Math.abs(z - c[2]) - half[2] + r;
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  const oz = Math.max(qz, 0);
  return Math.sqrt(ox * ox + oy * oy + oz * oz) + Math.min(Math.max(qx, qy, qz), 0) - r;
}

/** ტორი XY სიბრტყეში (ღერძი Z) */
export function torusZ(x: number, y: number, z: number, c: V3, R: number, r: number) {
  const dx = x - c[0];
  const dy = y - c[1];
  const dz = z - c[2];
  const q = Math.sqrt(dx * dx + dy * dy) - R;
  return Math.sqrt(q * q + dz * dz) - r;
}

/* ------------------------------------------------------------------
   Surface Nets
------------------------------------------------------------------- */

export interface MeshData {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
}

export interface MeshOptions {
  min: V3;
  max: V3;
  /** უჯრის ზომა (მეტრი) */
  step: number;
  /** უხეში ბლოკის ზომა უჯრებში */
  block?: number;
  /** ლიპშიცის მარაგი — რამდენად „არაზუსტია“ ველი */
  lipschitz?: number;
  /** რამდენჯერ მივაპროეციროთ წვეროები ზედაპირზე */
  project?: number;
}

/**
 * Naive Surface Nets: თითო უჯრაზე ერთი წვერო, თითო ნიშნის-ცვლილების
 * წიბოზე ერთი ოთხკუთხედი. ველი ითვლება ფენა-ფენა (Z-ით), ამიტომ
 * მეხსიერება მცირეა მაღალ გარჩევადობაზეც. წვეროები ბოლოს გრადიენტით
 * ზედაპირზე „ჯდება“.
 */
export function meshSDF(f: SDF, opts: MeshOptions): MeshData {
  const { min, max, step } = opts;
  const B = opts.block ?? 4;
  const L = opts.lipschitz ?? 1.4;
  const nx = Math.ceil((max[0] - min[0]) / step) + 1;
  const ny = Math.ceil((max[1] - min[1]) / step) + 1;
  const nz = Math.ceil((max[2] - min[2]) / step) + 1;
  const sxy = nx * ny;

  // --- 1. უხეში ბადე + „ზუსტი“ ბლოკების ნიშნები
  const cx = Math.ceil((nx - 1) / B) + 1;
  const cy = Math.ceil((ny - 1) / B) + 1;
  const cz = Math.ceil((nz - 1) / B) + 1;
  const coarse = new Float32Array(cx * cy * cz);
  for (let k = 0; k < cz; k++)
    for (let j = 0; j < cy; j++)
      for (let i = 0; i < cx; i++)
        coarse[i + j * cx + k * cx * cy] = f(min[0] + i * B * step, min[1] + j * B * step, min[2] + k * B * step);
  const C = (i: number, j: number, k: number) => coarse[i + j * cx + k * cx * cy];
  const near = B * step * 1.75 * L;
  const exact = new Uint8Array((cx - 1) * (cy - 1) * (cz - 1));
  for (let k = 0; k < cz - 1; k++)
    for (let j = 0; j < cy - 1; j++)
      for (let i = 0; i < cx - 1; i++) {
        let mn = Infinity;
        for (let c = 0; c < 8; c++) mn = Math.min(mn, Math.abs(C(i + (c & 1), j + ((c >> 1) & 1), k + ((c >> 2) & 1))));
        exact[i + j * (cx - 1) + k * (cx - 1) * (cy - 1)] = mn < near ? 1 : 0;
      }

  const fillSlice = (k: number, out: Float32Array) => {
    const bk = Math.min(Math.floor(k / B), cz - 2);
    const tz = (k - bk * B) / B;
    const z = min[2] + k * step;
    for (let j = 0; j < ny; j++) {
      const bj = Math.min(Math.floor(j / B), cy - 2);
      const ty = (j - bj * B) / B;
      const y = min[1] + j * step;
      for (let i = 0; i < nx; i++) {
        const bi = Math.min(Math.floor(i / B), cx - 2);
        // ბლოკის საზღვარზე მეზობელი ბლოკიც გავითვალისწინოთ
        let ex = exact[bi + bj * (cx - 1) + bk * (cx - 1) * (cy - 1)];
        if (!ex && i % B === 0 && bi > 0) ex = exact[bi - 1 + bj * (cx - 1) + bk * (cx - 1) * (cy - 1)];
        if (!ex && j % B === 0 && bj > 0) ex = exact[bi + (bj - 1) * (cx - 1) + bk * (cx - 1) * (cy - 1)];
        if (!ex && k % B === 0 && bk > 0) ex = exact[bi + bj * (cx - 1) + (bk - 1) * (cx - 1) * (cy - 1)];
        if (ex) {
          out[i + j * nx] = f(min[0] + i * step, y, z);
        } else {
          const tx = (i - bi * B) / B;
          const a = mix(mix(C(bi, bj, bk), C(bi + 1, bj, bk), tx), mix(C(bi, bj + 1, bk), C(bi + 1, bj + 1, bk), tx), ty);
          const b = mix(
            mix(C(bi, bj, bk + 1), C(bi + 1, bj, bk + 1), tx),
            mix(C(bi, bj + 1, bk + 1), C(bi + 1, bj + 1, bk + 1), tx),
            ty,
          );
          out[i + j * nx] = mix(a, b, tz);
        }
      }
    }
  };

  const EDGES = [
    [0, 1], [2, 3], [4, 5], [6, 7],
    [0, 2], [1, 3], [4, 6], [5, 7],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  const CO = [
    [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
    [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1],
  ];
  const cxN = nx - 1;
  const layerSize = (nx - 1) * (ny - 1);

  let s0 = new Float32Array(sxy);
  let s1 = new Float32Array(sxy);
  let prevLayer = new Int32Array(layerSize).fill(-1);
  let curLayer = new Int32Array(layerSize).fill(-1);
  const pos: number[] = [];
  const idx: number[] = [];
  const corner = new Float32Array(8);

  const quad = (a: number, b: number, c: number, d: number, flip: boolean) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    if (flip) idx.push(a, c, b, a, d, c);
    else idx.push(a, b, c, a, c, d);
  };
  const cellIn = (layer: Int32Array, i: number, j: number) =>
    i < 0 || j < 0 || i >= nx - 1 || j >= ny - 1 ? -1 : layer[i + j * cxN];

  fillSlice(0, s0);
  for (let k = 1; k < nz; k++) {
    fillSlice(k, s1);
    const L0 = k - 1; // უჯრების ფენა s0 და s1 შორის
    curLayer.fill(-1);

    // --- წვეროები ფენაში L0
    for (let j = 0; j < ny - 1; j++)
      for (let i = 0; i < nx - 1; i++) {
        let mask = 0;
        for (let c = 0; c < 8; c++) {
          const sl = CO[c][2] ? s1 : s0;
          const v = sl[i + CO[c][0] + (j + CO[c][1]) * nx];
          corner[c] = v;
          if (v < 0) mask |= 1 << c;
        }
        if (mask === 0 || mask === 255) continue;
        let ax = 0, ay = 0, az = 0, n = 0;
        for (const [a, b] of EDGES) {
          const va = corner[a];
          const vb = corner[b];
          if (va < 0 === vb < 0) continue;
          const t = va / (va - vb);
          ax += CO[a][0] + (CO[b][0] - CO[a][0]) * t;
          ay += CO[a][1] + (CO[b][1] - CO[a][1]) * t;
          az += CO[a][2] + (CO[b][2] - CO[a][2]) * t;
          n++;
        }
        curLayer[i + j * cxN] = pos.length / 3;
        pos.push(min[0] + (i + ax / n) * step, min[1] + (j + ay / n) * step, min[2] + (L0 + az / n) * step);
      }

    // --- X და Y წიბოები ჭრილში k−1 (ფენები L0−1 და L0)
    if (L0 >= 1) {
      for (let j = 0; j < ny; j++)
        for (let i = 0; i < nx; i++) {
          const in0 = s0[i + j * nx] < 0;
          if (i < nx - 1) {
            const in1 = s0[i + 1 + j * nx] < 0;
            if (in0 !== in1)
              quad(cellIn(prevLayer, i, j - 1), cellIn(prevLayer, i, j), cellIn(curLayer, i, j), cellIn(curLayer, i, j - 1), in1);
          }
          if (j < ny - 1) {
            const in1 = s0[i + (j + 1) * nx] < 0;
            if (in0 !== in1)
              quad(cellIn(prevLayer, i - 1, j), cellIn(curLayer, i - 1, j), cellIn(curLayer, i, j), cellIn(prevLayer, i, j), in1);
          }
        }
    }
    // --- Z წიბოები ჭრილებს k−1 და k შორის (ფენა L0)
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) {
        const in0 = s0[i + j * nx] < 0;
        const in1 = s1[i + j * nx] < 0;
        if (in0 !== in1)
          quad(cellIn(curLayer, i - 1, j - 1), cellIn(curLayer, i, j - 1), cellIn(curLayer, i, j), cellIn(curLayer, i - 1, j), in1);
      }

    const ts = s0;
    s0 = s1;
    s1 = ts;
    const tl = prevLayer;
    prevLayer = curLayer;
    curLayer = tl;
  }

  // --- პროექცია ზედაპირზე + ნორმალები ველის გრადიენტიდან
  const positions = new Float32Array(pos);
  const normals = new Float32Array(positions.length);
  const e = step * 0.35;
  const iters = opts.project ?? 2;
  for (let v = 0; v < positions.length; v += 3) {
    let x = positions[v];
    let y = positions[v + 1];
    let z = positions[v + 2];
    let gx = 0, gy = 0, gz = 0;
    for (let it = 0; it <= iters; it++) {
      gx = f(x + e, y, z) - f(x - e, y, z);
      gy = f(x, y + e, z) - f(x, y - e, z);
      gz = f(x, y, z + e) - f(x, y, z - e);
      const gl = Math.sqrt(gx * gx + gy * gy + gz * gz) || 1;
      gx /= gl;
      gy /= gl;
      gz /= gl;
      if (it === iters) break;
      const d = clamp(f(x, y, z), -step, step);
      x -= gx * d;
      y -= gy * d;
      z -= gz * d;
    }
    positions[v] = x;
    positions[v + 1] = y;
    positions[v + 2] = z;
    normals[v] = gx;
    normals[v + 1] = gy;
    normals[v + 2] = gz;
  }

  return { positions, normals, indices: new Uint32Array(idx) };
}

/* ------------------------------------------------------------------
   კანის წონები: softmax პრიმიტივების მანძილზე
------------------------------------------------------------------- */

/**
 * `dists(x,y,z, out)` ავსებს `out`-ს თითო ძვლის მანძილით. წონა ∝ exp(−d/k),
 * ვიტოვებთ 4 უდიდესს და ვანორმალებთ.
 */
export function softWeights(
  positions: Float32Array,
  boneCount: number,
  dists: (x: number, y: number, z: number, out: Float32Array) => void,
  k: number,
) {
  const n = positions.length / 3;
  const skinIndex = new Uint16Array(n * 4);
  const skinWeight = new Float32Array(n * 4);
  const d = new Float32Array(boneCount);
  const w = new Float32Array(boneCount);
  const order = new Int32Array(boneCount);
  for (let v = 0; v < n; v++) {
    dists(positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2], d);
    let dmin = Infinity;
    for (let b = 0; b < boneCount; b++) dmin = Math.min(dmin, d[b]);
    for (let b = 0; b < boneCount; b++) {
      w[b] = Math.exp(-(d[b] - dmin) / k);
      order[b] = b;
    }
    // ოთხი უდიდესი
    for (let a = 0; a < 4 && a < boneCount; a++) {
      let best = a;
      for (let b = a + 1; b < boneCount; b++) if (w[order[b]] > w[order[best]]) best = b;
      const t = order[a];
      order[a] = order[best];
      order[best] = t;
    }
    let sum = 0;
    for (let a = 0; a < 4 && a < boneCount; a++) sum += w[order[a]];
    for (let a = 0; a < 4; a++) {
      if (a < boneCount) {
        skinIndex[v * 4 + a] = order[a];
        skinWeight[v * 4 + a] = w[order[a]] / sum;
      }
    }
  }
  return { skinIndex, skinWeight };
}
