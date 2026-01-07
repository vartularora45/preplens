// controllers/feedbackController.js
import Feedback from "../models/Feedback.js";
import Submission from "../models/Submission.js";

/**
 * POST /api/feedback
 * Create new feedback for a submission
 */
export const createFeedback = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { submissionId, rulesFired } = req.body;

    if (!submissionId || !rulesFired || !Array.isArray(rulesFired)) {
      return res.status(400).json({
        success: false,
        message: "submissionId and rulesFired (array) are required"
      });
    }

    // Verify submission exists and belongs to user
    const submission = await Submission.findOne({
      _id: submissionId,
      userId
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    // Check if feedback already exists for this submission
    const existingFeedback = await Feedback.findOne({ submissionId });
    if (existingFeedback) {
      return res.status(409).json({
        success: false,
        message: "Feedback already exists for this submission"
      });
    }

    const newFeedback = await Feedback.create({
      userId,
      submissionId,
      rulesFired
    });

    return res.status(201).json({
      success: true,
      message: "Feedback created successfully",
      feedback: newFeedback
    });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create feedback",
      error: error.message
    });
  }
};

/**
 * GET /api/feedback
 * Get all feedbacks for the authenticated user
 */
export const getUserFeedback = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const skip = Number(req.query.skip) || 0;

    const feedbacks = await Feedback.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      feedbacks,
      count: feedbacks.length
    });
  } catch (error) {
    console.error("Error fetching user feedbacks:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch feedbacks",
      error: error.message
    });
  }
};

/**
 * GET /api/feedback/submission/:submissionId
 * Get feedback for a specific submission
 */
export const getFeedbackBySubmission = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { submissionId } = req.params;

    const feedback = await Feedback.findOne({
      submissionId,
      userId
    }).lean();

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found for this submission"
      });
    }

    return res.status(200).json({
      success: true,
      feedback
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
      error: error.message
    });
  }
};

/**
 * DELETE /api/feedback/:feedbackId
 * Delete feedback by ID
 */
export const deleteFeedback = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { feedbackId } = req.params;

    const feedback = await Feedback.findOne({
      _id: feedbackId,
      userId
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found"
      });
    }

    await Feedback.deleteOne({ _id: feedbackId, userId });

    return res.status(200).json({
      success: true,
      message: "Feedback deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete feedback",
      error: error.message
    });
  }
};

/**
 * PATCH /api/feedback/:feedbackId
 * Update feedback rules
 */
export const updateFeedback = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { feedbackId } = req.params;
    const { rulesFired } = req.body;

    if (!rulesFired || !Array.isArray(rulesFired)) {
      return res.status(400).json({
        success: false,
        message: "rulesFired (array) is required"
      });
    }

    const feedback = await Feedback.findOne({
      _id: feedbackId,
      userId
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found"
      });
    }

    feedback.rulesFired = rulesFired;
    await feedback.save();

    return res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      feedback
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update feedback",
      error: error.message
    });
  }
};