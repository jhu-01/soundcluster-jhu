import { createHash } from "node:crypto";

import type {
  EmotionVector,
  MusicAnalysisResponse,
  MusicMetadata,
} from "../../../shared/types/musicAnalysis.js";
import { ANALYSIS_CACHE_COLLECTION_NAME } from "../../../shared/constants/database.js";
import { getDatabase } from "../config/db.js";

interface AnalysisCacheDocument {
  cacheKey: string;
  title: string;
  artist: string;
  analysis: MusicAnalysisResponse;
  emotions: EmotionVector;
  createdAt: Date;
  updatedAt: Date;
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

const getAnalysisCacheCollection = async () => {
  const db = await getDatabase();

  return db.collection<AnalysisCacheDocument>(ANALYSIS_CACHE_COLLECTION_NAME);
};

export const findAnalysisCacheByKey = async (
  cacheKey: string,
): Promise<MusicAnalysisResponse | null> => {
  const collection = await getAnalysisCacheCollection();
  const document = await collection.findOne(
    { cacheKey },
    { projection: { analysis: 1 } },
  );

  return document?.analysis ?? null;
};

export const saveAnalysisCache = async (
  cacheKey: string,
  metadata: MusicMetadata,
  analysis: MusicAnalysisResponse,
): Promise<void> => {
  const collection = await getAnalysisCacheCollection();
  const now = new Date();

  await collection.updateOne(
    { cacheKey },
    {
      $set: {
        analysis,
        artist: metadata.artist,
        emotions: analysis.emotions,
        title: metadata.title,
        updatedAt: now,
      },
      $setOnInsert: {
        cacheKey,
        createdAt: now,
      },
    },
    { upsert: true },
  );
};

export const findAnalysisHistoryBySong = async (
  title: string,
  artist: string,
): Promise<AnalysisHistoryItem[]> => {
  const cacheKey = createAnalysisCacheKey(title, artist);
  const collection = await getAnalysisCacheCollection();
  const documents = await collection
    .find({ cacheKey })
    .sort({ updatedAt: -1 })
    .toArray();

  return documents.map((document) => {
    return {
      analysis: document.analysis,
      artist: document.artist,
      cacheKey: document.cacheKey,
      createdAt: document.createdAt.toISOString(),
      emotions: document.emotions,
      title: document.title,
      updatedAt: document.updatedAt.toISOString(),
    };
  });
};
