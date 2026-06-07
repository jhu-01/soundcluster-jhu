import { ANALYSIS_CACHE_TABLE_NAME } from "../../../shared/constants/database.js";

export const createAnalysisCacheTableSql = `
  CREATE TABLE IF NOT EXISTS ${ANALYSIS_CACHE_TABLE_NAME} (
    cache_key CHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    analysis_json JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_analysis_cache_title_artist (title, artist)
  )
`;
