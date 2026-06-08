import {
  lazy,
  Suspense,
  useCallback,
  useMemo,
  useState,
} from "react";

import { ANALYZE_CACHE_HIT_MESSAGE } from "../../shared/constants/analyzeStream";
import type { ItunesTrackMetadata } from "../../shared/types/itunes";
import type { MusicAnalysisResponse } from "../../shared/types/musicAnalysis";
import { ControlPanel } from "./components/ControlPanel";
import { ItunesSearchPanel } from "./components/ItunesSearchPanel";
import { SearchBar } from "./components/SearchBar";
import { ShareModal } from "./components/ShareModal";
import { SnapshotDebugPanel } from "./components/SnapshotDebugPanel";
import { StreamingLogViewer } from "./components/StreamingLogViewer";
import { TrackHoverCard } from "./components/TrackHoverCard";
import {
  DEFAULT_AXIS_SELECTION,
  MIN_ACTIVE_AXIS_COUNT,
  type AxisSelection,
  type EmotionAxis,
} from "./constants/emotionControls";
import { AnalysisProvider } from "./context/AnalysisProvider";
import { useAnalysis } from "./context/AnalysisContext";
import { mockTracks } from "./data/mockTracks";
import styles from "./App.module.css";
import type { ClusterShareSnapshot } from "./types/shareSnapshot";
import { findSnapshotTrack } from "./utils/snapshotSelection";
import {
  createShareSnapshotUrl,
  readShareSnapshotFromLocation,
} from "./utils/shareSnapshot";
import { createTrackRelationSummary } from "./utils/trackRelations";

const StarsCanvas = lazy(() =>
  import("./canvas/StarsCanvas").then((module) => ({
    default: module.StarsCanvas,
  })),
);

const countActiveAxes = (axisSelection: AxisSelection): number => {
  return Object.values(axisSelection).filter(Boolean).length;
};

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

const applyAnalysisResultToSnapshot = (
  snapshot: ClusterShareSnapshot,
  result: MusicAnalysisResponse,
): ClusterShareSnapshot => {
  const targetTrackId = snapshot.selectedTrackId ?? snapshot.tracks[0]?.id;

  if (!targetTrackId) {
    return snapshot;
  }

  return {
    ...snapshot,
    selectedTrackId: targetTrackId,
    tracks: snapshot.tracks.map((track) => {
      if (track.id !== targetTrackId) {
        return track;
      }

      return {
        ...track,
        emotions: result.emotions,
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

function SoundClusterApp() {
  const { state } = useAnalysis();
  const initialSnapshot = useMemo(() => {
    return readShareSnapshotFromLocation(window.location.search);
  }, []);
  const [snapshot, setSnapshot] = useState<ClusterShareSnapshot>(
    initialSnapshot ?? createDefaultSnapshot(),
  );
  const [axisSelection, setAxisSelection] = useState<AxisSelection>(
    DEFAULT_AXIS_SELECTION,
  );
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);
  const visibleSnapshot = useMemo(() => {
    if (!state.result) {
      return snapshot;
    }

    return applyAnalysisResultToSnapshot(snapshot, state.result);
  }, [snapshot, state.result]);
  const previewTrack = useMemo(() => {
    if (!previewTrackId) {
      return null;
    }

    return findSnapshotTrack(visibleSnapshot.tracks, previewTrackId);
  }, [previewTrackId, visibleSnapshot.tracks]);
  const relation = useMemo(() => {
    return createTrackRelationSummary(
      visibleSnapshot.tracks,
      visibleSnapshot.selectedTrackId,
    );
  }, [visibleSnapshot.selectedTrackId, visibleSnapshot.tracks]);
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
  const isCacheHit = useMemo(() => {
    return state.events.some((event) => event.message === ANALYZE_CACHE_HIT_MESSAGE);
  }, [state.events]);
  const toggleAxis = useCallback((axis: EmotionAxis): void => {
    setAxisSelection((previousSelection) => {
      const nextValue = !previousSelection[axis];

      if (!nextValue && countActiveAxes(previousSelection) <= MIN_ACTIVE_AXIS_COUNT) {
        return previousSelection;
      }

      return {
        ...previousSelection,
        [axis]: nextValue,
      };
    });
  }, []);
  const mutateSnapshot = useCallback(() => {
    const nextSnapshot = createMutatedSnapshot(visibleSnapshot);

    window.history.replaceState(
      null,
      "",
      createShareSnapshotUrl(nextSnapshot, window.location.href),
    );
    setSnapshot(nextSnapshot);
  }, [visibleSnapshot]);
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
          axisSelection={axisSelection}
          onPreviewTrack={setPreviewTrackId}
          onSnapshotChange={setSnapshot}
          relation={relation}
          snapshot={visibleSnapshot}
        />
      </Suspense>
      <TrackHoverCard
        relationLabel={previewRelationLabel}
        track={previewTrack}
      />
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <strong>SoundCluster</strong>
          <span>emotion mapped music space</span>
        </div>
        <SearchBar />
      </header>
      <div className={styles.rightRail}>
        <ControlPanel
          axisSelection={axisSelection}
          onToggleAxis={toggleAxis}
        />
        <StreamingLogViewer
          events={state.events}
          isCacheHit={isCacheHit}
          result={state.result}
          status={state.status}
        />
      </div>
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
            snapshot={visibleSnapshot}
          />
        </>
      ) : null}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        snapshot={visibleSnapshot}
      />
    </main>
  );
}

export default function App() {
  return (
    <AnalysisProvider>
      <SoundClusterApp />
    </AnalysisProvider>
  );
}
