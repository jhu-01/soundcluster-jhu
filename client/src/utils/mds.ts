import { Vector3 } from "three";

import type { EmotionVector } from "../../../shared/types/musicAnalysis";

export type EmotionAxis = keyof EmotionVector;

export type EmotionAxisWeights = Partial<Record<EmotionAxis, number>>;

export interface MdsMappingOptions {
  axisWeights?: EmotionAxisWeights;
  sceneScale?: number;
  verticalScale?: number;
}

export interface EmotionScenePoint {
  position: Vector3;
  color: string;
  scale: number;
  intensity: number;
}

type NumericVector = [number, number, number, number, number];

const EMOTION_AXES: readonly EmotionAxis[] = [
  "energy",
  "valence",
  "tempoDensity",
  "spaceDepth",
  "tension",
];

const DEFAULT_AXIS_WEIGHTS: Record<EmotionAxis, number> = {
  energy: 1.14,
  valence: 1.04,
  tempoDensity: 0.92,
  spaceDepth: 1.08,
  tension: 1.16,
};

const DEFAULT_SCENE_SCALE = 4.2;
const DEFAULT_VERTICAL_SCALE = 0.72;
const COLOR_HUE_BASE = 180;
const COLOR_HUE_VALENCE_RANGE = 120;
const COLOR_HUE_TENSION_OFFSET = 42;
const COLOR_SATURATION = 86;
const COLOR_LIGHTNESS_BASE = 48;
const COLOR_LIGHTNESS_ENERGY_RANGE = 18;
const NODE_SCALE_BASE = 0.16;
const NODE_SCALE_TEMPO_RANGE = 0.24;
const NODE_INTENSITY_BASE = 1.12;
const NODE_INTENSITY_ENERGY_RANGE = 0.82;
const NODE_INTENSITY_TENSION_RANGE = 0.42;
const POWER_ITERATION_COUNT = 48;
const EIGENVALUE_EPSILON = 1e-7;

const resolveAxisWeights = (
  axisWeights: EmotionAxisWeights = {},
): Record<EmotionAxis, number> => {
  return {
    ...DEFAULT_AXIS_WEIGHTS,
    ...axisWeights,
  };
};

const clampUnitValue = (value: number): number => {
  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
};

const toWeightedVector = (
  vector: EmotionVector,
  axisWeights: Record<EmotionAxis, number>,
): NumericVector => {
  return EMOTION_AXES.map((axis) => {
    return (clampUnitValue(vector[axis]) - 0.5) * axisWeights[axis];
  }) as NumericVector;
};

const createSquaredDistanceMatrix = (vectors: NumericVector[]): number[][] => {
  return vectors.map((sourceVector) => {
    return vectors.map((targetVector) => {
      return sourceVector.reduce((distance, value, index) => {
        const difference = value - targetVector[index];

        return distance + difference * difference;
      }, 0);
    });
  });
};

const mean = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const createCenteredKernel = (squaredDistances: number[][]): number[][] => {
  const rowMeans = squaredDistances.map(mean);
  const columnMeans = squaredDistances[0].map((_, columnIndex) => {
    return mean(squaredDistances.map((row) => row[columnIndex]));
  });
  const totalMean = mean(rowMeans);

  return squaredDistances.map((row, rowIndex) => {
    return row.map((distance, columnIndex) => {
      const centeredDistance =
        distance - rowMeans[rowIndex] - columnMeans[columnIndex] + totalMean;

      return -0.5 * centeredDistance;
    });
  });
};

const multiplyMatrixVector = (matrix: number[][], vector: number[]): number[] => {
  return matrix.map((row) => {
    return row.reduce((sum, value, index) => {
      return sum + value * vector[index];
    }, 0);
  });
};

const vectorMagnitude = (vector: number[]): number => {
  return Math.sqrt(
    vector.reduce((sum, value) => {
      return sum + value * value;
    }, 0),
  );
};

const normalizeVector = (vector: number[]): number[] => {
  const magnitude = vectorMagnitude(vector);

  if (magnitude <= EIGENVALUE_EPSILON) {
    return vector.map(() => 0);
  }

  return vector.map((value) => value / magnitude);
};

const createInitialEigenVector = (
  size: number,
  componentIndex: number,
): number[] => {
  const values = Array.from({ length: size }, (_, index) => {
    return Math.sin((index + 1) * (componentIndex + 1.37)) + 1.3;
  });

  return normalizeVector(values);
};

const calculateRayleighQuotient = (
  matrix: number[][],
  vector: number[],
): number => {
  const multipliedVector = multiplyMatrixVector(matrix, vector);

  return vector.reduce((sum, value, index) => {
    return sum + value * multipliedVector[index];
  }, 0);
};

const subtractOuterProduct = (
  matrix: number[][],
  eigenValue: number,
  eigenVector: number[],
): number[][] => {
  return matrix.map((row, rowIndex) => {
    return row.map((value, columnIndex) => {
      return value - eigenValue * eigenVector[rowIndex] * eigenVector[columnIndex];
    });
  });
};

