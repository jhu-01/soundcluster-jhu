import { useState } from "react";

import type { SearchPayload, SearchStatus } from "../types/search";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  progress: number;
  status: SearchStatus;
  statusMessage: string;
  onSubmit: (payload: SearchPayload) => void;
}

const DEFAULT_TITLE = "Midnight Circuit";
const DEFAULT_ARTIST = "SoundCluster Lab";

export function SearchBar({
  progress,
  status,
  statusMessage,
  onSubmit,
}: SearchBarProps) {
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [artist, setArtist] = useState(DEFAULT_ARTIST);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSubmit({
      title: title.trim(),
      artist: artist.trim(),
    });
  };

  return (
    <form className={styles.search} onSubmit={handleSubmit}>
      <div className={styles.fields}>
        <label className={styles.field}>
          <span>Title</span>
          <input
            name="title"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Track title"
            value={title}
          />
        </label>
        <label className={styles.field}>
          <span>Artist</span>
          <input
            name="artist"
            onChange={(event) => setArtist(event.target.value)}
            placeholder="Artist"
            value={artist}
          />
        </label>
      </div>
      <div className={styles.actions}>
        <button disabled={status === "connecting" || status === "streaming"} type="submit">
          Analyze
        </button>
        <output className={styles.status} data-status={status}>
          {statusMessage}
        </output>
      </div>
      <div className={styles.progress} aria-hidden="true">
        <span style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
    </form>
  );
}
