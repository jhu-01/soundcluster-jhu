import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

import { GridBase } from "./GridBase";

interface EmotionPoint {
  label: string;
  position: [number, number, number];
  color: string;
  scale: number;
}

const emotionPoints: EmotionPoint[] = [
  {
    label: "Energy",
    position: [-2.8, 0.2, -1.4],
    color: "#22d3ee",
    scale: 0.28,
  },
  {
    label: "Valence",
    position: [-0.8, 1.1, 1.8],
    color: "#f59e0b",
    scale: 0.22,
  },
  {
    label: "Tempo",
    position: [1.5, 0.65, -0.8],
    color: "#e879f9",
    scale: 0.25,
  },
  {
    label: "Depth",
    position: [2.7, -0.1, 1.2],
    color: "#34d399",
    scale: 0.2,
  },
  {
    label: "Tension",
    position: [0.4, 1.7, 0.2],
    color: "#fb7185",
    scale: 0.24,
  },
];

function EmotionNodes() {
  const groupRef = useRef<Group>(null);

  useFrame((_state, delta) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.y += delta * 0.08;
  });

  return (
    <group ref={groupRef}>
      {emotionPoints.map((point) => (
        <mesh key={point.label} position={point.position}>
          <sphereGeometry args={[point.scale, 32, 32]} />
          <meshStandardMaterial
            color={point.color}
            emissive={point.color}
            emissiveIntensity={1.35}
            roughness={0.42}
          />
        </mesh>
      ))}
    </group>
  );
}

export function StarsCanvas() {
  return (
    <Canvas
      camera={{ position: [5.5, 4.2, 7.5], fov: 48 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={["#06120f"]} />
      <ambientLight intensity={0.56} />
      <directionalLight position={[6, 8, 5]} intensity={1.4} />
      <pointLight position={[-5, 2, -3]} intensity={1.2} color="#22d3ee" />
      <Stars radius={64} depth={34} count={1400} factor={4} fade speed={0.35} />
      <GridBase />
      <EmotionNodes />
      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        maxDistance={16}
        maxPolarAngle={Math.PI * 0.48}
        minDistance={4}
      />
    </Canvas>
  );
}
