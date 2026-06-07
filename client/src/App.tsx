import styles from "./App.module.css";

interface PipelineStage {
  label: string;
  status: "ready" | "pending";
  description: string;
}

interface MetricCard {
  label: string;
  value: string;
  detail: string;
}

const pipelineStages: PipelineStage[] = [
  {
    label: "Server",
    status: "ready",
    description: "Express health check and MySQL pool are connected.",
  },
  {
    label: "Gemini",
    status: "ready",
    description: "JSON analysis response is constrained and validated.",
  },
  {
    label: "Canvas",
    status: "pending",
    description: "R3F scene setup starts in checklist item #8.",
  },
];

const metricCards: MetricCard[] = [
  {
    label: "Emotion Axes",
    value: "5",
    detail: "energy, valence, tempoDensity, spaceDepth, tension",
  },
  {
    label: "API Route",
    value: "/api/gemini/analyze/test",
    detail: "Returns validated JSON from Gemini.",
  },
  {
    label: "Frontend Layer",
    value: "CSS Modules",
    detail: "Component styles are isolated from global tokens.",
  },
];

const getStatusLabel = (status: PipelineStage["status"]): string => {
  if (status === "ready") {
    return "Ready";
  }

  return "Next";
};

export default function App() {
  return (
    <main className={styles.shell}>
      <section className={styles.header}>
        <div className={styles.brandGroup}>
          <img className={styles.logo} src="/favicon.svg" alt="" aria-hidden="true" />
          <p className={styles.eyebrow}>SoundCluster</p>
          <h1 className={styles.title}>Emotion analysis workspace</h1>
        </div>
        <div className={styles.badge}>Vite + React + TS</div>
      </section>

      <section className={styles.metrics} aria-label="Project metrics">
        {metricCards.map((metric) => (
          <article className={styles.metricCard} key={metric.label}>
            <span className={styles.metricLabel}>{metric.label}</span>
            <strong className={styles.metricValue}>{metric.value}</strong>
            <p className={styles.metricDetail}>{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className={styles.pipeline} aria-label="Implementation pipeline">
        {pipelineStages.map((stage) => (
          <article className={styles.stage} key={stage.label}>
            <div className={styles.stageHeader}>
              <h2 className={styles.stageTitle}>{stage.label}</h2>
              <span className={styles.status}>{getStatusLabel(stage.status)}</span>
            </div>
            <p className={styles.stageDescription}>{stage.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
