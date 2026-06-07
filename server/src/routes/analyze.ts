import { Router } from "express";
import type { Request, Response } from "express";

import { generateMusicAnalysis } from "../config/gemini.js";
import {
  createAnalysisCacheKey,
  findAnalysisCacheByKey,
  saveAnalysisCache,
} from "../repositories/analysisCache.js";
import {
  ANALYZE_CACHE_HIT_MESSAGE,
  ANALYZE_CACHE_MISS_EVENTS,
  ANALYZE_STREAM_EVENTS,
  ANALYZE_STREAM_HEADERS,
  ANALYZE_STREAM_RETRY_MS,
  ANALYZE_STREAM_ROUTE,
} from "../../../shared/constants/analyzeStream.js";
import {
  GEMINI_ANALYSIS_INSTRUCTION,
  GEMINI_DUMMY_ANALYSIS_REQUEST,
} from "../../../shared/constants/gemini.js";
import type { AnalyzeStreamEvent } from "../../../shared/types/analyzeStream.js";
import type { MusicAnalysisRequest } from "../../../shared/types/musicAnalysis.js";

export const analyzeRouter = Router();

const STREAM_STEP_DELAY_MS = 520;

const wait = (delayMs: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
};

const writeStreamEvent = (
  response: Response,
  event: AnalyzeStreamEvent,
): void => {
  response.write(`event: ${event.status}\n`);
  response.write(`data: ${JSON.stringify(event)}\n\n`);
};

const readQueryString = (
  value: Request["query"][string],
  fallback: string,
): string => {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return fallback;
};

const buildAnalysisRequest = (request: Request): MusicAnalysisRequest => {
  const { musicMetadata } = GEMINI_DUMMY_ANALYSIS_REQUEST;
  const title = readQueryString(request.query.title, musicMetadata.title);
  const artist = readQueryString(request.query.artist, musicMetadata.artist);
  const lyrics = readQueryString(request.query.lyrics, musicMetadata.lyrics);

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

const createDoneEvent = (
  result: AnalyzeStreamEvent["result"],
  message: string,
): AnalyzeStreamEvent => {
  return {
    ...ANALYZE_STREAM_EVENTS[ANALYZE_STREAM_EVENTS.length - 1],
    message,
    result,
  };
};

analyzeRouter.get(ANALYZE_STREAM_ROUTE, async (request: Request, response) => {
  let isClientConnected = true;

  request.on("close", () => {
    isClientConnected = false;
  });

  response.writeHead(200, ANALYZE_STREAM_HEADERS);
  response.write(`retry: ${ANALYZE_STREAM_RETRY_MS}\n\n`);

  const analysisRequest = buildAnalysisRequest(request);
  const cacheKey = createAnalysisCacheKey(
    analysisRequest.musicMetadata.title,
    analysisRequest.musicMetadata.artist,
  );
  const cachedAnalysis = await findAnalysisCacheByKey(cacheKey);

  if (cachedAnalysis) {
    writeStreamEvent(
      response,
      createDoneEvent(cachedAnalysis, ANALYZE_CACHE_HIT_MESSAGE),
    );
    response.end();
    return;
  }

  for (const event of ANALYZE_CACHE_MISS_EVENTS) {
    if (!isClientConnected) {
      return;
    }

    writeStreamEvent(response, event);
    await wait(STREAM_STEP_DELAY_MS);
  }

  if (!isClientConnected) {
    return;
  }

  const analysis = await generateMusicAnalysis(analysisRequest);
  await saveAnalysisCache(cacheKey, analysisRequest.musicMetadata, analysis);
  writeStreamEvent(
    response,
    createDoneEvent(analysis, "Analysis completed and cached."),
  );
  response.end();
});
