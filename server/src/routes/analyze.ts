import { Router } from "express";
import type { Request, Response } from "express";

import {
  ANALYZE_STREAM_EVENTS,
  ANALYZE_STREAM_HEADERS,
  ANALYZE_STREAM_RETRY_MS,
  ANALYZE_STREAM_ROUTE,
} from "../../../shared/constants/analyzeStream.js";
import type { AnalyzeStreamEvent } from "../../../shared/types/analyzeStream.js";

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

analyzeRouter.get(ANALYZE_STREAM_ROUTE, async (request: Request, response) => {
  let isClientConnected = true;

  request.on("close", () => {
    isClientConnected = false;
  });

  response.writeHead(200, ANALYZE_STREAM_HEADERS);
  response.write(`retry: ${ANALYZE_STREAM_RETRY_MS}\n\n`);

  for (const event of ANALYZE_STREAM_EVENTS) {
    if (!isClientConnected) {
      return;
    }

    writeStreamEvent(response, event);
    await wait(STREAM_STEP_DELAY_MS);
  }

  response.end();
});
