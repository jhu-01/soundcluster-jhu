import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ClusterShareSnapshot } from "../client/src/types/shareSnapshot.js";
import {
  createShareSnapshotUrl,
  decodeShareSnapshot,
  encodeLegacyShareSnapshot,
  encodeShareSnapshot,
  readShareSnapshotFromLocation,
} from "../client/src/utils/shareSnapshot.js";

const snapshotFixture: ClusterShareSnapshot = {
  version: 1,
  selectedTrackId: "midnight-city",
  cameraPosition: [1.2345, -2.3456, 3.4567],
  cameraTarget: [0.1111, 0, -0.2222],
  tracks: [
    {
      id: "midnight-city",
      title: "Midnight City",
      artist: "M83",
      itunesTrackId: "828259377",
      itunesUrl:
        "https://music.apple.com/us/album/midnight-city/828259375?i=828259377&uo=4",
      albumImageUrl:
        "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/cb/7b/a9/cb7ba903-b5f1-cc21-90db-7a81b7aa0997/724596951057.jpg/300x300bb.jpg",
      emotions: {
        energy: 0.7245,
        valence: 0.4214,
        tempoDensity: 0.6826,
        spaceDepth: 0.7512,
        tension: 0.5538,
      },
    },
    {
      id: "soft-orbit",
      title: "Soft Orbit",
      artist: "Mira Field",
      albumImageUrl: null,
      emotions: {
        energy: 0.28,
        valence: 0.82,
        tempoDensity: 0.34,
        spaceDepth: 0.88,
        tension: 0.18,
      },
    },
  ],
};

describe("share snapshot encoding", () => {
  it("creates shorter compact snapshot URLs than legacy base64 JSON", () => {
    const compactSnapshot = encodeShareSnapshot(snapshotFixture);
    const legacySnapshot = encodeLegacyShareSnapshot(snapshotFixture);

    assert.match(compactSnapshot, /^c1\./);
    assert.ok(compactSnapshot.length < legacySnapshot.length);
  });

  it("restores compact snapshot URLs with stable quantized values", () => {
    const url = createShareSnapshotUrl(
      snapshotFixture,
      "http://127.0.0.1:5173/?view=cluster",
    );
    const restored = readShareSnapshotFromLocation(new URL(url).search);

    assert.equal(restored?.selectedTrackId, snapshotFixture.selectedTrackId);
    assert.deepEqual(restored?.cameraPosition, [1.235, -2.346, 3.457]);
    assert.deepEqual(restored?.cameraTarget, [0.111, 0, -0.222]);
    assert.equal(restored?.tracks[0]?.title, "Midnight City");
    assert.equal(restored?.tracks[0]?.artist, "M83");
    assert.equal(restored?.tracks[0]?.itunesTrackId, "828259377");
    assert.equal(restored?.tracks[0]?.albumImageUrl, snapshotFixture.tracks[0]?.albumImageUrl);
    assert.equal(restored?.tracks[1]?.albumImageUrl, null);
    assert.deepEqual(restored?.tracks[0]?.emotions, {
      energy: 0.725,
      valence: 0.421,
      tempoDensity: 0.683,
      spaceDepth: 0.751,
      tension: 0.554,
    });
  });

  it("keeps legacy base64 JSON snapshots readable", () => {
    const legacySnapshot = encodeLegacyShareSnapshot(snapshotFixture);

    assert.deepEqual(decodeShareSnapshot(legacySnapshot), snapshotFixture);
  });

  it("falls back to null for invalid snapshot queries", () => {
    assert.equal(decodeShareSnapshot("c1.not-valid"), null);
    assert.equal(decodeShareSnapshot("not-valid"), null);
  });
});
