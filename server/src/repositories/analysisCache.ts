import { createHash } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";

import type {
  MusicAnalysisResponse,
  MusicMetadata,
} from "../../../shared/types/musicAnalysis.js";
import { ANALYSIS_CACHE_TABLE_NAME } from "../../../shared/constants/database.js";
import { databasePool } from "../config/db.js";

interface AnalysisCacheRow extends RowDataPacket {
  analysis_json: MusicAnalysisResponse | string;
}

export const createAnalysisCacheKey = (
  title: string,
  artist: string,
): string => {
  const normalizedTitle = title.trim().toLowerCase();
  const normalizedArtist = artist.trim().toLowerCase();

  return createHash("sha256")
    .update(`${normalizedTitle}:${normalizedArtist}`)
    .digest("hex");
};

export const findAnalysisCacheByKey = async (
  cacheKey: string,
): Promise<MusicAnalysisResponse | null> => {
  const [rows] = await databasePool.query<AnalysisCacheRow[]>(
    `SELECT analysis_json FROM ${ANALYSIS_CACHE_TABLE_NAME} WHERE cache_key = ? LIMIT 1`,
    [cacheKey],
  );

  const [row] = rows;

  if (!row) {
    return null;
  }

  if (typeof row.analysis_json === "string") {
    return JSON.parse(row.analysis_json) as MusicAnalysisResponse;
  }

  return row.analysis_json;
};

export const saveAnalysisCache = async (
  cacheKey: string,
  metadata: MusicMetadata,
  analysis: MusicAnalysisResponse,
): Promise<void> => {
  await databasePool.execute(
    `INSERT INTO ${ANALYSIS_CACHE_TABLE_NAME} (cache_key, title, artist, analysis_json)
     VALUES (?, ?, ?, CAST(? AS JSON))
     ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       artist = VALUES(artist),
       analysis_json = VALUES(analysis_json)`,
    [cacheKey, metadata.title, metadata.artist, JSON.stringify(analysis)],
  );
};
