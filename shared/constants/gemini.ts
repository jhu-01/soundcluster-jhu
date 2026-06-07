export const GEMINI_ENV_KEYS = {
  apiKey: "GEMINI_API_KEY",
  model: "GEMINI_MODEL",
} as const;

export const GEMINI_DEFAULT_CONFIG = {
  model: "gemini-2.5-flash",
} as const;

export const GEMINI_TEST_ROUTE = "/api/gemini/test";
export const GEMINI_TEST_PROMPT =
  "SoundCluster Gemini SDK connection test. Reply with one short Korean sentence.";
export const GEMINI_RESPONSE_LOG_PREFIX = "Gemini Response:";
