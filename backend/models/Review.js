import mongoose from "mongoose";
const reviewSchema = new mongoose.Schema({
  reviewedAt: Date,
  accuracy: Number,
  interval: Number,
  easeFactor: Number,
  streak: Number
}, { _id: false });

const reviewScheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, index: true },
  topicId: String,
  reviews: [reviewSchema],
  nextReviewAt: { type: Date, index: true },
  status: {
    type: String,
    enum: ["scheduled", "overdue", "mastered", "abandoned"]
  }
});

export default mongoose.model("ReviewSchedule", reviewScheduleSchema);
