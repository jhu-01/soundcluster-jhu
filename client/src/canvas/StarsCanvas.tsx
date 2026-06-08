import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { Vector3 } from "three";
import type { Group } from "three";

import type { AnalyzeStreamVisualFrame } from "../../../shared/types/analyzeStream";
import type { EmotionVector } from "../../../shared/types/musicAnalysis";
import { useAnalysis } from "../context/AnalysisContext";
import { mapEmotionVectorsToScenePointData } from "../utils/mds";
import { ClusterCameraRig } from "./ClusterCameraRig";
import { GridBase } from "./GridBase";
import { StarNodeCollection } from "./StarNodeCollection";
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

const DEFAULT_VISUAL_FRAME: AnalyzeStreamVisualFrame = {
  intensity: 1,
  activeNodeCount: mockTracks.length,
  orbitSpeed: 0.08,
  color: "#5eead4",
};
const CANVAS_CAMERA = { position: [9.6, 6.8, 10.8] as [number, number, number], fov: 48 };
const CANVAS_DPR: [number, number] = [1, 2];
const CANVAS_GL = { antialias: true, alpha: false };
const STAR_FIELD_CONFIG = {
  radius: 64,
  depth: 34,
  count: 1400,
  factor: 4,
  speed: 0.35,
} as const;

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

const createTrackPoints = (
  tracks: MockTrack[],
  visual: AnalyzeStreamVisualFrame,
  isFinal: boolean,
): StarNodeData[] => {
  const mappedPoints = mapEmotionVectorsToScenePointData(
    tracks.map((track) => track.emotions),
  );

  return tracks.map((track, index) => {
    const point = mappedPoints[index];

    return {
      id: track.id,
      title: track.title,
      artist: track.artist,
      position: point.position,
      color: isFinal ? point.color : visual.color,
      scale: point.scale,
      intensity: point.intensity * (0.74 + visual.intensity * 0.42),
    };
  });
};

const baseTrackPoints = mapEmotionVectorsToScenePointData(
  mockTracks.map((track) => track.emotions),
);
const clusterFocusPoint = baseTrackPoints.reduce((focusPoint, point) => {
  return focusPoint.add(point.position);
}, new Vector3()).divideScalar(baseTrackPoints.length);

function TrackNodes() {
  const { state } = useAnalysis();
  const groupRef = useRef<Group>(null);
  const [selectedTrack, setSelectedTrack] = useState<StarNodeData | null>(null);
  const visual = state.latestEvent?.visual ?? DEFAULT_VISUAL_FRAME;
  const isFinal = state.status === "done";
  const sceneTracks = useMemo(() => {
    return createSceneTracks(state.result?.emotions ?? null);
  }, [state.result]);
  const trackPoints = useMemo(() => {
    return createTrackPoints(sceneTracks, visual, isFinal);
  }, [isFinal, sceneTracks, visual]);
  const activeNodeCount = Math.min(visual.activeNodeCount, trackPoints.length);

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.y += delta * visual.orbitSpeed;
  });

  return (
    <group ref={groupRef}>
      <StarNodeCollection
        nodes={trackPoints.slice(0, activeNodeCount)}
        onSelectNode={setSelectedTrack}
        selectedNodeId={selectedTrack?.id ?? null}
      />
    </group>
  );
}

export function StarsCanvas() {
  return (
    <Canvas camera={CANVAS_CAMERA} dpr={CANVAS_DPR} gl={CANVAS_GL}>
      <color attach="background" args={["#06120f"]} />
      <ambientLight intensity={0.54} />
      <directionalLight position={[6, 8, 5]} intensity={1.35} />
      <pointLight position={[-5, 2, -3]} intensity={1.25} color="#22d3ee" />
      <Stars {...STAR_FIELD_CONFIG} fade />
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
