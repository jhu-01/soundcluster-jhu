import { customAlphabet } from "nanoid";
import type { RowDataPacket } from "mysql2/promise";

import {
  SHARE_SNAPSHOT_ID_LENGTH,
} from "../../../shared/constants/shareSnapshot.js";
import { SHARE_SNAPSHOT_TABLE_NAME } from "../../../shared/constants/database.js";
import type { ClusterShareSnapshot } from "../../../shared/types/shareSnapshot.js";
import { isClusterShareSnapshot } from "../../../shared/utils/shareSnapshotValidation.js";
import { databasePool } from "../config/db.js";

interface ShareSnapshotRow extends RowDataPacket {
  snapshot_json: ClusterShareSnapshot | string;
}

const SHARE_ID_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const createShareId = customAlphabet(
  SHARE_ID_ALPHABET,
  SHARE_SNAPSHOT_ID_LENGTH,
);
const SHARE_ID_RETRY_LIMIT = 5;

const parseSnapshotJson = (
  snapshotJson: ClusterShareSnapshot | string,
): ClusterShareSnapshot | null => {
  const parsedSnapshot =
    typeof snapshotJson === "string"
      ? (JSON.parse(snapshotJson) as unknown)
      : snapshotJson;

  return isClusterShareSnapshot(parsedSnapshot) ? parsedSnapshot : null;
};

export const saveShareSnapshot = async (
  snapshot: ClusterShareSnapshot,
): Promise<string> => {
  for (let attempt = 0; attempt < SHARE_ID_RETRY_LIMIT; attempt += 1) {
    const shareId = createShareId();

    try {
      await databasePool.execute(
        `INSERT INTO ${SHARE_SNAPSHOT_TABLE_NAME} (share_id, snapshot_json)
         VALUES (?, CAST(? AS JSON))`,
        [shareId, JSON.stringify(snapshot)],
      );

      return shareId;
    } catch (error: unknown) {
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
