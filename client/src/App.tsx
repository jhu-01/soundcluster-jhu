import { useCallback, useMemo, useState } from "react";

import { ANALYZE_CACHE_HIT_MESSAGE } from "../../shared/constants/analyzeStream";
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
import { AnalysisProvider } from "./context/AnalysisProvider";
import { useAnalysis } from "./context/AnalysisContext";
import styles from "./App.module.css";

const countActiveAxes = (axisSelection: AxisSelection): number => {
  return Object.values(axisSelection).filter(Boolean).length;
};

function SoundClusterApp() {
  const { state } = useAnalysis();
  const [axisSelection, setAxisSelection] = useState<AxisSelection>(
    DEFAULT_AXIS_SELECTION,
  );
  const activeEmotions = state.result?.emotions ?? DEFAULT_EMOTION_VECTOR;
  const isCacheHit = useMemo(() => {
    return state.events.some((event) => event.message === ANALYZE_CACHE_HIT_MESSAGE);
  }, [state.events]);
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
        activeEmotions={activeEmotions}
        axisSelection={axisSelection}
      />
      <div className={styles.hud}>
        <SearchBar />
        <ControlPanel
          axisSelection={axisSelection}
          onToggleAxis={toggleAxis}
          values={activeEmotions}
        />
        <div className={styles.stream}>
          <StreamingLogViewer
            events={state.events}
            isCacheHit={isCacheHit}
            result={state.result}
            status={state.status}
          />
        </div>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <AnalysisProvider>
      <SoundClusterApp />
    </AnalysisProvider>
  );
}
