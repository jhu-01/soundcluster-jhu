import assert from "node:assert/strict";
import { after, describe, it } from "node:test";

import {
  ANALYZE_STREAM_EVENTS,
  ANALYZE_CACHE_MISS_EVENTS,
} from "../shared/constants/analyzeStream.js";
import { mapEmotionVectorToScenePoint } from "../shared/utils/emotionToPoint.js";
import { databasePool } from "../server/src/config/db.js";
import { stripLrclibSyncedLyrics } from "../server/src/config/lyrics.js";
import { createAnalysisCacheKey } from "../server/src/repositories/analysisCache.js";
import { buildAnalysisRequest } from "../server/src/services/analyzeService.js";
import { parseMusicAnalysisResponse } from "../server/src/validation/musicAnalysis.js";

after(async () => {
  await databasePool.end();
});

describe("analysis pipeline contracts", () => {
  it("normalizes title and artist before creating cache keys", () => {
    const normalizedKey = createAnalysisCacheKey("Midnight Circuit", "SoundCluster Lab");
    const noisyKey = createAnalysisCacheKey(
      "  midnight circuit  ",
      "  SOUNDCLUSTER LAB  ",
    );

    assert.equal(noisyKey, normalizedKey);
  });

  it("rejects Gemini emotion values outside the unit range", () => {
    const invalidPayload = {
      analysisStatus: "success",
      musicId: "invalid-track",
      emotions: {
        energy: 1.2,
        valence: 0.4,
        tempoDensity: 0.5,
        spaceDepth: 0.6,
        tension: 0.7,
      },
      generatedSummary: "Invalid energy should fail validation.",
    };

    assert.throws(
      () => parseMusicAnalysisResponse(JSON.stringify(invalidPayload)),
      /energy must be a number between 0\.0 and 1\.0/,
    );
  });

  it("keeps SSE fixture statuses in fetching, analyzing, done order", () => {
    assert.deepEqual(
      ANALYZE_STREAM_EVENTS.map((event) => event.status),
      ["fetching", "fetching", "analyzing", "analyzing", "done"],
    );
    assert.deepEqual(
      ANALYZE_CACHE_MISS_EVENTS.map((event) => event.status),
      ["fetching", "fetching", "analyzing", "analyzing"],
    );
    assert.equal(ANALYZE_STREAM_EVENTS.at(-1)?.progress, 100);
  });

  it("maps a 5D emotion vector to a stable 3D scene point", () => {
    const scenePoint = mapEmotionVectorToScenePoint({
      energy: 0.72,
      valence: 0.42,
      tempoDensity: 0.68,
      spaceDepth: 0.75,
      tension: 0.55,
    });

    assert.deepEqual(
      scenePoint.position.map((value) => Number(value.toFixed(3))),
      [1.672, 1.368, -0.608],
    );
    assert.equal(scenePoint.color, "hsl(207 86% 61%)");
    assert.equal(Number(scenePoint.scale.toFixed(3)), 0.323);
    assert.equal(Number(scenePoint.intensity.toFixed(3)), 1.796);
  });

  it("builds analysis requests without dummy fallback lyrics", () => {
    const analysisRequest = buildAnalysisRequest({
      artist: "Sample Artist",
      title: "Sample Song",
    });

    assert.equal(analysisRequest.musicMetadata.lyrics, "");
  });

  it("strips LRCLIB synced timestamps before using lyrics", () => {
    const lyrics = stripLrclibSyncedLyrics(
      "[00:10.00]First line\n[00:12.50][00:12.80]Second line",
    );

    assert.equal(lyrics, "First line\nSecond line");
  });
});
