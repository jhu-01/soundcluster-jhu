import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdditiveBlending, CanvasTexture, Color, Vector3 } from "three";
import type { Group, MeshStandardMaterial, SpriteMaterial } from "three";

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
const NODE_CORE_COLOR = "#fff8ff";
const NODE_GEOMETRY_ARGS: [number, number, number] = [1, 16, 16];
const NODE_MARKER_SCALE = 0.44;
const NODE_CORE_SCALE = 0.34;
const NODE_GLOW_SCALE = 2.05;
const GLOW_TEXTURE_SIZE = 128;

const createFallbackLabel = (title: string): string => {
  return title.slice(0, 2).toUpperCase();
};

const createEntryPosition = (index: number): Vector3 => {
  const angle = index * 2.3999632297;
  const radius = ENTRY_RADIUS + (index % 3) * 0.42;
  const height = (index % 5 - 2) * ENTRY_HEIGHT_STEP;

  return new Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
};

const createGlowTexture = (colorValue: string): CanvasTexture => {
  const color = new Color(colorValue);
  const red = Math.round(color.r * 255);
  const green = Math.round(color.g * 255);
  const blue = Math.round(color.b * 255);
  const canvas = document.createElement("canvas");
  canvas.width = GLOW_TEXTURE_SIZE;
  canvas.height = GLOW_TEXTURE_SIZE;
  const context = canvas.getContext("2d");

  if (context) {
    const center = GLOW_TEXTURE_SIZE / 2;
    const gradient = context.createRadialGradient(center, center, 0, center, center, center);

    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.2, "rgba(255, 248, 255, 0.96)");
    gradient.addColorStop(0.45, `rgba(${red}, ${green}, ${blue}, 0.78)`);
    gradient.addColorStop(0.72, `rgba(${red}, ${green}, ${blue}, 0.28)`);
    gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);

    context.fillStyle = gradient;
    context.fillRect(0, 0, GLOW_TEXTURE_SIZE, GLOW_TEXTURE_SIZE);
  }

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
};

const shouldPinPointPopup = (
  relationRole: StarNodeRelationRole | null,
): boolean => {
  return relationRole === "nearest" || relationRole === "farthest";
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
  const visualRef = useRef<Group>(null);
  const coreMaterialRef = useRef<MeshStandardMaterial>(null);
  const glowMaterialRef = useRef<SpriteMaterial>(null);
  const [isHovered, setIsHovered] = useState(false);
  const targetPosition = useMemo(() => node.position.clone(), [node.position]);
  const entryPosition = useMemo(() => createEntryPosition(index), [index]);
  const baseColor = useMemo(() => new Color(node.color), [node.color]);
  const coreColor = useMemo(() => new Color(NODE_CORE_COLOR), []);
  const glowTexture = useMemo(() => createGlowTexture(node.color), [node.color]);
  const isPointPopupPinned = shouldPinPointPopup(relationRole);
  const shouldShowPointPopup =
    isPointPopupPinned || (isHovered && relationRole !== "selected");

  useEffect(() => {
    return () => glowTexture.dispose();
  }, [glowTexture]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    const visual = visualRef.current;
    const coreMaterial = coreMaterialRef.current;
    const glowMaterial = glowMaterialRef.current;

    if (!group || !visual || !coreMaterial || !glowMaterial) {
      return;
    }

    const settleEasing = 1 - Math.exp(-NODE_SETTLE_SPEED * delta);
    const hoverEasing = 1 - Math.exp(-NODE_HOVER_SPEED * delta);
    const isHighlighted = isHovered || isSelected || Boolean(relationRole);
    const targetScale = node.scale * NODE_MARKER_SCALE * (isHighlighted ? 1.16 : 1);
    const nextScale = visual.scale.x + (targetScale - visual.scale.x) * hoverEasing;
    const targetGlowOpacity = isHighlighted ? 0.9 : 0.66;

    group.position.lerp(targetPosition, settleEasing);
    visual.scale.setScalar(nextScale);
    coreMaterial.color.lerp(coreColor, hoverEasing);
    coreMaterial.emissive.lerp(baseColor, hoverEasing);
    coreMaterial.emissiveIntensity = isHighlighted
      ? node.intensity * 1.72
      : node.intensity;
    glowMaterial.opacity += (targetGlowOpacity - glowMaterial.opacity) * hoverEasing;
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
      <group ref={visualRef} scale={node.scale * NODE_MARKER_SCALE}>
        <sprite scale={[NODE_GLOW_SCALE, NODE_GLOW_SCALE, 1]}>
          <spriteMaterial
            ref={glowMaterialRef}
            map={glowTexture}
            transparent
            opacity={0.66}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
        <mesh scale={NODE_CORE_SCALE}>
          <sphereGeometry args={NODE_GEOMETRY_ARGS} />
          <meshStandardMaterial
            ref={coreMaterialRef}
            color={NODE_CORE_COLOR}
            emissive={node.color}
            emissiveIntensity={node.intensity * 1.6}
            metalness={0}
            roughness={0.08}
          />
        </mesh>
      </group>
      {relationRole ? (
        <Html center distanceFactor={10} position={[0, 0, 0]} zIndexRange={[18, 0]}>
          <span
            className={styles.markerRing}
            data-role={relationRole}
            aria-hidden="true"
          />
        </Html>
      ) : null}
      {shouldShowPointPopup ? (
        <Html center distanceFactor={7} position={[0, 0.62, 0]} zIndexRange={[24, 0]}>
          <aside
            className={styles.popup}
            data-role={isPointPopupPinned ? relationRole : "hover"}
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
