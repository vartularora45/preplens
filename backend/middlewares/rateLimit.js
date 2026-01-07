// middleware/rateLimiter.js
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const aiSuggestionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1, // 1 request per minute
  message: {
    success: false,
    message: "Please wait 1 minute before requesting new AI suggestions"
  },
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => {
    // ✅ Prefer logged-in user
    if (req.user?.id) return `user_${req.user.id}`;
    if (req.userId) return `user_${req.userId}`;

    // ✅ Fallback for non-auth users (IPv4 + IPv6 safe)
    return ipKeyGenerator(req);
  }
});
