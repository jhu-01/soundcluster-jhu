import { Router } from "express";

import { ANALYZE_STREAM_ROUTE } from "../../../shared/constants/analyzeStream.js";
import { streamAnalyzeController } from "../controllers/analyzeController.js";

export const analyzeRouter = Router();

analyzeRouter.get(ANALYZE_STREAM_ROUTE, streamAnalyzeController);
