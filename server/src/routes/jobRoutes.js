import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
  createJob,
  getEmployerJobs,
  getAllJobs,
  getPublicJobStats,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("employer"),
  createJob
);

router.get(
  "/employer",
  authMiddleware,
  roleMiddleware("employer"),
  getEmployerJobs
);

router.get("/", getAllJobs);

router.get("/stats", getPublicJobStats);

router.get("/:id", getJobById);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("employer"),
  updateJob
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("employer"),
  deleteJob
);

export default router;