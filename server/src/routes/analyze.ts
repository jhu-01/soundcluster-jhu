import { Router } from "express";

import {
  ANALYZE_HISTORY_ROUTE,
  ANALYZE_STREAM_ROUTE,
} from "../../../shared/constants/analyzeStream.js";
import {
  getAnalysisHistoryController,
  streamAnalyzeController,
} from "../controllers/analyzeController.js";

export const analyzeRouter = Router();

analyzeRouter.get(ANALYZE_STREAM_ROUTE, streamAnalyzeController);
analyzeRouter.get(ANALYZE_HISTORY_ROUTE, getAnalysisHistoryController);
