import mongoose from "mongoose";

const topicProgressSchema = new mongoose.Schema({
  mastered: { type: Boolean, default: false },
  proficiency: { type: Number, min: 0, max: 100 },
  lastReviewedAt: Date,
  nextReviewAt: Date,
  totalAttempts: { type: Number, default: 0 },
  correctAttempts: { type: Number, default: 0 }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: String,
  authToken: String,
  topicGraph: {
    type: Map,
    of: topicProgressSchema
  },
  strengths: [String],
  weaknesses: [String],
  globalStats: {
    totalProblems: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    avgTimePerProblem: Number,
    avgAccuracy: Number
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
