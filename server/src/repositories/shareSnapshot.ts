import { createHash } from "node:crypto";

import { customAlphabet } from "nanoid";
import { MongoServerError } from "mongodb";

import {
  DEFAULT_SHARE_CAMERA_POSITION,
  DEFAULT_SHARE_CAMERA_TARGET,
  SHARE_SNAPSHOT_ID_LENGTH,
} from "../../../shared/constants/shareSnapshot.js";
import { SHARE_SNAPSHOT_COLLECTION_NAME } from "../../../shared/constants/database.js";
import type {
  ClusterShareSnapshot,
  ClusterShareTrack,
  ShareSnapshotData,
} from "../../../shared/types/shareSnapshot.js";
import {
  isClusterShareSnapshot,
  isShareSnapshotData,
} from "../../../shared/utils/shareSnapshotValidation.js";
import { getDatabase } from "../config/db.js";

interface ShareSnapshotDocument {
  shareId: string;
  snapshotHash: string;
  snapshot: ShareSnapshotData;
  createdAt: Date;
  updatedAt: Date;
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

const parseSnapshotData = (
  snapshotData: ClusterShareSnapshot | ShareSnapshotData,
): ClusterShareSnapshot | null => {
  if (isShareSnapshotData(snapshotData)) {
    return createDefaultSnapshotFromData(snapshotData);
  }

  if (isClusterShareSnapshot(snapshotData)) {
    return createDefaultSnapshotFromData(createShareSnapshotData(snapshotData));
  }

  return null;
};

const getShareSnapshotCollection = async () => {
  const db = await getDatabase();

  return db.collection<ShareSnapshotDocument>(SHARE_SNAPSHOT_COLLECTION_NAME);
};

const findShareIdByHash = async (
  snapshotHash: string,
): Promise<string | null> => {
  const collection = await getShareSnapshotCollection();
  const document = await collection.findOne(
    { snapshotHash },
    { projection: { shareId: 1 } },
  );

  return document?.shareId ?? null;
};

const isDuplicateKeyError = (error: unknown): boolean => {
  return error instanceof MongoServerError && error.code === 11000;
};

export const saveShareSnapshot = async (
  snapshot: ClusterShareSnapshot,
): Promise<string> => {
  const collection = await getShareSnapshotCollection();
  const shareData = createShareSnapshotData(snapshot);
  const snapshotHash = createShareSnapshotHash(shareData);
  const existingShareId = await findShareIdByHash(snapshotHash);

  if (existingShareId) {
    return existingShareId;
  }

  for (let attempt = 0; attempt < SHARE_ID_RETRY_LIMIT; attempt += 1) {
    const now = new Date();
    const shareId = createShareId();

    try {
      await collection.insertOne({
        createdAt: now,
        shareId,
        snapshot: shareData,
        snapshotHash,
        updatedAt: now,
      });

      return shareId;
    } catch (error: unknown) {
      const shareIdFromConcurrentInsert = await findShareIdByHash(snapshotHash);

      if (shareIdFromConcurrentInsert) {
        return shareIdFromConcurrentInsert;
      }

      const isLastAttempt = attempt === SHARE_ID_RETRY_LIMIT - 1;

      if (isLastAttempt || !isDuplicateKeyError(error)) {
        throw error;
      }
    }
  }

  throw new Error("Failed to create share snapshot id");
};

export const findShareSnapshotById = async (
  shareId: string,
): Promise<ClusterShareSnapshot | null> => {
  const collection = await getShareSnapshotCollection();
  const document = await collection.findOne(
    { shareId },
    { projection: { snapshot: 1 } },
  );

  if (!document) {
    return null;
  }

  return parseSnapshotData(document.snapshot);
};
