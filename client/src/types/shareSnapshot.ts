import type { EmotionVector } from "../../../shared/types/musicAnalysis";

export type Vector3Tuple = [number, number, number];

export interface ClusterShareTrack {
  id: string;
  title: string;
  artist: string;
  emotions: EmotionVector;
}

export interface ClusterShareSnapshot {
  version: 1;
  selectedTrackId: string | null;
  cameraPosition: Vector3Tuple;
  cameraTarget: Vector3Tuple;
  tracks: ClusterShareTrack[];
}
