import { GoogleGenAI } from "@google/genai";

import {
  GEMINI_DEFAULT_CONFIG,
  GEMINI_ENV_KEYS,
} from "../../../shared/constants/gemini.js";
import { readStringEnv } from "./env.js";

let geminiClient: GoogleGenAI | undefined;

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
