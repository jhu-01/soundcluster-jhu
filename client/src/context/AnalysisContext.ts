import { createContext, useContext } from "react";

import type { EmotionStreamController } from "../hooks/useEmotionStream";

export const AnalysisContext =
  createContext<EmotionStreamController | null>(null);

export function useAnalysis(): EmotionStreamController {
  const context = useContext(AnalysisContext);

  if (!context) {
    throw new Error("useAnalysis must be used within AnalysisProvider.");
  }

  return context;
}
