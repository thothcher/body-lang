/**
 * „ლოფტი“ — სხეულის ნაწილი, აგებული Y ღერძის გასწვრივ განლაგებული
 * განივკვეთებით (სუპერელიფსები). სიმაღლეებს შორის თვისებები გლუვად
 * ინტერპოლირდება (Catmull-Rom), ამიტომ ფორმა ორგანულია.
 *
 * θ = 0 → წინ (+Z), θ = π/2 → +X.
 */
import * as THREE from "three";

export interface Ring {
  y: number;
  /** ნახევარ-სიგანე X-ით */
  rx: number;
  /** ნახევარ-სიღრმე წინ (+Z) */
  rzF: number;
  /** ნახევარ-სიღრმე უკან (−Z); ნაგულისხმევად = rzF */
  rzB?: number;
  /** ცენტრის წანაცვლება */
  cx?: number;
  cz?: number;
  /** სუპერელიფსის ხარისხი (2 = ელიფსი, მეტი = უფრო „კვადრატული“) */
  n?: number;
}

type Prop = "rx" | "rzF" | "rzB" | "cx" | "cz" | "n";

export type WeightFn = (x: number, y: number, z: number) => [number, number][];

export interface LoftOptions {
  rings: Ring[];
  /** წრიული სეგმენტები */
  radial?: number;
  /** რიგები 1 მეტრზე */
  density?: number;
  capTop?: boolean;
  capBottom?: boolean;
  /** ქვედა ბოლოს „სქელი“ კიდე — შიგნით შემობრუნებული ქსოვილი */
  hemBottom?: number;
  /** ზედაპირის დამატებითი დეფორმაცია (ნაოჭები, კუნთები…) */
  displace?: (x: number, y: number, z: number, theta: number) => number;
  weights?: WeightFn;
  /** UV-ის მასშტაბი (მეტრი ერთ გამეორებაზე) */
  uvScale?: number;
}

/** Catmull-Rom ინტერპოლაცია არათანაბარ ბადეზე (y-ები ზრდადობით) */
function sampleProp(rings: Ring[], y: number, prop: Prop, def: number) {
  const get = (r: Ring) => {
    const v = r[prop];
    if (v !== undefined) return v;
    if (prop === "rzB") return r.rzF;
    return def;
  };
  if (y <= rings[0].y) return get(rings[0]);
  const last = rings.length - 1;
  if (y >= rings[last].y) return get(rings[last]);
  let i = 0;
  while (i < last - 1 && rings[i + 1].y < y) i++;
  const r0 = rings[Math.max(0, i - 1)];
  const r1 = rings[i];
  const r2 = rings[i + 1];
  const r3 = rings[Math.min(last, i + 2)];
  const t = (y - r1.y) / (r2.y - r1.y);
  const p0 = get(r0);
  const p1 = get(r1);
  const p2 = get(r2);
  const p3 = get(r3);
  // დახრილობები (არათანაბარი ბიჯი) — შეზღუდული, რომ არ „გადაჭარბდეს“
  const m1 = r2.y - r0.y > 0 ? ((p2 - p0) / (r2.y - r0.y)) * (r2.y - r1.y) : 0;
  const m2 = r3.y - r1.y > 0 ? ((p3 - p1) / (r3.y - r1.y)) * (r2.y - r1.y) : 0;
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * p1 + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2 + (t3 - t2) * m2;
}

export function ringAt(rings: Ring[], y: number) {
  return {
    rx: sampleProp(rings, y, "rx", 0.05),
    rzF: sampleProp(rings, y, "rzF", 0.05),
    rzB: sampleProp(rings, y, "rzB", 0.05),
    cx: sampleProp(rings, y, "cx", 0),
    cz: sampleProp(rings, y, "cz", 0),
    n: sampleProp(rings, y, "n", 2),
  };
}

/** განივკვეთის წერტილი კუთხით θ */
export function ringPoint(r: ReturnType<typeof ringAt>, theta: number, inflate = 0): [number, number] {
  const s = Math.sin(theta);
  const c = Math.cos(theta);
  const e = 2 / r.n;
  const sx = Math.sign(s) * Math.pow(Math.abs(s), e);
  const sz = Math.sign(c) * Math.pow(Math.abs(c), e);
  const rz = c >= 0 ? r.rzF : r.rzB;
  return [r.cx + sx * (r.rx + inflate), r.cz + sz * (rz + inflate)];
}

/** ზედაპირის წერტილი (y, θ) — დეკალებისთვის (ღილები, საყელო…) */
export function surfacePoint(opts: LoftOptions, y: number, theta: number, offset = 0): THREE.Vector3 {
  const r = ringAt(opts.rings, y);
  const [x, z] = ringPoint(r, theta, offset);
  const d = opts.displace ? opts.displace(x, y, z, theta) : 0;
  const nx = Math.sin(theta);
  const nz = Math.cos(theta);
  return new THREE.Vector3(x + nx * d, y, z + nz * d);
}