const extractMdsCoordinates = (
  kernel: number[][],
  dimensionCount: number,
): number[][] => {
  let workingKernel = kernel.map((row) => [...row]);
  const coordinates = kernel.map(() => [0, 0, 0]);

  for (let dimensionIndex = 0; dimensionIndex < dimensionCount; dimensionIndex += 1) {
    let eigenVector = createInitialEigenVector(kernel.length, dimensionIndex);

    for (let iteration = 0; iteration < POWER_ITERATION_COUNT; iteration += 1) {
      eigenVector = normalizeVector(multiplyMatrixVector(workingKernel, eigenVector));
    }

    const eigenValue = calculateRayleighQuotient(workingKernel, eigenVector);

    if (eigenValue <= EIGENVALUE_EPSILON) {
      continue;
    }

    const coordinateScale = Math.sqrt(eigenValue);

    for (let pointIndex = 0; pointIndex < coordinates.length; pointIndex += 1) {
      coordinates[pointIndex][dimensionIndex] = eigenVector[pointIndex] * coordinateScale;
    }

    workingKernel = subtractOuterProduct(workingKernel, eigenValue, eigenVector);
  }

  return coordinates;
};

const projectSingleVector = (
  vector: EmotionVector,
  axisWeights: Record<EmotionAxis, number>,
  sceneScale: number,
  verticalScale: number,
): Vector3 => {
  const weightedVector = toWeightedVector(vector, axisWeights);
  const x = weightedVector[0] - weightedVector[4] * 0.46;
  const y = (weightedVector[3] - weightedVector[2] * 0.28) * verticalScale;
  const z = weightedVector[1] + weightedVector[2] * 0.36;

  return new Vector3(x, y, z).multiplyScalar(sceneScale);
};

const normalizeCoordinates = (
  coordinates: number[][],
  sceneScale: number,
  verticalScale: number,
): Vector3[] => {
  const maxRadius = coordinates.reduce((largestRadius, coordinate) => {
    const radius = Math.hypot(coordinate[0], coordinate[1], coordinate[2]);

    return Math.max(largestRadius, radius);
  }, 0);
  const scale = maxRadius > EIGENVALUE_EPSILON ? sceneScale / maxRadius : sceneScale;

  return coordinates.map((coordinate) => {
    return new Vector3(
      coordinate[0] * scale,
      coordinate[1] * scale * verticalScale,
      coordinate[2] * scale,
    );
  });
};

export const mapEmotionVectorsToScenePoints = (
  vectors: EmotionVector[],
  options: MdsMappingOptions = {},
): Vector3[] => {
  const axisWeights = resolveAxisWeights(options.axisWeights);
  const sceneScale = options.sceneScale ?? DEFAULT_SCENE_SCALE;
  const verticalScale = options.verticalScale ?? DEFAULT_VERTICAL_SCALE;

  if (vectors.length === 0) {
    return [];
  }

  if (vectors.length === 1) {
    return [projectSingleVector(vectors[0], axisWeights, sceneScale, verticalScale)];
  }

  const weightedVectors = vectors.map((vector) => {
    return toWeightedVector(vector, axisWeights);
  });
  const squaredDistances = createSquaredDistanceMatrix(weightedVectors);
  const kernel = createCenteredKernel(squaredDistances);
  const coordinates = extractMdsCoordinates(kernel, 3);

  return normalizeCoordinates(coordinates, sceneScale, verticalScale);
};

export const mapEmotionVectorToScenePoint = (
  vector: EmotionVector,
  options: MdsMappingOptions = {},
): Vector3 => {
  return mapEmotionVectorsToScenePoints([vector], options)[0];
};

const mapEmotionVectorToColor = (vector: EmotionVector): string => {
  const energy = clampUnitValue(vector.energy);
  const valence = clampUnitValue(vector.valence);
  const tension = clampUnitValue(vector.tension);
  const hue = Math.round(
    COLOR_HUE_BASE +
      valence * COLOR_HUE_VALENCE_RANGE -
      tension * COLOR_HUE_TENSION_OFFSET,
  );
  const lightness = Math.round(
    COLOR_LIGHTNESS_BASE + energy * COLOR_LIGHTNESS_ENERGY_RANGE,
  );

  return `hsl(${hue} ${COLOR_SATURATION}% ${lightness}%)`;
};

const mapEmotionVectorToScale = (vector: EmotionVector): number => {
  return NODE_SCALE_BASE + clampUnitValue(vector.tempoDensity) * NODE_SCALE_TEMPO_RANGE;
};

const mapEmotionVectorToIntensity = (vector: EmotionVector): number => {
  return (
    NODE_INTENSITY_BASE +
    clampUnitValue(vector.energy) * NODE_INTENSITY_ENERGY_RANGE +
    clampUnitValue(vector.tension) * NODE_INTENSITY_TENSION_RANGE
  );
};

export const mapEmotionVectorsToScenePointData = (
  vectors: EmotionVector[],
  options: MdsMappingOptions = {},
): EmotionScenePoint[] => {
  const positions = mapEmotionVectorsToScenePoints(vectors, options);

  return vectors.map((vector, index) => {
    return {
      position: positions[index],
      color: mapEmotionVectorToColor(vector),
      scale: mapEmotionVectorToScale(vector),
      intensity: mapEmotionVectorToIntensity(vector),
    };
  });
};
