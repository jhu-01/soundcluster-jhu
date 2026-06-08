import type { ClusterShareTrack } from "../types/shareSnapshot.js";

export interface TrackRelationSummary {
  farthestDistance: number;
  farthestTrackId: string;
  nearestDistance: number;
  nearestTrackId: string;
  selectedTrackId: string;
}

const calculateEmotionDistance = (
  selectedTrack: ClusterShareTrack,
  candidateTrack: ClusterShareTrack,
): number => {
  const energy = selectedTrack.emotions.energy - candidateTrack.emotions.energy;
  const valence = selectedTrack.emotions.valence - candidateTrack.emotions.valence;
  const tempoDensity =
    selectedTrack.emotions.tempoDensity - candidateTrack.emotions.tempoDensity;
  const spaceDepth =
    selectedTrack.emotions.spaceDepth - candidateTrack.emotions.spaceDepth;
  const tension = selectedTrack.emotions.tension - candidateTrack.emotions.tension;

  return Math.hypot(energy, valence, tempoDensity, spaceDepth, tension);
};

export const createTrackRelationSummary = (
  tracks: ClusterShareTrack[],
  selectedTrackId: string | null,
): TrackRelationSummary | null => {
  if (!selectedTrackId || tracks.length < 2) {
    return null;
  }

  const selectedTrack = tracks.find((track) => track.id === selectedTrackId);

  if (!selectedTrack) {
    return null;
  }

  const candidates = tracks.filter((track) => track.id !== selectedTrack.id);

  if (candidates.length === 0) {
    return null;
  }

  let nearestTrack = candidates[0];
  let farthestTrack = candidates[0];
  let nearestDistance = calculateEmotionDistance(selectedTrack, nearestTrack);
  let farthestDistance = nearestDistance;

  for (const candidateTrack of candidates.slice(1)) {
    const candidateDistance = calculateEmotionDistance(
      selectedTrack,
      candidateTrack,
    );

    if (candidateDistance < nearestDistance) {
      nearestTrack = candidateTrack;
      nearestDistance = candidateDistance;
    }

    if (candidateDistance > farthestDistance) {
      farthestTrack = candidateTrack;
      farthestDistance = candidateDistance;
    }
  }

  return {
    farthestDistance,
    farthestTrackId: farthestTrack.id,
    nearestDistance,
    nearestTrackId: nearestTrack.id,
    selectedTrackId: selectedTrack.id,
  };
};
