import type { ItunesTrackMetadata } from "../../../shared/types/itunes";
import styles from "./ItunesSearchPanel.module.css";

interface ItunesSearchPanelProps {
  extractingTrackId: string | null;
  items: ItunesTrackMetadata[];
  onClearResults: () => void;
  onExtractTrack: (track: ItunesTrackMetadata) => void;
  status: "idle" | "loading" | "error";
}

export function ItunesSearchPanel({
  extractingTrackId,
  items,
  onClearResults,
  onExtractTrack,
  status,
}: ItunesSearchPanelProps) {
  const canClearResults = items.length > 0 && extractingTrackId === null;

  return (
    <section className={styles.panel} aria-label="iTunes search results">
      <div className={styles.header}>
        <strong>Search Results</strong>
        {canClearResults ? (
          <button
            aria-label="Clear search results"
            className={styles.clearButton}
            onClick={onClearResults}
            type="button"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M5 12h14" />
            </svg>
          </button>
        ) : null}
      </div>
      {status === "loading" ? (
        <p className={styles.status}>Searching iTunes...</p>
      ) : null}
      {status === "idle" && items.length === 0 ? (
        <p className={styles.status}>Search for a song to add it here.</p>
      ) : null}
      <div className={styles.results}>
        {items.map((item) => (
          <article
            className={styles.result}
            data-loading={extractingTrackId === item.itunesTrackId}
            key={item.itunesTrackId}
          >
            {item.albumImageUrl ? (
              <img alt="" src={item.albumImageUrl} />
            ) : (
              <span className={styles.imageFallback} />
            )}
            <span className={styles.trackText}>
              <strong>{item.title}</strong>
              <small>{item.artist}</small>
            </span>
            <button
              aria-label={`Extract ${item.title}`}
              className={styles.addButton}
              disabled={extractingTrackId !== null}
              onClick={() => onExtractTrack(item)}
              type="button"
            >
              {extractingTrackId === item.itunesTrackId ? (
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M12 3v4" />
                  <path d="M12 17v4" />
                  <path d="M3 12h4" />
                  <path d="M17 12h4" />
                  <path d="m5.6 5.6 2.8 2.8" />
                  <path d="m15.6 15.6 2.8 2.8" />
                  <path d="m18.4 5.6-2.8 2.8" />
                  <path d="m8.4 15.6-2.8 2.8" />
                </svg>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              )}
            </button>
          </article>
        ))}
      </div>
      <footer className={styles.footer}>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M9 18.2a2.7 2.7 0 1 1-1.3-2.3V6.3l9.2-1.9v10.8a2.7 2.7 0 1 1-1.3-2.3V8.1L9 9.5v8.7Z" />
        </svg>
        <span>Powered by iTunes API</span>
      </footer>
    </section>
  );
}
