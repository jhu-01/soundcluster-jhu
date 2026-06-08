export interface MusicMetadata {
  albumImageUrl?: string | null;
  artist: string;
  itunesTrackId?: string;
  itunesUrl?: string;
  title: string;
  lyrics: string;
}

export interface EmotionVector {
  energy: number;
  valence: number;
  tempoDensity: number;
  spaceDepth: number;
  tension: number;
}

export type UserVectorTargets = {
  [Key in keyof EmotionVector]: number | null;
};

export interface MusicAnalysisRequest {
  musicId: string;
  musicMetadata: MusicMetadata;
  userVectorTargets: UserVectorTargets;
  instruction: string;
}

export interface MusicAnalysisResponse {
  analysisStatus: "success";
  musicId: string;
  emotions: EmotionVector;
  generatedSummary: string;
}
