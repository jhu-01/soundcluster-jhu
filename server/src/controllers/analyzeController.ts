import type { Request, Response } from "express";

import {
  ANALYZE_CACHE_MISS_EVENTS,
  ANALYZE_HISTORY_ROUTE,
  ANALYZE_STREAM_HEADERS,
  ANALYZE_STREAM_RETRY_MS,
} from "../../../shared/constants/analyzeStream.js";
import type { AnalyzeStreamEvent } from "../../../shared/types/analyzeStream.js";
import {
  ANALYZE_STREAM_STEP_DELAY_MS,
  buildAnalysisRequest,
  findCachedAnalysisEvent,
  getAnalysisHistory,
  generateAnalysisEvent,
} from "../services/analyzeService.js";

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
): string | undefined => {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return undefined;
};

const resolveErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};

const createFailedEvent = (error: unknown): AnalyzeStreamEvent => {
  const errorMessage = resolveErrorMessage(error);

  return {
    status: "failed",
    phase: "failed",
    progress: 100,
    message: "Analysis stream failed before completion.",
    errorMessage,
    visual: {
      intensity: 0.18,
      activeNodeCount: 0,
      color: "#ff7795",
    },
  };
};

export const streamAnalyzeController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  let isClientConnected = true;

  request.on("close", () => {
    isClientConnected = false;
  });

  response.writeHead(200, ANALYZE_STREAM_HEADERS);
  response.write(`retry: ${ANALYZE_STREAM_RETRY_MS}\n\n`);

  try {
    const analysisRequest = buildAnalysisRequest({
      title: readQueryString(request.query.title),
      artist: readQueryString(request.query.artist),
      lyrics: readQueryString(request.query.lyrics),
    });
    const cachedEvent = await findCachedAnalysisEvent(analysisRequest);

    if (cachedEvent) {
      writeStreamEvent(response, cachedEvent);
      response.end();
      return;
    }

    if (!isClientConnected) {
      return;
    }

    for (const event of ANALYZE_CACHE_MISS_EVENTS) {
      if (!isClientConnected) {
        return;
      }

      writeStreamEvent(response, event);
      await wait(ANALYZE_STREAM_STEP_DELAY_MS);
    }

    if (!isClientConnected) {
      return;
    }

    writeStreamEvent(response, await generateAnalysisEvent(analysisRequest));
    response.end();
  } catch (error: unknown) {
    if (!isClientConnected || response.writableEnded) {
      return;
    }

    writeStreamEvent(response, createFailedEvent(error));
    response.end();
  }
};

export const getAnalysisHistoryController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const title = readQueryString(request.query.title);
  const artist = readQueryString(request.query.artist);

  if (!title || !artist) {
    response.status(400).json({
      error: `${ANALYZE_HISTORY_ROUTE} requires title and artist query parameters`,
    });
    return;
  }

  response.json({
    items: await getAnalysisHistory({ title, artist }),
  });
};
