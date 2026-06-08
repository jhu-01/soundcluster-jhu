import { createHash } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";

import type {
  EmotionVector,
  MusicAnalysisResponse,
  MusicMetadata,
} from "../../../shared/types/musicAnalysis.js";
import { ANALYSIS_CACHE_TABLE_NAME } from "../../../shared/constants/database.js";
import { databasePool } from "../config/db.js";

interface AnalysisCacheRow extends RowDataPacket {
  analysis_json: MusicAnalysisResponse | string;
}

interface AnalysisHistoryRow extends RowDataPacket {
  cache_key: string;
  title: string;
  artist: string;
  analysis_json: MusicAnalysisResponse | string;
  energy: number;
  valence: number;
  tempo_density: number;
  space_depth: number;
  tension: number;
  created_at: Date;
  updated_at: Date;
}

export interface AnalysisHistoryItem {
  cacheKey: string;
  title: string;
  artist: string;
  emotions: EmotionVector;
  analysis: MusicAnalysisResponse;
  createdAt: string;
  updatedAt: string;
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

const parseAnalysisJson = (
  analysisJson: MusicAnalysisResponse | string,
): MusicAnalysisResponse => {
  if (typeof analysisJson === "string") {
    return JSON.parse(analysisJson) as MusicAnalysisResponse;
  }

  return analysisJson;
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

  return parseAnalysisJson(row.analysis_json);
};

export const saveAnalysisCache = async (
  cacheKey: string,
  metadata: MusicMetadata,
  analysis: MusicAnalysisResponse,
): Promise<void> => {
  const { energy, valence, tempoDensity, spaceDepth, tension } =
    analysis.emotions;

  await databasePool.execute(
    `INSERT INTO ${ANALYSIS_CACHE_TABLE_NAME} (
       cache_key,
       title,
       artist,
       analysis_json,
       energy,
       valence,
       tempo_density,
       space_depth,
       tension
     )
     VALUES (?, ?, ?, CAST(? AS JSON), ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       artist = VALUES(artist),
       analysis_json = VALUES(analysis_json),
       energy = VALUES(energy),
       valence = VALUES(valence),
       tempo_density = VALUES(tempo_density),
       space_depth = VALUES(space_depth),
       tension = VALUES(tension)`,
    [
      cacheKey,
      metadata.title,
      metadata.artist,
      JSON.stringify(analysis),
      energy,
      valence,
      tempoDensity,
      spaceDepth,
      tension,
    ],
  );
};

export const findAnalysisHistoryBySong = async (
  title: string,
  artist: string,
): Promise<AnalysisHistoryItem[]> => {
  const cacheKey = createAnalysisCacheKey(title, artist);
  const [rows] = await databasePool.query<AnalysisHistoryRow[]>(
    `SELECT
       cache_key,
       title,
       artist,
       analysis_json,
       energy,
       valence,
       tempo_density,
       space_depth,
       tension,
       created_at,
       updated_at
     FROM ${ANALYSIS_CACHE_TABLE_NAME}
     WHERE cache_key = ?
     ORDER BY updated_at DESC`,
    [cacheKey],
  );

  return rows.map((row) => {
    const analysis = parseAnalysisJson(row.analysis_json);

    return {
      cacheKey: row.cache_key,
      title: row.title,
      artist: row.artist,
      emotions: {
        energy: row.energy,
        valence: row.valence,
        tempoDensity: row.tempo_density,
        spaceDepth: row.space_depth,
        tension: row.tension,
      },
      analysis,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  });
};
