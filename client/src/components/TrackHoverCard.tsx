import type { ClusterShareTrack } from "../types/shareSnapshot";
import styles from "./TrackHoverCard.module.css";

interface TrackHoverCardProps {
  relationLabel: string | null;
  track: ClusterShareTrack | null;
}

const createFallbackLabel = (track: ClusterShareTrack): string => {
  return track.title.slice(0, 2).toUpperCase();
};

export function TrackHoverCard({ relationLabel, track }: TrackHoverCardProps) {
  if (!track) {
    return null;
  }

  return (
    <aside className={styles.card} aria-label="Track metadata">
      {track.albumImageUrl ? (
        <img
          alt={`${track.title} album cover`}
          className={styles.albumImage}
          src={track.albumImageUrl}
        />
      ) : (
        <div className={styles.albumFallback} aria-hidden="true">
          {createFallbackLabel(track)}
        </div>
      )}
      <div className={styles.metadata}>
        {relationLabel ? <span className={styles.badge}>{relationLabel}</span> : null}
        <strong>{track.title}</strong>
        <span>{track.artist}</span>
      </div>
    </aside>
  );
}
