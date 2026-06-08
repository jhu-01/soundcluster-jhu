import { useMemo, useState } from "react";

import type { ClusterShareSnapshot } from "../types/shareSnapshot";
import { createShareSnapshotUrl } from "../utils/shareSnapshot";
import styles from "./ShareModal.module.css";

interface ShareModalProps {
  isOpen: boolean;
  snapshot: ClusterShareSnapshot;
  onClose: () => void;
}

export function ShareModal({ isOpen, snapshot, onClose }: ShareModalProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const shareUrl = useMemo(() => {
    return createShareSnapshotUrl(snapshot, window.location.href);
  }, [snapshot]);

  if (!isOpen) {
    return null;
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopyStatus("copied");
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
          <h2>Share Snapshot</h2>
          <button aria-label="Close share modal" onClick={onClose} type="button">
            x
          </button>
        </div>
        <input className={styles.urlInput} readOnly value={shareUrl} />
        <button className={styles.copyButton} onClick={handleCopy} type="button">
          {copyStatus === "copied" ? "Copied" : "Copy Link"}
        </button>
      </section>
    </div>
  );
}
