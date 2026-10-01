/**
 * გეომეტრიის „სუფთა“ მონაცემები (typed arrays) — Web Worker-იდან
 * მთავარ ნაკადში უკოპიოდ გადასაცემად, და BufferGeometry-ში გადასაყვანად.
 */
import * as THREE from "three";

export type Arr = Float32Array | Uint16Array | Uint32Array;

export interface GeoData {
  attributes: Record<string, { array: Arr; itemSize: number }>;
  index: Uint32Array;
  morphPosition?: Float32Array[];
  morphNormal?: Float32Array[];
}

export function toGeometry(d: GeoData): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  for (const [name, a] of Object.entries(d.attributes)) {
    g.setAttribute(name, new THREE.BufferAttribute(a.array, a.itemSize));
  }
  g.setIndex(new THREE.BufferAttribute(d.index, 1));
  if (d.morphPosition) {
    g.morphAttributes.position = d.morphPosition.map((m) => new THREE.BufferAttribute(m, 3));
    if (d.morphNormal) g.morphAttributes.normal = d.morphNormal.map((m) => new THREE.BufferAttribute(m, 3));
    g.morphTargetsRelative = true;
  }
  g.computeBoundingSphere();
  return g;
}

export function fromGeometry(g: THREE.BufferGeometry): GeoData {
  const attributes: GeoData["attributes"] = {};
  for (const [name, a] of Object.entries(g.attributes)) {
    attributes[name] = { array: (a as THREE.BufferAttribute).array as Arr, itemSize: a.itemSize };
  }
  const idx = g.getIndex();
  const out: GeoData = {
    attributes,
    index: idx ? Uint32Array.from(idx.array as ArrayLike<number>) : new Uint32Array(0),
  };
  if (g.morphAttributes.position) {
    out.morphPosition = g.morphAttributes.position.map((m) => (m as THREE.BufferAttribute).array as Float32Array);
  }
  if (g.morphAttributes.normal) {
    out.morphNormal = g.morphAttributes.normal.map((m) => (m as THREE.BufferAttribute).array as Float32Array);
  }
  return out;
}

/** ყველა ArrayBuffer — postMessage-ის transfer სიისთვის */
export function transferables(d: GeoData | GeoData[]): ArrayBuffer[] {
  const list = Array.isArray(d) ? d : [d];
  const set = new Set<ArrayBuffer>();
  for (const g of list) {
    for (const a of Object.values(g.attributes)) set.add(a.array.buffer as ArrayBuffer);
    set.add(g.index.buffer as ArrayBuffer);
    g.morphPosition?.forEach((m) => set.add(m.buffer as ArrayBuffer));
    g.morphNormal?.forEach((m) => set.add(m.buffer as ArrayBuffer));
  }
  return [...set];
}

/** X-ით სარკისებური ასლი (მარჯვენა → მარცხენა) — სამკუთხედების რიგი ბრუნდება */
export function mirrorX(d: GeoData): GeoData {
  const attributes: GeoData["attributes"] = {};
  for (const [name, a] of Object.entries(d.attributes)) {
    const arr = a.array.slice() as Arr;
    if ((name === "position" || name === "normal") && a.itemSize === 3) {
      for (let i = 0; i < arr.length; i += 3) arr[i] = -arr[i];
    }
    attributes[name] = { array: arr, itemSize: a.itemSize };
  }
  const index = d.index.slice();
  for (let i = 0; i < index.length; i += 3) {
    const t = index[i + 1];
    index[i + 1] = index[i + 2];
    index[i + 2] = t;
  }
  const flip = (list?: Float32Array[]) =>
    list?.map((m) => {
      const c = m.slice();
      for (let i = 0; i < c.length; i += 3) c[i] = -c[i];
      return c;
    });
  return { attributes, index, morphPosition: flip(d.morphPosition), morphNormal: flip(d.morphNormal) };
}
