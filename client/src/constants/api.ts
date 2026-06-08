import {
  ANALYZE_ROUTE_PREFIX,
  ANALYZE_STREAM_ROUTE,
} from "../../../shared/constants/analyzeStream";
import { SERVER_DEFAULT_PORT } from "../../../shared/constants/server";

const LOCAL_API_BASE_URL = `http://127.0.0.1:${SERVER_DEFAULT_PORT}`;
const configuredApiBaseUrl = import.meta.env?.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = configuredApiBaseUrl
  ? configuredApiBaseUrl
  : LOCAL_API_BASE_URL;

export const ANALYZE_STREAM_ENDPOINT = `${ANALYZE_ROUTE_PREFIX}${ANALYZE_STREAM_ROUTE}`;
