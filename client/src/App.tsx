import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import type { ItunesTrackMetadata } from "../../shared/types/itunes";
import type { MusicAnalysisResponse } from "../../shared/types/musicAnalysis";
import {
  DEFAULT_SHARE_CAMERA_POSITION,
  DEFAULT_SHARE_CAMERA_TARGET,
} from "../../shared/constants/shareSnapshot";
import { ControlPanel } from "./components/ControlPanel";
import { ItunesSearchPanel } from "./components/ItunesSearchPanel";
import { SearchBar } from "./components/SearchBar";
import { ShareModal } from "./components/ShareModal";
import {
  DEFAULT_AXIS_SELECTION,
  EMOTION_AXIS_CONFIGS,
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
import { fetchItunesTracks } from "./utils/itunesSearch";
import { fetchLyrics } from "./utils/lyricsSearch";
import { readShareSnapshot } from "./utils/shareSnapshotApi";
import {
  readShareIdFromLocation,
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
    cameraPosition: [...DEFAULT_SHARE_CAMERA_POSITION],
    cameraTarget: [...DEFAULT_SHARE_CAMERA_TARGET],
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

const formatEmotionValue = (value: number): string => {
  return value.toFixed(2);
};

type ItunesSearchStatus = "idle" | "loading" | "error";

type DebugResponseStatus = "idle" | "loading" | "success" | "error";

interface DebugResponseEntry {
  body: unknown;
  status: DebugResponseStatus;
}

interface DebugResponseState {
  lyrics: DebugResponseEntry;
}

function SoundClusterApp() {
  const { state, startStream } = useAnalysis();
  const analysisTargetTrackIdRef = useRef<string | null>(null);
  const appliedAnalysisResultRef = useRef<MusicAnalysisResponse | null>(null);
  const initialSnapshot = useMemo(() => {
    return readShareSnapshotFromLocation(window.location.search);
  }, []);
  const initialShareId = useMemo(() => {
    return readShareIdFromLocation(window.location.search);
  }, []);
  const [snapshot, setSnapshot] = useState<ClusterShareSnapshot>(
    initialSnapshot ?? createDefaultSnapshot(),
  );
  const [shareLoadMessage, setShareLoadMessage] = useState<string | null>(
    initialShareId ? "Loading shared cluster..." : null,
  );
  const [axisSelection, setAxisSelection] = useState<AxisSelection>(
    DEFAULT_AXIS_SELECTION,
  );
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [selectedEmotionPanelTrackId, setSelectedEmotionPanelTrackId] =
    useState<string | null>(null);
  const [itunesItems, setItunesItems] = useState<ItunesTrackMetadata[]>([]);
  const [itunesSearchStatus, setItunesSearchStatus] =
    useState<ItunesSearchStatus>("idle");
  const [itunesSearchMessage, setItunesSearchMessage] = useState(
    "Search by song title or artist.",
  );
  const [extractingTrackId, setExtractingTrackId] = useState<string | null>(null);
  const [lyricsLookupTrackId, setLyricsLookupTrackId] = useState<string | null>(
    null,
  );
  const [debugResponse, setDebugResponse] = useState<DebugResponseState>({
    lyrics: {
      body: null,
      status: "idle",
    },
  });
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
  const isSelectedEmotionOpen =
    selectedTrack !== null && selectedEmotionPanelTrackId === selectedTrack.id;

  const activeExtractingTrackId =
    lyricsLookupTrackId ?? (state.isActive ? extractingTrackId : null);
  const debugPanelBody = useMemo(() => {
    return {
      gemini: {
        errorMessage: state.errorMessage,
        latestEvent: state.latestEvent,
        request: state.request,
        result: state.result,
        status: state.status,
      },
      lrclib: debugResponse.lyrics,
    };
  }, [
    debugResponse.lyrics,
    state.errorMessage,
    state.latestEvent,
    state.request,
    state.result,
    state.status,
  ]);
  const debugPanelStatus = useMemo<DebugResponseStatus>(() => {
    if (
      debugResponse.lyrics.status === "error" ||
      state.status === "error"
    ) {
      return "error";
    }

    if (state.status === "streaming" || state.status === "connecting") {
      return "loading";
    }

    if (
      debugResponse.lyrics.status === "success" ||
      state.status === "done"
    ) {
      return "success";
    }

    return "idle";
  }, [debugResponse.lyrics.status, state.status]);
  const ignorePreviewTrack = useCallback((trackId: string | null): void => {
    void trackId;
  }, []);
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
  const removeSelectedTrack = useCallback((): void => {
    setSelectedEmotionPanelTrackId(null);
    setSnapshot((currentSnapshot) => {
      const selectedTrackId = currentSnapshot.selectedTrackId;

      if (!selectedTrackId) {
        return currentSnapshot;
      }

      return {
        ...currentSnapshot,
        selectedTrackId: null,
        tracks: currentSnapshot.tracks.filter((track) => track.id !== selectedTrackId),
      };
    });
  }, []);
  const resetTracks = useCallback((): void => {
    analysisTargetTrackIdRef.current = null;
    appliedAnalysisResultRef.current = null;
    setExtractingTrackId(null);
    setLyricsLookupTrackId(null);
    setSelectedEmotionPanelTrackId(null);
    setSnapshot((currentSnapshot) => ({
      ...currentSnapshot,
      selectedTrackId: null,
      tracks: [],
    }));
    setDebugResponse({
      lyrics: {
        body: null,
        status: "idle",
      },
    });
    setIsResetConfirmOpen(false);
  }, []);
  const searchItunesTracks = useCallback(async (query: string): Promise<void> => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setItunesSearchStatus("error");
      setItunesSearchMessage("Search query is required.");
      return;
    }

    setItunesSearchStatus("loading");
    setItunesSearchMessage("Searching iTunes...");

    try {
      const response = await fetchItunesTracks(trimmedQuery, "");

      setItunesItems(response.items);
      setItunesSearchStatus("idle");
      setItunesSearchMessage(
        response.items.length > 0
          ? `${response.items.length} tracks found.`
          : "No tracks found.",
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      setItunesItems([]);
      setItunesSearchStatus("error");
      setItunesSearchMessage(errorMessage);
    }
  }, []);
  const extractItunesTrack = useCallback(
    async (track: ItunesTrackMetadata): Promise<void> => {
      analysisTargetTrackIdRef.current = track.itunesTrackId;
      appliedAnalysisResultRef.current = null;
      setExtractingTrackId(track.itunesTrackId);
      setLyricsLookupTrackId(track.itunesTrackId);
      bindItunesTrack(track);
      setDebugResponse((previousResponse) => ({
        ...previousResponse,
        lyrics: {
          body: {
            artist: track.artist,
            title: track.title,
          },
          status: "loading",
        },
      }));

      let lyrics = "";

      try {
        const lyricsResponse = await fetchLyrics(track.title, track.artist);

        lyrics = lyricsResponse.lyrics;
        setDebugResponse((previousResponse) => ({
          ...previousResponse,
          lyrics: {
            body: lyricsResponse,
            status: "success",
          },
        }));
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        setDebugResponse((previousResponse) => ({
          ...previousResponse,
          lyrics: {
            body: {
              artist: track.artist,
              error: errorMessage,
              fallback: "Gemini will analyze with title and artist only.",
              title: track.title,
            },
            status: "error",
          },
        }));
      } finally {
        setLyricsLookupTrackId(null);
      }

      startStream({
        artist: track.artist,
        lyrics,
        title: track.title,
      });
    },
    [bindItunesTrack, startStream],
  );

  useEffect(() => {
    if (!initialShareId) {
      return;
    }

    let isMounted = true;

    readShareSnapshot(initialShareId)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setSnapshot(response.snapshot);
        setShareLoadMessage(null);
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        const errorMessage = error instanceof Error ? error.message : String(error);

        setShareLoadMessage(errorMessage);
      });

    return () => {
      isMounted = false;
    };
  }, [initialShareId]);

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
        <SearchBar
          message={itunesSearchMessage}
          onSearch={searchItunesTracks}
          status={itunesSearchStatus}
        />
        <button
          className={styles.resetButton}
          disabled={visibleSnapshot.tracks.length === 0}
          onClick={() => setIsResetConfirmOpen(true)}
          type="button"
        >
          Reset
        </button>
      </header>
      {shareLoadMessage ? (
        <aside className={styles.shareLoadStatus}>{shareLoadMessage}</aside>
      ) : null}
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
      <ItunesSearchPanel
        extractingTrackId={activeExtractingTrackId}
        items={itunesItems}
        onExtractTrack={extractItunesTrack}
        status={itunesSearchStatus}
      />
      <aside className={styles.responseDebugPanel} aria-label="API response debug">
        <span className={styles.responseDebugHeader}>
          <strong>Response</strong>
          <small data-status={debugPanelStatus}>{debugPanelStatus}</small>
        </span>
        <span className={styles.responseDebugLabel}>
          LRCLIB / Gemini
        </span>
        <pre>{JSON.stringify(debugPanelBody, null, 2)}</pre>
      </aside>
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
          <button
            aria-expanded={isSelectedEmotionOpen}
            aria-label="Show selected track emotion values"
            className={styles.selectedTrackInfoButton}
            onClick={() => {
              setSelectedEmotionPanelTrackId((currentTrackId) => {
                return currentTrackId === selectedTrack.id ? null : selectedTrack.id;
              });
            }}
            title="Show emotion values"
            type="button"
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="18"
              viewBox="0 0 24 24"
              width="18"
            >
              <path
                d="M12 10.5v6.2M12 7.3h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>
          <button
            aria-label="Remove selected track"
            className={styles.selectedTrackRemoveButton}
            onClick={removeSelectedTrack}
            title="Remove selected track"
            type="button"
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="18"
              viewBox="0 0 24 24"
              width="18"
            >
              <path
                d="M9 4h6m-8 4h10m-9 0 .7 11h6.6L16 8M10 11v5m4-5v5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>
          {isSelectedEmotionOpen ? (
            <section
              aria-label="Selected track emotion values"
              className={styles.selectedTrackEmotionPanel}
            >
              {EMOTION_AXIS_CONFIGS.map((axis) => (
                <span
                  className={styles.selectedTrackEmotionRow}
                  key={axis.key}
                  style={
                    { "--emotion-color": axis.accentColor } as CSSProperties
                  }
                >
                  <span>{axis.label}</span>
                  <meter
                    aria-label={`${axis.label} value`}
                    max={1}
                    min={0}
                    value={selectedTrack.emotions[axis.key]}
                  />
                  <strong>{formatEmotionValue(selectedTrack.emotions[axis.key])}</strong>
                </span>
              ))}
            </section>
          ) : null}
        </aside>
      ) : null}
      {isResetConfirmOpen ? (
        <div
          aria-labelledby="reset-confirm-title"
          aria-modal="true"
          className={styles.confirmOverlay}
          role="dialog"
        >
          <section className={styles.confirmDialog}>
            <span className={styles.confirmKicker}>Reset cluster</span>
            <h2 id="reset-confirm-title">Remove all tracks?</h2>
            <p>
              This clears every rendered track from the current 3D space.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.confirmSecondaryButton}
                onClick={() => setIsResetConfirmOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className={styles.confirmDangerButton}
                onClick={resetTracks}
                type="button"
              >
                Reset
              </button>
            </div>
          </section>
        </div>
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
