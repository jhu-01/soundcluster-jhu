export interface SearchPayload {
  title: string;
  artist: string;
}

export type SearchStatus = "idle" | "connecting" | "streaming" | "done" | "error";
