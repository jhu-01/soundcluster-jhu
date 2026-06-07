import type { EmotionVector } from "../../../shared/types/musicAnalysis";

export type EmotionAxis = keyof EmotionVector;
export type AxisSelection = Record<EmotionAxis, boolean>;

export interface EmotionAxisConfig {
  key: EmotionAxis;
  label: string;
  accentColor: string;
}

export const EMOTION_AXIS_CONFIGS: readonly EmotionAxisConfig[] = [
  { key: "energy", label: "Energy", accentColor: "#22d3ee" },
  { key: "valence", label: "Valence", accentColor: "#34d399" },
  { key: "tempoDensity", label: "Tempo", accentColor: "#f59e0b" },
  { key: "spaceDepth", label: "Space", accentColor: "#a78bfa" },
  { key: "tension", label: "Tension", accentColor: "#fb7185" },
];

export const DEFAULT_EMOTION_VECTOR: EmotionVector = {
  energy: 0.5,
  valence: 0.5,
  tempoDensity: 0.5,
  spaceDepth: 0.5,
  tension: 0.5,
};

export const DEFAULT_AXIS_SELECTION: AxisSelection = {
  energy: true,
  valence: true,
  tempoDensity: true,
  spaceDepth: true,
  tension: true,
};

export const MIN_ACTIVE_AXIS_COUNT = 2;
