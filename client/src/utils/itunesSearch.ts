import {
  ITUNES_ROUTE_PREFIX,
  ITUNES_SEARCH_ROUTE,
} from "../../../shared/constants/itunes";
import type { ItunesSearchResponse } from "../../../shared/types/itunes";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:3001";

const readApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
};

export const createItunesSearchUrl = (
  title: string,
  artist: string,
): string => {
  const url = new URL(`${ITUNES_ROUTE_PREFIX}${ITUNES_SEARCH_ROUTE}`, readApiBaseUrl());

  url.searchParams.set("title", title);

  if (artist.trim()) {
    url.searchParams.set("artist", artist);
  }

  return url.toString();
};

export const fetchItunesTracks = async (
  title: string,
  artist: string,
): Promise<ItunesSearchResponse> => {
  const response = await fetch(createItunesSearchUrl(title, artist));

  if (!response.ok) {
    throw new Error(`iTunes metadata request failed with status ${response.status}`);
  }

  return (await response.json()) as ItunesSearchResponse;
};
