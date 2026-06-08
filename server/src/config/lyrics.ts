import {
  LRCLIB_SEARCH_URL,
  LRCLIB_USER_AGENT,
} from "../../../shared/constants/lyrics.js";
import type { LyricsSearchResponse } from "../../../shared/types/lyrics.js";

interface LrclibLyricsRecord {
  artistName?: unknown;
  id?: unknown;
  instrumental?: unknown;
  name?: unknown;
  plainLyrics?: unknown;
  syncedLyrics?: unknown;
}

interface LyricsSearchInput {
  artist?: string;
  title: string;
}

const readString = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return null;
};

const normalizeSearchText = (value: string): string => {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
};

const createEmptyLyricsResponse = (
  input: LyricsSearchInput,
): LyricsSearchResponse => {
  return {
    artist: input.artist ?? "",
    lyrics: "",
    source: "none",
    synced: false,
    title: input.title,
  };
};

export const stripLrclibSyncedLyrics = (syncedLyrics: string): string => {
  return syncedLyrics
    .split("\n")
    .map((line) => {
      return line
        .replace(/\[[0-9]{1,2}:[0-9]{2}(?:\.[0-9]{1,3})?\]/g, "")
        .trim();
    })
    .filter(Boolean)
    .join("\n");
};

const readLyrics = (
  record: LrclibLyricsRecord,
): { lyrics: string; synced: boolean } | null => {
  const plainLyrics = readString(record.plainLyrics);

  if (plainLyrics) {
    return {
      lyrics: plainLyrics,
      synced: false,
    };
  }

  const syncedLyrics = readString(record.syncedLyrics);

  if (!syncedLyrics) {
    return null;
  }

  const lyrics = stripLrclibSyncedLyrics(syncedLyrics);

  if (!lyrics) {
    return null;
  }

  return {
    lyrics,
    synced: true,
  };
};

const scoreLyricsRecord = (
  record: LrclibLyricsRecord,
  input: LyricsSearchInput,
): number => {
  const title = readString(record.name);
  const artist = readString(record.artistName);
  const requestedTitle = normalizeSearchText(input.title);
  const requestedArtist = input.artist ? normalizeSearchText(input.artist) : "";
  let score = 0;

  if (title) {
    const normalizedTitle = normalizeSearchText(title);

    if (normalizedTitle === requestedTitle) {
      score += 8;
    } else if (normalizedTitle.includes(requestedTitle)) {
      score += 3;
    }
  }

  if (artist && requestedArtist) {
    const normalizedArtist = normalizeSearchText(artist);

    if (normalizedArtist === requestedArtist) {
      score += 6;
    } else if (normalizedArtist.includes(requestedArtist)) {
      score += 2;
    }
  }

  if (readString(record.plainLyrics)) {
    score += 2;
  }

  if (record.instrumental === true) {
    score -= 8;
  }

  return score;
};

const normalizeLyricsRecord = (
  record: LrclibLyricsRecord,
  input: LyricsSearchInput,
): LyricsSearchResponse | null => {
  const lyricsResult = readLyrics(record);

  if (!lyricsResult) {
    return null;
  }

  const id = typeof record.id === "number" ? record.id : undefined;

  return {
    artist: readString(record.artistName) ?? input.artist ?? "",
    lrclibId: id,
    lyrics: lyricsResult.lyrics,
    source: "lrclib",
    synced: lyricsResult.synced,
    title: readString(record.name) ?? input.title,
  };
};

export const searchLyrics = async (
  input: LyricsSearchInput,
): Promise<LyricsSearchResponse> => {
  const searchUrl = new URL(LRCLIB_SEARCH_URL);

  searchUrl.searchParams.set("track_name", input.title);

  if (input.artist) {
    searchUrl.searchParams.set("artist_name", input.artist);
  }

  const response = await fetch(searchUrl, {
    headers: {
      "User-Agent": LRCLIB_USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`LRCLIB lyrics request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as unknown;

  if (!Array.isArray(payload)) {
    return createEmptyLyricsResponse(input);
  }

  const [bestLyrics] = payload
    .flatMap((item): Array<{ score: number; response: LyricsSearchResponse }> => {
      const record = item as LrclibLyricsRecord;
      const responseItem = normalizeLyricsRecord(record, input);

      if (!responseItem) {
        return [];
      }

      return [
        {
          response: responseItem,
          score: scoreLyricsRecord(record, input),
        },
      ];
    })
    .sort((left, right) => right.score - left.score);

  return bestLyrics?.response ?? createEmptyLyricsResponse(input);
};
