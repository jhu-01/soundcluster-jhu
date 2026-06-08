import type {
  ClusterShareSnapshot,
  ClusterShareTrack,
} from "../types/shareSnapshot.js";

export const findSnapshotTrack = (
  tracks: ClusterShareTrack[],
  trackId: string | null,
): ClusterShareTrack | null => {
  if (!trackId) {
    return null;
  }

  return tracks.find((track) => track.id === trackId) ?? null;
};

export const selectSnapshotTrack = (
  snapshot: ClusterShareSnapshot,
  trackId: string,
): ClusterShareSnapshot => {
  if (snapshot.selectedTrackId === trackId) {
    return snapshot;
  }

  if (!findSnapshotTrack(snapshot.tracks, trackId)) {
    return snapshot;
  }

  return {
    ...snapshot,
    selectedTrackId: trackId,
  };
};
