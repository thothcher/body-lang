"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";


/**
 * სტუდიის ავეჯი. ავატარი სათავეშია და +Z-ისკენ იყურება; ჯდომისას
 * მენჯის სახსარი ≈ 0.5 მ სიმაღლეზეა, მუხლები ≈ 0.41 მ წინ.
 */

function useMaterials(dark: boolean) {
  return React.useMemo(
    () => ({
      wood: new THREE.MeshStandardMaterial({ color: dark ? "#6b513d" : "#9a7556", roughness: 0.55 }),
      fabric: new THREE.MeshStandardMaterial({ color: dark ? "#3a3c46" : "#2c2e36", roughness: 0.95 }),
      metal: new THREE.MeshStandardMaterial({ color: "#b9bac2", metalness: 1, roughness: 0.28 }),
      dark: new THREE.MeshStandardMaterial({ color: "#1b1c21", roughness: 0.5 }),
      glass: new THREE.MeshPhysicalMaterial({
        color: "#e8f0f4",
        roughness: 0.06,
        metalness: 0,
        transparent: true,
        opacity: 0.28,
        clearcoat: 1,
        depthWrite: false,
      }),
      paper: new THREE.MeshStandardMaterial({ color: "#f3f1ec", roughness: 0.9 }),
      accent: new THREE.MeshStandardMaterial({ color: "#f0441f", roughness: 0.45 }),
    }),
    [dark],
  );
}

type Mats = ReturnType<typeof useMaterials>;

/** ჩნდება რბილად — მასშტაბი 0-დან 1-მდე */
function Appear({ show, children }: { show: boolean; children: React.ReactNode }) {
  const ref = React.useRef<THREE.Group>(null);
  const [mounted, setMounted] = React.useState(show);
  if (show && !mounted) setMounted(true);
  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    const target = show ? 1 : 0;
    const s = THREE.MathUtils.damp(g.scale.x, target, 9, Math.min(delta, 0.05));
    g.scale.setScalar(s);
    g.visible = s > 0.01;
    if (!show && s < 0.01 && mounted) setMounted(false);
  });
  if (!mounted) return null;
  return (
    <group ref={ref} scale={0.001}>
      {children}
    </group>
  );
}

function Leg({ m, pos, h, r = 0.014 }: { m: THREE.Material; pos: [number, number, number]; h: number; r?: number }) {
  return (
    <mesh material={m} position={[pos[0], pos[1] + h / 2, pos[2]]} castShadow receiveShadow>
      <cylinderGeometry args={[r, r, h, 16]} />
    </mesh>
  );
}

function Chair({ m }: { m: Mats }) {
  const seatY = 0.43;
  return (
    <group position={[0, 0, -0.03]}>
      {/* სავარძელი */}
      <RoundedBox args={[0.5, 0.075, 0.47]} radius={0.03} smoothness={4} position={[0, seatY - 0.04, 0]} material={m.fabric} castShadow receiveShadow />
      {/* ხის ჩარჩო */}
      <RoundedBox args={[0.52, 0.03, 0.49]} radius={0.012} smoothness={3} position={[0, seatY - 0.09, 0]} material={m.wood} castShadow receiveShadow />
      {/* საზურგე — ოდნავ გადახრილი */}
      <group position={[0, seatY - 0.06, -0.235]} rotation={[-0.14, 0, 0]}>
        <RoundedBox args={[0.48, 0.44, 0.055]} radius={0.025} smoothness={4} position={[0, 0.31, 0]} material={m.fabric} castShadow receiveShadow />
        <mesh material={m.wood} position={[-0.22, 0.2, -0.035]} castShadow>
          <boxGeometry args={[0.025, 0.42, 0.025]} />
        </mesh>
        <mesh material={m.wood} position={[0.22, 0.2, -0.035]} castShadow>
          <boxGeometry args={[0.025, 0.42, 0.025]} />
        </mesh>
      </group>
      {/* ფეხები */}
      {[
        [-0.22, -0.2],
        [0.22, -0.2],
        [-0.22, 0.2],
        [0.22, 0.2],
      ].map(([x, z]) => (
        <Leg key={`${x}${z}`} m={m.wood} pos={[x, 0, z]} h={seatY - 0.1} r={0.017} />
      ))}
    </group>
  );
}

