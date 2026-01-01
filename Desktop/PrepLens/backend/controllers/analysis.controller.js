import Submission from "../models/Submission.js";
import Weakness from "../models/Weakness.js";
import User from "../models/User.js";
import runRules from "../services/ruleEngineServices.js";


export const analyzeUserTopic = async (userId, topicId) => {
  try {
    const submissions = await Submission.find({
      userId,
      topic: topicId
    });

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
      }
    }
  } catch (err) {
    console.error(" analyzeUserTopic error:", err);
  }
};


export const getUserWeaknesses = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    const weaknesses = await Weakness.find({ userId })
      .sort({ reviewDueAt: 1 });

    res.status(200).json({
      success: true,
      weaknesses
    });
  } catch (err) {
    console.error(" getUserWeaknesses error:", err);
    res.status(500).json({ success: false });
  }
};


export const getTopicWeaknesses = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const topicId = String(req.params.topicId).trim(); // safe conversion

    const weaknesses = await Weakness.find({ userId, topicId })
      .sort({ reviewDueAt: 1 });

    if (!weaknesses.length) {
      return res.status(404).json({ success: false, message: "No weaknesses found for this topic" });
    }

    res.status(200).json({
      success: true,
      weaknesses
    });
  } catch (err) {
    console.error("getTopicWeaknesses error:", err);
    res.status(500).json({ success: false });
  }
};



export const getDashboard = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const topicStats = user.topicGraph || {};

    const globalStats = user.globalStats || {
      totalProblems: 0,
      correctCount: 0,
      avgAccuracy: 0
    };

    const weaknesses = await Weakness.find({ userId })
      .sort({ reviewDueAt: 1 });

    res.status(200).json({
      success: true,
      topicStats,
      globalStats,
      weaknesses
    });
  } catch (err) {
    console.error(" Dashboard error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard"
    });
  }
};

export default analyzeUserTopic;
