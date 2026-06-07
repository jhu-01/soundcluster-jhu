import { OrbitControls, Stars } from "@react-three/drei";
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
  onSelectTrack: (trackId: string) => void;
  selectedTrackId: string | null;
  tracks: ClusterShareTrack[];
}

function TrackNodes({
  onSelectTrack,
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

  return (
    <group>
      {trackPoints.map((point) => (
        <mesh
          key={point.id}
          onClick={(event) => {
            event.stopPropagation();
            handleSelectTrack(point.id);
          }}
          position={point.position}
          scale={
            point.scale *
            (point.id === selectedTrackId ? SELECTED_NODE_SCALE_MULTIPLIER : 1)
          }
        >
          <sphereGeometry args={NODE_GEOMETRY_ARGS} />
          <meshStandardMaterial
            color={point.color}
            emissive={point.color}
            emissiveIntensity={point.id === selectedTrackId ? 2 : 1.3}
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
  onSnapshotChange: (snapshot: ClusterShareSnapshot) => void;
  snapshot: ClusterShareSnapshot;
}

export function StarsCanvas({ onSnapshotChange, snapshot }: StarsCanvasProps) {
  const cameraSettings = useMemo(() => {
    return { position: snapshot.cameraPosition, fov: CAMERA_FOV };
  }, [snapshot.cameraPosition]);
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
    >
      <color attach="background" args={["#06120f"]} />
      <ambientLight intensity={0.54} />
      <directionalLight position={[6, 8, 5]} intensity={1.35} />
      <pointLight position={[-5, 2, -3]} intensity={1.25} color="#22d3ee" />
      <Stars {...STAR_FIELD_CONFIG} fade />
      <GridBase />
      <TrackNodes
        onSelectTrack={updateSelectedTrack}
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
