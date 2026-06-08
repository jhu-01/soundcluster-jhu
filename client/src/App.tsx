import { StarsCanvas } from "./canvas/StarsCanvas";
import { SearchBar } from "./components/SearchBar";
import { AnalysisProvider } from "./context/AnalysisProvider";
import styles from "./App.module.css";

export default function App() {
  return (
    <AnalysisProvider>
      <main className={styles.shell}>
        <StarsCanvas />
        <SearchBar />
      </main>
    </AnalysisProvider>
  );
}
