"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, N8AO, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import Avatar from "./Avatar";
import Furniture from "./Furniture";
import { SEAT_DROP, isSeated, type AvatarConfig } from "./rig";

export type CameraView = "full" | "upper" | "face";

const VIEWS: Record<CameraView, { pos: [number, number, number]; target: [number, number, number]; fov: number }> = {
  full: { pos: [0, 1.02, 3.35], target: [0, 0.9, 0], fov: 36 },
  upper: { pos: [0, 1.42, 1.62], target: [0, 1.32, 0], fov: 34 },
  face: { pos: [0, 1.64, 0.74], target: [0, 1.615, 0], fov: 26 },
};

/* ჯდომისას — ოდნავ გვერდიდან და ზემოდან, რომ ფეხები და ავეჯი კარგად ჩანდეს */
const SEATED_FULL = { pos: [1.35, 1.42, 3.35] as [number, number, number], target: [0, 0.74, 0.25] as [number, number, number], fov: 36 };

function Rig({ view, seated, autoRotate }: { view: CameraView; seated: boolean; autoRotate: boolean }) {
  const base = VIEWS[view];
  const v =
    seated && view === "full"
      ? SEATED_FULL
      : seated
        ? {
            ...base,
            pos: [base.pos[0], base.pos[1] + SEAT_DROP, base.pos[2]] as [number, number, number],
            target: [base.target[0], base.target[1] + SEAT_DROP, base.target[2]] as [number, number, number],
          }
        : base;
  const aspect = useThree((s) => s.size.width / s.size.height);
  // ვიწრო ეკრანზე კამერა უკან იწევს, რომ ფიგურა მთლიანად ჩაეტიოს
  const pull = aspect < 1 ? 1 + (1 - aspect) * 0.95 : 1;
  const pos: [number, number, number] = [v.pos[0] * pull, v.pos[1], v.pos[2] * pull];
  return (
    <>
      <PerspectiveCamera makeDefault position={pos} fov={v.fov} near={0.05} far={50} />
      <OrbitControls
        target={v.target}
        enablePan={false}
        minDistance={0.42}
        maxDistance={7}
        minPolarAngle={Math.PI * 0.16}
        maxPolarAngle={Math.PI * 0.62}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.7}
        autoRotate={autoRotate}
        autoRotateSpeed={1.6}
        makeDefault
      />
    </>
  );
}

/** სტუდიური გარემო — ფოტოსტუდიის „სოფთბოქსები“, ქსელის გარეშე */
function StudioLights({ dark }: { dark: boolean }) {
  return (
    <Environment resolution={256} frames={1} environmentIntensity={dark ? 0.42 : 0.5}>
      <color attach="background" args={[dark ? "#0b0c0f" : "#e4e4ea"]} />
      {/* მთავარი სოფთბოქსი */}
      <Lightformer form="rect" intensity={dark ? 2.2 : 3} position={[2.6, 2.8, 3]} scale={[2.6, 2.2, 1]} target={[0, 1.2, 0]} color="#fff3e6" />
      {/* შემავსებელი */}
      <Lightformer form="rect" intensity={dark ? 0.6 : 1.1} position={[-3.2, 1.8, 1.8]} scale={[2, 3, 1]} target={[0, 1.2, 0]} color="#dfe7ff" />
      {/* კონტურის რგოლი უკნიდან */}
      <Lightformer form="ring" intensity={dark ? 2.4 : 2} position={[-0.6, 3.2, -3]} scale={1.6} target={[0, 1.3, 0]} color="#ffd8b8" />
      {/* ზედა ზოლი */}
      <Lightformer form="rect" intensity={0.8} position={[0, 4.5, 0]} rotation-x={Math.PI / 2} scale={[4, 1, 1]} color="#ffffff" />
      {/* იატაკიდან არეკლილი თბილი სინათლე */}
      <Lightformer form="rect" intensity={dark ? 0.15 : 0.45} position={[0, -0.5, 1]} rotation-x={-Math.PI / 2} scale={[6, 6, 1]} color={dark ? "#24252c" : "#ececf0"} />
    </Environment>
  );
}

function Ready({ onReady }: { onReady?: () => void }) {
  React.useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
}

