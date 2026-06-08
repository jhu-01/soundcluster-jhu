import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { Color, Vector3 } from "three";
import type { Group, Mesh, MeshStandardMaterial } from "three";

import styles from "./StarNode.module.css";

export interface StarNodeData {
  albumImageUrl?: string | null;
  id: string;
  title: string;
  artist: string;
  position: Vector3;
  color: string;
  scale: number;
  intensity: number;
}

export type StarNodeRelationRole = "selected" | "nearest" | "farthest";

interface StarNodeProps {
  index: number;
  isSelected: boolean;
  node: StarNodeData;
  onPreview: (node: StarNodeData | null) => void;
  onSelect: (node: StarNodeData) => void;
  relationRole: StarNodeRelationRole | null;
}

const NODE_SETTLE_SPEED = 2.8;
const NODE_HOVER_SPEED = 8.5;
const ENTRY_RADIUS = 7.4;
const ENTRY_HEIGHT_STEP = 0.54;
const NEON_HOVER_COLOR = "#67e8f9";
const NODE_GEOMETRY_ARGS: [number, number, number] = [1, 12, 12];
const NODE_MARKER_SCALE = 0.58;

const createFallbackLabel = (title: string): string => {
  return title.slice(0, 2).toUpperCase();
};

const createEntryPosition = (index: number): Vector3 => {
  const angle = index * 2.3999632297;
  const radius = ENTRY_RADIUS + (index % 3) * 0.42;
  const height = (index % 5 - 2) * ENTRY_HEIGHT_STEP;

  return new Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
};

export function StarNode({
  index,
  isSelected,
  node,
  onPreview,
  onSelect,
  relationRole,
}: StarNodeProps) {
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
    const isHighlighted = isHovered || isSelected || Boolean(relationRole);
    const targetScale = node.scale * NODE_MARKER_SCALE * (isHighlighted ? 1.2 : 1);
    const nextScale = mesh.scale.x + (targetScale - mesh.scale.x) * hoverEasing;

    group.position.lerp(targetPosition, settleEasing);
    mesh.scale.setScalar(nextScale);
    material.color.lerp(isHighlighted ? hoverColor : baseColor, hoverEasing);
    material.emissive.lerp(isHighlighted ? hoverColor : baseColor, hoverEasing);
    material.emissiveIntensity = isHighlighted
      ? node.intensity * 1.72
      : node.intensity;
  });

  return (
    <group
      ref={groupRef}
      position={entryPosition}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(node);
        onPreview(node);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setIsHovered(false);
        onPreview(null);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setIsHovered(true);
        onPreview(node);
      }}
    >
      <mesh ref={meshRef} scale={node.scale * NODE_MARKER_SCALE}>
        <sphereGeometry args={NODE_GEOMETRY_ARGS} />
        <meshStandardMaterial
          ref={materialRef}
          color={node.color}
          emissive={node.color}
          emissiveIntensity={node.intensity * 1.6}
          metalness={0}
          roughness={0.12}
        />
      </mesh>
      {relationRole ? (
        <Html center distanceFactor={10} position={[0, 0, 0]} zIndexRange={[18, 0]}>
          <span
            className={styles.markerRing}
            data-role={relationRole}
            aria-hidden="true"
          />
        </Html>
      ) : null}
      {isHovered || relationRole ? (
        <Html center distanceFactor={7} position={[0, 0.66, 0]} zIndexRange={[24, 0]}>
          <aside
            className={styles.popup}
            data-role={relationRole ?? "hover"}
            aria-label="Track hover details"
          >
            {node.albumImageUrl ? (
              <img
                alt={`${node.title} album cover`}
                className={styles.albumImage}
                src={node.albumImageUrl}
              />
            ) : (
              <span className={styles.albumFallback} aria-hidden="true">
                {createFallbackLabel(node.title)}
              </span>
            )}
            <span className={styles.metadata}>
              <strong>{node.title}</strong>
              <small>{node.artist}</small>
            </span>
          </aside>
        </Html>
      ) : null}
    </group>
  );
}
