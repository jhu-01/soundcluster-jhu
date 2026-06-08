import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { ItunesTrackMetadata } from "../../shared/types/itunes";
import type { MusicAnalysisResponse } from "../../shared/types/musicAnalysis";
import { ControlPanel } from "./components/ControlPanel";
import { ItunesSearchPanel } from "./components/ItunesSearchPanel";
import { SearchBar } from "./components/SearchBar";
import { ShareModal } from "./components/ShareModal";
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
import { applyAnalysisResultToSnapshotTrack } from "./utils/analysisSnapshot";
import { readShareSnapshotFromLocation } from "./utils/shareSnapshot";
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

const createFallbackLabel = (title: string): string => {
  return title.slice(0, 2).toUpperCase();
};

function SoundClusterApp() {
  const { state } = useAnalysis();
  const analysisTargetTrackIdRef = useRef<string | null>(null);
  const appliedAnalysisResultRef = useRef<MusicAnalysisResponse | null>(null);
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
  const visibleSnapshot = snapshot;
  const relation = useMemo(() => {
    return createTrackRelationSummary(
      visibleSnapshot.tracks,
      visibleSnapshot.selectedTrackId,
    );
  }, [visibleSnapshot.selectedTrackId, visibleSnapshot.tracks]);
  const selectedTrack = useMemo(() => {
    if (!visibleSnapshot.selectedTrackId) {
      return null;
    }

    return (
      visibleSnapshot.tracks.find(
        (track) => track.id === visibleSnapshot.selectedTrackId,
      ) ?? null
    );
  }, [visibleSnapshot.selectedTrackId, visibleSnapshot.tracks]);
  const ignorePreviewTrack = useCallback((trackId: string | null): void => {
    void trackId;
  }, []);
  const rememberAnalysisTarget = useCallback((): void => {
    analysisTargetTrackIdRef.current =
      snapshot.selectedTrackId ?? snapshot.tracks[0]?.id ?? null;
  }, [snapshot.selectedTrackId, snapshot.tracks]);
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

  useEffect(() => {
    if (!state.result || appliedAnalysisResultRef.current === state.result) {
      return;
    }

    const analysisResult = state.result;

    appliedAnalysisResultRef.current = analysisResult;
    setSnapshot((currentSnapshot) => {
      return applyAnalysisResultToSnapshotTrack(
        currentSnapshot,
        analysisResult,
        analysisTargetTrackIdRef.current,
      );
    });
  }, [state.result]);

  return (
    <main className={styles.shell}>
      <Suspense
        fallback={<div className={styles.canvasFallback}>Loading 3D space</div>}
      >
        <StarsCanvas
          axisSelection={axisSelection}
          onPreviewTrack={ignorePreviewTrack}
          onSnapshotChange={setSnapshot}
          relation={relation}
          snapshot={visibleSnapshot}
        />
      </Suspense>
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <strong>SoundCluster</strong>
          <span>emotion mapped music space</span>
        </div>
        <SearchBar onAnalyzeStart={rememberAnalysisTarget} />
      </header>
      <div className={styles.rightRail}>
        <ControlPanel
          axisSelection={axisSelection}
          onToggleAxis={toggleAxis}
        />
      </div>
      <button
        className={styles.shareButton}
        onClick={() => setIsShareOpen(true)}
        type="button"
      >
        <span className={styles.shareTitle}>Share Your Cluster</span>
        <span className={styles.shareHint}>Current view is ready to share.</span>
        <span className={styles.shareCta}>Share</span>
      </button>
      {import.meta.env.DEV ? (
        <ItunesSearchPanel onSelectTrack={bindItunesTrack} />
      ) : null}
      {selectedTrack ? (
        <aside className={styles.selectedTrackHud} aria-label="Selected track">
          {selectedTrack.albumImageUrl ? (
            <img
              alt={`${selectedTrack.title} album cover`}
              className={styles.selectedTrackImage}
              src={selectedTrack.albumImageUrl}
            />
          ) : (
            <span className={styles.selectedTrackFallback} aria-hidden="true">
              {createFallbackLabel(selectedTrack.title)}
            </span>
          )}
          <span className={styles.selectedTrackText}>
            <small>Selected</small>
            <strong>{selectedTrack.title}</strong>
            <span>{selectedTrack.artist}</span>
          </span>
        </aside>
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
