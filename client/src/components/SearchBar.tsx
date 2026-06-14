import { useState } from "react";
import type { FormEvent } from "react";

import styles from "./SearchBar.module.css";

interface SearchBarProps {
  message: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
  query: string;
  status: "idle" | "loading" | "error";
}

const MAX_QUERY_LENGTH = 160;

export function SearchBar({
  message,
  onQueryChange,
  onSearch,
  query,
  status,
}: SearchBarProps) {
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

    onQueryChange(trimmedQuery);
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
            onQueryChange(event.target.value);
            setValidationMessage(null);
          }}
          placeholder="Search by song title or artist..."
          value={query}
        />
      </label>
      <div className={styles.actions}>
        <button
          aria-label={isLoading ? "Searching iTunes" : "Search iTunes"}
          disabled={isLoading}
          type="submit"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="20"
            viewBox="0 0 24 24"
            width="20"
          >
            <path
              d="m15.8 15.8 4.2 4.2M17.4 10.8a6.6 6.6 0 1 1-13.2 0 6.6 6.6 0 0 1 13.2 0Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.8"
            />
          </svg>
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
