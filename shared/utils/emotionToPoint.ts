import type { EmotionVector } from "../types/musicAnalysis.js";

export type ScenePosition = [number, number, number];

export interface EmotionScenePoint {
  color: string;
  intensity: number;
  position: ScenePosition;
  scale: number;
}

const SCENE_RADIUS = 7.6;
const SPACE_DEPTH_VERTICAL_RATIO = 0.72;
const BASE_NODE_SCALE = 0.16;
const TEMPO_SCALE_RANGE = 0.24;
const BASE_LIGHTNESS = 48;
const ENERGY_LIGHTNESS_RANGE = 18;
const BASE_HUE = 180;
const VALENCE_HUE_RANGE = 120;
const TENSION_HUE_RANGE = 42;

const centerUnitValue = (value: number): number => {
  return value - 0.5;
};

const mapUnitToScene = (value: number): number => {
  return centerUnitValue(value) * SCENE_RADIUS;
};

export const mapEmotionVectorToScenePoint = (
  emotions: EmotionVector,
): EmotionScenePoint => {
  const hue = Math.round(
    BASE_HUE +
      emotions.valence * VALENCE_HUE_RANGE -
      emotions.tension * TENSION_HUE_RANGE,
  );
  const lightness = Math.round(
    BASE_LIGHTNESS + emotions.energy * ENERGY_LIGHTNESS_RANGE,
  );

  return {
    position: [
      mapUnitToScene(emotions.energy),
      mapUnitToScene(emotions.spaceDepth) * SPACE_DEPTH_VERTICAL_RATIO,
      mapUnitToScene(emotions.valence),
    ],
    color: `hsl(${hue} 86% ${lightness}%)`,
    scale: BASE_NODE_SCALE + emotions.tempoDensity * TEMPO_SCALE_RANGE,
    intensity: 1 + emotions.energy * 0.8 + emotions.tension * 0.4,
  };
};
