import { Line, OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ElementRef,
} from "react";

import { mapEmotionVectorToScenePoint } from "../../../shared/utils/emotionToPoint.js";
import { GridBase } from "./GridBase";
import type {
  ClusterShareSnapshot,
  ClusterShareTrack,
  Vector3Tuple,
} from "../types/shareSnapshot";
import { selectSnapshotTrack } from "../utils/snapshotSelection";
import type { TrackRelationSummary } from "../utils/trackRelations";

interface TrackPoint {
  id: string;
  position: [number, number, number];
  color: string;
  scale: number;
}

const CANVAS_DPR: [number, number] = [1, 1.5];
const CANVAS_GL = { antialias: true, alpha: false };
const CAMERA_FOV = 48;
const NODE_GEOMETRY_ARGS: [number, number, number] = [1, 18, 18];
const SELECTED_NODE_SCALE_MULTIPLIER = 1.34;
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

const createTrackPoint = (track: ClusterShareTrack): TrackPoint => {
  const scenePoint = mapEmotionVectorToScenePoint(track.emotions);

  return {
    id: track.id,
    position: scenePoint.position,
    color: scenePoint.color,
    scale: scenePoint.scale,
  };
};

interface TrackNodesProps {
  onPreviewTrack: (trackId: string | null) => void;
  onSelectTrack: (trackId: string) => void;
  relation: TrackRelationSummary | null;
  selectedTrackId: string | null;
  tracks: ClusterShareTrack[];
}

function TrackNodes({
  onPreviewTrack,
  onSelectTrack,
  relation,
  selectedTrackId,
  tracks,
}: TrackNodesProps) {
  const trackPoints = useMemo(() => {
    return tracks.map(createTrackPoint);
  }, [tracks]);
  const handleSelectTrack = useCallback(
    (trackId: string) => {
      onSelectTrack(trackId);
    },
    [onSelectTrack],
  );
  const relationLines = useMemo(() => {
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
  }, [relation, trackPoints]);
  const getNodeColor = useCallback(
    (point: TrackPoint): string => {
      if (point.id === selectedTrackId) {
        return RELATION_COLORS.selected;
      }

      if (point.id === relation?.nearestTrackId) {
        return RELATION_COLORS.nearest;
      }

      if (point.id === relation?.farthestTrackId) {
        return RELATION_COLORS.farthest;
      }

      return point.color;
    },
    [relation, selectedTrackId],
  );
  const getNodeIntensity = useCallback(
    (point: TrackPoint): number => {
      if (point.id === selectedTrackId) {
        return 2.3;
      }

      if (
        point.id === relation?.nearestTrackId ||
        point.id === relation?.farthestTrackId
      ) {
        return 2;
      }

      return 1.05;
    },
    [relation, selectedTrackId],
  );

  return (
    <group>
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
      {trackPoints.map((point) => (
        <mesh
          key={point.id}
          onClick={(event) => {
            event.stopPropagation();
            handleSelectTrack(point.id);
            onPreviewTrack(point.id);
          }}
          onPointerOut={(event) => {
            event.stopPropagation();
            onPreviewTrack(null);
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            onPreviewTrack(point.id);
          }}
          position={point.position}
          scale={
            point.scale *
            (point.id === selectedTrackId ? SELECTED_NODE_SCALE_MULTIPLIER : 1)
          }
        >
          <sphereGeometry args={NODE_GEOMETRY_ARGS} />
          <meshStandardMaterial
            color={getNodeColor(point)}
            emissive={getNodeColor(point)}
            emissiveIntensity={getNodeIntensity(point)}
            roughness={0.34}
          />
        </mesh>
      ))}
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

interface StarsCanvasProps {
  onPreviewTrack: (trackId: string | null) => void;
  onSnapshotChange: (snapshot: ClusterShareSnapshot) => void;
  relation: TrackRelationSummary | null;
  snapshot: ClusterShareSnapshot;
}

export function StarsCanvas({
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
