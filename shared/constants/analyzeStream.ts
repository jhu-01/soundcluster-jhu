import type { AnalyzeStreamEvent } from "../types/analyzeStream.js";

export const ANALYZE_ROUTE_PREFIX = "/api/analyze";
export const ANALYZE_STREAM_ROUTE = "/stream";
export const ANALYZE_STREAM_STATUS_EVENT_NAMES = [
  "fetching",
  "analyzing",
  "done",
  "failed",
] as const;
export const ANALYZE_HISTORY_ROUTE = "/history";

export const ANALYZE_STREAM_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "Access-Control-Allow-Origin": "*",
} as const;

export const ANALYZE_STREAM_RETRY_MS = 3000;
export const ANALYZE_CACHE_HIT_MESSAGE =
  "Cached analysis found. Streaming stored vector immediately.";

export const ANALYZE_STREAM_EVENTS: AnalyzeStreamEvent[] = [
  {
    status: "fetching",
    phase: "metadata",
    progress: 12,
    message: "Track metadata received.",
    visual: {
      intensity: 0.24,
      activeNodeCount: 1,
      color: "#22d3ee",
    },
  },
  {
    status: "fetching",
    phase: "lyrics",
    progress: 28,
    message: "Lyrics context is being prepared.",
    visual: {
      intensity: 0.38,
      activeNodeCount: 2,
      color: "#34d399",
    },
  },
  {
    status: "analyzing",
    phase: "vectorizing",
    progress: 56,
    message: "Gemini is estimating emotional vector values.",
    visual: {
      intensity: 0.64,
      activeNodeCount: 4,
      color: "#e879f9",
    },
  },
  {
    status: "analyzing",
    phase: "mapping",
    progress: 82,
    message: "Vector values are being mapped into 3D space.",
    visual: {
      intensity: 0.82,
      activeNodeCount: 5,
      color: "#f59e0b",
    },
  },
  {
    status: "done",
    phase: "complete",
    progress: 100,
    message: "Analysis stream is complete.",
    visual: {
      intensity: 1,
      activeNodeCount: 5,
      color: "#5eead4",
    },
    result: {
      analysisStatus: "success",
      musicId: "dummy-track-001",
      emotions: {
        energy: 0.72,
        valence: 0.42,
        tempoDensity: 0.68,
        spaceDepth: 0.75,
        tension: 0.55,
      },
      generatedSummary:
        "A nocturnal electronic track with energetic motion, spatial depth, and moderate emotional tension.",
    },
  },
];

export const ANALYZE_CACHE_MISS_EVENTS = ANALYZE_STREAM_EVENTS.filter(
  (event) => event.status !== "done",
);
