import { createHash } from "node:crypto";

import { customAlphabet } from "nanoid";
import type { RowDataPacket } from "mysql2/promise";

import {
  DEFAULT_SHARE_CAMERA_POSITION,
  DEFAULT_SHARE_CAMERA_TARGET,
  SHARE_SNAPSHOT_ID_LENGTH,
} from "../../../shared/constants/shareSnapshot.js";
import { SHARE_SNAPSHOT_TABLE_NAME } from "../../../shared/constants/database.js";
import type {
  ClusterShareSnapshot,
  ClusterShareTrack,
  ShareSnapshotData,
} from "../../../shared/types/shareSnapshot.js";
import {
  isClusterShareSnapshot,
  isShareSnapshotData,
} from "../../../shared/utils/shareSnapshotValidation.js";
import { databasePool } from "../config/db.js";

interface ShareSnapshotRow extends RowDataPacket {
  snapshot_json: ClusterShareSnapshot | ShareSnapshotData | string;
}

interface ShareSnapshotIdRow extends RowDataPacket {
  share_id: string;
}

const SHARE_ID_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const createShareId = customAlphabet(
  SHARE_ID_ALPHABET,
  SHARE_SNAPSHOT_ID_LENGTH,
);
const SHARE_ID_RETRY_LIMIT = 5;

const createNormalizedTrack = (
  track: ClusterShareTrack,
): ClusterShareTrack => {
  const normalizedTrack: ClusterShareTrack = {
    id: track.id,
    title: track.title,
    artist: track.artist,
    emotions: {
      energy: track.emotions.energy,
      valence: track.emotions.valence,
      tempoDensity: track.emotions.tempoDensity,
      spaceDepth: track.emotions.spaceDepth,
      tension: track.emotions.tension,
    },
  };

  if (track.itunesTrackId) {
    normalizedTrack.itunesTrackId = track.itunesTrackId;
  }

  if (track.albumImageUrl !== undefined) {
    normalizedTrack.albumImageUrl = track.albumImageUrl;
  }

  return normalizedTrack;
};

const createShareSnapshotData = (
  snapshot: ClusterShareSnapshot,
): ShareSnapshotData => {
  return {
    version: 1,
    tracks: snapshot.tracks.map(createNormalizedTrack),
  };
};

const createDefaultSnapshotFromData = (
  shareData: ShareSnapshotData,
): ClusterShareSnapshot => {
  return {
    version: 1,
    selectedTrackId: null,
    cameraPosition: [...DEFAULT_SHARE_CAMERA_POSITION],
    cameraTarget: [...DEFAULT_SHARE_CAMERA_TARGET],
    tracks: shareData.tracks,
  };
};

const createShareSnapshotHash = (shareData: ShareSnapshotData): string => {
  return createHash("sha256")
    .update(JSON.stringify(shareData))
    .digest("hex");
};

const parseSnapshotJson = (
  snapshotJson: ClusterShareSnapshot | ShareSnapshotData | string,
): ClusterShareSnapshot | null => {
  const parsedSnapshot =
    typeof snapshotJson === "string"
      ? (JSON.parse(snapshotJson) as unknown)
      : snapshotJson;

  if (isShareSnapshotData(parsedSnapshot)) {
    return createDefaultSnapshotFromData(parsedSnapshot);
  }

  if (isClusterShareSnapshot(parsedSnapshot)) {
    return createDefaultSnapshotFromData(createShareSnapshotData(parsedSnapshot));
  }

  return null;
};

const findShareIdByHash = async (
  snapshotHash: string,
): Promise<string | null> => {
  const [rows] = await databasePool.query<ShareSnapshotIdRow[]>(
    `SELECT share_id FROM ${SHARE_SNAPSHOT_TABLE_NAME} WHERE snapshot_hash = ? LIMIT 1`,
    [snapshotHash],
  );
  const [row] = rows;

  return row?.share_id ?? null;
};

export const saveShareSnapshot = async (
  snapshot: ClusterShareSnapshot,
): Promise<string> => {
  const shareData = createShareSnapshotData(snapshot);
  const snapshotHash = createShareSnapshotHash(shareData);
  const existingShareId = await findShareIdByHash(snapshotHash);

  if (existingShareId) {
    return existingShareId;
  }

  for (let attempt = 0; attempt < SHARE_ID_RETRY_LIMIT; attempt += 1) {
    const shareId = createShareId();

    try {
      await databasePool.execute(
        `INSERT INTO ${SHARE_SNAPSHOT_TABLE_NAME} (
           share_id,
           snapshot_hash,
           snapshot_json
         )
         VALUES (?, ?, CAST(? AS JSON))`,
        [shareId, snapshotHash, JSON.stringify(shareData)],
      );

      return shareId;
    } catch (error: unknown) {
      const shareIdFromConcurrentInsert = await findShareIdByHash(snapshotHash);

      if (shareIdFromConcurrentInsert) {
        return shareIdFromConcurrentInsert;
      }

      const isLastAttempt = attempt === SHARE_ID_RETRY_LIMIT - 1;

      if (isLastAttempt) {
        throw error;
      }
    }
  }

  throw new Error("Failed to create share snapshot id");
};

export const findShareSnapshotById = async (
  shareId: string,
): Promise<ClusterShareSnapshot | null> => {
  const [rows] = await databasePool.query<ShareSnapshotRow[]>(
    `SELECT snapshot_json FROM ${SHARE_SNAPSHOT_TABLE_NAME} WHERE share_id = ? LIMIT 1`,
    [shareId],
  );
  const [row] = rows;

  if (!row) {
    return null;
  }

  return parseSnapshotJson(row.snapshot_json);
};
