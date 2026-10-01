/**
 * პროცედურული ტექსტურები (canvas-ზე, მხოლოდ კლიენტზე).
 * ყველა ტექსტურა ერთხელ იქმნება და კეშირდება.
 */
import * as THREE from "three";

const cache = new Map<string, THREE.Texture>();

function cached<T extends THREE.Texture>(key: string, make: () => T): T {
  const hit = cache.get(key);
  if (hit) return hit as T;
  const t = make();
  cache.set(key, t);
  return t;
}

/* ------------------------------------------------------------------
   ხმაური
------------------------------------------------------------------- */

/** დეტერმინისტული ფსევდო-შემთხვევითი რიცხვები */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

/** პერიოდული value-noise — ტექსტურა უნაკეროდ მეორდება */
function periodicNoise(size: number, cells: number, seed: number) {
  const r = rng(seed);
  const lattice = new Float32Array(cells * cells).map(() => r());
  const out = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    const fy = (y / size) * cells;
    const y0 = Math.floor(fy);
    const ty = fy - y0;
    const sy = ty * ty * (3 - 2 * ty);
    for (let x = 0; x < size; x++) {
      const fx = (x / size) * cells;
      const x0 = Math.floor(fx);
      const tx = fx - x0;
      const sx = tx * tx * (3 - 2 * tx);
      const a = lattice[(x0 % cells) + (y0 % cells) * cells];
      const b = lattice[((x0 + 1) % cells) + (y0 % cells) * cells];
      const c = lattice[(x0 % cells) + ((y0 + 1) % cells) * cells];
      const d = lattice[((x0 + 1) % cells) + ((y0 + 1) % cells) * cells];
      out[x + y * size] = a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
    }
  }
  return out;
}

function fbm(size: number, octaves: [cells: number, amp: number][], seed: number) {
  const out = new Float32Array(size * size);
  octaves.forEach(([cells, amp], i) => {
    const n = periodicNoise(size, cells, seed + i * 101);
    for (let p = 0; p < out.length; p++) out[p] += (n[p] - 0.5) * amp;
  });
  return out;
}

