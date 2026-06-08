import {
  ANALYSIS_CACHE_TABLE_NAME,
  SHARE_SNAPSHOT_TABLE_NAME,
} from "../../../shared/constants/database.js";

export const analysisCacheEmotionColumns = [
  { name: "energy", jsonPath: "$.emotions.energy" },
  { name: "valence", jsonPath: "$.emotions.valence" },
  { name: "tempo_density", jsonPath: "$.emotions.tempoDensity" },
  { name: "space_depth", jsonPath: "$.emotions.spaceDepth" },
  { name: "tension", jsonPath: "$.emotions.tension" },
] as const;

export const ANALYSIS_CACHE_EMOTION_INDEX_NAME = "idx_analysis_cache_emotions";
export const SHARE_SNAPSHOT_HASH_INDEX_NAME = "idx_share_snapshots_hash";

export const createAnalysisCacheTableSql = `
  CREATE TABLE IF NOT EXISTS ${ANALYSIS_CACHE_TABLE_NAME} (
    cache_key CHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    analysis_json JSON NOT NULL,
    energy DOUBLE NULL,
    valence DOUBLE NULL,
    tempo_density DOUBLE NULL,
    space_depth DOUBLE NULL,
    tension DOUBLE NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_analysis_cache_title_artist (title, artist),
    INDEX ${ANALYSIS_CACHE_EMOTION_INDEX_NAME} (
      energy,
      valence,
      tempo_density,
      space_depth,
      tension
    )
  )
`;

export const createShareSnapshotTableSql = `
  CREATE TABLE IF NOT EXISTS ${SHARE_SNAPSHOT_TABLE_NAME} (
    share_id VARCHAR(32) PRIMARY KEY,
    snapshot_hash CHAR(64) NULL,
    snapshot_json JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX ${SHARE_SNAPSHOT_HASH_INDEX_NAME} (snapshot_hash)
  )
`;

export const selectShareSnapshotColumnNamesSql = `
  SELECT COLUMN_NAME
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = '${SHARE_SNAPSHOT_TABLE_NAME}'
`;

export const selectShareSnapshotHashIndexSql = `
  SELECT INDEX_NAME
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = '${SHARE_SNAPSHOT_TABLE_NAME}'
    AND INDEX_NAME = '${SHARE_SNAPSHOT_HASH_INDEX_NAME}'
  LIMIT 1
`;

export const createAddShareSnapshotHashColumnSql = `
  ALTER TABLE ${SHARE_SNAPSHOT_TABLE_NAME} ADD COLUMN snapshot_hash CHAR(64) NULL
`;

export const createShareSnapshotHashIndexSql = `
  CREATE UNIQUE INDEX ${SHARE_SNAPSHOT_HASH_INDEX_NAME}
  ON ${SHARE_SNAPSHOT_TABLE_NAME} (snapshot_hash)
`;

export const selectAnalysisCacheColumnNamesSql = `
  SELECT COLUMN_NAME
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = '${ANALYSIS_CACHE_TABLE_NAME}'
`;

export const selectAnalysisCacheEmotionIndexSql = `
  SELECT INDEX_NAME
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = '${ANALYSIS_CACHE_TABLE_NAME}'
    AND INDEX_NAME = '${ANALYSIS_CACHE_EMOTION_INDEX_NAME}'
  LIMIT 1
`;

export const createAnalysisCacheEmotionIndexSql = `
  CREATE INDEX ${ANALYSIS_CACHE_EMOTION_INDEX_NAME}
  ON ${ANALYSIS_CACHE_TABLE_NAME} (
    energy,
    valence,
    tempo_density,
    space_depth,
    tension
  )
`;

export const createAddAnalysisCacheEmotionColumnSql = (
  columnName: string,
): string => {
  return `ALTER TABLE ${ANALYSIS_CACHE_TABLE_NAME} ADD COLUMN ${columnName} DOUBLE NULL`;
};

export const backfillAnalysisCacheEmotionColumnsSql = `
  UPDATE ${ANALYSIS_CACHE_TABLE_NAME}
  SET
    energy = COALESCE(
      energy,
      CAST(JSON_UNQUOTE(JSON_EXTRACT(analysis_json, '$.emotions.energy')) AS DECIMAL(6,5))
    ),
    valence = COALESCE(
      valence,
      CAST(JSON_UNQUOTE(JSON_EXTRACT(analysis_json, '$.emotions.valence')) AS DECIMAL(6,5))
    ),
    tempo_density = COALESCE(
      tempo_density,
      CAST(JSON_UNQUOTE(JSON_EXTRACT(analysis_json, '$.emotions.tempoDensity')) AS DECIMAL(6,5))
    ),
    space_depth = COALESCE(
      space_depth,
      CAST(JSON_UNQUOTE(JSON_EXTRACT(analysis_json, '$.emotions.spaceDepth')) AS DECIMAL(6,5))
    ),
    tension = COALESCE(
      tension,
      CAST(JSON_UNQUOTE(JSON_EXTRACT(analysis_json, '$.emotions.tension')) AS DECIMAL(6,5))
    )
`;
