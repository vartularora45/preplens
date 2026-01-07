// controllers/review.controller.js
import ReviewSchedule from "../models/Review.js";
import Weakness from "../models/Weakness.js";

/**
 * Handle review schedule creation based on weakness
 */
export const handleReviewSchedule = async ({ userId, topicId, accuracy }) => {
  try {
    if (!userId || !topicId) {
      console.error("handleReviewSchedule: userId and topicId are required");
      return;
    }

    // Find high severity weakness for this topic
    const weakness = await Weakness.findOne({
      userId,
      topicId,
      severity: { $in: ["high", "critical", "HIGH", "CRITICAL"] }
    }).lean();

    if (!weakness) return;

    // Check if review schedule already exists
    const existingSchedule = await ReviewSchedule.findOne({ userId, topicId });

    if (existingSchedule) {
      // Update existing schedule based on accuracy
      const interval = accuracy >= 0.8 ? 3 : accuracy >= 0.6 ? 2 : 1;
      existingSchedule.nextReviewAt = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);
      existingSchedule.reviewCount = (existingSchedule.reviewCount || 0) + 1;
      existingSchedule.lastReviewedAt = new Date();
      
      await existingSchedule.save();
      return;
    }

    // Create new review schedule
    await ReviewSchedule.create({
      userId,
      topicId,
      nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      reviewCount: 0,
      lastReviewedAt: null
    });
  } catch (error) {
    console.error("handleReviewSchedule error:", error);
  }
};

/**
 * GET /api/reviews
 * Get all review schedules for user
 */
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const reviews = await ReviewSchedule.find({ userId })
      .sort({ nextReviewAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      reviews,
      count: reviews.length
    });
  } catch (error) {
    console.error("getUserReviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message
    });
  }
};

/**
 * GET /api/reviews/due
 * Get reviews that are due for review
 */
export const getDueReviews = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const now = new Date();
    const dueReviews = await ReviewSchedule.find({
      userId,
      nextReviewAt: { $lte: now }
    })
      .sort({ nextReviewAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      reviews: dueReviews,
      count: dueReviews.length
    });
  } catch (error) {
    console.error("getDueReviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch due reviews",
      error: error.message
    });
  }
};

/**
 * GET /api/reviews/topic/:topicId
 * Get review schedule for specific topic
 */
export const getTopicReview = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { topicId } = req.params;

    const review = await ReviewSchedule.findOne({
      userId,
      topicId
    }).lean();

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review schedule not found for this topic"
      });
    }

    return res.status(200).json({
      success: true,
      review
    });
  } catch (error) {
    console.error("getTopicReview error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch topic review",
      error: error.message
    });
  }
};

/**
 * PATCH /api/reviews/:reviewId/complete
 * Mark review as completed and update schedule
 */
export const completeReview = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { reviewId } = req.params;
    const { accuracy } = req.body;

    if (accuracy === undefined || accuracy < 0 || accuracy > 1) {
      return res.status(400).json({
        success: false,
        message: "Valid accuracy (0-1) is required"
      });
    }

    const review = await ReviewSchedule.findOne({
      _id: reviewId,
      userId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Calculate next review interval based on accuracy
    let interval = 1; // days
    if (accuracy >= 0.9) {
      interval = 7; // 1 week
    } else if (accuracy >= 0.8) {
      interval = 3; // 3 days
    } else if (accuracy >= 0.6) {
      interval = 2; // 2 days
    }

    review.lastReviewedAt = new Date();
    review.nextReviewAt = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);
    review.reviewCount = (review.reviewCount || 0) + 1;

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Review completed",
      review
    });
  } catch (error) {
    console.error("completeReview error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to complete review",
      error: error.message
    });
  }
};

/**
 * DELETE /api/reviews/:reviewId
 * Delete review schedule
 */
export const deleteReview = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { reviewId } = req.params;

    const review = await ReviewSchedule.findOne({
      _id: reviewId,
      userId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    await ReviewSchedule.deleteOne({ _id: reviewId, userId });

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    console.error("deleteReview error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message
    });
  }
};

export default handleReviewSchedule;