function Desk({ m }: { m: Mats }) {
  const top = 0.74;
  const z = 0.72;
  return (
    <group position={[0, 0, z]}>
      {/* მინის ზედაპირი — ფეხები გამჭვირვალედ ჩანს */}
      <RoundedBox args={[1.5, 0.022, 0.72]} radius={0.008} smoothness={3} position={[0, top, 0]} material={m.glass} />
      {/* ლითონის ჩარჩო */}
      {[-0.35, 0.35].map((dz) => (
        <mesh key={dz} material={m.metal} position={[0, top - 0.02, dz]} castShadow>
          <boxGeometry args={[1.42, 0.02, 0.02]} />
        </mesh>
      ))}
      {[-0.71, 0.71].map((dx) => (
        <group key={dx} position={[dx, 0, 0]}>
          <Leg m={m.metal} pos={[0, 0, -0.33]} h={top - 0.02} r={0.012} />
          <Leg m={m.metal} pos={[0, 0, 0.33]} h={top - 0.02} r={0.012} />
          <mesh material={m.metal} position={[0, top - 0.02, 0]}>
            <boxGeometry args={[0.02, 0.02, 0.68]} />
          </mesh>
        </group>
      ))}
      {/* საგნები მაგიდაზე */}
      <group position={[-0.42, top + 0.011, -0.05]} rotation={[0, 0.25, 0]}>
        <RoundedBox args={[0.33, 0.016, 0.23]} radius={0.006} smoothness={2} position={[0, 0.008, 0]} material={m.dark} castShadow />
      </group>
      <RoundedBox args={[0.21, 0.012, 0.29]} radius={0.002} smoothness={2} position={[0.36, top + 0.017, 0.02]} rotation={[0, -0.18, 0]} material={m.paper} castShadow />
      <mesh material={m.accent} position={[0.55, top + 0.06, -0.12]} castShadow>
        <cylinderGeometry args={[0.038, 0.034, 0.1, 24]} />
      </mesh>
    </group>
  );
}

function Podium({ m }: { m: Mats }) {
  return (
    <group position={[0, 0, 0.5]}>
      {/* ტანი — ოდნავ ვიწროვდება ზემოთ */}
      <mesh material={m.fabric} position={[0, 0.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.36, 1.0, 4, 1]} />
      </mesh>
      {/* ხის ფუძე */}
      <RoundedBox args={[0.6, 0.05, 0.48]} radius={0.012} smoothness={3} position={[0, 0.025, 0]} material={m.wood} castShadow receiveShadow />
      {/* დახრილი ხის ზედაპირი */}
      <RoundedBox
        args={[0.62, 0.035, 0.44]}
        radius={0.012}
        smoothness={3}
        position={[0, 1.04, 0.01]}
        rotation={[0.24, 0, 0]}
        material={m.wood}
        castShadow
      />
      {/* ფურცლები */}
      <RoundedBox args={[0.21, 0.006, 0.29]} radius={0.002} smoothness={2} position={[0.05, 1.062, 0.0]} rotation={[0.24, 0.06, 0]} material={m.paper} />
      {/* წინა ზოლი */}
      <mesh material={m.accent} position={[0, 0.78, 0.226]} rotation={[0.06, 0, 0]}>
        <boxGeometry args={[0.36, 0.03, 0.004]} />
      </mesh>
    </group>
  );
}

export default function Furniture({ setting, dark }: { setting: string; dark: boolean }) {
  const m = useMaterials(dark);
  React.useEffect(() => () => Object.values(m).forEach((x) => x.dispose()), [m]);
  return (
    <>
      <Appear show={setting === "chair" || setting === "desk"}>
        <Chair m={m} />
      </Appear>
      <Appear show={setting === "desk"}>
        <Desk m={m} />
      </Appear>
      <Appear show={setting === "podium"}>
        <Podium m={m} />
      </Appear>
    </>
  );
}
