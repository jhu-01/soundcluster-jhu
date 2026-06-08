import {
  LYRICS_ROUTE_PREFIX,
  LYRICS_SEARCH_ROUTE,
} from "../../../shared/constants/lyrics";
import type { LyricsSearchResponse } from "../../../shared/types/lyrics";
import { API_BASE_URL } from "../constants/api";

export const createLyricsSearchUrl = (title: string, artist: string): string => {
  const url = new URL(
    `${LYRICS_ROUTE_PREFIX}${LYRICS_SEARCH_ROUTE}`,
    API_BASE_URL,
  );

  url.searchParams.set("title", title);

  if (artist.trim()) {
    url.searchParams.set("artist", artist);
  }

  return url.toString();
};

export const fetchLyrics = async (
  title: string,
  artist: string,
): Promise<LyricsSearchResponse> => {
  const response = await fetch(createLyricsSearchUrl(title, artist));

  if (!response.ok) {
    throw new Error(`lyrics request failed with status ${response.status}`);
  }

  return (await response.json()) as LyricsSearchResponse;
};
