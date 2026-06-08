import { lazy, Suspense, useCallback, useMemo, useState } from "react";

import type { ItunesTrackMetadata } from "../../shared/types/itunes";
import { ItunesSearchPanel } from "./components/ItunesSearchPanel";
import { ShareModal } from "./components/ShareModal";
import { SnapshotDebugPanel } from "./components/SnapshotDebugPanel";
import { TrackHoverCard } from "./components/TrackHoverCard";
import { mockTracks } from "./data/mockTracks";
import styles from "./App.module.css";
import type { ClusterShareSnapshot } from "./types/shareSnapshot";
import { createTrackRelationSummary } from "./utils/trackRelations";
import { findSnapshotTrack } from "./utils/snapshotSelection";
import {
  createShareSnapshotUrl,
  readShareSnapshotFromLocation,
} from "./utils/shareSnapshot";

const StarsCanvas = lazy(() =>
  import("./canvas/StarsCanvas").then((module) => ({
    default: module.StarsCanvas,
  })),
);

const createDefaultSnapshot = (): ClusterShareSnapshot => {
  return {
    version: 1,
    selectedTrackId: null,
    cameraPosition: [6.4, 4.8, 7.6],
    cameraTarget: [0, 0, 0],
    tracks: mockTracks,
  };
};

const clampUnitValue = (value: number): number => {
  return Math.max(0, Math.min(1, value));
};

const createMutatedSnapshot = (
  snapshot: ClusterShareSnapshot,
): ClusterShareSnapshot => {
  const targetTrackId = snapshot.selectedTrackId ?? snapshot.tracks[0]?.id;

  return {
    ...snapshot,
    selectedTrackId: targetTrackId ?? null,
    tracks: snapshot.tracks.map((track) => {
      if (track.id !== targetTrackId) {
        return track;
      }

      return {
        ...track,
        emotions: {
          ...track.emotions,
          energy: clampUnitValue(track.emotions.energy + 0.11),
          valence: clampUnitValue(track.emotions.valence - 0.09),
          tension: clampUnitValue(track.emotions.tension + 0.13),
        },
      };
    }),
  };
};

const createTrackFromItunesMetadata = (
  track: ItunesTrackMetadata,
): ClusterShareSnapshot["tracks"][number] => {
  return {
    id: track.itunesTrackId,
    itunesTrackId: track.itunesTrackId,
    itunesUrl: track.itunesUrl,
    albumImageUrl: track.albumImageUrl,
    title: track.title,
    artist: track.artist,
    emotions: {
      energy: 0.5,
      valence: 0.5,
      tempoDensity: 0.5,
      spaceDepth: 0.5,
      tension: 0.5,
    },
  };
};

export default function App() {
  const initialSnapshot = useMemo(() => {
    return readShareSnapshotFromLocation(window.location.search);
  }, []);
  const [snapshot, setSnapshot] = useState<ClusterShareSnapshot>(
    initialSnapshot ?? createDefaultSnapshot(),
  );
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);
  const previewTrack = useMemo(() => {
    if (!previewTrackId) {
      return null;
    }

    return findSnapshotTrack(snapshot.tracks, previewTrackId);
  }, [previewTrackId, snapshot.tracks]);
  const relation = useMemo(() => {
    return createTrackRelationSummary(snapshot.tracks, snapshot.selectedTrackId);
  }, [snapshot.selectedTrackId, snapshot.tracks]);
  const previewRelationLabel = useMemo(() => {
    if (!previewTrack || !relation) {
      return null;
    }

    if (previewTrack.id === relation.selectedTrackId) {
      return "Selected";
    }

    if (previewTrack.id === relation.nearestTrackId) {
      return `Nearest ${relation.nearestDistance.toFixed(3)}`;
    }

    if (previewTrack.id === relation.farthestTrackId) {
      return `Farthest ${relation.farthestDistance.toFixed(3)}`;
    }

    return null;
  }, [previewTrack, relation]);
  const mutateSnapshot = useCallback(() => {
    const nextSnapshot = createMutatedSnapshot(snapshot);

    window.history.replaceState(
      null,
      "",
      createShareSnapshotUrl(nextSnapshot, window.location.href),
    );
    setSnapshot(nextSnapshot);
  }, [snapshot]);
  const bindItunesTrack = useCallback((track: ItunesTrackMetadata) => {
    setSnapshot((currentSnapshot) => {
      const nextTrack = createTrackFromItunesMetadata(track);
      const nextTracks = [
        nextTrack,
        ...currentSnapshot.tracks.filter(
          (snapshotTrack) => snapshotTrack.id !== nextTrack.id,
        ),
      ];

      return {
        ...currentSnapshot,
        selectedTrackId: nextTrack.id,
        tracks: nextTracks,
      };
    });
  }, []);

  return (
    <main className={styles.shell}>
      <Suspense
        fallback={<div className={styles.canvasFallback}>Loading 3D space</div>}
      >
        <StarsCanvas
          onPreviewTrack={setPreviewTrackId}
          onSnapshotChange={setSnapshot}
          relation={relation}
          snapshot={snapshot}
        />
      </Suspense>
      <TrackHoverCard relationLabel={previewRelationLabel} track={previewTrack} />
      <button
        className={styles.shareButton}
        onClick={() => setIsShareOpen(true)}
        type="button"
      >
        Share
      </button>
      {import.meta.env.DEV ? (
        <>
          <ItunesSearchPanel onSelectTrack={bindItunesTrack} />
          <SnapshotDebugPanel
            onMutateSnapshot={mutateSnapshot}
            snapshot={snapshot}
          />
        </>
      ) : null}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        snapshot={snapshot}
      />
    </main>
  );
}
