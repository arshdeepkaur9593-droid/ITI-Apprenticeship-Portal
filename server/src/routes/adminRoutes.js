import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { getPortalAnalytics } from "../controllers/analyticsController.js";

import {
  getDashboardStats,
  getAllJobs,
  getPendingJobs,
  approveJob,
  suspendJob,
  activateJob,
  deleteJob,
  getEmployers,
  getEmployerById,
  approveEmployer,
  suspendEmployer,
  activateEmployer,
  resetEmployerPassword,
  getUsers,
  getUserById,
  suspendUser,
  activateUser,
} from "../controllers/adminController.js";

const router = express.Router();

router.get(
  "/analytics",
  authMiddleware,
  roleMiddleware("admin"),
  getPortalAnalytics
);

router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("admin"),
  getDashboardStats
);

router.get(
  "/jobs",
  authMiddleware,
  roleMiddleware("admin"),
  getAllJobs
);

router.get(
  "/jobs/pending",
  authMiddleware,
  roleMiddleware("admin"),
  getPendingJobs
);

router.patch(
  "/jobs/:id/approve",
  authMiddleware,
  roleMiddleware("admin"),
  approveJob
);

router.patch(
  "/jobs/:id/suspend",
  authMiddleware,
  roleMiddleware("admin"),
  suspendJob
);

router.patch(
  "/jobs/:id/activate",
  authMiddleware,
  roleMiddleware("admin"),
  activateJob
);

router.delete(
  "/jobs/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteJob
);

router.get(
  "/employers",
  authMiddleware,
  roleMiddleware("admin"),
  getEmployers
);

router.get(
  "/employers/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getEmployerById
);

router.patch(
  "/employers/:id/approve",
  authMiddleware,
  roleMiddleware("admin"),
  approveEmployer
);

router.patch(
  "/employers/:id/suspend",
  authMiddleware,
  roleMiddleware("admin"),
  suspendEmployer
);

router.patch(
  "/employers/:id/activate",
  authMiddleware,
  roleMiddleware("admin"),
  activateEmployer
);

router.patch(
  "/employers/:userId/password",
  authMiddleware,
  roleMiddleware("admin"),
  resetEmployerPassword
);

router.get(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  getUsers
);

router.get(
  "/users/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getUserById
);

router.patch(
  "/users/:id/suspend",
  authMiddleware,
  roleMiddleware("admin"),
  suspendUser
);

router.patch(
  "/users/:id/activate",
  authMiddleware,
  roleMiddleware("admin"),
  activateUser
);

export default router;