import {
  ITUNES_SEARCH_URL,
  ITUNES_TRACK_SEARCH_LIMIT,
} from "../../../shared/constants/itunes.js";
import type {
  ItunesSearchResponse,
  ItunesTrackMetadata,
} from "../../../shared/types/itunes.js";

interface ItunesTrackItem {
  artistName?: unknown;
  artworkUrl100?: unknown;
  artworkUrl60?: unknown;
  trackId?: unknown;
  trackName?: unknown;
  trackViewUrl?: unknown;
}

interface ItunesSearchPayload {
  resultCount?: unknown;
  results?: ItunesTrackItem[];
}

const createItunesSearchTerm = (title: string, artist?: string): string => {
  if (artist) {
    return `${title} ${artist}`;
  }

  return title;
};

const readString = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return null;
};

const readTrackId = (value: unknown): string | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return readString(value);
};

const normalizeArtworkUrl = (value: unknown): string | null => {
  const url = readString(value);

  if (!url) {
    return null;
  }

  return url.replace("100x100bb", "300x300bb");
};

const normalizeItunesTrack = (
  item: ItunesTrackItem,
): ItunesTrackMetadata | null => {
  const itunesTrackId = readTrackId(item.trackId);
  const title = readString(item.trackName);
  const artist = readString(item.artistName);
  const itunesUrl = readString(item.trackViewUrl);

  if (!itunesTrackId || !title || !artist || !itunesUrl) {
    return null;
  }

  return {
    itunesTrackId,
    title,
    artist,
    itunesUrl,
    albumImageUrl:
      normalizeArtworkUrl(item.artworkUrl100) ??
      normalizeArtworkUrl(item.artworkUrl60),
  };
};

export const searchItunesTracks = async (
  title: string,
  artist?: string,
): Promise<ItunesSearchResponse> => {
  const searchUrl = new URL(ITUNES_SEARCH_URL);

  searchUrl.searchParams.set("term", createItunesSearchTerm(title, artist));
  searchUrl.searchParams.set("media", "music");
  searchUrl.searchParams.set("entity", "song");
  searchUrl.searchParams.set("limit", String(ITUNES_TRACK_SEARCH_LIMIT));

  const response = await fetch(searchUrl);

  if (!response.ok) {
    throw new Error(`iTunes search request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ItunesSearchPayload;
  const results = payload.results ?? [];

  return {
    items: results.flatMap((item) => {
      const track = normalizeItunesTrack(item);

      return track ? [track] : [];
    }),
  };
};