/** სიმაღლის ველი → ნორმალების რუკა (tileable) */
function heightToNormal(h: Float32Array, size: number, strength: number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const at = (x: number, y: number) => h[((x + size) % size) + ((y + size) % size) * size];
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const l = Math.sqrt(dx * dx + dy * dy + 1);
      const o = (x + y * size) * 4;
      img.data[o] = ((-dx / l) * 0.5 + 0.5) * 255;
      img.data[o + 1] = ((dy / l) * 0.5 + 0.5) * 255;
      img.data[o + 2] = ((1 / l) * 0.5 + 0.5) * 255;
      img.data[o + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function grayTexture(h: Float32Array, size: number, map: (v: number) => number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let p = 0; p < h.length; p++) {
    const v = Math.max(0, Math.min(255, map(h[p]) * 255));
    img.data[p * 4] = img.data[p * 4 + 1] = img.data[p * 4 + 2] = v;
    img.data[p * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/* ------------------------------------------------------------------
   კანი: ფორები + წვრილი ნაოჭები
------------------------------------------------------------------- */

export function skinNormalMap() {
  return cached("skin-n", () => {
    const S = 512;
    const h = fbm(S, [[64, 0.35], [128, 0.25], [16, 0.25]], 7);
    const r = rng(42);
    // ფორები — პატარა ჩაღრმავებები
    for (let i = 0; i < 5200; i++) {
      const cx = r() * S;
      const cy = r() * S;
      const rad = 0.8 + r() * 1.5;
      const depth = 0.5 + r() * 0.8;
      for (let y = Math.floor(cy - 3); y <= cy + 3; y++)
        for (let x = Math.floor(cx - 3); x <= cx + 3; x++) {
          const d = Math.hypot(x - cx, y - cy) / rad;
          if (d > 1.6) continue;
          const xi = ((x % S) + S) % S;
          const yi = ((y % S) + S) % S;
          h[xi + yi * S] -= depth * Math.exp(-d * d * 1.6);
        }
    }
    return heightToNormal(h, S, 1.1);
  });
}

export function skinRoughnessMap() {
  return cached("skin-r", () => {
    const S = 256;
    const h = fbm(S, [[8, 0.6], [32, 0.4]], 11);
    return grayTexture(h, S, (v) => 0.5 + v * 0.5);
  });
}

/* ------------------------------------------------------------------
   ქსოვილები
------------------------------------------------------------------- */

/** ჯერსი (ტრიკოტაჟი) — V-ს მაგვარი მარყუჟები */
export function knitNormalMap() {
  return cached("knit-n", () => {
    const S = 256;
    const h = fbm(S, [[32, 0.12], [128, 0.12]], 3);
    const cols = 32;
    const rows = 44;
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const u = (x / S) * cols;
        const v = (y / S) * rows;
        const fu = u - Math.floor(u) - 0.5;
        const fv = v - Math.floor(v);
        // ორი დახრილი „ფოთოლი“ თითო უჯრაში
        const side = fu < 0 ? -1 : 1;
        const lean = Math.abs(fu) * 2 - (fv - 0.5) * 0.6 * side * side;
        const loop = Math.exp(-Math.pow((lean - 0.5) * 3.2, 2)) * Math.sin(fv * Math.PI);
        h[x + y * S] += loop * 0.9;
      }
    return heightToNormal(h, S, 1.6);
  });
}

/** თვილი (შალი / ჯინსი) — დიაგონალური ზოლები */
export function twillNormalMap() {
  return cached("twill-n", () => {
    const S = 256;
    const h = fbm(S, [[16, 0.2], [64, 0.15], [256, 0.12]], 5);
    const lines = 48;
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const d = ((x + y) / S) * lines;
        h[x + y * S] += Math.pow(Math.sin(d * Math.PI), 2) * 0.55;
      }
    return heightToNormal(h, S, 1.3);
  });
}

/** ტყავი — წვრილი მარცვლოვანი ზედაპირი */
export function leatherNormalMap() {
  return cached("leather-n", () => {
    const S = 256;
    const h = fbm(S, [[24, 0.5], [64, 0.35], [128, 0.2]], 9);
    for (let p = 0; p < h.length; p++) h[p] = -Math.abs(h[p]) * 1.6;
    return heightToNormal(h, S, 1.4);
  });
}

/* ------------------------------------------------------------------
   თმა
------------------------------------------------------------------- */

/** ღეროები V მიმართულებით — ფერის და ნორმალის რუკები */
export function hairTextures() {
  const color = cached("hair-c", () => {
    const W = 512;
    const H = 512;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, W, H);
    const r = rng(77);
    for (let i = 0; i < 2600; i++) {
      const x = r() * W;
      const y = r() * H;
      const len = 40 + r() * 140;
      const shade = 70 + r() * 120;
      ctx.strokeStyle = `rgba(${shade},${shade},${shade},${0.25 + r() * 0.35})`;
      ctx.lineWidth = 0.6 + r() * 1.4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + (r() - 0.5) * 6, y + len * 0.33, x + (r() - 0.5) * 6, y + len * 0.66, x + (r() - 0.5) * 8, y + len);
      ctx.stroke();
      // ვიმეორებთ კიდეებზე, რომ ტექსტურა უნაკერო იყოს
      if (y + len > H) {
        ctx.beginPath();
        ctx.moveTo(x, y - H);
        ctx.lineTo(x, y - H + len);
        ctx.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.NoColorSpace;
    tex.anisotropy = 8;
    return tex;
  });

  const normal = cached("hair-n", () => {
    const S = 256;
    const h = new Float32Array(S * S);
    const r = rng(91);
    const phase = Array.from({ length: S }, () => r() * Math.PI * 2);
    const amp = Array.from({ length: S }, () => 0.4 + r() * 0.6);
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        h[x + y * S] = Math.sin(x * 1.7 + phase[x] + Math.sin(y * 0.05 + phase[x]) * 0.8) * amp[x] * 0.5;
      }
    return heightToNormal(h, S, 1.2);
  });

  return { color, normal };
}

/* ------------------------------------------------------------------
   თვალი: გუგა, ფერადი გარსი, სისხლძარღვები
------------------------------------------------------------------- */

/**
 * თვალის კაკლის ტექსტურა სფერულ UV-ში (პოლუსი = გუგა, ზემოთ).
 * `irisAngle` — ფერადი გარსის კუთხური რადიუსი რადიანებში.
 */
export function eyeTexture(iris: string, irisAngle: number) {
  return cached(`eye-${iris}-${irisAngle.toFixed(3)}`, () => {
    const W = 512;
    const H = 256;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    const img = ctx.createImageData(W, H);
    const base = new THREE.Color(iris);
    const B = [base.r, base.g, base.b];
    const D = B.map((v) => v * 0.32);
    const Lc = new THREE.Color(iris).lerp(new THREE.Color("#e2c48a"), 0.4);
    const Lt = [Lc.r, Lc.g, Lc.b];
    const SC = [0.95, 0.93, 0.9];
    const VE = [0.78, 0.36, 0.33];

    // რადიალური ბოჭკოები — თითო სვეტზე (phi) ერთი მნიშვნელობა
    const r = rng(5);
    const fiber = new Float32Array(W);
    for (let i = 0; i < 150; i++) {
      const c = r() * W;
      const w = 0.4 + r() * 0.6;
      for (let dx = -3; dx <= 3; dx++) {
        const x = (Math.floor(c) + dx + W) % W;
        fiber[x] += w * Math.max(0, 1 - Math.abs(dx) / 3);
      }
    }
    const crypt = periodicNoise(W, 48, 13);
    const veins = fbm(W, [[12, 1], [40, 0.6]], 21);
    const pupil = irisAngle * 0.36;

    const px = (o: number, c: number[]) => {
      img.data[o] = Math.min(255, c[0] * 255);
      img.data[o + 1] = Math.min(255, c[1] * 255);
      img.data[o + 2] = Math.min(255, c[2] * 255);
      img.data[o + 3] = 255;
    };
    const lerp3 = (a: number[], b: number[], t: number) => [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
    ];

    for (let y = 0; y < H; y++) {
      const theta = (y / H) * Math.PI;
      for (let x = 0; x < W; x++) {
        const o = (x + y * W) * 4;
        if (theta < pupil) {
          px(o, [0.02, 0.018, 0.016]);
        } else if (theta < irisAngle) {
          const t = (theta - pupil) / (irisAngle - pupil);
          const cr = crypt[x + Math.floor(t * 30) * W];
          let c = lerp3(B, Lt, Math.max(0, 0.5 - t) * 1.2 + fiber[x] * 0.18 * Math.sin(t * Math.PI));
          c = lerp3(c, D, (cr - 0.5) * 0.6 + 0.1);
          c = lerp3(c, Lt, Math.exp(-Math.pow((t - 0.3) * 8, 2)) * 0.4);
          c = lerp3(c, D, Math.pow(Math.max(0, t - 0.7) / 0.3, 1.5) * 0.92);
          c = lerp3(c, D, Math.exp(-Math.pow(t * 10, 2)) * 0.7);
          px(o, c);
        } else {
          const t = (theta - irisAngle) / (Math.PI - irisAngle);
          let c = lerp3(SC, D, Math.exp(-Math.pow(t * 40, 2)) * 0.55);
          const v = veins[x + y * W];
          const veinMask = Math.max(0, 1 - Math.abs(v) * 14);
          c = lerp3(c, VE, veinMask * Math.min(1, t * 2.4) * 0.4);
          const shade = 1 - t * 0.25;
          px(o, [c[0] * shade, c[1] * shade, c[2] * shade]);
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  });
}

/** წამწამების / წარბის ღეროს ალფა — ვიწრო, წვეტიანი */
export function strandAlpha() {
  return cached("strand-a", () => {
    const W = 32;
    const H = 128;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.8, "rgba(255,255,255,0.8)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(W * 0.15, 0);
    ctx.lineTo(W * 0.85, 0);
    ctx.lineTo(W * 0.5, H);
    ctx.closePath();
    ctx.fill();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.NoColorSpace;
    return tex;
  });
}
