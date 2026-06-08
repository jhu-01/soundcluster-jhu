import { Line, OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ElementRef,
} from "react";
import { Vector3 } from "three";
import type { Group } from "three";

import type { AnalyzeStreamVisualFrame } from "../../../shared/types/analyzeStream";
import type { AxisSelection } from "../constants/emotionControls";
import { useAnalysis } from "../context/AnalysisContext";
import type {
  ClusterShareSnapshot,
  ClusterShareTrack,
  Vector3Tuple,
} from "../types/shareSnapshot";
import { projectEmotionVectorsByAxes } from "../utils/axisProjection";
import { mapEmotionVectorsToScenePointData } from "../utils/mds";
import { selectSnapshotTrack } from "../utils/snapshotSelection";
import type { TrackRelationSummary } from "../utils/trackRelations";
import { GridBase } from "./GridBase";
import { StarNodeCollection } from "./StarNodeCollection";
import type { StarNodeData } from "./StarNode";

interface StarsCanvasProps {
  axisSelection: AxisSelection;
  onPreviewTrack: (trackId: string | null) => void;
  onSnapshotChange: (snapshot: ClusterShareSnapshot) => void;
  relation: TrackRelationSummary | null;
  snapshot: ClusterShareSnapshot;
}

const DEFAULT_VISUAL_FRAME: AnalyzeStreamVisualFrame = {
  intensity: 1,
  activeNodeCount: 5,
  orbitSpeed: 0.08,
  color: "#5eead4",
};
const CANVAS_DPR: [number, number] = [1, 1.5];
const CANVAS_GL = { antialias: true, alpha: false };
const CAMERA_FOV = 48;
const RELATION_COLORS = {
  farthest: "#fb7185",
  nearest: "#5eead4",
  selected: "#facc15",
} as const;
const RELATION_LINE_WIDTH = 2;
const STAR_FIELD_CONFIG = {
  radius: 64,
  depth: 34,
  count: 1400,
  factor: 4,
  speed: 0.35,
} as const;

interface BaseTrackPoint extends StarNodeData {
  baseColor: string;
  baseIntensity: number;
}

const createNodeColor = (
  trackId: string,
  baseColor: string,
  relation: TrackRelationSummary | null,
): string => {
  if (trackId === relation?.selectedTrackId) {
    return RELATION_COLORS.selected;
  }

  if (trackId === relation?.nearestTrackId) {
    return RELATION_COLORS.nearest;
  }

  if (trackId === relation?.farthestTrackId) {
    return RELATION_COLORS.farthest;
  }

  return baseColor;
};

const createNodeIntensity = (
  trackId: string,
  baseIntensity: number,
  relation: TrackRelationSummary | null,
): number => {
  if (trackId === relation?.selectedTrackId) {
    return baseIntensity * 1.32;
  }

  if (
    trackId === relation?.nearestTrackId ||
    trackId === relation?.farthestTrackId
  ) {
    return baseIntensity * 1.2;
  }

  return baseIntensity;
};

const createBaseTrackPoints = (
  tracks: ClusterShareTrack[],
  axisSelection: AxisSelection,
): BaseTrackPoint[] => {
  const vectors = tracks.map((track) => track.emotions);
  const positions = projectEmotionVectorsByAxes(vectors, axisSelection);
  const mappedPoints = mapEmotionVectorsToScenePointData(vectors);

  return tracks.map((track, index) => {
    const point = mappedPoints[index];

    return {
      id: track.id,
      title: track.title,
      artist: track.artist,
      position: new Vector3(...positions[index]),
      baseColor: point.color,
      baseIntensity: point.intensity,
      color: point.color,
      scale: point.scale,
      intensity: point.intensity,
    };
  });
};

const createTrackPoints = (
  baseTrackPoints: BaseTrackPoint[],
  visual: AnalyzeStreamVisualFrame,
  isFinal: boolean,
  relation: TrackRelationSummary | null,
): StarNodeData[] => {
  return baseTrackPoints.map((point) => {
    const baseColor = isFinal ? point.baseColor : visual.color;
    const baseIntensity = point.baseIntensity * (0.74 + visual.intensity * 0.42);

    return {
      id: point.id,
      title: point.title,
      artist: point.artist,
      position: point.position,
      color: createNodeColor(point.id, baseColor, relation),
      scale: point.scale,
      intensity: createNodeIntensity(point.id, baseIntensity, relation),
    };
  });
};

const createRelationLines = (
  trackPoints: StarNodeData[],
  relation: TrackRelationSummary | null,
) => {
  if (!relation) {
    return [];
  }

  const selectedPoint = trackPoints.find(
    (point) => point.id === relation.selectedTrackId,
  );
  const nearestPoint = trackPoints.find(
    (point) => point.id === relation.nearestTrackId,
  );
  const farthestPoint = trackPoints.find(
    (point) => point.id === relation.farthestTrackId,
  );

  if (!selectedPoint || !nearestPoint || !farthestPoint) {
    return [];
  }

  return [
    {
      id: "nearest",
      color: RELATION_COLORS.nearest,
      points: [selectedPoint.position, nearestPoint.position],
    },
    {
      id: "farthest",
      color: RELATION_COLORS.farthest,
      points: [selectedPoint.position, farthestPoint.position],
    },
  ];
};

