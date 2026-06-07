import { useCallback, useState } from "react";

import type { EmotionVector } from "../../shared/types/musicAnalysis";
import { StarsCanvas } from "./canvas/StarsCanvas";
import { ControlPanel } from "./components/ControlPanel";
import { SearchBar } from "./components/SearchBar";
import { StreamingLogViewer } from "./components/StreamingLogViewer";
import {
  DEFAULT_AXIS_SELECTION,
  DEFAULT_EMOTION_VECTOR,
  MIN_ACTIVE_AXIS_COUNT,
  type AxisSelection,
  type EmotionAxis,
} from "./constants/emotionControls";
import { useSearchStream } from "./hooks/useSearchStream";
import styles from "./App.module.css";

const countActiveAxes = (axisSelection: AxisSelection): number => {
  return Object.values(axisSelection).filter(Boolean).length;
};

export default function App() {
  const [analysisEmotions, setAnalysisEmotions] = useState<EmotionVector>(
    DEFAULT_EMOTION_VECTOR,
  );
  const [axisSelection, setAxisSelection] = useState<AxisSelection>(
    DEFAULT_AXIS_SELECTION,
  );
  const applyAnalysisResult = useCallback(
    (emotions: EmotionVector): void => {
      setAnalysisEmotions(emotions);
    },
    [],
  );
  const searchStream = useSearchStream(applyAnalysisResult);
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

  return (
    <main className={styles.shell}>
      <StarsCanvas
        activeEmotions={analysisEmotions}
        axisSelection={axisSelection}
      />
      <div className={styles.hud}>
        <SearchBar
          onSubmit={searchStream.startSearchStream}
          progress={searchStream.state.progress}
          status={searchStream.state.status}
          statusMessage={searchStream.state.message}
        />
        <ControlPanel
          axisSelection={axisSelection}
          onToggleAxis={toggleAxis}
          values={analysisEmotions}
        />
        <div className={styles.stream}>
          <StreamingLogViewer
            events={searchStream.state.events}
            isCacheHit={searchStream.state.isCacheHit}
            result={searchStream.state.result}
            status={searchStream.state.status}
          />
        </div>
      </div>
    </main>
  );
}
