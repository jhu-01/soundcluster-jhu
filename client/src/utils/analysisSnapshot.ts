import type { MusicAnalysisResponse } from "../../../shared/types/musicAnalysis.js";
import type { ClusterShareSnapshot } from "../types/shareSnapshot.js";

export const applyAnalysisResultToSnapshotTrack = (
  snapshot: ClusterShareSnapshot,
  result: MusicAnalysisResponse,
  targetTrackId: string | null,
): ClusterShareSnapshot => {
  if (!targetTrackId) {
    return snapshot;
  }

  const hasTargetTrack = snapshot.tracks.some((track) => track.id === targetTrackId);

  if (!hasTargetTrack) {
    return snapshot;
  }

  return {
    ...snapshot,
    tracks: snapshot.tracks.map((track) => {
      if (track.id !== targetTrackId) {
        return track;
      }

      return {
        ...track,
        emotions: result.emotions,
      };
    }),
  };
};
