"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, N8AO, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import Avatar from "./Avatar";
import type { AvatarConfig } from "./rig";

export type CameraView = "full" | "upper" | "face";

const VIEWS: Record<CameraView, { pos: [number, number, number]; target: [number, number, number]; fov: number }> = {
  full: { pos: [0, 1.02, 3.35], target: [0, 0.9, 0], fov: 36 },
  upper: { pos: [0, 1.42, 1.62], target: [0, 1.32, 0], fov: 34 },
  face: { pos: [0, 1.64, 0.74], target: [0, 1.615, 0], fov: 26 },
};

function Rig({ view }: { view: CameraView }) {
  const v = VIEWS[view];
  const aspect = useThree((s) => s.size.width / s.size.height);
  // ვიწრო ეკრანზე კამერა უკან იწევს, რომ ფიგურა მთლიანად ჩაეტიოს
  const pull = aspect < 1 ? 1 + (1 - aspect) * 0.95 : 1;
  const pos: [number, number, number] = [v.pos[0], v.pos[1], v.pos[2] * pull];
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
        makeDefault
      />
    </>
  );
}

/** სტუდიური გარემო — ფოტოსტუდიის „სოფთბოქსები“, ქსელის გარეშე */
function StudioLights({ dark }: { dark: boolean }) {
  return (
    <Environment resolution={256} frames={1} environmentIntensity={dark ? 0.42 : 0.5}>
      <color attach="background" args={[dark ? "#0c0d12" : "#d9d3c8"]} />
      {/* მთავარი სოფთბოქსი */}
      <Lightformer form="rect" intensity={dark ? 2.2 : 3} position={[2.6, 2.8, 3]} scale={[2.6, 2.2, 1]} target={[0, 1.2, 0]} color="#fff3e6" />
      {/* შემავსებელი */}
      <Lightformer form="rect" intensity={dark ? 0.6 : 1.1} position={[-3.2, 1.8, 1.8]} scale={[2, 3, 1]} target={[0, 1.2, 0]} color="#dfe7ff" />
      {/* კონტურის რგოლი უკნიდან */}
      <Lightformer form="ring" intensity={dark ? 2.4 : 2} position={[-0.6, 3.2, -3]} scale={1.6} target={[0, 1.3, 0]} color="#ffd8b8" />
      {/* ზედა ზოლი */}
      <Lightformer form="rect" intensity={0.8} position={[0, 4.5, 0]} rotation-x={Math.PI / 2} scale={[4, 1, 1]} color="#ffffff" />
      {/* იატაკიდან არეკლილი თბილი სინათლე */}
      <Lightformer form="rect" intensity={dark ? 0.15 : 0.45} position={[0, -0.5, 1]} rotation-x={-Math.PI / 2} scale={[6, 6, 1]} color={dark ? "#2a2c36" : "#e9dccb"} />
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
  onReady,
}: {
  config: AvatarConfig;
  view?: CameraView;
  dark?: boolean;
  onReady?: () => void;
}) {
  const bg = dark ? "#14161d" : "#efeae0";
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      gl={{ antialias: false, powerPreference: "high-performance", preserveDrawingBuffer: false }}
      style={{ touchAction: "pan-y" }}
    >
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 5, 12]} />

      <Rig key={view} view={view} />

      <hemisphereLight args={[dark ? "#9aa6d6" : "#fff8ee", dark ? "#1a1c24" : "#cbbfae", dark ? 0.22 : 0.3]} />
      {/* საკვანძო სინათლე — რბილი ჩრდილებით */}
      <directionalLight
        position={[2.2, 4.4, 3.1]}
        intensity={dark ? 2.1 : 2.9}
        color="#fff4e8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-camera-left={-1.1}
        shadow-camera-right={1.1}
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

      {/* იატაკი */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[4, 96]} />
        <meshStandardMaterial color={dark ? "#1a1d25" : "#e6dfd2"} roughness={0.92} />
      </mesh>
      <ContactShadows position={[0, 0.003, 0]} opacity={0.55} scale={3} blur={2.2} far={1.2} resolution={1024} color="#1c160f" />

      {/* დამხმარე წრე */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <ringGeometry args={[0.66, 0.672, 96]} />
        <meshBasicMaterial color={dark ? "#3a4270" : "#c9c2b2"} transparent opacity={0.55} />
      </mesh>

      <EffectComposer multisampling={4}>
        <N8AO aoRadius={0.18} distanceFalloff={0.6} intensity={2.4} quality="medium" color={new THREE.Color("#1a120c")} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette offset={0.3} darkness={dark ? 0.5 : 0.28} />
      </EffectComposer>
    </Canvas>
  );
}
