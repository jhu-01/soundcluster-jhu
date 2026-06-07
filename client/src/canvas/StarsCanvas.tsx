import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ElementRef } from "react";

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

const mapUnitToScene = (value: number): number => {
  return (value - 0.5) * 7.6;
};

const createTrackPoint = (track: ClusterShareTrack): TrackPoint => {
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

  return (
    <group>
      {trackPoints.map((point) => (
        <mesh
          key={point.id}
          onClick={(event) => {
            event.stopPropagation();
            onSelectTrack(point.id);
          }}
          position={point.position}
          scale={point.id === selectedTrackId ? 1.34 : 1}
        >
          <sphereGeometry args={[point.scale, 32, 32]} />
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
  const updateSelectedTrack = (selectedTrackId: string) => {
    onSnapshotChange({
      ...snapshot,
      selectedTrackId,
    });
  };

  const updateCamera = (
    cameraPosition: Vector3Tuple,
    cameraTarget: Vector3Tuple,
  ) => {
    onSnapshotChange({
      ...snapshot,
      cameraPosition,
      cameraTarget,
    });
  };

  return (
    <Canvas
      camera={{ position: snapshot.cameraPosition, fov: 48 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={["#06120f"]} />
      <ambientLight intensity={0.54} />
      <directionalLight position={[6, 8, 5]} intensity={1.35} />
      <pointLight position={[-5, 2, -3]} intensity={1.25} color="#22d3ee" />
      <Stars radius={64} depth={34} count={1400} factor={4} fade speed={0.35} />
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
