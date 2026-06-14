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
  const [clusterSearchQuery, setClusterSearchQuery] = useState("");
  const [itunesItems, setItunesItems] = useState<ItunesTrackMetadata[]>([]);
  const [itunesSearchQuery, setItunesSearchQuery] = useState("");
  const [itunesSearchStatus, setItunesSearchStatus] =
    useState<ItunesSearchStatus>("idle");
  const [itunesSearchMessage, setItunesSearchMessage] = useState("");
  const [extractingTrackId, setExtractingTrackId] = useState<string | null>(null);
  const [lyricsLookupTrackId, setLyricsLookupTrackId] = useState<string | null>(
    null,
  );
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
  const clusterSearchMatches = useMemo(() => {
    const normalizedQuery = clusterSearchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return visibleSnapshot.tracks
      .filter((track) => {
        return (
          track.title.toLowerCase().includes(normalizedQuery) ||
          track.artist.toLowerCase().includes(normalizedQuery)
        );
      })
      .slice(0, 6);
  }, [clusterSearchQuery, visibleSnapshot.tracks]);

  const activeExtractingTrackId =
    lyricsLookupTrackId ?? (state.isActive ? extractingTrackId : null);
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
    setClusterSearchQuery("");
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
  const selectClusterTrack = useCallback((trackId: string): void => {
    setSelectedEmotionPanelTrackId(null);
    setClusterSearchQuery("");
    setSnapshot((currentSnapshot) => ({
      ...currentSnapshot,
      selectedTrackId: trackId,
    }));
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
  const clearItunesSearchResults = useCallback((): void => {
    setItunesItems([]);
    setItunesSearchQuery("");
    setItunesSearchStatus("idle");
    setItunesSearchMessage("");
  }, []);
  const extractItunesTrack = useCallback(
    async (track: ItunesTrackMetadata): Promise<void> => {
      analysisTargetTrackIdRef.current = track.itunesTrackId;
      appliedAnalysisResultRef.current = null;
      setExtractingTrackId(track.itunesTrackId);
      setLyricsLookupTrackId(track.itunesTrackId);
      bindItunesTrack(track);

      let lyrics = "";

      try {
        const lyricsResponse = await fetchLyrics(track.title, track.artist);

        lyrics = lyricsResponse.lyrics;
      } catch (error: unknown) {
        void error;
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
          onQueryChange={setItunesSearchQuery}
          onSearch={searchItunesTracks}
          query={itunesSearchQuery}
          status={itunesSearchStatus}
        />
        <div className={styles.topActions}>
          <button
            aria-label="Share your cluster"
            className={styles.topShareButton}
            onClick={() => setIsShareOpen(true)}
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
                d="M8.7 12.7 15.3 16M15.3 8 8.7 11.3M18 9.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>
          <button
            aria-label="Reset cluster"
            className={styles.resetButton}
            disabled={visibleSnapshot.tracks.length === 0}
            onClick={() => setIsResetConfirmOpen(true)}
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
                d="M4 7h16M9 7V5h6v2m-8 0 .7 12h8.6L17 7M10 11v5m4-5v5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>
        </div>
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
      <ItunesSearchPanel
        extractingTrackId={activeExtractingTrackId}
        items={itunesItems}
        onClearResults={clearItunesSearchResults}
        onExtractTrack={extractItunesTrack}
        status={itunesSearchStatus}
      />
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
      ) : (
        <aside
          className={`${styles.selectedTrackHud} ${styles.clusterSearchHud}`}
          aria-label="Cluster track search"
        >
          <form
            className={styles.clusterSearchForm}
            onSubmit={(event) => {
              event.preventDefault();
              const [firstMatch] = clusterSearchMatches;

              if (firstMatch) {
                selectClusterTrack(firstMatch.id);
              }
            }}
          >
            <label className={styles.clusterSearchField}>
              <small>Cluster Search</small>
              <input
                aria-label="Search tracks in cluster"
                autoComplete="off"
                disabled={visibleSnapshot.tracks.length === 0}
                name="cluster-track-search"
                onChange={(event) => setClusterSearchQuery(event.currentTarget.value)}
                type="search"
                value={clusterSearchQuery}
              />
            </label>
            <button
              aria-label="Search cluster"
              disabled={
                visibleSnapshot.tracks.length === 0 ||
                clusterSearchQuery.trim().length === 0
              }
              type="submit"
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="18"
                viewBox="0 0 24 24"
                width="18"
              >
                <path
                  d="m15.8 15.8 4.2 4.2M17.4 10.8a6.6 6.6 0 1 1-13.2 0 6.6 6.6 0 0 1 13.2 0Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.8"
                />
              </svg>
            </button>
          </form>
          {clusterSearchMatches.length > 0 ? (
            <section
              aria-label="Cluster search results"
              className={styles.clusterSearchResults}
            >
              {clusterSearchMatches.map((track) => (
                <button
                  className={styles.clusterSearchResult}
                  key={track.id}
                  onClick={() => selectClusterTrack(track.id)}
                  type="button"
                >
                  {track.albumImageUrl ? (
                    <img
                      alt={`${track.title} album cover`}
                      src={track.albumImageUrl}
                    />
                  ) : (
                    <span aria-hidden="true">{createFallbackLabel(track.title)}</span>
                  )}
                  <strong>{track.title}</strong>
                  <small>{track.artist}</small>
                </button>
              ))}
            </section>
          ) : null}
        </aside>
      )}
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
