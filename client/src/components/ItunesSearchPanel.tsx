import type { ItunesTrackMetadata } from "../../../shared/types/itunes";
import styles from "./ItunesSearchPanel.module.css";

interface ItunesSearchPanelProps {
  extractingTrackId: string | null;
  items: ItunesTrackMetadata[];
  onExtractTrack: (track: ItunesTrackMetadata) => void;
  status: "idle" | "loading" | "error";
}

export function ItunesSearchPanel({
  extractingTrackId,
  items,
  onExtractTrack,
  status,
}: ItunesSearchPanelProps) {
  return (
    <section className={styles.panel} aria-label="iTunes search results">
      <div className={styles.header}>
        <strong>Search Results</strong>
        <output>{items.length}</output>
      </div>
      {status === "loading" ? (
        <p className={styles.status}>Searching iTunes...</p>
      ) : null}
      {status === "idle" && items.length === 0 ? (
        <p className={styles.status}>Search for a song to add it here.</p>
      ) : null}
      <div className={styles.results}>
        {items.map((item) => (
          <button
            className={styles.result}
            data-loading={extractingTrackId === item.itunesTrackId}
            disabled={extractingTrackId !== null}
            key={item.itunesTrackId}
            onClick={() => onExtractTrack(item)}
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
            <span className={styles.addMark} aria-hidden="true">
              {extractingTrackId === item.itunesTrackId ? "..." : "+"}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
