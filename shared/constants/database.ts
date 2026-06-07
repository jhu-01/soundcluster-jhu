export const DATABASE_ENV_KEYS = {
  host: "DB_HOST",
  port: "DB_PORT",
  user: "DB_USER",
  password: "DB_PASSWORD",
  database: "DB_NAME",
  connectionLimit: "DB_CONNECTION_LIMIT",
} as const;

export const DATABASE_DEFAULT_CONFIG = {
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "",
  database: "soundcluster",
  connectionLimit: 10,
} as const;

export const DATABASE_CONNECTED_MESSAGE = "Database Connected!";
export const ANALYSIS_CACHE_TABLE_NAME = "analysis_cache";
