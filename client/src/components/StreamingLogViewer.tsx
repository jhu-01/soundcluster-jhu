import { ANALYZE_CACHE_HIT_MESSAGE } from "../../../shared/constants/analyzeStream";
import type { AnalyzeStreamEvent } from "../../../shared/types/analyzeStream";
import type { MusicAnalysisResponse } from "../../../shared/types/musicAnalysis";
import type { SearchStatus } from "../types/search";
import styles from "./StreamingLogViewer.module.css";

interface StreamingLogViewerProps {
  events: AnalyzeStreamEvent[];
  isCacheHit: boolean;
  result: MusicAnalysisResponse | null;
  status: SearchStatus;
}

const resolveStatusLabel = (
  status: SearchStatus,
  isCacheHit: boolean,
): string => {
  if (isCacheHit) {
    return "Cache hit";
  }

  if (status === "idle") {
    return "Idle";
  }

  if (status === "done") {
    return "Done";
  }

  if (status === "error") {
    return "Error";
  }

  return "Streaming";
};

const isCacheEvent = (event: AnalyzeStreamEvent): boolean => {
  return event.message === ANALYZE_CACHE_HIT_MESSAGE;
};

export function StreamingLogViewer({
  events,
  isCacheHit,
  result,
  status,
}: StreamingLogViewerProps) {
  const visibleEvents = events.slice(-4);

  return (
    <section className={styles.viewer} aria-label="Analysis stream">
      <div className={styles.header}>
        <span>Analysis</span>
        <output data-status={status}>{resolveStatusLabel(status, isCacheHit)}</output>
      </div>
      <ol className={styles.events}>
        {visibleEvents.map((event) => (
          <li data-cache={isCacheEvent(event)} key={`${event.phase}-${event.progress}`}>
            <span>{event.progress}%</span>
            <p>{event.message}</p>
          </li>
        ))}
      </ol>
      {result ? (
        <div className={styles.summary}>
          <span>{result.musicId}</span>
          <p>{result.generatedSummary}</p>
        </div>
      ) : null}
    </section>
  );
}
