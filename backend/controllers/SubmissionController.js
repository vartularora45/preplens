// controllers/submissionController.js
import Submission from "../models/Submission.js";
import User from "../models/User.js";
import analyzeUserTopic from "../controllers/analysis.controller.js";
import handleReviewSchedule from "../controllers/review.controller.js";
import mongoose from "mongoose";

export const submitProblem = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      topic,
      difficulty,
      problemId,
      correct,
      timeTakenSeconds,
      attemptNumber,

      // 🔥 NEW (from frontend scraping)
      platform,
      submissionUrl,
      language,
      status
    } = req.body;

    // Validate required fields
    if (!topic || !problemId || correct === undefined || !difficulty) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create submission
    const submission = await Submission.create({
      userId,
      topic: topic.toLowerCase(),
      difficulty,
      problemId,

      // 🔥 store scraped metadata
      platform,
      submissionUrl,
      language,
      status,

      result: {
        correct,
        timeTakenSeconds: timeTakenSeconds || 0,
        attemptNumber: attemptNumber || 1,
        timestamp: new Date()
      },

      metadata: {
        isRetry: (attemptNumber || 1) > 1
      }
    });

    // ================= USER STATS =================

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.topicGraph) user.topicGraph = {};
    if (!user.globalStats) {
      user.globalStats = {
        totalProblems: 0,
        correctCount: 0,
        avgAccuracy: 0
      };
    }

    // Topic stats
    let topicData = user.topicGraph[topic] || {
      mastered: false,
      proficiency: 0,
      totalAttempts: 0,
      correctAttempts: 0
    };

    topicData.totalAttempts += 1;
    if (correct) topicData.correctAttempts += 1;

    topicData.proficiency = Math.round(
      (topicData.correctAttempts / topicData.totalAttempts) * 100
    );
    topicData.mastered = topicData.proficiency >= 85;

    user.topicGraph[topic] = topicData;
    user.markModified("topicGraph");

    // Global stats
    user.globalStats.totalProblems += 1;
    if (correct) user.globalStats.correctCount += 1;
    user.globalStats.avgAccuracy = Math.round(
      (user.globalStats.correctCount / user.globalStats.totalProblems) * 100
    );

    await user.save();

    // ================= BACKGROUND TASKS =================
    analyzeUserTopic(userId, topic).catch(err =>
      console.error("Analysis error:", err)
    );

    handleReviewSchedule({
      userId,
      topicId: topic,
      accuracy: correct ? 1 : 0
    }).catch(err =>
      console.error("Review schedule error:", err)
    );

    return res.status(201).json({
      success: true,
      message: "Submission recorded",
      submissionId: submission._id,
      topicStats: topicData,
      globalStats: user.globalStats
    });

  } catch (err) {
    console.error("Submission Error:", err);
    return res.status(500).json({
      message: "Submission failed",
      error: err.message
    });
  }
};


export const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { topic, difficulty } = req.query;
    const limit = Math.min(Number(req.query.limit) || 20, 100); // Max 100
    const skip = Number(req.query.skip) || 0;

    const query = { userId: new mongoose.Types.ObjectId(userId) };
    
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;

    const submissions = await Submission.find(query)
      .sort({ "result.timestamp": -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Faster queries

    return res.status(200).json({ submissions });

  } catch (err) {
    console.error("Get Submissions Error:", err);
    return res.status(500).json({
      message: "Failed to retrieve submissions",
      error: err.message
    });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { submissionId } = req.params;

    const submission = await Submission.findOne({
      _id: submissionId,
      userId
    }).lean();

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    return res.status(200).json({ submission });

  } catch (err) {
    console.error("Get Submission By ID Error:", err);
    return res.status(500).json({
      message: "Failed to retrieve submission",
      error: err.message
    });
  }
};

export const deleteSubmission = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { submissionId } = req.params;

    // First, get the submission to know topic and result
    const submission = await Submission.findOne({
      _id: submissionId,
      userId
    });

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found"
      });
    }

    const { topic, result } = submission;

    // Delete the submission
    await Submission.deleteOne({ _id: submissionId, userId });

    // Update user stats
    const user = await User.findById(userId);
    if (user) {
      // Update topic stats
      if (user.topicGraph && user.topicGraph[topic]) {
        let topicData = user.topicGraph[topic];
        
        topicData.totalAttempts = Math.max(0, topicData.totalAttempts - 1);
        if (result.correct) {
          topicData.correctAttempts = Math.max(0, topicData.correctAttempts - 1);
        }

        if (topicData.totalAttempts > 0) {
          topicData.proficiency = Math.round(
            (topicData.correctAttempts / topicData.totalAttempts) * 100
          );
          topicData.mastered = topicData.proficiency >= 85;
        } else {
          // No attempts left, reset topic
          topicData.proficiency = 0;
          topicData.mastered = false;
        }

        user.topicGraph[topic] = topicData;
        user.markModified("topicGraph");
      }

      // Update global stats
      if (user.globalStats) {
        user.globalStats.totalProblems = Math.max(0, user.globalStats.totalProblems - 1);
        if (result.correct) {
          user.globalStats.correctCount = Math.max(0, user.globalStats.correctCount - 1);
        }

        if (user.globalStats.totalProblems > 0) {
          user.globalStats.avgAccuracy = Math.round(
            (user.globalStats.correctCount / user.globalStats.totalProblems) * 100
          );
        } else {
          user.globalStats.avgAccuracy = 0;
        }
      }

      await user.save();
    }

    return res.status(200).json({
      message: "Submission deleted and stats updated successfully"
    });

  } catch (err) {
    console.error("Delete Submission Error:", err);
    return res.status(500).json({
      message: "Failed to delete submission",
      error: err.message
    });
  }
};

export const getSubmissionsStats = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const stats = await Submission.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: "$difficulty",
          totalSubmissions: { $sum: 1 },
          correctSubmissions: {
            $sum: { $cond: ["$result.correct", 1, 0] }
          },
          avgTime: { $avg: "$result.timeTakenSeconds" }
        }
      },
      {
        $project: {
          _id: 0,
          difficulty: "$_id",
          totalSubmissions: 1,
          correctSubmissions: 1,
          avgTime: { $round: ["$avgTime", 2] },
          accuracy: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$correctSubmissions", "$totalSubmissions"] },
                  100
                ]
              },
              2
            ]
          }
        }
      }
    ]);

    return res.status(200).json({ stats });

  } catch (err) {
    console.error("Get Submissions Stats Error:", err);
    return res.status(500).json({
      message: "Failed to retrieve submission stats",
      error: err.message
    });
  }
};

export const resetUserSubmissions = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await Submission.deleteMany({ userId });

    // Reset user stats 
    const user = await User.findById(userId);
    if (user) {
      user.topicGraph = {};
      user.globalStats = {
        totalProblems: 0,
        correctCount: 0,
        avgAccuracy: 0
      };
      await user.save();
    }
    return res.status(200).json({
      message: "All submissions deleted and user stats reset"
    });
  } catch (err) {
    console.error("Reset Submissions Error:", err);
    return res.status(500).json({
      message: "Failed to reset submissions",
      error: err.message
    });
  }

};
