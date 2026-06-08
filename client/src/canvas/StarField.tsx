import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  ShaderMaterial,
} from "three";

interface StarFieldProps {
  count: number;
  radius: number;
}

interface StarFieldData {
  colors: Float32Array;
  positions: Float32Array;
  sizes: Float32Array;
  twinkleOffsets: Float32Array;
}

const STAR_VERTEX_SHADER = `
  attribute float starSize;
  attribute float twinkleOffset;
  attribute vec3 starColor;
  uniform float uTime;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float twinkle = 0.72 + 0.28 * sin(uTime * 1.8 + twinkleOffset);

    vAlpha = twinkle;
    vColor = starColor;
    gl_PointSize = starSize * twinkle * (42.0 / max(28.0, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const STAR_FRAGMENT_SHADER = `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float distanceFromCenter = length(coord);
    float alpha = smoothstep(0.5, 0.16, distanceFromCenter) * vAlpha;

    if (distanceFromCenter > 0.5 || alpha < 0.02) {
      discard;
    }

    gl_FragColor = vec4(vColor, alpha);
  }
`;

const createSeededRandom = (seed: number) => {
  let value = seed;

  return () => {
    value += 0x6d2b79f5;

    let next = value;

    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);

    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
};

const createStarFieldData = (count: number, radius: number): StarFieldData => {
  const random = createSeededRandom(9371);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const twinkleOffsets = new Float32Array(count);
  const coolWhite = new Color("#dfeaff");
  const warmWhite = new Color("#fff3c4");
  const cyanWhite = new Color("#b8fffb");

  for (let index = 0; index < count; index += 1) {
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const distance = radius * (0.38 + random() * 0.62);
    const color = coolWhite.clone();
    const colorRoll = random();

    if (colorRoll > 0.86) {
      color.lerp(warmWhite, 0.72);
    } else if (colorRoll > 0.72) {
      color.lerp(cyanWhite, 0.58);
    }

    positions[index * 3] = Math.sin(phi) * Math.cos(theta) * distance;
    positions[index * 3 + 1] = Math.cos(phi) * distance * 0.74;
    positions[index * 3 + 2] = Math.sin(phi) * Math.sin(theta) * distance;
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
    sizes[index] = 3.2 + random() * random() * 9.6;
    twinkleOffsets[index] = random() * Math.PI * 2;
  }

  return { colors, positions, sizes, twinkleOffsets };
};

export function StarField({ count, radius }: StarFieldProps) {
  const materialRef = useRef<ShaderMaterial | null>(null);
  const geometry = useMemo(() => {
    const data = createStarFieldData(count, radius);
    const nextGeometry = new BufferGeometry();

    nextGeometry.setAttribute("position", new BufferAttribute(data.positions, 3));
    nextGeometry.setAttribute("starColor", new BufferAttribute(data.colors, 3));
    nextGeometry.setAttribute("starSize", new BufferAttribute(data.sizes, 1));
    nextGeometry.setAttribute(
      "twinkleOffset",
      new BufferAttribute(data.twinkleOffsets, 1),
    );

    return nextGeometry;
  }, [count, radius]);
  const material = useMemo(() => {
    return new ShaderMaterial({
      blending: AdditiveBlending,
      depthWrite: false,
      fragmentShader: STAR_FRAGMENT_SHADER,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: STAR_VERTEX_SHADER,
    });
  }, []);

  useFrame(({ clock }) => {
    if (!materialRef.current) {
      return;
    }

    materialRef.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <points geometry={geometry}>
      <primitive
        attach="material"
        object={material}
        ref={materialRef}
      />
    </points>
  );
}
