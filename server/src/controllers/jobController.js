import mongoose from "mongoose";
import Job from "../models/Job.js";
import Employer from "../models/Employer.js";
import User from "../models/User.js";
import Application from "../models/Application.js";

const editableJobFields = [
  "title",
  "trade",
  "jobType",
  "location",
  "state",
  "experience",
  "salaryMin",
  "salaryMax",
  "vacancies",
  "skills",
  "description",
  "responsibilities",
  "qualifications",
];

const getPublicEmployerIds = async () => {
  const approvedEmployers = await Employer.find({
    isApproved: true,
    isSuspended: false,
  })
    .populate({ path: "user", match: { isSuspended: false }, select: "_id" })
    .select("_id user")
    .lean();

  return approvedEmployers
    .filter((employer) => employer.user)
    .map((employer) => employer._id);
};

const validateJobPayload = (payload, partial = false) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "Job details must be an object";
  }

  const keys = Object.keys(payload);
  const unknownField = keys.find((key) => !editableJobFields.includes(key));
  if (unknownField) {
    return `Field "${unknownField}" cannot be set`;
  }

  if (partial && keys.length === 0) {
    return "At least one job detail is required";
  }

  const requiredFields = [
    "title",
    "trade",
    "jobType",
    "location",
    "state",
    "vacancies",
    "description",
  ];
  if (!partial) {
    const missingField = requiredFields.find(
      (field) => typeof payload[field] !== "string" && field !== "vacancies"
    );
    if (
      missingField ||
      !Number.isInteger(payload.vacancies) ||
      payload.vacancies < 1
    ) {
      return "Provide valid required job details";
    }
  }

  for (const field of ["title", "trade", "jobType", "location", "state", "description"]) {
    if (field in payload && (typeof payload[field] !== "string" || !payload[field].trim())) {
      return `${field} must be a non-empty string`;
    }
  }

  for (const field of ["experience", "salaryMin", "salaryMax", "vacancies"]) {
    if (field in payload) {
      const value = payload[field];
      if (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        value < (field === "vacancies" ? 1 : 0) ||
        (field === "vacancies" && !Number.isInteger(value))
      ) {
        return `${field} must be a valid non-negative number`;
      }
    }
  }

  for (const field of ["skills", "responsibilities", "qualifications"]) {
    if (
      field in payload &&
      (!Array.isArray(payload[field]) ||
        payload[field].some((item) => typeof item !== "string"))
    ) {
      return `${field} must be an array of strings`;
    }
  }

  if (
    typeof payload.salaryMin === "number" &&
    typeof payload.salaryMax === "number" &&
    payload.salaryMin > payload.salaryMax
  ) {
    return "Minimum salary cannot exceed maximum salary";
  }

  return null;
};

const getAuthorizedEmployer = async (userId, res) => {
  const employer = await Employer.findOne({ user: userId });

  if (!employer) {
    res.status(404).json({
      success: false,
      message: "Employer profile not found",
    });
    return null;
  }

  if (!employer.isApproved || employer.isSuspended) {
    res.status(403).json({
      success: false,
      message: "Your employer account is not approved for job management",
    });
    return null;
  }

  return employer;
};

const sendJobError = (res, message, error) => {
  if (error?.name === "ValidationError" || error?.name === "CastError") {
    return res.status(400).json({ success: false, message });
  }
  if (error?.code === 11000) {
    return res.status(409).json({ success: false, message });
  }
  return res.status(500).json({ success: false, message });
};

export const createJob = async (req, res) => {
  try {
    const validationError = validateJobPayload(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const employer = await getAuthorizedEmployer(req.user.userId, res);
    if (!employer) return;

    const job = await Job.create({
      ...req.body,
      employer: employer._id,
      isActive: true,
      isApproved: false,
    });

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job,
    });
  } catch (error) {
    sendJobError(res, "Failed to post job. Check the provided job details.", error);
  }
};

