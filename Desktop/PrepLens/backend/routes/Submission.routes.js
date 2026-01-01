import express from "express";
import { submitProblem,getSubmissionById,getSubmissionsStats,getUserSubmissions } from "../controllers/SubmissionController.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, submitProblem);
router.get("/user/:userId", protect, getUserSubmissions);
router.get("/stats", protect, getSubmissionsStats);
router.get("/:submissionId", protect, getSubmissionById);

export default router;
