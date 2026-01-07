import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  platform: {
    type: String,
    enum: ["leetcode", "gfg", "codeforces", "codechef", "hackerrank"],
    lowercase: true
  },

  submissionUrl: String,

  problemId: {
    type: String,
    required: true
  },

  topic: {
    type: String,
    lowercase: true,
    trim: true,
    required: true
  },

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    lowercase: true,
    required: true
  },

  language: String,

  status: String,

  result: {
    correct: { type: Boolean, required: true },
    timeTakenSeconds: { type: Number, default: 0 },
    attemptNumber: { type: Number, default: 1 },
    timestamp: { type: Date, default: Date.now }
  }
});

submissionSchema.index({ userId: 1, topic: 1, "result.timestamp": -1 });

export default mongoose.model("Submission", submissionSchema);
