import { generateMusicAnalysis } from "../config/gemini.js";
import {
  createAnalysisCacheKey,
  findAnalysisHistoryBySong,
  findAnalysisCacheByKey,
  saveAnalysisCache,
} from "../repositories/analysisCache.js";
import type { AnalysisHistoryItem } from "../repositories/analysisCache.js";
import {
  ANALYZE_CACHE_HIT_MESSAGE,
  ANALYZE_STREAM_EVENTS,
} from "../../../shared/constants/analyzeStream.js";
import {
  GEMINI_ANALYSIS_INSTRUCTION,
  GEMINI_DUMMY_ANALYSIS_REQUEST,
} from "../../../shared/constants/gemini.js";
import type { AnalyzeStreamEvent } from "../../../shared/types/analyzeStream.js";
import type {
  MusicAnalysisRequest,
  MusicAnalysisResponse,
} from "../../../shared/types/musicAnalysis.js";

export interface AnalyzeRequestInput {
  title?: string;
  artist?: string;
  lyrics?: string;
}

export const ANALYZE_STREAM_STEP_DELAY_MS = 520;

const createDoneEvent = (
  result: MusicAnalysisResponse,
  message: string,
): AnalyzeStreamEvent => {
  return {
    ...ANALYZE_STREAM_EVENTS[ANALYZE_STREAM_EVENTS.length - 1],
    message,
    result,
  };
};

export const buildAnalysisRequest = (
  input: AnalyzeRequestInput,
): MusicAnalysisRequest => {
  const { musicMetadata } = GEMINI_DUMMY_ANALYSIS_REQUEST;
  const title = input.title ?? musicMetadata.title;
  const artist = input.artist ?? musicMetadata.artist;
  const lyrics = input.lyrics ?? musicMetadata.lyrics;

  return {
    musicId: createAnalysisCacheKey(title, artist),
    musicMetadata: {
      title,
      artist,
      lyrics,
    },
    userVectorTargets: {
      ...GEMINI_DUMMY_ANALYSIS_REQUEST.userVectorTargets,
    },
    instruction: GEMINI_ANALYSIS_INSTRUCTION,
  };
};

export const findCachedAnalysisEvent = async (
  analysisRequest: MusicAnalysisRequest,
): Promise<AnalyzeStreamEvent | null> => {
  const cacheKey = createAnalysisCacheKey(
    analysisRequest.musicMetadata.title,
    analysisRequest.musicMetadata.artist,
  );
  const cachedAnalysis = await findAnalysisCacheByKey(cacheKey);

  if (!cachedAnalysis) {
    return null;
  }

  return createDoneEvent(cachedAnalysis, ANALYZE_CACHE_HIT_MESSAGE);
};

export const generateAnalysisEvent = async (
  analysisRequest: MusicAnalysisRequest,
): Promise<AnalyzeStreamEvent> => {
  const cacheKey = createAnalysisCacheKey(
    analysisRequest.musicMetadata.title,
    analysisRequest.musicMetadata.artist,
  );
  const analysis = await generateMusicAnalysis(analysisRequest);

  await saveAnalysisCache(cacheKey, analysisRequest.musicMetadata, analysis);

  return createDoneEvent(analysis, "Analysis completed and cached.");
};

export const getAnalysisHistory = async (
  input: AnalyzeRequestInput,
): Promise<AnalysisHistoryItem[]> => {
  if (!input.title || !input.artist) {
    return [];
  }

  return findAnalysisHistoryBySong(input.title, input.artist);
};
