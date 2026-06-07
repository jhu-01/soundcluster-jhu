import { GoogleGenAI } from "@google/genai";

import {
  GEMINI_ANALYSIS_OUTPUT_CONTRACT,
  GEMINI_ANALYSIS_RESPONSE_JSON_SCHEMA,
  GEMINI_DEFAULT_CONFIG,
  GEMINI_ENV_KEYS,
  GEMINI_JSON_MIME_TYPE,
  GEMINI_SYSTEM_PROMPT,
} from "../../../shared/constants/gemini.js";
import type {
  MusicAnalysisRequest,
  MusicAnalysisResponse,
} from "../../../shared/types/musicAnalysis.js";
import { readStringEnv } from "./env.js";
import { parseMusicAnalysisResponse } from "../validation/musicAnalysis.js";

let geminiClient: GoogleGenAI | undefined;

const buildMusicAnalysisPrompt = (request: MusicAnalysisRequest): string => {
  return JSON.stringify({
    ...request,
    outputContract: GEMINI_ANALYSIS_OUTPUT_CONTRACT,
  });
};

const readGeminiApiKey = (): string => {
  const apiKey = readStringEnv(GEMINI_ENV_KEYS.apiKey, "");

  if (!apiKey) {
    throw new Error(`${GEMINI_ENV_KEYS.apiKey} is required`);
  }

  return apiKey;
};

export const getGeminiClient = (): GoogleGenAI => {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: readGeminiApiKey() });
  }

  return geminiClient;
};

export const generateGeminiText = async (prompt: string): Promise<string> => {
  const response = await getGeminiClient().models.generateContent({
    model: readStringEnv(GEMINI_ENV_KEYS.model, GEMINI_DEFAULT_CONFIG.model),
    contents: prompt,
  });

  const text = response.text;

  if (!text) {
    throw new Error("Gemini response text is empty");
  }

  return text;
};

export const generateMusicAnalysis = async (
  request: MusicAnalysisRequest,
): Promise<MusicAnalysisResponse> => {
  const response = await getGeminiClient().models.generateContent({
    model: readStringEnv(GEMINI_ENV_KEYS.model, GEMINI_DEFAULT_CONFIG.model),
    contents: buildMusicAnalysisPrompt(request),
    config: {
      systemInstruction: GEMINI_SYSTEM_PROMPT,
      responseMimeType: GEMINI_JSON_MIME_TYPE,
      responseJsonSchema: GEMINI_ANALYSIS_RESPONSE_JSON_SCHEMA,
      temperature: 0.2,
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error("Gemini analysis response text is empty");
  }

  return parseMusicAnalysisResponse(text);
};
