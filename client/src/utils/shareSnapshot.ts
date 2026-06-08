import type {
  ClusterShareSnapshot,
  ClusterShareTrack,
  Vector3Tuple,
} from "../types/shareSnapshot.js";

const SNAPSHOT_QUERY_PARAM = "snapshot";
const SNAPSHOT_VERSION = 1;
const COMPACT_SNAPSHOT_PREFIX = "c1.";
const COMPACT_SNAPSHOT_VERSION = 1;
const QUANTIZE_SCALE = 1000;

type CompactOptionalString = string | null | 0;
type CompactEmotionVector = [number, number, number, number, number];
type CompactShareTrack = [
  string,
  string,
  string,
  CompactEmotionVector,
  CompactOptionalString,
  CompactOptionalString,
  CompactOptionalString,
];
type CompactShareSnapshot = [
  1,
  string | null,
  Vector3Tuple,
  Vector3Tuple,
  CompactShareTrack[],
];

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

const encodeJsonToBase64Url = (json: string): string => {
  return btoa(encodeURIComponent(json))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
};

const decodeBase64UrlToJson = (encodedValue: string): string => {
  const normalizedBase64 = encodedValue
    .replaceAll("-", "+")
    .replaceAll("_", "/");
  const paddingLength = (4 - (normalizedBase64.length % 4)) % 4;
  const base64 = normalizedBase64.padEnd(
    normalizedBase64.length + paddingLength,
    "=",
  );

  return decodeURIComponent(atob(base64));
};

const quantizeNumber = (value: number): number => {
  return Math.round(value * QUANTIZE_SCALE);
};

const dequantizeNumber = (value: number): number => {
  return value / QUANTIZE_SCALE;
};

const quantizeVector3 = (value: Vector3Tuple): Vector3Tuple => {
  return [
    quantizeNumber(value[0]),
    quantizeNumber(value[1]),
    quantizeNumber(value[2]),
  ];
};

const dequantizeVector3 = (value: Vector3Tuple): Vector3Tuple => {
  return [
    dequantizeNumber(value[0]),
    dequantizeNumber(value[1]),
    dequantizeNumber(value[2]),
  ];
};

const encodeOptionalString = (value: string | undefined): CompactOptionalString => {
  return value ?? 0;
};

const encodeNullableString = (
  value: string | null | undefined,
): CompactOptionalString => {
  return value === undefined ? 0 : value;
};

const decodeOptionalString = (
  value: CompactOptionalString,
): string | undefined => {
  return typeof value === "string" ? value : undefined;
};

const isCompactOptionalString = (
  value: unknown,
): value is CompactOptionalString => {
  return value === 0 || value === null || typeof value === "string";
};

const toCompactShareTrack = (track: ClusterShareTrack): CompactShareTrack => {
  return [
    track.id,
    track.title,
    track.artist,
    [
      quantizeNumber(track.emotions.energy),
      quantizeNumber(track.emotions.valence),
      quantizeNumber(track.emotions.tempoDensity),
      quantizeNumber(track.emotions.spaceDepth),
      quantizeNumber(track.emotions.tension),
    ],
    encodeOptionalString(track.itunesTrackId),
    encodeOptionalString(track.itunesUrl),
    encodeNullableString(track.albumImageUrl),
  ];
};

const toCompactShareSnapshot = (
  snapshot: ClusterShareSnapshot,
): CompactShareSnapshot => {
  return [
    COMPACT_SNAPSHOT_VERSION,
    snapshot.selectedTrackId,
    quantizeVector3(snapshot.cameraPosition),
    quantizeVector3(snapshot.cameraTarget),
    snapshot.tracks.map(toCompactShareTrack),
  ];
};

const isCompactEmotionVector = (
  value: unknown,
): value is CompactEmotionVector => {
  return (
    Array.isArray(value) &&
    value.length === 5 &&
    value.every((item) => Number.isInteger(item))
  );
};

const isCompactShareTrack = (value: unknown): value is CompactShareTrack => {
  return (
    Array.isArray(value) &&
    value.length === 7 &&
    typeof value[0] === "string" &&
    typeof value[1] === "string" &&
    typeof value[2] === "string" &&
    isCompactEmotionVector(value[3]) &&
    isCompactOptionalString(value[4]) &&
    isCompactOptionalString(value[5]) &&
    isCompactOptionalString(value[6])
  );
};

const isCompactShareSnapshot = (
  value: unknown,
): value is CompactShareSnapshot => {
  return (
    Array.isArray(value) &&
    value.length === 5 &&
    value[0] === COMPACT_SNAPSHOT_VERSION &&
    (value[1] === null || typeof value[1] === "string") &&
    isVector3Tuple(value[2]) &&
    isVector3Tuple(value[3]) &&
    Array.isArray(value[4]) &&
    value[4].every(isCompactShareTrack)
  );
};

const fromCompactShareTrack = (
  compactTrack: CompactShareTrack,
): ClusterShareTrack => {
  const track: ClusterShareTrack = {
    id: compactTrack[0],
    title: compactTrack[1],
    artist: compactTrack[2],
    emotions: {
      energy: dequantizeNumber(compactTrack[3][0]),
      valence: dequantizeNumber(compactTrack[3][1]),
      tempoDensity: dequantizeNumber(compactTrack[3][2]),
      spaceDepth: dequantizeNumber(compactTrack[3][3]),
      tension: dequantizeNumber(compactTrack[3][4]),
    },
  };
  const itunesTrackId = decodeOptionalString(compactTrack[4]);
  const itunesUrl = decodeOptionalString(compactTrack[5]);

  if (itunesTrackId) {
    track.itunesTrackId = itunesTrackId;
  }

  if (itunesUrl) {
    track.itunesUrl = itunesUrl;
  }

  if (compactTrack[6] !== 0) {
    track.albumImageUrl = compactTrack[6];
  }

  return track;
};

const fromCompactShareSnapshot = (
  compactSnapshot: CompactShareSnapshot,
): ClusterShareSnapshot => {
  return {
    version: SNAPSHOT_VERSION,
    selectedTrackId: compactSnapshot[1],
    cameraPosition: dequantizeVector3(compactSnapshot[2]),
    cameraTarget: dequantizeVector3(compactSnapshot[3]),
    tracks: compactSnapshot[4].map(fromCompactShareTrack),
  };
};

export const encodeLegacyShareSnapshot = (
  snapshot: ClusterShareSnapshot,
): string => {
  const json = JSON.stringify(snapshot);

  return encodeJsonToBase64Url(json);
};

export const encodeShareSnapshot = (
  snapshot: ClusterShareSnapshot,
): string => {
  const compactSnapshot = toCompactShareSnapshot(snapshot);

  return `${COMPACT_SNAPSHOT_PREFIX}${encodeJsonToBase64Url(
    JSON.stringify(compactSnapshot),
  )}`;
};

export const decodeShareSnapshot = (
  encodedSnapshot: string | null,
): ClusterShareSnapshot | null => {
  if (!encodedSnapshot) {
    return null;
  }

  try {
    if (encodedSnapshot.startsWith(COMPACT_SNAPSHOT_PREFIX)) {
      const json = decodeBase64UrlToJson(
        encodedSnapshot.slice(COMPACT_SNAPSHOT_PREFIX.length),
      );
      const parsed = JSON.parse(json) as unknown;

      if (!isCompactShareSnapshot(parsed)) {
        return null;
      }

      const snapshot = fromCompactShareSnapshot(parsed);

      return isClusterShareSnapshot(snapshot) ? snapshot : null;
    }

    const json = decodeBase64UrlToJson(encodedSnapshot);
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
