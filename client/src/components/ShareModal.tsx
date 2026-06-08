import { useEffect, useMemo, useState } from "react";

import type { ClusterShareSnapshot } from "../types/shareSnapshot";
import { createShareSnapshot } from "../utils/shareSnapshotApi";
import {
  createShortShareSnapshotUrl,
  encodeShareSnapshot,
} from "../utils/shareSnapshot";
import styles from "./ShareModal.module.css";

interface ShareModalProps {
  isOpen: boolean;
  snapshot: ClusterShareSnapshot;
  onClose: () => void;
}

export function ShareModal({ isOpen, snapshot, onClose }: ShareModalProps) {
  const [copiedUrl, setCopiedUrl] = useState("");
  const [shareResult, setShareResult] = useState({
    errorMessage: "",
    requestKey: "",
    url: "",
  });
  const requestKey = useMemo(() => {
    return isOpen ? encodeShareSnapshot(snapshot) : "";
  }, [isOpen, snapshot]);
  const hasCurrentResult = shareResult.requestKey === requestKey;
  const shareUrl = hasCurrentResult ? shareResult.url : "";
  const shareErrorMessage = hasCurrentResult ? shareResult.errorMessage : "";
  const shareStatus = shareErrorMessage ? "error" : shareUrl ? "ready" : "loading";
  const shareMessage =
    shareStatus === "ready"
      ? "Short share link is ready."
      : shareErrorMessage || "Creating short share link...";
  const copyStatus = copiedUrl === shareUrl ? "copied" : "idle";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;

    createShareSnapshot(snapshot)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setShareResult({
          errorMessage: "",
          requestKey,
          url: createShortShareSnapshotUrl(response.shareId, window.location.href),
        });
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        const errorMessage = error instanceof Error ? error.message : String(error);

        setShareResult({
          errorMessage,
          requestKey,
          url: "",
        });
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, requestKey, snapshot]);

  if (!isOpen) {
    return null;
  }

  const handleCopy = async () => {
    if (!shareUrl) {
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setCopiedUrl(shareUrl);
  };

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <section
        aria-modal="true"
        className={styles.dialog}
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <h2>Share Your Cluster</h2>
          <button aria-label="Close share modal" onClick={onClose} type="button">
            x
          </button>
        </div>
        <p className={styles.description}>Your current cluster state is ready to share.</p>
        <input
          className={styles.urlInput}
          readOnly
          value={shareUrl || shareMessage}
        />
        <span className={styles.status} data-status={shareStatus}>
          {shareMessage}
        </span>
        <button
          className={styles.copyButton}
          disabled={!shareUrl || shareStatus !== "ready"}
          onClick={handleCopy}
          type="button"
        >
          {copyStatus === "copied" ? "Copied" : "Copy Link"}
        </button>
      </section>
    </div>
  );
}
