import { StarsCanvas } from "./canvas/StarsCanvas";
import styles from "./App.module.css";

export default function App() {
  return (
    <main className={styles.shell}>
      <StarsCanvas />
    </main>
  );
}