interface TrackNodesProps {
  axisSelection: AxisSelection;
  onPreviewTrack: (trackId: string | null) => void;
  onSelectTrack: (trackId: string) => void;
  relation: TrackRelationSummary | null;
  selectedTrackId: string | null;
  tracks: ClusterShareTrack[];
}

function TrackNodes({
  axisSelection,
  onPreviewTrack,
  onSelectTrack,
  relation,
  selectedTrackId,
  tracks,
}: TrackNodesProps) {
  const { state } = useAnalysis();
  const groupRef = useRef<Group>(null);
  const visual = state.latestEvent?.visual ?? DEFAULT_VISUAL_FRAME;
  const isFinal = state.status === "done";
  const baseTrackPoints = useMemo(() => {
    return createBaseTrackPoints(tracks, axisSelection);
  }, [axisSelection, tracks]);
  const trackPoints = useMemo(() => {
    return createTrackPoints(baseTrackPoints, visual, isFinal, relation);
  }, [baseTrackPoints, isFinal, relation, visual]);
  const activeNodeCount = Math.min(visual.activeNodeCount, trackPoints.length);
  const visibleTrackPoints = useMemo(() => {
    return trackPoints.slice(0, activeNodeCount);
  }, [activeNodeCount, trackPoints]);
  const relationLines = useMemo(() => {
    return createRelationLines(visibleTrackPoints, relation);
  }, [relation, visibleTrackPoints]);

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.y += delta * visual.orbitSpeed;
  });

  return (
    <group ref={groupRef}>
      {relationLines.map((line) => (
        <Line
          key={line.id}
          color={line.color}
          lineWidth={RELATION_LINE_WIDTH}
          points={line.points}
          transparent
          opacity={0.76}
        />
      ))}
      <StarNodeCollection
        nodes={visibleTrackPoints}
        onPreviewNode={(node) => onPreviewTrack(node?.id ?? null)}
        onSelectNode={(node) => onSelectTrack(node.id)}
        selectedNodeId={selectedTrackId}
      />
    </group>
  );
}

interface CameraControllerProps {
  cameraPosition: Vector3Tuple;
  cameraTarget: Vector3Tuple;
  onCameraChange: (position: Vector3Tuple, target: Vector3Tuple) => void;
}

function CameraController({
  cameraPosition,
  cameraTarget,
  onCameraChange,
}: CameraControllerProps) {
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null);
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(...cameraPosition);
    controlsRef.current?.target.set(...cameraTarget);
    controlsRef.current?.update();
  }, [camera, cameraPosition, cameraTarget]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxDistance={16}
      maxPolarAngle={Math.PI * 0.48}
      minDistance={4}
      onEnd={() => {
        const target = controlsRef.current?.target;

        onCameraChange(
          [camera.position.x, camera.position.y, camera.position.z],
          target ? [target.x, target.y, target.z] : cameraTarget,
        );
      }}
    />
  );
}

export function StarsCanvas({
  axisSelection,
  onPreviewTrack,
  onSnapshotChange,
  relation,
  snapshot,
}: StarsCanvasProps) {
  const cameraSettings = useMemo(() => {
    return { position: snapshot.cameraPosition, fov: CAMERA_FOV };
  }, [snapshot.cameraPosition]);
  const updateSelectedTrack = useCallback(
    (selectedTrackId: string) => {
      onSnapshotChange(selectSnapshotTrack(snapshot, selectedTrackId));
    },
    [onSnapshotChange, snapshot],
  );
  const updateCamera = useCallback(
    (cameraPosition: Vector3Tuple, cameraTarget: Vector3Tuple) => {
      onSnapshotChange({
        ...snapshot,
        cameraPosition,
        cameraTarget,
      });
    },
    [onSnapshotChange, snapshot],
  );

  return (
    <Canvas
      camera={cameraSettings}
      dpr={CANVAS_DPR}
      gl={CANVAS_GL}
      onPointerMissed={() => onPreviewTrack(null)}
    >
      <color attach="background" args={["#06120f"]} />
      <ambientLight intensity={0.54} />
      <directionalLight position={[6, 8, 5]} intensity={1.35} />
      <pointLight position={[-5, 2, -3]} intensity={1.25} color="#22d3ee" />
      <Stars {...STAR_FIELD_CONFIG} fade />
      <GridBase />
      <TrackNodes
        axisSelection={axisSelection}
        onPreviewTrack={onPreviewTrack}
        onSelectTrack={updateSelectedTrack}
        relation={relation}
        selectedTrackId={snapshot.selectedTrackId}
        tracks={snapshot.tracks}
      />
      <CameraController
        cameraPosition={snapshot.cameraPosition}
        cameraTarget={snapshot.cameraTarget}
        onCameraChange={updateCamera}
      />
    </Canvas>
  );
}
