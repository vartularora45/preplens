import express from "express";
import { register, login,getUserProfile } from "../controllers/User.controller.js";
import {protect} from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/:id",protect, getUserProfile);

export default router;
