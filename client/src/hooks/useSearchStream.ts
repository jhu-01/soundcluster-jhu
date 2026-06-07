import { useCallback, useEffect, useRef, useState } from "react";

import { ANALYZE_CACHE_HIT_MESSAGE } from "../../../shared/constants/analyzeStream";
import type { AnalyzeStreamEvent } from "../../../shared/types/analyzeStream";
import type {
  EmotionVector,
  MusicAnalysisResponse,
} from "../../../shared/types/musicAnalysis";
import { ANALYZE_STREAM_ENDPOINT, API_BASE_URL } from "../constants/api";
import type { SearchPayload, SearchStatus } from "../types/search";

interface SearchStreamState {
  status: SearchStatus;
  progress: number;
  message: string;
  events: AnalyzeStreamEvent[];
  result: MusicAnalysisResponse | null;
  isCacheHit: boolean;
}

interface SearchStreamController {
  state: SearchStreamState;
  startSearchStream: (payload: SearchPayload) => void;
}

const DEFAULT_SEARCH_MESSAGE = "Ready";
const STREAM_ERROR_MESSAGE = "Stream failed";
const STREAM_EVENT_NAMES = ["fetching", "analyzing", "done"] as const;

const createAnalyzeStreamUrl = (payload: SearchPayload): string => {
  const url = new URL(ANALYZE_STREAM_ENDPOINT, API_BASE_URL);

  if (payload.title) {
    url.searchParams.set("title", payload.title);
  }

  if (payload.artist) {
    url.searchParams.set("artist", payload.artist);
  }

  return url.toString();
};

const parseStreamEvent = (messageEvent: MessageEvent<string>): AnalyzeStreamEvent => {
  return JSON.parse(messageEvent.data) as AnalyzeStreamEvent;
};

export const useSearchStream = (
  onResult: (emotions: EmotionVector) => void,
): SearchStreamController => {
  const streamRef = useRef<EventSource | null>(null);
  const [state, setState] = useState<SearchStreamState>({
    status: "idle",
    progress: 0,
    message: DEFAULT_SEARCH_MESSAGE,
    events: [],
    result: null,
    isCacheHit: false,
  });

  const closeStream = useCallback((): void => {
    streamRef.current?.close();
    streamRef.current = null;
  }, []);

  const failStream = useCallback((): void => {
    setState((previousState) => ({
      ...previousState,
      status: "error",
      message: STREAM_ERROR_MESSAGE,
      events: previousState.events,
      result: previousState.result,
      isCacheHit: previousState.isCacheHit,
    }));
    closeStream();
  }, [closeStream]);

  const startSearchStream = useCallback(
    (payload: SearchPayload): void => {
      closeStream();
      setState({
        status: "connecting",
        progress: 0,
        message: "Connecting",
        events: [],
        result: null,
        isCacheHit: false,
      });

      const stream = new EventSource(createAnalyzeStreamUrl(payload));
      streamRef.current = stream;

      const handleStreamEvent = (messageEvent: MessageEvent<string>): void => {
        if (streamRef.current !== stream) {
          return;
        }

        let streamEvent: AnalyzeStreamEvent;

        try {
          streamEvent = parseStreamEvent(messageEvent);
        } catch {
          failStream();
          return;
        }

        setState((previousState) => ({
          status: streamEvent.status === "done" ? "done" : "streaming",
          progress: streamEvent.progress,
          message: streamEvent.message,
          events: [...previousState.events, streamEvent],
          result: streamEvent.result ?? previousState.result,
          isCacheHit:
            streamEvent.message === ANALYZE_CACHE_HIT_MESSAGE ||
            previousState.isCacheHit,
        }));

        if (streamEvent.result) {
          onResult(streamEvent.result.emotions);
        }

        if (streamEvent.status === "done") {
          closeStream();
        }
      };

      for (const eventName of STREAM_EVENT_NAMES) {
        stream.addEventListener(eventName, handleStreamEvent);
      }

      stream.onerror = (): void => {
        if (streamRef.current !== stream) {
          return;
        }

        failStream();
      };
    },
    [closeStream, failStream, onResult],
  );

  useEffect(() => {
    return closeStream;
  }, [closeStream]);

  return {
    state,
    startSearchStream,
  };
};
