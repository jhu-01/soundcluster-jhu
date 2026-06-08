import type { EmotionVector } from "../../../shared/types/musicAnalysis";
import {
  EMOTION_AXIS_CONFIGS,
  MIN_ACTIVE_AXIS_COUNT,
  type AxisSelection,
  type EmotionAxis,
} from "../constants/emotionControls";
import styles from "./ControlPanel.module.css";

interface ControlPanelProps {
  axisSelection: AxisSelection;
  values: EmotionVector;
  onToggleAxis: (axis: EmotionAxis) => void;
}

const countActiveAxes = (axisSelection: AxisSelection): number => {
  return Object.values(axisSelection).filter(Boolean).length;
};

export function ControlPanel({
  axisSelection,
  values,
  onToggleAxis,
}: ControlPanelProps) {
  const activeAxisCount = countActiveAxes(axisSelection);

  return (
    <section className={styles.panel} aria-label="Emotion axis controls">
      <div className={styles.summary}>
        <span>Axes</span>
        <output>{activeAxisCount} / 5</output>
      </div>
      {EMOTION_AXIS_CONFIGS.map((axis) => {
        const axisValue = values[axis.key];
        const isChecked = axisSelection[axis.key];
        const isLocked = isChecked && activeAxisCount <= MIN_ACTIVE_AXIS_COUNT;

        return (
          <label className={styles.control} data-active={isChecked} key={axis.key}>
            <input
              checked={isChecked}
              disabled={isLocked}
              id={`axis-${axis.key}`}
              name={`axis-${axis.key}`}
              onChange={() => onToggleAxis(axis.key)}
              type="checkbox"
            />
            <span
              className={styles.swatch}
              style={{ backgroundColor: axis.accentColor }}
            />
            <span className={styles.header}>
              <span>{axis.label}</span>
              <output>{axisValue.toFixed(2)}</output>
            </span>
          </label>
        );
      })}
    </section>
  );
}