export default function StudioScene({
  config,
  view = "full",
  dark = false,
  autoRotate = false,
  onReady,
}: {
  config: AvatarConfig;
  view?: CameraView;
  dark?: boolean;
  autoRotate?: boolean;
  onReady?: () => void;
}) {
  const bg = dark ? "#0e0f13" : "#ececf0";
  const seated = isSeated(config);
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      gl={{ antialias: false, powerPreference: "high-performance", preserveDrawingBuffer: false }}
      style={{ touchAction: "pan-y" }}
    >
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 5.5, 13]} />

      <Rig key={`${view}-${seated}`} view={view} seated={seated} autoRotate={autoRotate} />

      <hemisphereLight args={[dark ? "#9aa6d6" : "#ffffff", dark ? "#16171c" : "#cfcfd8", dark ? 0.22 : 0.32]} />
      {/* საკვანძო სინათლე — რბილი ჩრდილებით */}
      <directionalLight
        position={[2.2, 4.4, 3.1]}
        intensity={dark ? 2.1 : 2.9}
        color="#fff4e8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-camera-left={-1.4}
        shadow-camera-right={1.4}
        shadow-camera-top={2.1}
        shadow-camera-bottom={-0.3}
        shadow-bias={-0.0002}
        shadow-normalBias={0.012}
        shadow-radius={4}
      />
      {/* კონტური (rim) — ფიგურას ფონისგან გამოყოფს */}
      <directionalLight position={[-1.6, 2.6, -3.2]} intensity={dark ? 1.8 : 1.4} color="#ffdcc0" />
      <directionalLight position={[-3, 1.6, 1.8]} intensity={dark ? 0.35 : 0.5} color="#d6e0ff" />

      <StudioLights dark={dark} />

      <React.Suspense fallback={null}>
        <Avatar config={config} />
        <Ready onReady={onReady} />
      </React.Suspense>

      <Furniture setting={config.setting} dark={dark} />

      {/* ციკლორამა — იატაკი რბილად გადადის კედელში, ნაკერის გარეშე */}
      <Cyclorama color={dark ? "#15161b" : "#e9e9ee"} />
      <ContactShadows position={[0, 0.003, 0.2]} opacity={0.5} scale={4} blur={2.4} far={1.3} resolution={1024} color="#101014" />

      {/* დამხმარე წრე */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <ringGeometry args={[0.72, 0.728, 128]} />
        <meshBasicMaterial color={dark ? "#ff6a45" : "#f0441f"} transparent opacity={0.45} />
      </mesh>

      <EffectComposer multisampling={4}>
        <N8AO aoRadius={0.18} distanceFalloff={0.6} intensity={2.4} quality="medium" color={new THREE.Color("#101014")} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette offset={0.32} darkness={dark ? 0.5 : 0.18} />
      </EffectComposer>
    </Canvas>
  );
}

/** იატაკი + მოხრილი უკანა კედელი ერთ ზედაპირად (L-პროფილი რადიუსით) */
function Cyclorama({ color }: { color: string }) {
  const geo = React.useMemo(() => {
    const R = 1.6; // მოხრის რადიუსი
    const back = -3.2; // კედლის z
    const pts: THREE.Vector2[] = [];
    // პროფილი: იატაკი წინიდან უკან, მოხრა, შემდეგ კედელი ზემოთ
    const prof: [number, number][] = [];
    for (let z = 6; z > back + R; z -= 0.25) prof.push([z, 0]);
    for (let i = 0; i <= 16; i++) {
      const a = (i / 16) * (Math.PI / 2);
      prof.push([back + R - Math.sin(a) * R, R - Math.cos(a) * R]);
    }
    for (let y = R + 0.3; y <= 7; y += 0.6) prof.push([back, y]);
    prof.forEach(([z, y]) => pts.push(new THREE.Vector2(z, y)));
    const W = 16;
    const g = new THREE.BufferGeometry();
    const pos: number[] = [];
    const idx: number[] = [];
    pts.forEach((p) => {
      pos.push(-W / 2, p.y, p.x, W / 2, p.y, p.x);
    });
    for (let i = 0; i < pts.length - 1; i++) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, []);
  React.useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color={color} roughness={0.95} side={THREE.DoubleSide} />
    </mesh>
  );
}
