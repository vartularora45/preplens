// feedbackController.js
import Feedback from "../models/Feedback.js";

/**
 * POST /api/feedback
 * Add new feedback for a submission
 */
export const createFeedback = async (req, res) => {
  try {
    const { userId, submissionId, rulesFired } = req.body;

    if (!userId || !submissionId || !rulesFired) {
      return res.status(400).json({ error: "userId, submissionId, and rulesFired are required." });
    }

    const newFeedback = new Feedback({ userId, submissionId, rulesFired });
    const savedFeedback = await newFeedback.save();

    res.status(201).json(savedFeedback);
  } catch (error) {
    console.error("Error creating feedback:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/feedback/:userId
 * Get all feedbacks for a specific user
 */
export const getFeedbackByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const feedbacks = await Feedback.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/feedback/submission/:submissionId
 * Get feedback for a specific submission
 */
export const getFeedbackBySubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const feedback = await Feedback.findOne({ submissionId });

    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found for this submission" });
    }

    res.status(200).json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * DELETE /api/feedback/:id
 * Delete feedback by ID
 */
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Feedback.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
