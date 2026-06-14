import type { EmotionVector } from "../../../shared/types/musicAnalysis";

export interface MockTrack {
  albumImageUrl?: string | null;
  id: string;
  title: string;
  artist: string;
  itunesTrackId?: string;
  itunesUrl?: string;
  emotions: EmotionVector;
}

const baseMockTracks: MockTrack[] = [
  {
    id: "midnight-circuit",
    title: "Midnight Circuit",
    artist: "SoundCluster Lab",
    albumImageUrl: null,
    emotions: {
      energy: 0.72,
      valence: 0.42,
      tempoDensity: 0.68,
      spaceDepth: 0.75,
      tension: 0.55,
    },
  },
  {
    id: "soft-orbit",
    title: "Soft Orbit",
    artist: "Mira Field",
    albumImageUrl: null,
    emotions: {
      energy: 0.28,
      valence: 0.82,
      tempoDensity: 0.34,
      spaceDepth: 0.88,
      tension: 0.18,
    },
  },
  {
    id: "fault-line",
    title: "Fault Line",
    artist: "Noir Static",
    albumImageUrl: null,
    emotions: {
      energy: 0.91,
      valence: 0.22,
      tempoDensity: 0.86,
      spaceDepth: 0.36,
      tension: 0.92,
    },
  },
  {
    id: "glass-harbor",
    title: "Glass Harbor",
    artist: "Aster Tide",
    albumImageUrl: null,
    emotions: {
      energy: 0.46,
      valence: 0.64,
      tempoDensity: 0.52,
      spaceDepth: 0.58,
      tension: 0.38,
    },
  },
  {
    id: "solar-drift",
    title: "Solar Drift",
    artist: "Dayline",
    albumImageUrl: null,
    emotions: {
      energy: 0.66,
      valence: 0.78,
      tempoDensity: 0.72,
      spaceDepth: 0.44,
      tension: 0.31,
    },
  },
];

const CLUSTER_VARIANT_COUNT = 10;

const clampUnitValue = (value: number): number => {
  return Math.max(0, Math.min(1, value));
};

const createVariantEmotionValue = (
  value: number,
  variantIndex: number,
  offset: number,
): number => {
  const wave = Math.sin((variantIndex + 1) * offset) * 0.18;

  return Number(clampUnitValue(value + wave).toFixed(3));
};

const createMockTrackVariants = (track: MockTrack): MockTrack[] => {
  return Array.from({ length: CLUSTER_VARIANT_COUNT }, (_, variantIndex) => {
    if (variantIndex === 0) {
      return track;
    }

    return {
      id: `${track.id}-${variantIndex + 1}`,
      title: `${track.title} ${variantIndex + 1}`,
      artist: track.artist,
      emotions: {
        energy: createVariantEmotionValue(track.emotions.energy, variantIndex, 0.73),
        valence: createVariantEmotionValue(track.emotions.valence, variantIndex, 1.17),
        tempoDensity: createVariantEmotionValue(
          track.emotions.tempoDensity,
          variantIndex,
          0.91,
        ),
        spaceDepth: createVariantEmotionValue(
          track.emotions.spaceDepth,
          variantIndex,
          1.39,
        ),
        tension: createVariantEmotionValue(track.emotions.tension, variantIndex, 1.61),
      },
    };
  });
};

export const mockTracks: MockTrack[] = baseMockTracks.flatMap(
  createMockTrackVariants,
);
