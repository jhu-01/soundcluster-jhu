import { Line } from "@react-three/drei";

const BOX_SIZE = 7.2;
const BOX_Y_MIN = -3.2;
const BOX_Y_MAX = 4.2;
const GRID_LINE_COLOR = "#6f7f96";
const AXIS_LINE_COLOR = "#d9e4ff";

const createBoxEdges = () => {
  const min = -BOX_SIZE;
  const max = BOX_SIZE;
  const y0 = BOX_Y_MIN;
  const y1 = BOX_Y_MAX;
  const corners = {
    a: [min, y0, min] as [number, number, number],
    b: [max, y0, min] as [number, number, number],
    c: [max, y0, max] as [number, number, number],
    d: [min, y0, max] as [number, number, number],
    e: [min, y1, min] as [number, number, number],
    f: [max, y1, min] as [number, number, number],
    g: [max, y1, max] as [number, number, number],
    h: [min, y1, max] as [number, number, number],
  };

  return [
    [corners.a, corners.b],
    [corners.b, corners.c],
    [corners.c, corners.d],
    [corners.d, corners.a],
    [corners.e, corners.f],
    [corners.f, corners.g],
    [corners.g, corners.h],
    [corners.h, corners.e],
    [corners.a, corners.e],
    [corners.b, corners.f],
    [corners.c, corners.g],
    [corners.d, corners.h],
  ];
};

const BOX_EDGES = createBoxEdges();

export function GridBase() {
  return (
    <group position={[0, -1.35, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[36, 36]} />
        <meshBasicMaterial color="#050716" transparent opacity={0.2} />
      </mesh>
      <gridHelper args={[20, 10, "#2b8b92", "#162235"]} />
      {BOX_EDGES.map((edge, index) => (
        <Line
          color={GRID_LINE_COLOR}
          key={index}
          lineWidth={1}
          opacity={0.18}
          points={edge}
          transparent
        />
      ))}
      <Line
        color={AXIS_LINE_COLOR}
        lineWidth={1.4}
        opacity={0.5}
        points={[
          [0, BOX_Y_MIN, 0],
          [0, BOX_Y_MAX + 0.7, 0],
        ]}
        transparent
      />
      <Line
        color={AXIS_LINE_COLOR}
        lineWidth={1.2}
        opacity={0.42}
        points={[
          [-BOX_SIZE - 0.7, BOX_Y_MIN, 0],
          [BOX_SIZE + 0.7, BOX_Y_MIN, 0],
        ]}
        transparent
      />
      <Line
        color={AXIS_LINE_COLOR}
        lineWidth={1.2}
        opacity={0.42}
        points={[
          [0, BOX_Y_MIN, -BOX_SIZE - 0.7],
          [0, BOX_Y_MIN, BOX_SIZE + 0.7],
        ]}
        transparent
      />
    </group>
  );
}
