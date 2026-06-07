import { useCallback, useEffect, useRef, useState } from "react";

import { ANALYZE_STREAM_STATUS_EVENT_NAMES } from "../../../shared/constants/analyzeStream";
import type {
  AnalyzeStreamEvent,
  AnalyzeStreamStatus,
} from "../../../shared/types/analyzeStream";
import type { MusicAnalysisResponse } from "../../../shared/types/musicAnalysis";
import { ANALYZE_STREAM_ENDPOINT, API_BASE_URL } from "../constants/api";

export interface EmotionStreamRequest {
  title?: string;
  artist?: string;
  lyrics?: string;
}

export type EmotionStreamConnectionStatus =
  | "idle"
  | "connecting"
  | "streaming"
  | "done"
  | "error";

export interface EmotionStreamState {
  status: EmotionStreamConnectionStatus;
  request: EmotionStreamRequest | null;
  events: AnalyzeStreamEvent[];
  latestEvent: AnalyzeStreamEvent | null;
  result: MusicAnalysisResponse | null;
  errorMessage: string | null;
  isActive: boolean;
}

export interface EmotionStreamController {
  state: EmotionStreamState;
  startStream: (request?: EmotionStreamRequest) => void;
  resetStream: () => void;
}

const INITIAL_STREAM_STATE: EmotionStreamState = {
  status: "idle",
  request: null,
  events: [],
  latestEvent: null,
  result: null,
  errorMessage: null,
  isActive: false,
};

const STREAM_CONNECTION_ERROR_MESSAGE = "Analysis stream connection failed.";
const STREAM_PARSE_ERROR_MESSAGE = "Invalid analysis stream event.";

const hasTextValue = (value: string | undefined): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

const appendQueryParam = (
  params: URLSearchParams,
  key: keyof EmotionStreamRequest,
  value: string | undefined,
): void => {
  if (hasTextValue(value)) {
    params.set(key, value.trim());
  }
};

export const createAnalyzeStreamUrl = (
  request: EmotionStreamRequest = {},
  baseUrl = API_BASE_URL,
): string => {
  const url = new URL(ANALYZE_STREAM_ENDPOINT, baseUrl);

  appendQueryParam(url.searchParams, "title", request.title);
  appendQueryParam(url.searchParams, "artist", request.artist);
  appendQueryParam(url.searchParams, "lyrics", request.lyrics);

  return url.toString();
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isAnalyzeStreamStatus = (
  value: unknown,
): value is AnalyzeStreamStatus => {
  return (
    typeof value === "string" &&
    ANALYZE_STREAM_STATUS_EVENT_NAMES.includes(value as AnalyzeStreamStatus)
  );
};

const isAnalyzeStreamEvent = (value: unknown): value is AnalyzeStreamEvent => {
  if (!isRecord(value)) {
    return false;
  }

  const visual = value.visual;
  const hasValidVisual =
    isRecord(visual) &&
    typeof visual.intensity === "number" &&
    typeof visual.activeNodeCount === "number" &&
    typeof visual.orbitSpeed === "number" &&
    typeof visual.color === "string";

  return (
    isAnalyzeStreamStatus(value.status) &&
    typeof value.phase === "string" &&
    typeof value.progress === "number" &&
    typeof value.message === "string" &&
    hasValidVisual
  );
};

const parseAnalyzeStreamEvent = (data: string): AnalyzeStreamEvent => {
  const parsedData: unknown = JSON.parse(data);

  if (!isAnalyzeStreamEvent(parsedData)) {
    throw new Error(STREAM_PARSE_ERROR_MESSAGE);
  }

  return parsedData;
};

const resolveErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return STREAM_CONNECTION_ERROR_MESSAGE;
};

export const useEmotionStream = (): EmotionStreamController => {
  const streamRef = useRef<EventSource | null>(null);
  const [state, setState] =
    useState<EmotionStreamState>(INITIAL_STREAM_STATE);

  const closeStream = useCallback((): void => {
    streamRef.current?.close();
    streamRef.current = null;
  }, []);

  const applyStreamEvent = useCallback(
    (streamEvent: AnalyzeStreamEvent): void => {
      setState((previousState) => ({
        status: streamEvent.status === "done" ? "done" : "streaming",
        request: previousState.request,
        events: [...previousState.events, streamEvent],
        latestEvent: streamEvent,
        result: streamEvent.result ?? previousState.result,
        errorMessage: null,
        isActive: streamEvent.status !== "done",
      }));

      if (streamEvent.status === "done") {
        closeStream();
      }
    },
    [closeStream],
  );

  const failStream = useCallback(
    (error: unknown): void => {
      closeStream();
      setState((previousState) => ({
        ...previousState,
        status: "error",
        errorMessage: resolveErrorMessage(error),
        isActive: false,
      }));
    },
    [closeStream],
  );

  const startStream = useCallback(
    (request: EmotionStreamRequest = {}): void => {
      closeStream();
      setState({
        ...INITIAL_STREAM_STATE,
        status: "connecting",
        request,
        isActive: true,
      });

      let stream: EventSource;

      try {
        stream = new EventSource(createAnalyzeStreamUrl(request));
      } catch (error) {
        failStream(error);
        return;
      }

      streamRef.current = stream;

      const isCurrentStream = (): boolean => {
        return streamRef.current === stream;
      };

      const handleStreamEvent = (messageEvent: MessageEvent<string>): void => {
        if (!isCurrentStream()) {
          return;
        }

        try {
          applyStreamEvent(parseAnalyzeStreamEvent(messageEvent.data));
        } catch (error) {
          failStream(error);
        }
      };

      for (const eventName of ANALYZE_STREAM_STATUS_EVENT_NAMES) {
        stream.addEventListener(eventName, handleStreamEvent);
      }

      stream.onerror = (): void => {
        if (!isCurrentStream()) {
          return;
        }

        failStream(new Error(STREAM_CONNECTION_ERROR_MESSAGE));
      };
    },
    [applyStreamEvent, closeStream, failStream],
  );

  const resetStream = useCallback((): void => {
    closeStream();
    setState(INITIAL_STREAM_STATE);
  }, [closeStream]);

  useEffect(() => {
    return closeStream;
  }, [closeStream]);

  return {
    state,
    startStream,
    resetStream,
  };
};
