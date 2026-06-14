import { Line } from "@react-three/drei";
import { AdditiveBlending } from "three";

const ORIGIN_CORE_SCALE = 0.047;
const ORIGIN_GLOW_SCALE = 0.075;
const AXIS_LENGTH = 7.2;
const AXIS_DASH_SIZE = 0.08;
const AXIS_GAP_SIZE = 0.085;
const AXIS_OPACITY = 0.24;
const DOTTED_AXES = [
  {
    color: "#8b6cff",
    points: [
      [-AXIS_LENGTH, 0, 0],
      [AXIS_LENGTH, 0, 0],
    ],
  },
  {
    color: "#5eead4",
    points: [
      [0, -AXIS_LENGTH * 0.58, 0],
      [0, AXIS_LENGTH, 0],
    ],
  },
  {
    color: "#facc15",
    points: [
      [0, 0, -AXIS_LENGTH],
      [0, 0, AXIS_LENGTH],
    ],
  },
] as const;

export function GridBase() {
  return (
    <group>
      {DOTTED_AXES.map((axis) => (
        <Line
          color={axis.color}
          dashSize={AXIS_DASH_SIZE}
          dashed
          gapSize={AXIS_GAP_SIZE}
          key={axis.color}
          lineWidth={0.7}
          opacity={AXIS_OPACITY}
          points={axis.points}
          transparent
        />
      ))}
      <mesh scale={ORIGIN_GLOW_SCALE}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#2d245f"
          depthWrite={false}
          opacity={0.12}
          transparent
          toneMapped={false}
        />
      </mesh>
      <mesh scale={ORIGIN_CORE_SCALE}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial
          color="#000000"
          emissive="#10091f"
          emissiveIntensity={0.45}
          metalness={0}
          roughness={0.08}
        />
      </mesh>
    </group>
  );
}
