import { useState } from "react";

import { useAnalysis } from "../context/AnalysisContext";
import type { EmotionStreamRequest } from "../hooks/useEmotionStream";
import styles from "./SearchBar.module.css";

interface SearchFormState {
  title: string;
  artist: string;
  lyrics: string;
}

const INITIAL_FORM_STATE: SearchFormState = {
  title: "Midnight Circuit",
  artist: "SoundCluster Lab",
  lyrics: "",
};

const MAX_TEXT_LENGTHS: Record<keyof SearchFormState, number> = {
  title: 120,
  artist: 120,
  lyrics: 5000,
};

const REQUIRED_FIELD_MESSAGE = "Title and artist are required.";
const LENGTH_ERROR_MESSAGE = "Input is too long.";

const trimFormState = (formState: SearchFormState): SearchFormState => {
  return {
    title: formState.title.trim(),
    artist: formState.artist.trim(),
    lyrics: formState.lyrics.trim(),
  };
};

const validateFormState = (formState: SearchFormState): string | null => {
  if (!formState.title || !formState.artist) {
    return REQUIRED_FIELD_MESSAGE;
  }

  const hasTooLongValue = Object.entries(formState).some(([key, value]) => {
    return value.length > MAX_TEXT_LENGTHS[key as keyof SearchFormState];
  });

  if (hasTooLongValue) {
    return LENGTH_ERROR_MESSAGE;
  }

  return null;
};

const createStreamRequest = (
  formState: SearchFormState,
): EmotionStreamRequest => {
  return {
    title: formState.title,
    artist: formState.artist,
    lyrics: formState.lyrics,
  };
};

export function SearchBar() {
  const { state, startStream } = useAnalysis();
  const [formState, setFormState] = useState<SearchFormState>(INITIAL_FORM_STATE);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const isStreaming = state.status === "connecting" || state.status === "streaming";
  const visibleMessage =
    validationMessage ?? state.errorMessage ?? state.latestEvent?.message ?? "Ready";

  const updateField = (
    field: keyof SearchFormState,
    value: string,
  ): void => {
    setFormState((previousState) => ({
      ...previousState,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const trimmedFormState = trimFormState(formState);
    const nextValidationMessage = validateFormState(trimmedFormState);

    setValidationMessage(nextValidationMessage);

    if (nextValidationMessage) {
      return;
    }

    setFormState(trimmedFormState);
    startStream(createStreamRequest(trimmedFormState));
  };

  return (
    <form className={styles.search} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <label className={styles.field}>
          <span>Title</span>
          <input
            id="analysis-title"
            maxLength={MAX_TEXT_LENGTHS.title}
            name="title"
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Search by song title..."
            value={formState.title}
          />
        </label>
        <label className={styles.field}>
          <span>Artist</span>
          <input
            id="analysis-artist"
            maxLength={MAX_TEXT_LENGTHS.artist}
            name="artist"
            onChange={(event) => updateField("artist", event.target.value)}
            placeholder="Artist..."
            value={formState.artist}
          />
        </label>
      </div>
      <label className={`${styles.field} ${styles.lyricsField}`}>
        <span>Lyrics</span>
        <textarea
          id="analysis-lyrics"
          maxLength={MAX_TEXT_LENGTHS.lyrics}
          name="lyrics"
          onChange={(event) => updateField("lyrics", event.target.value)}
          placeholder="Optional lyrics context"
          rows={3}
          value={formState.lyrics}
        />
      </label>
      <div className={styles.actions}>
        <button disabled={isStreaming} type="submit">
          {isStreaming ? "Extracting" : "Extract"}
        </button>
        <output className={styles.message} data-error={Boolean(validationMessage)}>
          {visibleMessage}
        </output>
      </div>
      <div className={styles.progress} aria-hidden="true">
        <span
          style={{ transform: `scaleX(${(state.latestEvent?.progress ?? 0) / 100})` }}
        />
      </div>
    </form>
  );
}
