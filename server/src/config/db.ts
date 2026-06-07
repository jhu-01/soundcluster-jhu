import mysql, { type PoolOptions } from "mysql2/promise";

import {
  DATABASE_CONNECTED_MESSAGE,
  DATABASE_DEFAULT_CONFIG,
  DATABASE_ENV_KEYS,
} from "../../../shared/constants/database.js";
import { readNumberEnv, readStringEnv } from "./env.js";
import { createAnalysisCacheTableSql } from "../database/schema.js";

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

export const checkDatabaseConnection = async (): Promise<void> => {
  const connection = await databasePool.getConnection();

  try {
    await connection.ping();
    await connection.query(createAnalysisCacheTableSql);
    console.log(DATABASE_CONNECTED_MESSAGE);
  } finally {
    connection.release();
  }
};
