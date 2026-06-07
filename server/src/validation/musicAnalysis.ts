import type {
  EmotionVector,
  MusicAnalysisResponse,
} from "../../../shared/types/musicAnalysis.js";

const emotionKeys = [
  "energy",
  "valence",
  "tempoDensity",
  "spaceDepth",
  "tension",
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isUnitValue = (value: unknown): value is number => {
  if (typeof value !== "number") {
    return false;
  }

  return Number.isFinite(value) && value >= 0 && value <= 1;
};

const parseEmotionVector = (value: unknown): EmotionVector => {
  if (!isRecord(value)) {
    throw new Error("Gemini emotions field must be an object");
  }

  const emotions = {} as EmotionVector;

  for (const key of emotionKeys) {
    const emotionValue = value[key];

    if (!isUnitValue(emotionValue)) {
      throw new Error(`Gemini emotion ${key} must be a number between 0.0 and 1.0`);
    }

    emotions[key] = emotionValue;
  }

  return emotions;
};

export const parseMusicAnalysisResponse = (
  text: string,
): MusicAnalysisResponse => {
  const parsed: unknown = JSON.parse(text);

  if (!isRecord(parsed)) {
    throw new Error("Gemini analysis response must be a JSON object");
  }

  if (parsed.analysisStatus !== "success") {
    throw new Error("Gemini analysisStatus must be success");
  }

  if (typeof parsed.musicId !== "string" || !parsed.musicId) {
    throw new Error("Gemini musicId must be a non-empty string");
  }

  if (typeof parsed.generatedSummary !== "string" || !parsed.generatedSummary) {
    throw new Error("Gemini generatedSummary must be a non-empty string");
  }

  return {
    analysisStatus: parsed.analysisStatus,
    musicId: parsed.musicId,
    emotions: parseEmotionVector(parsed.emotions),
    generatedSummary: parsed.generatedSummary,
  };
};
