import express from "express";
import { getUserWeaknesses, getTopicWeaknesses,getDashboard } from "../controllers/analysis.controller.js";
import { getAiSuggestions } from "../controllers/Suggestion.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import {aiSuggestionLimiter} from "../middlewares/rateLimit.js";
// import { addSubmissionFromLink } from "../controllers/LinkController.js";


const router = express.Router();

// All weaknesses for logged-in user
router.get("/weaknesses", protect, getUserWeaknesses);
router.get("/dashboard", protect, getDashboard);
router.get("/ai-suggestions", protect, aiSuggestionLimiter, getAiSuggestions);

// Parse LeetCode submission link

// Weaknesses for a single topic
router.get("/weaknesses/:topicId", protect, getTopicWeaknesses);

export default router;
