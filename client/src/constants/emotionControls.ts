import type { EmotionVector } from "../../../shared/types/musicAnalysis";

export type EmotionAxis = keyof EmotionVector;
export type AxisSelection = Record<EmotionAxis, boolean>;

export interface EmotionAxisConfig {
  key: EmotionAxis;
  label: string;
  accentColor: string;
  description: string;
}

export const EMOTION_AXIS_CONFIGS: readonly EmotionAxisConfig[] = [
  {
    key: "energy",
    label: "Energy",
    accentColor: "#8b6cff",
    description: "Intensity and drive",
  },
  {
    key: "valence",
    label: "Valence",
    accentColor: "#34e5d6",
    description: "Positive to melancholic",
  },
  {
    key: "tempoDensity",
    label: "Tempo",
    accentColor: "#ffd166",
    description: "Rhythm density",
  },
  {
    key: "spaceDepth",
    label: "Space",
    accentColor: "#a78bfa",
    description: "Wide to intimate",
  },
  {
    key: "tension",
    label: "Tension",
    accentColor: "#ff7795",
    description: "Calm to strained",
  },
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
