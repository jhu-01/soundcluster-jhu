import { Router } from "express";

import { isClusterShareSnapshot } from "../../../shared/utils/shareSnapshotValidation.js";
import {
  findShareSnapshotById,
  saveShareSnapshot,
} from "../repositories/shareSnapshot.js";

export const shareSnapshotRouter = Router();

const resolveErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};

shareSnapshotRouter.post("/", async (request, response) => {
  const snapshot = (request.body as { snapshot?: unknown }).snapshot;

  if (!isClusterShareSnapshot(snapshot)) {
    response.status(400).json({ error: "valid snapshot is required" });
    return;
  }

  try {
    response.status(201).json({
      shareId: await saveShareSnapshot(snapshot),
    });
  } catch (error: unknown) {
    response.status(500).json({ error: resolveErrorMessage(error) });
  }
});

shareSnapshotRouter.get("/:shareId", async (request, response) => {
  const shareId = request.params.shareId?.trim();

  if (!shareId) {
    response.status(400).json({ error: "shareId path parameter is required" });
    return;
  }

  try {
    const snapshot = await findShareSnapshotById(shareId);

    if (!snapshot) {
      response.status(404).json({ error: "share snapshot not found" });
      return;
    }

    response.json({ snapshot });
  } catch (error: unknown) {
    response.status(500).json({ error: resolveErrorMessage(error) });
  }
});
