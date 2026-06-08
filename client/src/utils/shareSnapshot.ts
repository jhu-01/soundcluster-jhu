import type {
  ClusterShareSnapshot,
  ClusterShareTrack,
  Vector3Tuple,
} from "../types/shareSnapshot";

const SNAPSHOT_QUERY_PARAM = "snapshot";
const SNAPSHOT_VERSION = 1;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isVector3Tuple = (value: unknown): value is Vector3Tuple => {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((item) => typeof item === "number" && Number.isFinite(item))
  );
};

const isShareTrack = (value: unknown): value is ClusterShareTrack => {
  if (!isRecord(value) || !isRecord(value.emotions)) {
    return false;
  }

  const emotions = value.emotions;

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.artist === "string" &&
    typeof emotions.energy === "number" &&
    typeof emotions.valence === "number" &&
    typeof emotions.tempoDensity === "number" &&
    typeof emotions.spaceDepth === "number" &&
    typeof emotions.tension === "number"
  );
};

const isClusterShareSnapshot = (
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

export const encodeShareSnapshot = (
  snapshot: ClusterShareSnapshot,
): string => {
  const json = JSON.stringify(snapshot);

  return btoa(encodeURIComponent(json))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
};

export const decodeShareSnapshot = (
  encodedSnapshot: string | null,
): ClusterShareSnapshot | null => {
  if (!encodedSnapshot) {
    return null;
  }

  try {
    const normalizedBase64 = encodedSnapshot
      .replaceAll("-", "+")
      .replaceAll("_", "/");
    const paddingLength = (4 - (normalizedBase64.length % 4)) % 4;
    const base64 = normalizedBase64.padEnd(
      normalizedBase64.length + paddingLength,
      "=",
    );
    const json = decodeURIComponent(atob(base64));
    const parsed = JSON.parse(json) as unknown;

    if (!isClusterShareSnapshot(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const createShareSnapshotUrl = (
  snapshot: ClusterShareSnapshot,
  href: string,
): string => {
  const url = new URL(href);

  url.searchParams.set(SNAPSHOT_QUERY_PARAM, encodeShareSnapshot(snapshot));

  return url.toString();
};

export const readShareSnapshotFromLocation = (
  search: string,
): ClusterShareSnapshot | null => {
  return decodeShareSnapshot(new URLSearchParams(search).get(SNAPSHOT_QUERY_PARAM));
};