export function buildLoft(opts: LoftOptions): THREE.BufferGeometry {
  const rings = opts.rings;
  const radial = opts.radial ?? 48;
  const y0 = rings[0].y;
  const y1 = rings[rings.length - 1].y;
  const rows = Math.max(4, Math.ceil((y1 - y0) * (opts.density ?? 120)));
  const uvS = opts.uvScale ?? 0.25;

  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const sIdx: number[] = [];
  const sW: number[] = [];

  const pushWeights = (x: number, y: number, z: number) => {
    if (!opts.weights) return;
    const w = opts.weights(x, y, z).slice(0, 4);
    const sum = w.reduce((a, b) => a + b[1], 0) || 1;
    for (let k = 0; k < 4; k++) {
      sIdx.push(w[k] ? w[k][0] : 0);
      sW.push(w[k] ? w[k][1] / sum : 0);
    }
  };

  const ringVerts = (y: number, inflate: number, vOff: number) => {
    const r = ringAt(rings, y);
    const start = pos.length / 3;
    let arc = 0;
    let prev: [number, number] | null = null;
    for (let i = 0; i <= radial; i++) {
      const theta = (i / radial) * Math.PI * 2;
      const [px, pz] = ringPoint(r, theta, inflate);
      const d = opts.displace ? opts.displace(px, y, pz, theta) : 0;
      const x = px + Math.sin(theta) * d;
      const z = pz + Math.cos(theta) * d;
      if (prev) arc += Math.hypot(x - prev[0], z - prev[1]);
      prev = [x, z];
      pos.push(x, y, z);
      uv.push(arc / uvS, (y + vOff) / uvS);
      pushWeights(x, y, z);
    }
    return start;
  };

  const stitch = (a: number, b: number) => {
    for (let i = 0; i < radial; i++) {
      const a0 = a + i;
      const a1 = a + i + 1;
      const b0 = b + i;
      const b1 = b + i + 1;
      // a — ქვედა რიგი, b — ზედა; ნორმალი გარეთ
      idx.push(a0, a1, b1, a0, b1, b0);
    }
  };

  // --- ძირითადი ზედაპირი
  const rowStarts: number[] = [];
  for (let j = 0; j <= rows; j++) {
    const y = y0 + ((y1 - y0) * j) / rows;
    rowStarts.push(ringVerts(y, 0, 0));
  }
  for (let j = 0; j < rows; j++) stitch(rowStarts[j], rowStarts[j + 1]);

  // --- სახურავები
  const cap = (y: number, start: number, top: boolean) => {
    const r = ringAt(rings, y);
    const c = pos.length / 3;
    const cy = y + (top ? 1 : -1) * Math.min(r.rx, r.rzF) * 0.35;
    pos.push(r.cx, cy, r.cz);
    uv.push(0, cy / uvS);
    pushWeights(r.cx, cy, r.cz);
    for (let i = 0; i < radial; i++) {
      if (top) idx.push(start + i, start + i + 1, c);
      else idx.push(start + i + 1, start + i, c);
    }
  };
  if (opts.capTop) cap(y1, rowStarts[rows], true);
  if (opts.capBottom && !opts.hemBottom) cap(y0, rowStarts[0], false);

  // --- „სქელი“ კიდე: გარე რგოლი → შიდა რგოლი → შიგნით ზემოთ
  if (opts.hemBottom) {
    const t = opts.hemBottom;
    const lip = ringVerts(y0 - t * 0.4, -t * 0.5, 0);
    const inner0 = ringVerts(y0, -t, 0);
    const inner1 = ringVerts(y0 + 0.03, -t * 1.1, 0);
    stitch(lip, rowStarts[0]);
    // შიდა ზედაპირი შემობრუნებული ნორმალით
    for (let i = 0; i < radial; i++) {
      idx.push(lip + i, inner0 + i + 1, lip + i + 1, lip + i, inner0 + i, inner0 + i + 1);
      idx.push(inner0 + i, inner1 + i + 1, inner0 + i + 1, inner0 + i, inner1 + i, inner1 + i + 1);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  if (opts.weights) {
    g.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(sIdx, 4));
    g.setAttribute("skinWeight", new THREE.Float32BufferAttribute(sW, 4));
  }
  g.setIndex(idx);
  g.computeVertexNormals();
  weldSeamNormals(g, radial + 1);
  return g;
}

/** θ = 0 და θ = 2π წვეროები ერთსა და იმავე ადგილზეა — ნორმალებს ვაერთიანებთ */
function weldSeamNormals(g: THREE.BufferGeometry, stride: number) {
  const n = g.getAttribute("normal") as THREE.BufferAttribute;
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  const count = p.count;
  for (let s = 0; s + stride - 1 < count; s += stride) {
    const a = s;
    const b = s + stride - 1;
    if (
      Math.abs(p.getX(a) - p.getX(b)) > 1e-6 ||
      Math.abs(p.getY(a) - p.getY(b)) > 1e-6 ||
      Math.abs(p.getZ(a) - p.getZ(b)) > 1e-6
    )
      continue;
    const x = n.getX(a) + n.getX(b);
    const y = n.getY(a) + n.getY(b);
    const z = n.getZ(a) + n.getZ(b);
    const l = Math.hypot(x, y, z) || 1;
    n.setXYZ(a, x / l, y / l, z / l);
    n.setXYZ(b, x / l, y / l, z / l);
  }
  n.needsUpdate = true;
}

/* ------------------------------------------------------------------
   წონების დამხმარე: ძვლების ჯაჭვი Y-ის გასწვრივ
------------------------------------------------------------------- */

/**
 * `chain` — [{ bone, y }] ზემოდან ქვემოთ, სადაც y არის სახსრის სიმაღლე,
 * საიდანაც ეს ძვალი იწყება; `blend` — გადასვლის ნახევარ-სიგანე.
 */
export function chainWeights(chain: { bone: number; y: number; blend: number }[]): WeightFn {
  return (_x, y) => {
    // ზემოდან: პირველი ძვალი, სანამ შემდეგი სახსარი არ დაიწყება
    let current = chain[0].bone;
    for (let i = 1; i < chain.length; i++) {
      const j = chain[i];
      const t = smooth01((j.y + j.blend - y) / (2 * j.blend));
      if (t <= 0) return [[current, 1]];
      if (t < 1) return [
        [current, 1 - t],
        [j.bone, t],
      ];
      current = j.bone;
    }
    return [[current, 1]];
  };
}

function smooth01(t: number) {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * (3 - 2 * c);
}
