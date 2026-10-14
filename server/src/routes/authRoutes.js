import express from "express";
import rateLimit from "../middleware/rateLimit.js";

import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many unsuccessful login attempts. Please try again later.",
  skipSuccessfulRequests: true,
});
const recoveryLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many password reset requests. Please try again later.",
});
const registrationLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many registration attempts. Please try again later.",
});

router.post("/register", registrationLimit, registerUser);

router.post("/login", loginLimit, loginUser);

router.post("/forgot-password", recoveryLimit, forgotPassword);

router.post("/reset-password", recoveryLimit, resetPassword);

export default router;