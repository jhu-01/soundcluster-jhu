import { Router } from "express";
import type { Request } from "express";

import { searchLyrics } from "../config/lyrics.js";
import { LYRICS_SEARCH_ROUTE } from "../../../shared/constants/lyrics.js";

export const lyricsRouter = Router();

const readQueryString = (value: Request["query"][string]): string | null => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return null;
};

const resolveErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};

lyricsRouter.get(LYRICS_SEARCH_ROUTE, async (request, response) => {
  const title = readQueryString(request.query.title);
  const artist = readQueryString(request.query.artist) ?? undefined;

  if (!title) {
    response.status(400).json({ error: "title query parameter is required" });
    return;
  }

  try {
    response.json(await searchLyrics({ title, artist }));
  } catch (error: unknown) {
    response.status(500).json({ error: resolveErrorMessage(error) });
  }
});
