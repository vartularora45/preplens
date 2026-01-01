import express from "express";
import { getUserWeaknesses, getTopicWeaknesses,getDashboard } from "../controllers/analysis.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All weaknesses for logged-in user
router.get("/weaknesses", protect, getUserWeaknesses);
router.get("/dashboard", protect, getDashboard);
// Weaknesses for a single topic
router.get("/weaknesses/:topicId", protect, getTopicWeaknesses);

export default router;
