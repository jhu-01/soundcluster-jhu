import { MongoClient, type Db } from "mongodb";

import {
  ANALYSIS_CACHE_COLLECTION_NAME,
  DATABASE_CONNECTED_MESSAGE,
  DATABASE_DEFAULT_CONFIG,
  DATABASE_ENV_KEYS,
  SHARE_SNAPSHOT_COLLECTION_NAME,
} from "../../../shared/constants/database.js";
import { readStringEnv } from "./env.js";

let mongoClient: MongoClient | null = null;
let database: Db | null = null;

export const getDatabase = async (): Promise<Db> => {
  const databaseUri = readStringEnv(DATABASE_ENV_KEYS.uri, "");

  if (!databaseUri) {
    throw new Error(`${DATABASE_ENV_KEYS.uri} is required`);
  }

  if (!mongoClient) {
    mongoClient = new MongoClient(databaseUri);
  }

  if (!database) {
    await mongoClient.connect();
    const databaseName = readStringEnv(
      DATABASE_ENV_KEYS.database,
      DATABASE_DEFAULT_CONFIG.database,
    );

    database = mongoClient.db(databaseName);
  }

  return database;
};

const ensureIndexes = async (db: Db): Promise<void> => {
  await Promise.all([
    db
      .collection(ANALYSIS_CACHE_COLLECTION_NAME)
      .createIndex({ cacheKey: 1 }, { unique: true }),
    db
      .collection(ANALYSIS_CACHE_COLLECTION_NAME)
      .createIndex({ title: 1, artist: 1 }),
    db
      .collection(ANALYSIS_CACHE_COLLECTION_NAME)
      .createIndex({
        "emotions.energy": 1,
        "emotions.valence": 1,
        "emotions.tempoDensity": 1,
        "emotions.spaceDepth": 1,
        "emotions.tension": 1,
      }),
    db
      .collection(SHARE_SNAPSHOT_COLLECTION_NAME)
      .createIndex({ shareId: 1 }, { unique: true }),
    db
      .collection(SHARE_SNAPSHOT_COLLECTION_NAME)
      .createIndex({ snapshotHash: 1 }, { unique: true }),
  ]);
};

export const checkDatabaseConnection = async (): Promise<void> => {
  const db = await getDatabase();

  await db.command({ ping: 1 });
  await ensureIndexes(db);
  console.log(DATABASE_CONNECTED_MESSAGE);
};

export const closeDatabase = async (): Promise<void> => {
  if (!mongoClient) {
    return;
  }

  await mongoClient.close();
  mongoClient = null;
  database = null;
};
