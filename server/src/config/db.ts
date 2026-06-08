import mysql, { type PoolOptions, type RowDataPacket } from "mysql2/promise";

import {
  DATABASE_CONNECTED_MESSAGE,
  DATABASE_DEFAULT_CONFIG,
  DATABASE_ENV_KEYS,
} from "../../../shared/constants/database.js";
import { readNumberEnv, readStringEnv } from "./env.js";
import {
  ANALYSIS_CACHE_EMOTION_INDEX_NAME,
  SHARE_SNAPSHOT_HASH_INDEX_NAME,
  analysisCacheEmotionColumns,
  backfillAnalysisCacheEmotionColumnsSql,
  createAddAnalysisCacheEmotionColumnSql,
  createAddShareSnapshotHashColumnSql,
  createAnalysisCacheEmotionIndexSql,
  createAnalysisCacheTableSql,
  createShareSnapshotHashIndexSql,
  createShareSnapshotTableSql,
  selectAnalysisCacheColumnNamesSql,
  selectAnalysisCacheEmotionIndexSql,
  selectShareSnapshotColumnNamesSql,
  selectShareSnapshotHashIndexSql,
} from "../database/schema.js";

interface SchemaColumnRow extends RowDataPacket {
  COLUMN_NAME: string;
}

interface SchemaIndexRow extends RowDataPacket {
  INDEX_NAME: string;
}

const databasePoolOptions: PoolOptions = {
  host: readStringEnv(DATABASE_ENV_KEYS.host, DATABASE_DEFAULT_CONFIG.host),
  port: readNumberEnv(DATABASE_ENV_KEYS.port, DATABASE_DEFAULT_CONFIG.port),
  user: readStringEnv(DATABASE_ENV_KEYS.user, DATABASE_DEFAULT_CONFIG.user),
  password: readStringEnv(DATABASE_ENV_KEYS.password, DATABASE_DEFAULT_CONFIG.password),
  database: readStringEnv(DATABASE_ENV_KEYS.database, DATABASE_DEFAULT_CONFIG.database),
  connectionLimit: readNumberEnv(
    DATABASE_ENV_KEYS.connectionLimit,
    DATABASE_DEFAULT_CONFIG.connectionLimit,
  ),
};

export const databasePool = mysql.createPool(databasePoolOptions);

const ensureAnalysisCacheSchema = async (
  connection: mysql.PoolConnection,
): Promise<void> => {
  await connection.query(createAnalysisCacheTableSql);

  const [columnRows] = await connection.query<SchemaColumnRow[]>(
    selectAnalysisCacheColumnNamesSql,
  );
  const existingColumnNames = new Set(
    columnRows.map((row) => row.COLUMN_NAME),
  );

  for (const column of analysisCacheEmotionColumns) {
    if (!existingColumnNames.has(column.name)) {
      await connection.query(createAddAnalysisCacheEmotionColumnSql(column.name));
    }
  }

  await connection.query(backfillAnalysisCacheEmotionColumnsSql);

  const [indexRows] = await connection.query<SchemaIndexRow[]>(
    selectAnalysisCacheEmotionIndexSql,
  );
  const hasEmotionIndex = indexRows.some(
    (row) => row.INDEX_NAME === ANALYSIS_CACHE_EMOTION_INDEX_NAME,
  );

  if (!hasEmotionIndex) {
    await connection.query(createAnalysisCacheEmotionIndexSql);
  }
};

const ensureShareSnapshotSchema = async (
  connection: mysql.PoolConnection,
): Promise<void> => {
  await connection.query(createShareSnapshotTableSql);

  const [columnRows] = await connection.query<SchemaColumnRow[]>(
    selectShareSnapshotColumnNamesSql,
  );
  const existingColumnNames = new Set(
    columnRows.map((row) => row.COLUMN_NAME),
  );

  if (!existingColumnNames.has("snapshot_hash")) {
    await connection.query(createAddShareSnapshotHashColumnSql);
  }

  const [indexRows] = await connection.query<SchemaIndexRow[]>(
    selectShareSnapshotHashIndexSql,
  );
  const hasSnapshotHashIndex = indexRows.some(
    (row) => row.INDEX_NAME === SHARE_SNAPSHOT_HASH_INDEX_NAME,
  );

  if (!hasSnapshotHashIndex) {
    await connection.query(createShareSnapshotHashIndexSql);
  }
};

export const checkDatabaseConnection = async (): Promise<void> => {
  const connection = await databasePool.getConnection();

  try {
    await connection.ping();
    await ensureAnalysisCacheSchema(connection);
    await ensureShareSnapshotSchema(connection);
    console.log(DATABASE_CONNECTED_MESSAGE);
  } finally {
    connection.release();
  }
};
