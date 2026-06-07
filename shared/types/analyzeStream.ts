import type { MusicAnalysisResponse } from "./musicAnalysis.js";

export type AnalyzeStreamStatus = "fetching" | "analyzing" | "done";

export type AnalyzeStreamPhase =
  | "metadata"
  | "lyrics"
  | "vectorizing"
  | "mapping"
  | "complete";

export interface AnalyzeStreamVisualFrame {
  intensity: number;
  activeNodeCount: number;
  orbitSpeed: number;
  color: string;
}

export interface AnalyzeStreamEvent {
  status: AnalyzeStreamStatus;
  phase: AnalyzeStreamPhase;
  progress: number;
  message: string;
  visual: AnalyzeStreamVisualFrame;
  result?: MusicAnalysisResponse;
}
