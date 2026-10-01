/**
 * ყველა „მძიმე“ გეომეტრია — Worker-შიც და მთავარ ნაკადშიც მუშაობს.
 * ორ ნაწილად იყოფა, რომ ორ Worker-ში პარალელურად აიგოს.
 */
import { buildBrowsData, buildHairData, buildHairFuzzData, buildHeadData, type HeadData } from "./headModel";
import { buildHandData, type HandData } from "./handModel";
import { buildShoeData, type ShoeData } from "./shoeModel";
import { mirrorX, transferables, type GeoData } from "./geo";

export interface FaceData {
  head: HeadData;
  hair: GeoData;
  brows: GeoData;
  fuzz: GeoData;
}

export interface LimbData {
  /** A = მარჯვენა ხელი (x < 0), B = სარკისებური */
  handA: HandData;
  handB: HandData;
  shoes: { casual: ShoeData; formal: ShoeData };
}

export type AvatarData = FaceData & LimbData;
export type Part = "face" | "limbs";

export function buildFace(): FaceData {
  return {
    head: buildHeadData(),
    hair: buildHairData(),
    brows: buildBrowsData(),
    fuzz: buildHairFuzzData(),
  };
}

export function buildLimbs(): LimbData {
  const handA = buildHandData();
  return {
    handA,
    handB: { skin: mirrorX(handA.skin), nails: mirrorX(handA.nails) },
    shoes: { casual: buildShoeData(false), formal: buildShoeData(true) },
  };
}

export function buildAll(): AvatarData {
  return { ...buildFace(), ...buildLimbs() };
}

export function partTransferables(part: Part, d: FaceData | LimbData): ArrayBuffer[] {
  if (part === "face") {
    const f = d as FaceData;
    return [...transferables([f.head.geo, f.hair, f.brows, f.fuzz]), f.head.masks.buffer as ArrayBuffer];
  }
  const l = d as LimbData;
  return transferables([
    l.handA.skin,
    l.handA.nails,
    l.handB.skin,
    l.handB.nails,
    l.shoes.casual.upper,
    l.shoes.casual.sole,
    l.shoes.formal.upper,
    l.shoes.formal.sole,
  ]);
}