export const getEmployerJobs = async (req, res) => {
  try {
    const employer = await getAuthorizedEmployer(req.user.userId, res);
    if (!employer) return;

    const jobs = await Job.find({ employer: employer._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch {
    res.status(500).json({ success: false, message: "Failed to get employer jobs" });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const { trade, location, jobType, experience } = req.query;
    const filter = { isActive: true, isApproved: true };

    if (trade) filter.trade = { $regex: trade, $options: "i" };
    if (location) filter.location = { $regex: location, $options: "i" };
    if (jobType) filter.jobType = jobType;
    if (experience !== undefined) {
      const maximumExperience = Number(experience);
      if (!Number.isFinite(maximumExperience) || maximumExperience < 0) {
        return res.status(400).json({
          success: false,
          message: "Experience filter must be a non-negative number",
        });
      }
      filter.experience = { $lte: maximumExperience };
    }

    const employerIds = await getPublicEmployerIds();

    const jobs = await Job.find({ ...filter, employer: { $in: employerIds } })
      .populate("employer", "companyName contactPerson industry city state")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch {
    res.status(500).json({ success: false, message: "Failed to get jobs" });
  }
};

export const getPublicJobStats = async (req, res) => {
  try {
    const employerIds = await getPublicEmployerIds();
    const availableJobs = {
      employer: { $in: employerIds },
      isActive: true,
      isApproved: true,
    };
    const [students, hiringEmployerIds, jobs, applications, tradeCounts] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        Job.distinct("employer", availableJobs),
        Job.countDocuments(availableJobs),
        Application.countDocuments(),
        Job.aggregate([
          { $match: availableJobs },
          { $group: { _id: "$trade", count: { $sum: 1 } } },
        ]),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        students,
        hiringEmployers: hiringEmployerIds.length,
        jobs,
        applications,
        jobsByTrade: Object.fromEntries(
          tradeCounts.map(({ _id, count }) => [_id, count])
        ),
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to get portal statistics",
    });
  }
};

export const getJobById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid job ID" });
    }

    const job = await Job.findOne({
      _id: req.params.id,
      isActive: true,
      isApproved: true,
    }).populate(
      "employer",
      "companyName contactPerson industry city state address description website"
    );

    if (!job || !job.employer) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const employer = await Employer.findOne({
      _id: job.employer._id,
      isApproved: true,
      isSuspended: false,
    }).select("user");
    const employerUser = employer
      ? await User.findOne({ _id: employer.user, isSuspended: false }).select("_id")
      : null;
    if (!employerUser) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({ success: true, job });
  } catch {
    res.status(500).json({ success: false, message: "Failed to get job" });
  }
};

export const updateJob = async (req, res) => {
  try {
    const validationError = validateJobPayload(req.body, true);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid job ID" });
    }

    const employer = await getAuthorizedEmployer(req.user.userId, res);
    if (!employer) return;

    const ownedJob = await Job.findOne({
      _id: req.params.id,
      employer: employer._id,
    }).select("salaryMin salaryMax");
    if (!ownedJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found or access denied",
      });
    }
    const salaryMin = req.body.salaryMin ?? ownedJob.salaryMin;
    const salaryMax = req.body.salaryMax ?? ownedJob.salaryMax;
    if (salaryMin !== undefined && salaryMax !== undefined && salaryMin > salaryMax) {
      return res.status(400).json({
        success: false,
        message: "Minimum salary cannot exceed maximum salary",
      });
    }

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, employer: employer._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or access denied",
      });
    }

    res.status(200).json({ success: true, message: "Job updated successfully", job });
  } catch (error) {
    sendJobError(res, "Failed to update job. Check the provided job details.", error);
  }
};

export const deleteJob = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid job ID" });
    }

    const employer = await getAuthorizedEmployer(req.user.userId, res);
    if (!employer) return;

    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      employer: employer._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or access denied",
      });
    }

    res.status(200).json({ success: true, message: "Job deleted successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to delete job" });
  }
};
