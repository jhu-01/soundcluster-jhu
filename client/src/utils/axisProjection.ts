import type { EmotionVector } from "../../../shared/types/musicAnalysis";
import type { AxisSelection, EmotionAxis } from "../constants/emotionControls";

export type ScenePosition = [number, number, number];

type NumericVector = number[];

const SCENE_RADIUS = 3.8;
const VERTICAL_SCALE = 0.72;
const EIGENVALUE_EPSILON = 1e-7;
const POWER_ITERATION_COUNT = 42;

const getActiveAxes = (axisSelection: AxisSelection): EmotionAxis[] => {
  return Object.entries(axisSelection)
    .filter(([, isActive]) => isActive)
    .map(([axis]) => axis as EmotionAxis);
};

const centerUnitValue = (value: number): number => {
  if (value < 0) {
    return -0.5;
  }

  if (value > 1) {
    return 0.5;
  }

  return value - 0.5;
};

const toSelectedVector = (
  emotions: EmotionVector,
  activeAxes: EmotionAxis[],
): NumericVector => {
  return activeAxes.map((axis) => centerUnitValue(emotions[axis]));
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
    return Math.sin((index + 1) * (componentIndex + 1.61)) + 1.2;
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

const runClassicalProjection = (vectors: NumericVector[]): ScenePosition[] => {
  let kernel = createCenteredKernel(createSquaredDistanceMatrix(vectors));
  const coordinates: ScenePosition[] = vectors.map(() => [0, 0, 0]);

  for (let dimensionIndex = 0; dimensionIndex < 3; dimensionIndex += 1) {
    let eigenVector = createInitialEigenVector(vectors.length, dimensionIndex);

    for (let iteration = 0; iteration < POWER_ITERATION_COUNT; iteration += 1) {
      eigenVector = normalizeVector(multiplyMatrixVector(kernel, eigenVector));
    }

    const eigenValue = calculateRayleighQuotient(kernel, eigenVector);

    if (eigenValue <= EIGENVALUE_EPSILON) {
      continue;
    }

    const coordinateScale = Math.sqrt(eigenValue);

    for (let pointIndex = 0; pointIndex < coordinates.length; pointIndex += 1) {
      coordinates[pointIndex][dimensionIndex] =
        eigenVector[pointIndex] * coordinateScale;
    }

    kernel = subtractOuterProduct(kernel, eigenValue, eigenVector);
  }

  return normalizeScenePositions(coordinates);
};

const normalizeScenePositions = (positions: ScenePosition[]): ScenePosition[] => {
  const maxRadius = positions.reduce((largestRadius, position) => {
    return Math.max(largestRadius, Math.hypot(position[0], position[1], position[2]));
  }, 0);
  const scale = maxRadius > EIGENVALUE_EPSILON ? SCENE_RADIUS / maxRadius : SCENE_RADIUS;

  return positions.map((position) => {
    return [
      position[0] * scale,
      position[1] * scale * VERTICAL_SCALE,
      position[2] * scale,
    ];
  });
};

const projectDirectAxes = (
  emotions: EmotionVector,
  activeAxes: EmotionAxis[],
): ScenePosition => {
  const coordinates: ScenePosition = [0, 0, 0];

  activeAxes.forEach((axis, index) => {
    const projectedValue = centerUnitValue(emotions[axis]) * SCENE_RADIUS * 2;

    if (index === 0) {
      coordinates[0] = projectedValue;
    }

    if (index === 1) {
      coordinates[2] = projectedValue;
    }

    if (index === 2) {
      coordinates[1] = projectedValue * VERTICAL_SCALE;
    }
  });

  return coordinates;
};

export const projectEmotionVectorsByAxes = (
  vectors: EmotionVector[],
  axisSelection: AxisSelection,
): ScenePosition[] => {
  const activeAxes = getActiveAxes(axisSelection);

  if (activeAxes.length <= 3) {
    return vectors.map((vector) => projectDirectAxes(vector, activeAxes));
  }

  const selectedVectors = vectors.map((vector) => {
    return toSelectedVector(vector, activeAxes);
  });

  return runClassicalProjection(selectedVectors);
};
