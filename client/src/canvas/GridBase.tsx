import { Html, Line } from "@react-three/drei";

const AXIS_LENGTH = 8.2;
const AXIS_LABEL_OFFSET = AXIS_LENGTH + 0.45;
const AXIS_OPACITY = 0.54;
const AXES = [
  {
    label: "X",
    color: "#8b6cff",
    points: [
      [-AXIS_LENGTH, 0, 0],
      [AXIS_LENGTH, 0, 0],
    ],
    labelPosition: [AXIS_LABEL_OFFSET, 0, 0],
  },
  {
    label: "Y",
    color: "#5eead4",
    points: [
      [0, -AXIS_LENGTH * 0.58, 0],
      [0, AXIS_LENGTH, 0],
    ],
    labelPosition: [0, AXIS_LABEL_OFFSET, 0],
  },
  {
    label: "Z",
    color: "#facc15",
    points: [
      [0, 0, -AXIS_LENGTH],
      [0, 0, AXIS_LENGTH],
    ],
    labelPosition: [0, 0, AXIS_LABEL_OFFSET],
  },
] as const;

export function GridBase() {
  return (
    <group>
      {AXES.map((axis) => (
        <Line
          color={axis.color}
          key={axis.label}
          lineWidth={1.8}
          opacity={AXIS_OPACITY}
          points={axis.points}
          transparent
        />
      ))}
      {AXES.map((axis) => (
        <Html
          center
          distanceFactor={10}
          key={`${axis.label}-label`}
          position={axis.labelPosition}
          zIndexRange={[8, 0]}
        >
          <span style={{ color: axis.color, fontSize: 12, fontWeight: 900 }}>
            {axis.label}
          </span>
        </Html>
      ))}
    </group>
  );
}
