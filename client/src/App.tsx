import { useCallback, useState } from "react";

import type { EmotionVector } from "../../shared/types/musicAnalysis";
import { StarsCanvas } from "./canvas/StarsCanvas";
import { ControlPanel } from "./components/ControlPanel";
import { SearchBar } from "./components/SearchBar";
import { DEFAULT_EMOTION_VECTOR } from "./constants/emotionControls";
import { useSearchStream } from "./hooks/useSearchStream";
import styles from "./App.module.css";

export default function App() {
  const [emotionControls, setEmotionControls] = useState<EmotionVector>(
    DEFAULT_EMOTION_VECTOR,
  );
  const applyAnalysisResult = useCallback(
    (emotions: EmotionVector): void => {
      setEmotionControls(emotions);
    },
    [],
  );
  const searchStream = useSearchStream(applyAnalysisResult);

  return (
    <main className={styles.shell}>
      <StarsCanvas vectorControls={emotionControls} />
      <div className={styles.hud}>
        <SearchBar
          onSubmit={searchStream.startSearchStream}
          progress={searchStream.state.progress}
          status={searchStream.state.status}
          statusMessage={searchStream.state.message}
        />
        <ControlPanel onChange={setEmotionControls} value={emotionControls} />
      </div>
    </main>
  );
}
