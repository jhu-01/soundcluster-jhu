import { Billboard, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { Color, Vector3 } from "three";
import type { Group, Mesh, MeshStandardMaterial } from "three";

export interface StarNodeData {
  id: string;
  title: string;
  artist: string;
  position: Vector3;
  color: string;
  scale: number;
}

interface StarNodeProps {
  index: number;
  node: StarNodeData;
}

const NODE_SETTLE_SPEED = 2.8;
const NODE_HOVER_SPEED = 8.5;
const ENTRY_RADIUS = 7.4;
const ENTRY_HEIGHT_STEP = 0.54;
const NEON_HOVER_COLOR = "#67e8f9";
const LABEL_COLOR = "#d7fff7";
const LABEL_HOVER_COLOR = "#ffffff";

const createEntryPosition = (index: number): Vector3 => {
  const angle = index * 2.3999632297;
  const radius = ENTRY_RADIUS + (index % 3) * 0.42;
  const height = (index % 5 - 2) * ENTRY_HEIGHT_STEP;

  return new Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
};

export function StarNode({ index, node }: StarNodeProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const [isHovered, setIsHovered] = useState(false);
  const targetPosition = useMemo(() => node.position.clone(), [node.position]);
  const entryPosition = useMemo(() => createEntryPosition(index), [index]);
  const baseColor = useMemo(() => new Color(node.color), [node.color]);
  const hoverColor = useMemo(() => new Color(NEON_HOVER_COLOR), []);

  useFrame((_, delta) => {
    const group = groupRef.current;
    const mesh = meshRef.current;
    const material = materialRef.current;

    if (!group || !mesh || !material) {
      return;
    }

    const settleEasing = 1 - Math.exp(-NODE_SETTLE_SPEED * delta);
    const hoverEasing = 1 - Math.exp(-NODE_HOVER_SPEED * delta);
    const targetScale = isHovered ? node.scale * 1.38 : node.scale;
    const nextScale = mesh.scale.x + (targetScale - mesh.scale.x) * hoverEasing;

    group.position.lerp(targetPosition, settleEasing);
    mesh.scale.setScalar(nextScale);
    material.color.lerp(isHovered ? hoverColor : baseColor, hoverEasing);
    material.emissive.lerp(isHovered ? hoverColor : baseColor, hoverEasing);
    material.emissiveIntensity = isHovered ? 2.45 : 1.35;
  });

  return (
    <group
      ref={groupRef}
      position={entryPosition}
      onPointerOut={() => setIsHovered(false)}
      onPointerOver={() => setIsHovered(true)}
    >
      <mesh ref={meshRef} scale={node.scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          color={node.color}
          emissive={node.color}
          emissiveIntensity={1.35}
          roughness={0.28}
        />
      </mesh>
      <Billboard follow position={[0, 0.64, 0]}>
        <Text
          anchorX="center"
          anchorY="middle"
          color={isHovered ? LABEL_HOVER_COLOR : LABEL_COLOR}
          fontSize={0.22}
          maxWidth={1.6}
          outlineColor="#03110f"
          outlineWidth={0.018}
          textAlign="center"
        >
          {node.artist}
        </Text>
      </Billboard>
    </group>
  );
}
