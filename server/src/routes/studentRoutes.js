import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import roleMiddleware from "../middleware/roleMiddleware.js";
import { uploadResume } from "../middleware/resumeUpload.js";

import {
  getStudentProfile,
  uploadStudentResume,
  downloadStudentResume,
  createStudentProfile,
  updateStudentProfile,
  saveJob,
  removeSavedJob,
  getSavedJobs,
} from "../controllers/studentController.js";

const router = express.Router();

router.get(
  "/resume",
  authMiddleware,
  roleMiddleware("student"),
  downloadStudentResume
);

router.post(
  "/resume",
  authMiddleware,
  roleMiddleware("student"),
  uploadResume,
  uploadStudentResume
);

router.get(
  "/profile",
  authMiddleware,
  roleMiddleware("student"),
  getStudentProfile
);

router.post(
  "/profile",
  authMiddleware,
  roleMiddleware("student"),
  createStudentProfile
);

router.patch(
  "/profile",
  authMiddleware,
  roleMiddleware("student"),
  updateStudentProfile
);

router.get(
  "/saved-jobs",
  authMiddleware,
  roleMiddleware("student"),
  getSavedJobs
);

router.post(
  "/saved-jobs/:jobId",
  authMiddleware,
  roleMiddleware("student"),
  saveJob
);

router.delete(
  "/saved-jobs/:jobId",
  authMiddleware,
  roleMiddleware("student"),
  removeSavedJob
);

export default router;