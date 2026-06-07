import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Vector3 } from "three";

import type { EmotionVector } from "../../../shared/types/musicAnalysis";
import { mapEmotionVectorsToScenePoints } from "../utils/mds";
import { ClusterCameraRig } from "./ClusterCameraRig";
import { GridBase } from "./GridBase";
import { StarNode } from "./StarNode";
import type { StarNodeData } from "./StarNode";

interface MockTrack {
  id: string;
  title: string;
  artist: string;
  emotions: EmotionVector;
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

const mockTrackPositions = mapEmotionVectorsToScenePoints(
  mockTracks.map((track) => track.emotions),
);

const createTrackPoint = (track: MockTrack, index: number): StarNodeData => {
  const { emotions } = track;
  const hue = Math.round(180 + emotions.valence * 120 - emotions.tension * 42);
  const lightness = Math.round(48 + emotions.energy * 18);

  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    position: mockTrackPositions[index],
    color: `hsl(${hue} 86% ${lightness}%)`,
    scale: 0.16 + emotions.tempoDensity * 0.24,
  };
};

const trackPoints = mockTracks.map(createTrackPoint);
const clusterFocusPoint = trackPoints.reduce((focusPoint, point) => {
  return focusPoint.add(point.position);
}, new Vector3()).divideScalar(trackPoints.length);

function TrackNodes() {
  return (
    <group>
      {trackPoints.map((point, index) => (
        <StarNode index={index} key={point.id} node={point} />
      ))}
    </group>
  );
}

export function StarsCanvas() {
  return (
    <Canvas
      camera={{ position: [9.6, 6.8, 10.8], fov: 48 }}
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
      <ClusterCameraRig focusPoint={clusterFocusPoint} />
      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        maxDistance={16}
        maxPolarAngle={Math.PI * 0.48}
        minDistance={4}
        target={clusterFocusPoint.toArray()}
      />
    </Canvas>
  );
}
