import type { ReactNode } from "react";

import { useEmotionStream } from "../hooks/useEmotionStream";
import { AnalysisContext } from "./AnalysisContext";

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const emotionStream = useEmotionStream();

  return (
    <AnalysisContext.Provider value={emotionStream}>
      {children}
    </AnalysisContext.Provider>
  );
}
