import mongoose from "mongoose";
const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, index: true },
  topic: String,
  difficulty: { type: String, enum: ["easy", "medium", "hard"] },
  problemId: String,
  result: {
    correct: Boolean,
    timeTakenSeconds: Number,
    attemptNumber: Number,
    timestamp: { type: Date, default: Date.now }
  },
  metadata: {
    edgeCase: Boolean,
    isRetry: Boolean,
    previousCorrect: Boolean
  }
});

submissionSchema.index({ userId: 1, topic: 1, "result.timestamp": -1 });

export default mongoose.model("Submission", submissionSchema);
