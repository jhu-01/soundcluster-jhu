import { OrbitControls, Stars } from "@react-three/drei";
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
import { ClusterCameraRig } from "./ClusterCameraRig";
import { GridBase } from "./GridBase";
import { StarNodeCollection } from "./StarNodeCollection";
import type { StarNodeData } from "./StarNode";

interface StarsCanvasProps {
  axisSelection: AxisSelection;
  onPreviewTrack: (trackId: string | null) => void;
  onSnapshotChange: (snapshot: ClusterShareSnapshot) => void;
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
const STAR_FIELD_CONFIG = {
  radius: 64,
  depth: 34,
  count: 1400,
  factor: 4,
  speed: 0.35,
} as const;

const createTrackPoints = (
  tracks: ClusterShareTrack[],
  axisSelection: AxisSelection,
  visual: AnalyzeStreamVisualFrame,
  isFinal: boolean,
): StarNodeData[] => {
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
      color: isFinal ? point.color : visual.color,
      scale: point.scale,
      intensity: point.intensity * (0.74 + visual.intensity * 0.42),
    };
  });
};

const createClusterFocusPoint = (
  tracks: ClusterShareTrack[],
  axisSelection: AxisSelection,
): Vector3 => {
  const positions = projectEmotionVectorsByAxes(
    tracks.map((track) => track.emotions),
    axisSelection,
  );

  if (positions.length === 0) {
    return new Vector3();
  }

  return positions.reduce((focusPoint, position) => {
    return focusPoint.add(new Vector3(...position));
  }, new Vector3()).divideScalar(positions.length);
};

interface TrackNodesProps {
  axisSelection: AxisSelection;
  onPreviewTrack: (trackId: string | null) => void;
  onSelectTrack: (trackId: string) => void;
  selectedTrackId: string | null;
  tracks: ClusterShareTrack[];
}

function TrackNodes({
  axisSelection,
  onPreviewTrack,
  onSelectTrack,
  selectedTrackId,
  tracks,
}: TrackNodesProps) {
  const { state } = useAnalysis();
  const groupRef = useRef<Group>(null);
  const visual = state.latestEvent?.visual ?? DEFAULT_VISUAL_FRAME;
  const isFinal = state.status === "done";
  const trackPoints = useMemo(() => {
    return createTrackPoints(tracks, axisSelection, visual, isFinal);
  }, [axisSelection, isFinal, tracks, visual]);
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
  focusPoint: Vector3;
  onCameraChange: (position: Vector3Tuple, target: Vector3Tuple) => void;
}

function CameraController({
  cameraPosition,
  cameraTarget,
  focusPoint,
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
    <>
      <ClusterCameraRig focusPoint={focusPoint} />
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
    </>
  );
}

export function StarsCanvas({
  axisSelection,
  onPreviewTrack,
  onSnapshotChange,
  snapshot,
}: StarsCanvasProps) {
  const cameraSettings = useMemo(() => {
    return { position: snapshot.cameraPosition, fov: CAMERA_FOV };
  }, [snapshot.cameraPosition]);
  const clusterFocusPoint = useMemo(() => {
    return createClusterFocusPoint(snapshot.tracks, axisSelection);
  }, [axisSelection, snapshot.tracks]);
  const updateSelectedTrack = useCallback(
    (selectedTrackId: string) => {
      onSnapshotChange({
        ...snapshot,
        selectedTrackId,
      });
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
        selectedTrackId={snapshot.selectedTrackId}
        tracks={snapshot.tracks}
      />
      <CameraController
        cameraPosition={snapshot.cameraPosition}
        cameraTarget={snapshot.cameraTarget}
        focusPoint={clusterFocusPoint}
        onCameraChange={updateCamera}
      />
    </Canvas>
  );
}
