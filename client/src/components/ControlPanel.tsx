import type { EmotionVector } from "../../../shared/types/musicAnalysis";
import { EMOTION_AXIS_CONFIGS } from "../constants/emotionControls";
import styles from "./ControlPanel.module.css";

interface ControlPanelProps {
  value: EmotionVector;
  onChange: (value: EmotionVector) => void;
}

const SLIDER_MIN = 0;
const SLIDER_MAX = 1;
const SLIDER_STEP = 0.01;

export function ControlPanel({ value, onChange }: ControlPanelProps) {
  return (
    <section className={styles.panel} aria-label="Emotion controls">
      {EMOTION_AXIS_CONFIGS.map((axis) => {
        const axisValue = value[axis.key];

        return (
          <label className={styles.control} key={axis.key}>
            <span className={styles.header}>
              <span>{axis.label}</span>
              <output>{axisValue.toFixed(2)}</output>
            </span>
            <input
              max={SLIDER_MAX}
              min={SLIDER_MIN}
              onChange={(event) => {
                onChange({
                  ...value,
                  [axis.key]: Number(event.target.value),
                });
              }}
              step={SLIDER_STEP}
              style={{ accentColor: axis.accentColor }}
              type="range"
              value={axisValue}
            />
          </label>
        );
      })}
    </section>
  );
}
