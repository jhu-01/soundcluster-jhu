import { useState } from "react";
import type { FormEvent } from "react";

import styles from "./SearchBar.module.css";

interface SearchBarProps {
  message: string;
  onSearch: (query: string) => void;
  status: "idle" | "loading" | "error";
}

const MAX_QUERY_LENGTH = 160;

export function SearchBar({ message, onSearch, status }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const isLoading = status === "loading";
  const visibleMessage = validationMessage ?? message;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const trimmedQuery = query.trim();
    const nextValidationMessage = trimmedQuery ? null : "Search query is required.";

    setValidationMessage(nextValidationMessage);

    if (nextValidationMessage) {
      return;
    }

    setQuery(trimmedQuery);
    onSearch(trimmedQuery);
  };

  return (
    <form className={styles.search} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span>Search</span>
        <input
          autoComplete="off"
          id="itunes-query"
          maxLength={MAX_QUERY_LENGTH}
          name="itunes-query"
          onChange={(event) => {
            setQuery(event.target.value);
            setValidationMessage(null);
          }}
          placeholder="Search by song title or artist..."
          value={query}
        />
      </label>
      <div className={styles.actions}>
        <button disabled={isLoading} type="submit">
          {isLoading ? "Searching" : "Search"}
        </button>
        {visibleMessage ? (
          <output
            className={styles.message}
            data-error={Boolean(validationMessage) || status === "error"}
          >
            {visibleMessage}
          </output>
        ) : null}
      </div>
    </form>
  );
}
