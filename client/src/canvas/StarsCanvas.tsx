import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, Vector3 } from "three";
import type { Group, MeshStandardMaterial } from "three";

import type { AnalyzeStreamVisualFrame } from "../../../shared/types/analyzeStream";
import type { EmotionVector } from "../../../shared/types/musicAnalysis";
import { useAnalysis } from "../context/AnalysisContext";
import { GridBase } from "./GridBase";

interface MockTrack {
  id: string;
  title: string;
  artist: string;
  emotions: EmotionVector;
}

interface TrackPoint {
  id: string;
  position: [number, number, number];
  color: string;
  scale: number;
}

interface AnimatedTrackNodeProps {
  index: number;
  point: TrackPoint;
  visual: AnalyzeStreamVisualFrame;
  isFinal: boolean;
}

const mockTracks: MockTrack[] = [
  {
    id: "midnight-circuit",
    title: "Midnight Circuit",
    artist: "SoundCluster Lab",
    emotions: {
      energy: 0.72,
      valence: 0.42,
      tempoDensity: 0.68,
      spaceDepth: 0.75,
      tension: 0.55,
    },
  },
  {
    id: "soft-orbit",
    title: "Soft Orbit",
    artist: "Mira Field",
    emotions: {
      energy: 0.28,
      valence: 0.82,
      tempoDensity: 0.34,
      spaceDepth: 0.88,
      tension: 0.18,
    },
  },
  {
    id: "fault-line",
    title: "Fault Line",
    artist: "Noir Static",
    emotions: {
      energy: 0.91,
      valence: 0.22,
      tempoDensity: 0.86,
      spaceDepth: 0.36,
      tension: 0.92,
    },
  },
  {
    id: "glass-harbor",
    title: "Glass Harbor",
    artist: "Aster Tide",
    emotions: {
      energy: 0.46,
      valence: 0.64,
      tempoDensity: 0.52,
      spaceDepth: 0.58,
      tension: 0.38,
    },
  },
  {
    id: "solar-drift",
    title: "Solar Drift",
    artist: "Dayline",
    emotions: {
      energy: 0.66,
      valence: 0.78,
      tempoDensity: 0.72,
      spaceDepth: 0.44,
      tension: 0.31,
    },
  },
];

const DEFAULT_VISUAL_FRAME: AnalyzeStreamVisualFrame = {
  intensity: 1,
  activeNodeCount: mockTracks.length,
  orbitSpeed: 0.08,
  color: "#5eead4",
};

const NODE_SETTLE_SPEED = 3.2;
const STREAM_COLOR_BLEND_SPEED = 5.8;
const ENTRY_RADIUS = 6.8;

const mapUnitToScene = (value: number): number => {
  return (value - 0.5) * 7.6;
};

const createEntryPosition = (index: number): Vector3 => {
  const angle = index * 2.3999632297;

  return new Vector3(
    Math.cos(angle) * ENTRY_RADIUS,
    (index % 4 - 1.5) * 0.42,
    Math.sin(angle) * ENTRY_RADIUS,
  );
};

const createTrackPoint = (track: MockTrack): TrackPoint => {
  const { emotions } = track;
  const hue = Math.round(180 + emotions.valence * 120 - emotions.tension * 42);
  const lightness = Math.round(48 + emotions.energy * 18);

  return {
    id: track.id,
    position: [
      mapUnitToScene(emotions.energy),
      mapUnitToScene(emotions.spaceDepth) * 0.72,
      mapUnitToScene(emotions.valence),
    ],
    color: `hsl(${hue} 86% ${lightness}%)`,
    scale: 0.16 + emotions.tempoDensity * 0.24,
  };
};

const createSceneTracks = (analysisEmotions: EmotionVector | null): MockTrack[] => {
  return mockTracks.map((track, index) => {
    if (index !== 0 || !analysisEmotions) {
      return track;
    }

    return {
      ...track,
      emotions: analysisEmotions,
    };
  });
};

function AnimatedTrackNode({
  index,
  point,
  visual,
  isFinal,
}: AnimatedTrackNodeProps) {
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const targetColorRef = useRef(new Color(point.color));
  const targetPosition = useMemo(() => {
    return new Vector3(...point.position);
  }, [point.position]);
  const entryPosition = useMemo(() => createEntryPosition(index), [index]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    const material = materialRef.current;

    if (!group || !material) {
      return;
    }

    const settleEasing = 1 - Math.exp(-NODE_SETTLE_SPEED * delta);
    const colorEasing = 1 - Math.exp(-STREAM_COLOR_BLEND_SPEED * delta);
    const emissiveColor = isFinal ? point.color : visual.color;

    group.position.lerp(targetPosition, settleEasing);
    targetColorRef.current.set(emissiveColor);
    material.emissive.lerp(targetColorRef.current, colorEasing);
    material.emissiveIntensity = 0.82 + visual.intensity * 1.24;
  });

  return (
    <group ref={groupRef} position={entryPosition}>
      <mesh>
        <sphereGeometry args={[point.scale, 32, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          color={point.color}
          emissive={point.color}
          emissiveIntensity={1.3}
          roughness={0.34}
        />
      </mesh>
    </group>
  );
}

function TrackNodes() {
  const { state } = useAnalysis();
  const groupRef = useRef<Group>(null);
  const visual = state.latestEvent?.visual ?? DEFAULT_VISUAL_FRAME;
  const trackPoints = useMemo(() => {
    return createSceneTracks(state.result?.emotions ?? null).map(createTrackPoint);
  }, [state.result]);
  const activeNodeCount = Math.min(visual.activeNodeCount, trackPoints.length);
  const isFinal = state.status === "done";

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.y += delta * visual.orbitSpeed;
  });

  return (
    <group ref={groupRef}>
      {trackPoints.slice(0, activeNodeCount).map((point, index) => (
        <AnimatedTrackNode
          index={index}
          isFinal={isFinal}
          key={point.id}
          point={point}
          visual={visual}
        />
      ))}
    </group>
  );
}

export function StarsCanvas() {
  return (
    <Canvas
      camera={{ position: [6.4, 4.8, 7.6], fov: 48 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={["#06120f"]} />
      <ambientLight intensity={0.54} />
      <directionalLight position={[6, 8, 5]} intensity={1.35} />
      <pointLight position={[-5, 2, -3]} intensity={1.25} color="#22d3ee" />
      <Stars radius={64} depth={34} count={1400} factor={4} fade speed={0.35} />
      <GridBase />
      <TrackNodes />
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
