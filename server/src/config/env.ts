import { config } from "dotenv";
import { resolve } from "node:path";

const serverEnvPath = resolve(process.cwd(), "server/.env");

config({ path: serverEnvPath, quiet: true });

export const readStringEnv = (key: string, fallback: string): string => {
  const value = process.env[key];

  if (value === undefined) {
    return fallback;
  }

  return value;
};

export const readNumberEnv = (key: string, fallback: number): number => {
  const value = process.env[key];

  if (value === undefined) {
    return fallback;
  }

  const numberValue = Number(value);
  const isValidNumber = Number.isFinite(numberValue);

  if (!isValidNumber) {
    return fallback;
  }

  return numberValue;
};
