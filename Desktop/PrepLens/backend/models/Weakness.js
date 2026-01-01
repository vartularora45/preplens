import mongoose from "mongoose";

const weaknessSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, index: true },
  topicId: String,
  rootCause: {
    type: String,
    enum: ["lowAccuracy", "slowSpeed", "inconsistency", "prerequisiteGap"]
  },
  severity: {
    type: String,
    enum: ["critical", "high", "medium"]
  },
  evidence: {
    recentAccuracy: Number,
    recentSpeed: Number,
    sampleSize: Number
  },
  relatedTopics: [String],
  reviewDueAt: Date,
  spaced: {
    reviewCount: Number,
    interval: Number,
    easeFactor: Number
  }
}, { timestamps: true });

export default mongoose.model("Weakness", weaknessSchema);
