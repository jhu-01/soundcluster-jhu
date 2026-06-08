import {
  EMOTION_AXIS_CONFIGS,
  MIN_ACTIVE_AXIS_COUNT,
  type AxisSelection,
  type EmotionAxis,
} from "../constants/emotionControls";
import type { CSSProperties } from "react";
import styles from "./ControlPanel.module.css";

interface ControlPanelProps {
  axisSelection: AxisSelection;
  onToggleAxis: (axis: EmotionAxis) => void;
}

const countActiveAxes = (axisSelection: AxisSelection): number => {
  return Object.values(axisSelection).filter(Boolean).length;
};

export function ControlPanel({
  axisSelection,
  onToggleAxis,
}: ControlPanelProps) {
  const activeAxisCount = countActiveAxes(axisSelection);

  return (
    <section className={styles.panel} aria-label="Emotion controls">
      <div className={styles.summary}>
        <span>Emotions</span>
        <output>{activeAxisCount} active</output>
      </div>
      <div className={styles.controls}>
        {EMOTION_AXIS_CONFIGS.map((axis) => {
          const isChecked = axisSelection[axis.key];
          const isLocked = isChecked && activeAxisCount <= MIN_ACTIVE_AXIS_COUNT;
          const axisStyle = {
            "--axis-color": axis.accentColor,
          } as CSSProperties;

          return (
            <label
              className={styles.control}
              data-active={isChecked}
              key={axis.key}
              style={axisStyle}
            >
              <span className={styles.mark} aria-hidden="true">
                {axis.mark}
              </span>
              <span className={styles.copy}>
                <span className={styles.label}>{axis.label}</span>
                <span className={styles.description}>{axis.description}</span>
              </span>
              <input
                aria-checked={isChecked}
                checked={isChecked}
                disabled={isLocked}
                id={`axis-${axis.key}`}
                name={`axis-${axis.key}`}
                onChange={() => onToggleAxis(axis.key)}
                role="switch"
                type="checkbox"
              />
            </label>
          );
        })}
      </div>
    </section>
  );
}
