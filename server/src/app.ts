import express from "express";
import type { Server } from "node:http";

import { checkDatabaseConnection } from "./config/db.js";
import { generateGeminiText, generateMusicAnalysis } from "./config/gemini.js";
import { analyzeRouter } from "./routes/analyze.js";
import { itunesRouter } from "./routes/itunes.js";
import { lyricsRouter } from "./routes/lyrics.js";
import { shareSnapshotRouter } from "./routes/shareSnapshot.js";
import {
  GEMINI_ANALYSIS_LOG_PREFIX,
  GEMINI_ANALYSIS_TEST_ROUTE,
  GEMINI_DUMMY_ANALYSIS_REQUEST,
  GEMINI_RESPONSE_LOG_PREFIX,
  GEMINI_TEST_PROMPT,
  GEMINI_TEST_ROUTE,
} from "../../shared/constants/gemini.js";
import { ANALYZE_ROUTE_PREFIX } from "../../shared/constants/analyzeStream.js";
import { ITUNES_ROUTE_PREFIX } from "../../shared/constants/itunes.js";
import { LYRICS_ROUTE_PREFIX } from "../../shared/constants/lyrics.js";
import { SHARE_SNAPSHOT_ROUTE_PREFIX } from "../../shared/constants/shareSnapshot.js";
import {
  SERVER_DEFAULT_PORT,
  SERVER_HEALTH_RESPONSE,
  SERVER_HEALTH_ROUTE,
  SERVER_TEST_ENVIRONMENT,
} from "../../shared/constants/server.js";

const resolveServerPort = (value: string | undefined): number => {
  if (!value) {
    return SERVER_DEFAULT_PORT;
  }

  const port = Number(value);
  const isValidPort = Number.isInteger(port) && port > 0 && port <= 65535;

  if (!isValidPort) {
    return SERVER_DEFAULT_PORT;
  }

  return port;
};

const resolveErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};

export const app = express();

app.use((_request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.header("Access-Control-Allow-Headers", "Content-Type");

  if (_request.method === "OPTIONS") {
    response.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json({ limit: "256kb" }));

app.use(ANALYZE_ROUTE_PREFIX, analyzeRouter);
app.use(ITUNES_ROUTE_PREFIX, itunesRouter);
app.use(LYRICS_ROUTE_PREFIX, lyricsRouter);
app.use(SHARE_SNAPSHOT_ROUTE_PREFIX, shareSnapshotRouter);

app.get(SERVER_HEALTH_ROUTE, (_request, response) => {
  response.json(SERVER_HEALTH_RESPONSE);
});

app.get(GEMINI_TEST_ROUTE, async (_request, response) => {
  try {
    const text = await generateGeminiText(GEMINI_TEST_PROMPT);

    console.log(`${GEMINI_RESPONSE_LOG_PREFIX} ${text}`);
    response.json({ text });
  } catch (error: unknown) {
    response.status(500).json({ error: resolveErrorMessage(error) });
  }
});

app.get(GEMINI_ANALYSIS_TEST_ROUTE, async (_request, response) => {
  try {
    const analysis = await generateMusicAnalysis(GEMINI_DUMMY_ANALYSIS_REQUEST);

    console.log(`${GEMINI_ANALYSIS_LOG_PREFIX} ${JSON.stringify(analysis)}`);
    response.json(analysis);
  } catch (error: unknown) {
    response.status(500).json({ error: resolveErrorMessage(error) });
  }
});

export const startServer = async (): Promise<Server> => {
  await checkDatabaseConnection();

  const port = resolveServerPort(process.env.PORT);

  return app.listen(port, () => {
    console.log(`SoundCluster API server listening on ${port}`);
  });
};

if (process.env.NODE_ENV !== SERVER_TEST_ENVIRONMENT) {
  startServer().catch((error: unknown) => {
    console.error(resolveErrorMessage(error));
    process.exitCode = 1;
  });
}
