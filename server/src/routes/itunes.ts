import { Router } from "express";
import type { Request } from "express";

import { searchItunesTracks } from "../config/itunes.js";
import { ITUNES_SEARCH_ROUTE } from "../../../shared/constants/itunes.js";

export const itunesRouter = Router();

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

itunesRouter.get(ITUNES_SEARCH_ROUTE, async (request, response) => {
  const title = readQueryString(request.query.title);
  const artist = readQueryString(request.query.artist) ?? undefined;

  if (!title) {
    response.status(400).json({ error: "title query parameter is required" });
    return;
  }

  try {
    response.json(await searchItunesTracks(title, artist));
  } catch (error: unknown) {
    response.status(500).json({ error: resolveErrorMessage(error) });
  }
});
