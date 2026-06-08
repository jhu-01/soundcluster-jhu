import {
  ITUNES_ROUTE_PREFIX,
  ITUNES_SEARCH_ROUTE,
} from "../../../shared/constants/itunes";
import type { ItunesSearchResponse } from "../../../shared/types/itunes";
import { API_BASE_URL } from "../constants/api";

export const createItunesSearchUrl = (
  title: string,
  artist: string,
): string => {
  const url = new URL(`${ITUNES_ROUTE_PREFIX}${ITUNES_SEARCH_ROUTE}`, API_BASE_URL);

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
