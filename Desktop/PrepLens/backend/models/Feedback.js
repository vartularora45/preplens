import mongoose from "mongoose";
const ruleSchema = new mongoose.Schema({
  ruleId: String,
  severity: String,
  message: String,
  suggestion: String
}, { _id: false });

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, index: true },
  submissionId: mongoose.Schema.Types.ObjectId,
  rulesFired: [ruleSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Feedback", feedbackSchema);
