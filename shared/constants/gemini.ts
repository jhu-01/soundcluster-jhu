export const GEMINI_ENV_KEYS = {
  apiKey: "GEMINI_API_KEY",
  model: "GEMINI_MODEL",
} as const;

export const GEMINI_DEFAULT_CONFIG = {
  model: "gemini-2.5-flash",
} as const;

export const GEMINI_TEST_ROUTE = "/api/gemini/test";
export const GEMINI_ANALYSIS_TEST_ROUTE = "/api/gemini/analyze/test";
export const GEMINI_TEST_PROMPT =
  "SoundCluster Gemini SDK connection test. Reply with one short Korean sentence.";
export const GEMINI_RESPONSE_LOG_PREFIX = "Gemini Response:";
export const GEMINI_ANALYSIS_LOG_PREFIX = "Gemini Analysis Response:";
export const GEMINI_JSON_MIME_TYPE = "application/json";
export const GEMINI_SYSTEM_PROMPT = `[Role & Context]
너는 음악 심리학, 다차원 데이터 정량화, 감성 텍스트 분석 전문가다.
입력 데이터인 곡명, 아티스트, 가사를 종합해 음악의 무드를 5차원 감성 벡터로 정량화한다.

[Agent Operating Guardrails]
SoundCluster의 AI 응답은 백엔드 런타임 계약을 우선한다.
프론트엔드에 API Key를 노출하지 않고, 서버의 검증 가능한 JSON 계약만 따른다.
TypeScript 친화적인 camelCase 키를 사용하고, 임의의 추가 필드를 만들지 않는다.

[Constraints]
1. 응답은 백엔드가 즉시 JSON.parse()로 처리할 수 있는 Raw JSON 객체 하나여야 한다.
2. 마크다운 코드 블록, 설명 문장, 인사말, 종결 문장은 출력하지 않는다.
3. 모든 감성 축 수치는 0.0 이상 1.0 이하의 실수로 반환한다.
4. 알 수 없는 값은 추측 문장이 아니라 JSON schema 안의 합리적인 기본값으로 표현한다.`;
export const GEMINI_ANALYSIS_INSTRUCTION =
  "userVectorTargets에 값이 있는 축은 원곡 분석 결과를 기준으로 자연스럽게 보정하고, null인 축은 가사와 메타데이터에 따라 판단한다.";
export const GEMINI_ANALYSIS_OUTPUT_CONTRACT =
  "Return exactly one JSON object with analysisStatus, musicId, emotions, and generatedSummary. emotions must include energy, valence, tempoDensity, spaceDepth, and tension as numbers from 0.0 to 1.0.";
export const GEMINI_ANALYSIS_RESPONSE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["analysisStatus", "musicId", "emotions", "generatedSummary"],
  propertyOrdering: ["analysisStatus", "musicId", "emotions", "generatedSummary"],
  properties: {
    analysisStatus: {
      type: "string",
      enum: ["success"],
    },
    musicId: {
      type: "string",
    },
    emotions: {
      type: "object",
      additionalProperties: false,
      required: ["energy", "valence", "tempoDensity", "spaceDepth", "tension"],
      propertyOrdering: ["energy", "valence", "tempoDensity", "spaceDepth", "tension"],
      properties: {
        energy: {
          type: "number",
          minimum: 0,
          maximum: 1,
        },
        valence: {
          type: "number",
          minimum: 0,
          maximum: 1,
        },
        tempoDensity: {
          type: "number",
          minimum: 0,
          maximum: 1,
        },
        spaceDepth: {
          type: "number",
          minimum: 0,
          maximum: 1,
        },
        tension: {
          type: "number",
          minimum: 0,
          maximum: 1,
        },
      },
    },
    generatedSummary: {
      type: "string",
    },
  },
} as const;
export const GEMINI_DUMMY_ANALYSIS_REQUEST = {
  musicId: "dummy-track-001",
  musicMetadata: {
    title: "Midnight Circuit",
    artist: "SoundCluster Lab",
    lyrics:
      "Neon rain falls over silent streets while a restless heart keeps time with the city lights.",
  },
  userVectorTargets: {
    energy: 0.72,
    valence: 0.42,
    tempoDensity: 0.68,
    spaceDepth: null,
    tension: null,
  },
  instruction: GEMINI_ANALYSIS_INSTRUCTION,
} as const;
