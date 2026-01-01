import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization || req.cookies.token;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
