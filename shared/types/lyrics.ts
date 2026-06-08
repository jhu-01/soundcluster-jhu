export type LyricsLookupSource = "lrclib" | "none";

export interface LyricsSearchResponse {
  artist: string;
  lrclibId?: number;
  lyrics: string;
  source: LyricsLookupSource;
  synced: boolean;
  title: string;
}
