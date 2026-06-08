import type { ClusterShareSnapshot } from "../types/shareSnapshot";
import styles from "./SnapshotDebugPanel.module.css";

interface SnapshotDebugPanelProps {
  snapshot: ClusterShareSnapshot;
  onMutateSnapshot: () => void;
}

const formatVector = (value: number): string => {
  return value.toFixed(2);
};

export function SnapshotDebugPanel({
  snapshot,
  onMutateSnapshot,
}: SnapshotDebugPanelProps) {
  const selectedTrack =
    snapshot.tracks.find((track) => track.id === snapshot.selectedTrackId) ??
    snapshot.tracks[0];

  if (!selectedTrack) {
    return null;
  }

  return (
    <aside className={styles.panel} aria-label="Snapshot debug panel">
      <div>
        <span className={styles.label}>selected</span>
        <strong>{selectedTrack.title}</strong>
      </div>
      <div>
        <span className={styles.label}>nodes</span>
        <strong>{snapshot.tracks.length}</strong>
      </div>
      <div className={styles.values}>
        <span>energy {formatVector(selectedTrack.emotions.energy)}</span>
        <span>valence {formatVector(selectedTrack.emotions.valence)}</span>
        <span>tension {formatVector(selectedTrack.emotions.tension)}</span>
      </div>
      <button onClick={onMutateSnapshot} type="button">
        Mutate Snapshot
      </button>
    </aside>
  );
}
