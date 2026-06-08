import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ClusterShareTrack } from "../client/src/types/shareSnapshot.js";
import { createTrackRelationSummary } from "../client/src/utils/trackRelations.js";

const createTrack = (
  id: string,
  values: [number, number, number, number, number],
): ClusterShareTrack => {
  return {
    id,
    title: id,
    artist: "fixture",
    emotions: {
      energy: values[0],
      valence: values[1],
      tempoDensity: values[2],
      spaceDepth: values[3],
      tension: values[4],
    },
  };
};

describe("track relation summary", () => {
  const tracks = [
    createTrack("selected", [0.5, 0.5, 0.5, 0.5, 0.5]),
    createTrack("near", [0.52, 0.49, 0.5, 0.5, 0.51]),
    createTrack("far", [0.1, 0.9, 0.2, 0.8, 0.1]),
  ];

  it("finds nearest and farthest tracks from a selected 5D emotion vector", () => {
    const relation = createTrackRelationSummary(tracks, "selected");

    assert.equal(relation?.selectedTrackId, "selected");
    assert.equal(relation?.nearestTrackId, "near");
    assert.equal(relation?.farthestTrackId, "far");
    assert.equal(Number(relation?.nearestDistance.toFixed(3)), 0.024);
    assert.equal(Number(relation?.farthestDistance.toFixed(3)), 0.812);
  });

  it("recomputes relation targets when selected track changes", () => {
    const relation = createTrackRelationSummary(tracks, "far");

    assert.equal(relation?.selectedTrackId, "far");
    assert.equal(relation?.nearestTrackId, "selected");
    assert.equal(relation?.farthestTrackId, "near");
  });

  it("returns null when relation calculation has no valid selected track", () => {
    assert.equal(createTrackRelationSummary(tracks, null), null);
    assert.equal(createTrackRelationSummary(tracks, "missing"), null);
    assert.equal(createTrackRelationSummary([tracks[0]], "selected"), null);
  });
});
