import ReviewSchedule from "../models/Review.js";
import Weakness from "../models/Weakness.js";

const handleReviewSchedule = async ({ userId, topicId }) => {
  const weakness = await Weakness.findOne({
    userId,
    topicId,
    severity: { $in: ["HIGH", "CRITICAL"] }
  });

  if (!weakness) return;

  const exists = await ReviewSchedule.findOne({ userId, topicId });
  if (exists) return;

  await ReviewSchedule.create({
    userId,
    topicId,
    nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // tomorrow
  });
};


export default handleReviewSchedule;

