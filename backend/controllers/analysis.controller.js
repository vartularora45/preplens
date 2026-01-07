// controllers/analysis.controller.js
import Submission from "../models/Submission.js";
import Weakness from "../models/Weakness.js";
import User from "../models/User.js";
import runRules from "../services/ruleEngineServices.js";

export const analyzeUserTopic = async (userId, topicId) => {
  try {
    const submissions = await Submission.find({
      userId,
      topic: topicId
    }).lean();

    // Need minimum data to analyze
    if (submissions.length < 3) return;

    let correct = 0;
    let totalTime = 0;
    let easyWrong = 0;

    submissions.forEach(sub => {
      const difficulty = sub.difficulty || "medium";
      const result = sub.result || {};

      if (result.correct) correct++;
      if (!result.correct && difficulty === "easy") easyWrong++;
      totalTime += result.timeTakenSeconds || 0;
    });

    const stats = {
      topicId,
      attempts: submissions.length,
      accuracy: Math.round((correct / submissions.length) * 100),
      avgTime: Math.round(totalTime / submissions.length),
      easyWrong
    };

    const weaknesses = runRules(stats);

    if (!weaknesses || weaknesses.length === 0) return;

    // Create or update weaknesses
    for (const w of weaknesses) {
      if (!w.rootCause) continue;

      const exists = await Weakness.findOne({
        userId,
        topicId,
        rootCause: w.rootCause
      });

      if (!exists) {
        await Weakness.create({
          userId,
          topicId,
          rootCause: w.rootCause,
          severity: w.severity || "medium",
          evidence: {
            recentAccuracy: stats.accuracy,
            recentSpeed: stats.avgTime,
            sampleSize: stats.attempts
          },
          reviewDueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          spaced: {
            reviewCount: 0,
            interval: 3,
            easeFactor: 2.5
          }
        });
      } else {
        // Update existing weakness
        exists.evidence = {
          recentAccuracy: stats.accuracy,
          recentSpeed: stats.avgTime,
          sampleSize: stats.attempts
        };
        exists.severity = w.severity || exists.severity;
        await exists.save();
      }
    }
  } catch (err) {
    console.error("analyzeUserTopic error:", err);
    throw err;
  }
};

export const getUserWeaknesses = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const weaknesses = await Weakness.find({ userId })
      .sort({ reviewDueAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      weaknesses
    });
  } catch (err) {
    console.error("getUserWeaknesses error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch weaknesses",
      error: err.message
    });
  }
};

export const getTopicWeaknesses = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const topicId = String(req.params.topicId).trim();

    if (!topicId) {
      return res.status(400).json({
        success: false,
        message: "Topic ID is required"
      });
    }

    const weaknesses = await Weakness.find({ userId, topicId })
      .sort({ reviewDueAt: 1 })
      .lean();

    if (!weaknesses.length) {
      return res.status(200).json({
        success: true,
        weaknesses: [],
        message: "No weaknesses found for this topic"
      });
    }

    return res.status(200).json({
      success: true,
      weaknesses
    });
  } catch (err) {
    console.error("getTopicWeaknesses error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch topic weaknesses",
      error: err.message
    });
  }
};

export const deleteWeakness = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { weaknessId } = req.params;

    const weakness = await Weakness.findOne({
      _id: weaknessId,
      userId
    });

    if (!weakness) {
      return res.status(404).json({
        success: false,
        message: "Weakness not found"
      });
    }

    await Weakness.deleteOne({ _id: weaknessId, userId });

    return res.status(200).json({
      success: true,
      message: "Weakness deleted successfully"
    });
  } catch (err) {
    console.error("deleteWeakness error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete weakness",
      error: err.message
    });
  }
};

/**
 * ✅ Universal getDashboard function
 * Can be used as:
 * 1. API endpoint: getDashboard(req, res)
 * 2. Reusable function: getDashboard(userId) 
 */
export const getDashboard = async (reqOrUserId, res) => {
  try {
    // ✅ Check if called as API endpoint or direct function
    const isApiCall = typeof reqOrUserId === "object" && res !== undefined;
    
    const userId = isApiCall 
      ? (reqOrUserId.user?.id || reqOrUserId.userId)
      : reqOrUserId;

    if (!userId) {
      if (isApiCall) {
        return res.status(401).json({ 
          success: false, 
          message: "Unauthorized" 
        });
      }
      throw new Error("User ID is required");
    }

    // ✅ Fetch data
    const user = await User.findById(userId).lean();
    if (!user) {
      if (isApiCall) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }
      throw new Error("User not found");
    }

    const totalProblems = Number(user.globalStats?.totalProblems || 0);
    const correctCount = Number(user.globalStats?.correctCount || 0);

    // ✅ SINGLE SOURCE OF TRUTH
    const avgAccuracy =
      totalProblems > 0
        ? Math.round((correctCount / totalProblems) * 100)
        : 0;

    const globalStats = {
      totalProblems,
      correctCount,
      avgAccuracy: Math.min(100, avgAccuracy) // ⛔ HARD CAP
    };

    const weaknesses = await Weakness.find({ userId })
      .sort({ reviewDueAt: 1 })
      .lean();

    const recentSubmissions = await Submission.find({ userId })
      .sort({ "result.timestamp": -1 })
      .limit(10)
      .lean();

    const dashboardData = {
      topicStats: user.topicGraph || {},
      globalStats,
      weaknesses,
      recentSubmissions
    };

    // ✅ Return based on call type
    if (isApiCall) {
      return res.status(200).json({
        success: true,
        ...dashboardData
      });
    }

    // Direct function call - return data
    return dashboardData;

  } catch (err) {
    console.error("Dashboard error:", err);
    
    if (isApiCall) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard"
      });
    }

    // Re-throw for function calls
    throw err;
  }
};

export default analyzeUserTopic;
// User.updateMany({}, { $unset: { "globalStats.avgAccuracy": "" } })
