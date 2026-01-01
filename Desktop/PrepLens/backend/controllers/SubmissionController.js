// controllers/submissionController.js
import Submission from "../models/Submission.js";
import User from "../models/User.js";
import analyzeUserTopic from "../controllers/analysis.controller.js";
import handleReviewSchedule from "../controllers/review.controller.js";
import mongoose from "mongoose";
export const submitProblem = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    
    const { topic, difficulty, problemId, correct, timeTakenSeconds, attemptNumber } = req.body;

    if (!topic || !problemId || correct === undefined || !difficulty) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const submission = await Submission.create({
      userId,
      topic,
      difficulty,
      problemId,
      result: { correct, timeTakenSeconds, attemptNumber, timestamp: new Date() },
      metadata: { isRetry: attemptNumber > 1 }
    });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.topicGraph) user.topicGraph = {};
    if (!user.globalStats) user.globalStats = { totalProblems: 0, correctCount: 0, avgAccuracy: 0 };

    let topicData = user.topicGraph[topic] || { mastered: false, proficiency: 0, totalAttempts: 0, correctAttempts: 0 };
    topicData.totalAttempts += 1;
    if (correct) topicData.correctAttempts += 1;

    topicData.proficiency = Math.round((topicData.correctAttempts / topicData.totalAttempts) * 100);
    topicData.mastered = topicData.proficiency >= 85;

    user.topicGraph[topic] = topicData;
    user.markModified("topicGraph");

    user.globalStats.totalProblems += 1;
    if (correct) user.globalStats.correctCount += 1;
    user.globalStats.avgAccuracy = Math.round((user.globalStats.correctCount / user.globalStats.totalProblems) * 100);

    await user.save();
   
    
   
    analyzeUserTopic(userId, topic)
      .then(() => console.log("Analysis finished", { userId, topic }))
      .catch(err => console.error("Analysis error:", err));
   await handleReviewSchedule({
  userId,
  topicId: topic,
  accuracy: correct ? 1 : 0
});

    res.status(201).json({
      success: true,
      message: "Submission recorded",
      submissionId: submission._id,
      topicStats: topicData,
      globalStats: user.globalStats
    });
  } catch (err) {
    console.error("Submission Error:", err);
    res.status(500).json({ message: "Submission failed", error: err.message });
  }
};




export const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    // ❌ no userId = no data
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    const { topic, difficulty } = req.query;
    const limit = Number(req.query.limit) || 20;
    const skip = Number(req.query.skip) || 0;

    const query = {
      userId: new mongoose.Types.ObjectId(userId)
    };

    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;

    const submissions = await Submission.find(query)
      .sort({ "result.timestamp": -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ submissions });
  } catch (err) {
    console.error("Get Submissions Error:", err);
    res.status(500).json({
      message: "Failed to retrieve submissions",
      error: err.message
    });
  }
};



export const getSubmissionById = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { submissionId } = req.params;
    const submission = await Submission.findOne({ _id: submissionId, userId });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    res.status(200).json({ submission });
  }
  catch (err) {
    console.error("Get Submission By ID Error:", err);
    res.status(500).json({ message: "Failed to retrieve submission", error: err.message });
  }
};



export const deleteSubmission = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { submissionId } = req.params;
    const deletionResult = await Submission.deleteOne({ _id: submissionId, userId });
    if (deletionResult.deletedCount === 0) {
      return res.status(404).json({ message: "Submission not found or already deleted" });
    }
    res.status(200).json({ message: "Submission deleted successfully" });
  }
  catch (err) {
    console.error("Delete Submission Error:", err);
    res.status(500).json({ message: "Failed to delete submission", error: err.message });
  }

};


export const getSubmissionsStats = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const stats = await Submission.aggregate([
  { $match: { userId: new mongoose.Types.ObjectId(userId) } },
  {
    $group: {
      _id: "$difficulty",
      totalSubmissions: { $sum: 1 },
      correctSubmissions: { $sum: { $cond: ["$result.correct", 1, 0] } },
      avgTime: { $avg: "$result.timeTakenSeconds" }
    }
  },
  {
    $project: {
      _id: 0, // remove _id
      difficulty: "$_id",
      totalSubmissions: 1,
      correctSubmissions: 1,
      avgTime: { $round: ["$avgTime", 2] } // round to 2 decimal places
    }
  }
]);

res.status(200).json({ stats });

  } 
  catch (err) {
    console.error("Get Submissions Stats Error:", err);
    res.status(500).json({ message: "Failed to retrieve submission stats", error: err.message });
  }
};

