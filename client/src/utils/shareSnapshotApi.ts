import { SHARE_SNAPSHOT_ROUTE_PREFIX } from "../../../shared/constants/shareSnapshot";
import type {
  ClusterShareSnapshot,
  CreateShareSnapshotResponse,
  ReadShareSnapshotResponse,
} from "../../../shared/types/shareSnapshot";
import { API_BASE_URL } from "../constants/api";

export const createShareSnapshotEndpointUrl = (): string => {
  return new URL(SHARE_SNAPSHOT_ROUTE_PREFIX, API_BASE_URL).toString();
};

export const createReadShareSnapshotEndpointUrl = (shareId: string): string => {
  return new URL(
    `${SHARE_SNAPSHOT_ROUTE_PREFIX}/${encodeURIComponent(shareId)}`,
    API_BASE_URL,
  ).toString();
};

export const createShareSnapshot = async (
  snapshot: ClusterShareSnapshot,
): Promise<CreateShareSnapshotResponse> => {
  const response = await fetch(createShareSnapshotEndpointUrl(), {
    body: JSON.stringify({ snapshot }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`share snapshot request failed with status ${response.status}`);
  }

  return (await response.json()) as CreateShareSnapshotResponse;
};

export const readShareSnapshot = async (
  shareId: string,
): Promise<ReadShareSnapshotResponse> => {
  const response = await fetch(createReadShareSnapshotEndpointUrl(shareId));

  if (!response.ok) {
    throw new Error(`share snapshot lookup failed with status ${response.status}`);
  }

  return (await response.json()) as ReadShareSnapshotResponse;
};
