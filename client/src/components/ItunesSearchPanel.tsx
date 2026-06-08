import { useState } from "react";
import type { FormEvent } from "react";

import type { ItunesTrackMetadata } from "../../../shared/types/itunes";
import { fetchItunesTracks } from "../utils/itunesSearch";
import styles from "./ItunesSearchPanel.module.css";

interface ItunesSearchPanelProps {
  onSelectTrack: (track: ItunesTrackMetadata) => void;
}

export function ItunesSearchPanel({ onSelectTrack }: ItunesSearchPanelProps) {
  const [title, setTitle] = useState("Midnight City");
  const [artist, setArtist] = useState("M83");
  const [items, setItems] = useState<ItunesTrackMetadata[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setStatus("error");
      setErrorMessage("Title is required.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetchItunesTracks(title.trim(), artist.trim());

      setItems(response.items);
      setStatus("idle");
    } catch (error: unknown) {
      setItems([]);
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <section className={styles.panel} aria-label="iTunes metadata search">
      <form className={styles.form} onSubmit={handleSearch}>
        <input
          aria-label="Track title"
          id="itunes-title"
          name="itunes-title"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Track title"
          value={title}
        />
        <input
          aria-label="Artist"
          id="itunes-artist"
          name="itunes-artist"
          onChange={(event) => setArtist(event.target.value)}
          placeholder="Artist"
          value={artist}
        />
        <button disabled={status === "loading"} type="submit">
          {status === "loading" ? "Searching" : "Search"}
        </button>
      </form>
      {status === "error" ? (
        <p className={styles.error}>{errorMessage}</p>
      ) : null}
      <div className={styles.results}>
        {items.map((item) => (
          <button
            className={styles.result}
            key={item.itunesTrackId}
            onClick={() => onSelectTrack(item)}
            type="button"
          >
            {item.albumImageUrl ? (
              <img alt="" src={item.albumImageUrl} />
            ) : (
              <span className={styles.imageFallback} />
            )}
            <span>
              <strong>{item.title}</strong>
              <small>{item.artist}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
