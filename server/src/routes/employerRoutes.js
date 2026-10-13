import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  getEmployerProfile,
  createEmployerProfile,
  updateEmployerProfile,
} from "../controllers/employerController.js";

const router = express.Router();

router.get(
  "/profile",
  authMiddleware,
  roleMiddleware("employer"),
  getEmployerProfile
);

router.post(
  "/profile",
  authMiddleware,
  roleMiddleware("employer"),
  createEmployerProfile
);

router.patch(
  "/profile",
  authMiddleware,
  roleMiddleware("employer"),
  updateEmployerProfile
);

export default router;