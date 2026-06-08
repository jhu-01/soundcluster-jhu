import type { MusicAnalysisResponse } from "./musicAnalysis.js";

export type AnalyzeStreamStatus = "fetching" | "analyzing" | "done" | "failed";

export type AnalyzeStreamPhase =
  | "metadata"
  | "lyrics"
  | "vectorizing"
  | "mapping"
  | "complete"
  | "failed";

export interface AnalyzeStreamVisualFrame {
  intensity: number;
  activeNodeCount: number;
  color: string;
}

export interface AnalyzeStreamEvent {
  status: AnalyzeStreamStatus;
  phase: AnalyzeStreamPhase;
  progress: number;
  message: string;
  visual: AnalyzeStreamVisualFrame;
  errorMessage?: string;
  result?: MusicAnalysisResponse;
}
