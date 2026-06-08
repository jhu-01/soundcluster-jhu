import type { EmotionVector } from "./musicAnalysis.js";

export type Vector3Tuple = [number, number, number];

export interface ClusterShareTrack {
  albumImageUrl?: string | null;
  id: string;
  title: string;
  artist: string;
  itunesTrackId?: string;
  itunesUrl?: string;
  emotions: EmotionVector;
}

export interface ClusterShareSnapshot {
  version: 1;
  selectedTrackId: string | null;
  cameraPosition: Vector3Tuple;
  cameraTarget: Vector3Tuple;
  tracks: ClusterShareTrack[];
}

export interface CreateShareSnapshotResponse {
  shareId: string;
}

export interface ReadShareSnapshotResponse {
  snapshot: ClusterShareSnapshot;
}
