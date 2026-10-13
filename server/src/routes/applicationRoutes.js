import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
  applyForJob,
  getMyApplications,
  getJobApplications,
  downloadApplicationResume,
  updateApplicationStatus,
} from "../controllers/applicationController.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("student"),
  applyForJob
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("student"),
  getMyApplications
);

router.get(
  "/:id/resume",
  authMiddleware,
  roleMiddleware("employer"),
  downloadApplicationResume
);

router.get(
  "/employer",
  authMiddleware,
  roleMiddleware("employer"),
  getJobApplications
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("employer"),
  updateApplicationStatus
);

export default router;