export const DATABASE_ENV_KEYS = {
  uri: "MONGODB_URI",
  database: "MONGODB_DB_NAME",
} as const;

export const DATABASE_DEFAULT_CONFIG = {
  database: "soundcluster",
} as const;

export const DATABASE_CONNECTED_MESSAGE = "Database Connected!";
export const ANALYSIS_CACHE_COLLECTION_NAME = "analysis_cache";
export const SHARE_SNAPSHOT_COLLECTION_NAME = "share_snapshots";
