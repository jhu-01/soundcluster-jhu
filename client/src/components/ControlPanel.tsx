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

function EmotionAxisIcon({ axis }: { axis: EmotionAxis }) {
  if (axis === "energy") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M13.7 2.6 5.2 13h5.7l-.6 8.4 8.5-10.9h-5.6l.5-7.9Z" />
      </svg>
    );
  }

  if (axis === "valence") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 20.4S5.1 15.9 5.1 9.8A3.8 3.8 0 0 1 12 7.6a3.8 3.8 0 0 1 6.9 2.2c0 6.1-6.9 10.6-6.9 10.6Z" />
      </svg>
    );
  }

  if (axis === "tempoDensity") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M6.2 17.5V8.2m5.8 9.3v-12m5.8 12V11" />
        <path d="M4.7 17.6h3m5.8 0h-3m5.8 0h3" />
      </svg>
    );
  }

  if (axis === "spaceDepth") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 14.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z" />
        <path d="M3.8 12c2.2-3.6 5-5.4 8.2-5.4s6 1.8 8.2 5.4c-2.2 3.6-5 5.4-8.2 5.4s-6-1.8-8.2-5.4Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m4 15 4.2-6 3.4 5.5 3.2-7.4L20 15.2" />
      <path d="M4 19h16" />
    </svg>
  );
}

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
                <EmotionAxisIcon axis={axis.key} />
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
