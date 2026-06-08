import type {
  ClusterShareSnapshot,
  ClusterShareTrack,
  ShareSnapshotData,
  Vector3Tuple,
} from "../types/shareSnapshot.js";

const SNAPSHOT_VERSION = 1;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

export const isVector3Tuple = (value: unknown): value is Vector3Tuple => {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((item) => typeof item === "number" && Number.isFinite(item))
  );
};

export const isShareTrack = (value: unknown): value is ClusterShareTrack => {
  if (!isRecord(value) || !isRecord(value.emotions)) {
    return false;
  }

  const emotions = value.emotions;

  return (
    (value.albumImageUrl === undefined ||
      value.albumImageUrl === null ||
      typeof value.albumImageUrl === "string") &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.artist === "string" &&
    (value.itunesTrackId === undefined ||
      typeof value.itunesTrackId === "string") &&
    (value.itunesUrl === undefined || typeof value.itunesUrl === "string") &&
    typeof emotions.energy === "number" &&
    typeof emotions.valence === "number" &&
    typeof emotions.tempoDensity === "number" &&
    typeof emotions.spaceDepth === "number" &&
    typeof emotions.tension === "number"
  );
};

export const isClusterShareSnapshot = (
  value: unknown,
): value is ClusterShareSnapshot => {
  if (!isRecord(value) || value.version !== SNAPSHOT_VERSION) {
    return false;
  }

  const hasSelectedTrack =
    value.selectedTrackId === null || typeof value.selectedTrackId === "string";

  return (
    hasSelectedTrack &&
    isVector3Tuple(value.cameraPosition) &&
    isVector3Tuple(value.cameraTarget) &&
    Array.isArray(value.tracks) &&
    value.tracks.every(isShareTrack)
  );
};

export const isShareSnapshotData = (
  value: unknown,
): value is ShareSnapshotData => {
  return (
    isRecord(value) &&
    value.version === SNAPSHOT_VERSION &&
    Array.isArray(value.tracks) &&
    value.tracks.every(isShareTrack)
  );
};
