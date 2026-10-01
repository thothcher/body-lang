/**
 * მასალები: კანი (იაფი subsurface-ის იმიტაციით), ქსოვილები, ტყავი, თმა.
 */
import * as THREE from "three";
import {
  hairTextures,
  knitNormalMap,
  leatherNormalMap,
  skinNormalMap,
  skinRoughnessMap,
  twillNormalMap,
} from "./textures";

/* ------------------------------------------------------------------
   კანი

   MeshPhysicalMaterial-ს ვუცვლით პირდაპირი სინათლის დიფუზურ წევრს:
   „შემოხვეული“ (wrap) განათება + მოწითალო გადასვლა ჩრდილის საზღვარზე.
   ეს არის კანის ქვეზედაპირული გაბნევის ცნობილი, იაფი მიახლოება — კანი
   რბილად, „ცოცხლად“ გამოიყურება და არა პლასტმასივით.
------------------------------------------------------------------- */

const DIFFUSE_LINE =
  "reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );";

const SSS_LINE = /* glsl */ `
  #ifdef SKIN_SSS
    float sssNL = dot( geometryNormal, directLight.direction );
    float sssWrap = saturate( ( sssNL + 0.42 ) / 1.42 );
    vec3 sssBand = vec3( 1.0, 0.36, 0.24 ) * saturate( sssWrap - saturate( sssNL ) ) * 0.85;
    reflectedLight.directDiffuse += ( vec3( sssWrap ) + sssBand ) * directLight.color * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
  #else
    ${DIFFUSE_LINE}
  #endif
`;

function patchSkin(mat: THREE.MeshPhysicalMaterial) {
  mat.defines = { ...(mat.defines ?? {}), SKIN_SSS: "" };
  mat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <lights_physical_pars_fragment>",
      THREE.ShaderChunk.lights_physical_pars_fragment.replace(DIFFUSE_LINE, SSS_LINE),
    );
  };
  mat.customProgramCacheKey = () => "skin-sss";
  return mat;
}

export interface SkinOptions {
  vertexColors?: boolean;
  /** UV-ის გამეორება ფორების რუკისთვის */
  repeat?: number;
  roughness?: number;
}

export function createSkinMaterial(color: string, opts: SkinOptions = {}) {
  const normalMap = skinNormalMap().clone();
  normalMap.repeat.set(opts.repeat ?? 6, opts.repeat ?? 6);
  normalMap.needsUpdate = true;
  const roughnessMap = skinRoughnessMap();
  const mat = new THREE.MeshPhysicalMaterial({
    color: opts.vertexColors ? "#ffffff" : color,
    vertexColors: !!opts.vertexColors,
    roughness: opts.roughness ?? 0.56,
    roughnessMap,
    metalness: 0,
    normalMap,
    normalScale: new THREE.Vector2(0.22, 0.22),
    specularIntensity: 0.55,
    ior: 1.4,
    clearcoat: 0.06,
    clearcoatRoughness: 0.45,
  });
  return patchSkin(mat);
}

/* ------------------------------------------------------------------
   ქსოვილები
------------------------------------------------------------------- */

export type FabricKind = "knit" | "twill" | "wool";

export function createFabricMaterial(color: string, kind: FabricKind, repeat = 8) {
  const base = kind === "knit" ? knitNormalMap() : twillNormalMap();
  const normalMap = base.clone();
  normalMap.repeat.set(repeat, repeat);
  normalMap.needsUpdate = true;
  const c = new THREE.Color(color);
  return new THREE.MeshPhysicalMaterial({
    color: c,
    roughness: kind === "wool" ? 0.74 : 0.86,
    metalness: 0,
    normalMap,
    normalScale: new THREE.Vector2(kind === "knit" ? 0.55 : 0.45, kind === "knit" ? 0.55 : 0.45),
    // ქსოვილის ხავერდოვანი ბზინვარება კიდეებზე
    sheen: kind === "wool" ? 0.6 : 0.85,
    sheenRoughness: 0.55,
    sheenColor: c.clone().lerp(new THREE.Color("#ffffff"), 0.35),
    specularIntensity: 0.35,
    side: THREE.FrontSide,
  });
}

export function createLeatherMaterial(color: string, polished: boolean) {
  const normalMap = leatherNormalMap().clone();
  normalMap.repeat.set(10, 10);
  normalMap.needsUpdate = true;
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: polished ? 0.38 : 0.62,
    metalness: 0,
    normalMap,
    normalScale: new THREE.Vector2(0.35, 0.35),
    clearcoat: polished ? 0.75 : 0.15,
    clearcoatRoughness: polished ? 0.18 : 0.5,
  });
}

/* ------------------------------------------------------------------
   თმა — ანიზოტროპული ბზინვარება ღეროების გასწვრივ
------------------------------------------------------------------- */

export function createHairMaterial(color: string) {
  const { color: map, normal } = hairTextures();
  const m = map.clone();
  m.repeat.set(5, 2.5);
  m.needsUpdate = true;
  const n = normal.clone();
  n.repeat.set(5, 2.5);
  n.needsUpdate = true;
  const c = new THREE.Color(color);
  return new THREE.MeshPhysicalMaterial({
    color: c.clone().multiplyScalar(1.9),
    map: m,
    normalMap: n,
    normalScale: new THREE.Vector2(0.6, 0.6),
    roughness: 0.48,
    metalness: 0,
    anisotropy: 0.85,
    anisotropyRotation: Math.PI / 2,
    sheen: 0.4,
    sheenRoughness: 0.4,
    sheenColor: c.clone().lerp(new THREE.Color("#ffffff"), 0.25),
    specularIntensity: 0.6,
  });
}
