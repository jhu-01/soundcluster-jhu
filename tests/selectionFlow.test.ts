import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ClusterShareSnapshot } from "../client/src/types/shareSnapshot.js";
import {
  decodeShareSnapshot,
  encodeShareSnapshot,
} from "../client/src/utils/shareSnapshot.js";
import { selectSnapshotTrack } from "../client/src/utils/snapshotSelection.js";
import { createTrackRelationSummary } from "../client/src/utils/trackRelations.js";

const snapshotFixture: ClusterShareSnapshot = {
  version: 1,
  selectedTrackId: "center",
  cameraPosition: [6.4, 4.8, 7.6],
  cameraTarget: [0, 0, 0],
  tracks: [
    {
      id: "center",
      title: "Center",
      artist: "Fixture",
      emotions: {
        energy: 0.5,
        valence: 0.5,
        tempoDensity: 0.5,
        spaceDepth: 0.5,
        tension: 0.5,
      },
    },
    {
      id: "near",
      title: "Near",
      artist: "Fixture",
      emotions: {
        energy: 0.51,
        valence: 0.49,
        tempoDensity: 0.5,
        spaceDepth: 0.5,
        tension: 0.5,
      },
    },
    {
      id: "far",
      title: "Far",
      artist: "Fixture",
      emotions: {
        energy: 0.1,
        valence: 0.9,
        tempoDensity: 0.2,
        spaceDepth: 0.8,
        tension: 0.1,
      },
    },
  ],
};

describe("selection relation flow", () => {
  it("keeps selectedTrackId as the only selection source in snapshot state", () => {
    const unchangedSnapshot = selectSnapshotTrack(snapshotFixture, "center");
    const missingSnapshot = selectSnapshotTrack(snapshotFixture, "missing");
    const changedSnapshot = selectSnapshotTrack(snapshotFixture, "near");

    assert.equal(unchangedSnapshot, snapshotFixture);
    assert.equal(missingSnapshot, snapshotFixture);
    assert.notEqual(changedSnapshot, snapshotFixture);
    assert.equal(changedSnapshot.selectedTrackId, "near");
  });

  it("recomputes nearest and farthest relation from the selected snapshot track", () => {
    const centerRelation = createTrackRelationSummary(
      snapshotFixture.tracks,
      snapshotFixture.selectedTrackId,
    );
    const nextSnapshot = selectSnapshotTrack(snapshotFixture, "far");
    const farRelation = createTrackRelationSummary(
      nextSnapshot.tracks,
      nextSnapshot.selectedTrackId,
    );

    assert.equal(centerRelation?.nearestTrackId, "near");
    assert.equal(centerRelation?.farthestTrackId, "far");
    assert.equal(farRelation?.nearestTrackId, "center");
    assert.equal(farRelation?.farthestTrackId, "near");
  });

  it("restores selected track from a share URL payload before relation calculation", () => {
    const nextSnapshot = selectSnapshotTrack(snapshotFixture, "far");
    const restoredSnapshot = decodeShareSnapshot(encodeShareSnapshot(nextSnapshot));
    const restoredRelation = createTrackRelationSummary(
      restoredSnapshot?.tracks ?? [],
      restoredSnapshot?.selectedTrackId ?? null,
    );

    assert.equal(restoredSnapshot?.selectedTrackId, "far");
    assert.equal(restoredRelation?.selectedTrackId, "far");
    assert.equal(restoredRelation?.nearestTrackId, "center");
  });
});
