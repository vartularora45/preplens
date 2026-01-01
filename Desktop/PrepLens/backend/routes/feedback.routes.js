// feedbackRoutes.js
import express from "express";
import {
  createFeedback,
  getFeedbackByUser,
  getFeedbackBySubmission,
  deleteFeedback
} from "../controllers/feedbackController.js";
import {protect} from "../middlewares/auth.middleware.js";
const router = express.Router();


router.post("/", protect, createFeedback);

router.get("/user/:userId", protect, getFeedbackByUser);

router.get("/submission/:submissionId", protect, getFeedbackBySubmission);


router.delete("/:id", protect, deleteFeedback);

export default router;
