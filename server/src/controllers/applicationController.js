import mongoose from "mongoose";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Student from "../models/Student.js";
import Employer from "../models/Employer.js";
import path from "node:path";
import { getResumePath } from "../middleware/resumeUpload.js";

const getApprovedEmployer = async (userId, res) => {
  const employer = await Employer.findOne({ user: userId });
  if (!employer) {
    res.status(404).json({ success: false, message: "Employer profile not found" });
    return null;
  }
  if (!employer.isApproved || employer.isSuspended) {
    res.status(403).json({
      success: false,
      message: "Your employer account is not approved to manage applications",
    });
    return null;
  }
  return employer;
};

export const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter, resume } = req.body || {};

    if (!jobId || typeof jobId !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid job ID is required",
      });
    }
    if (
      (coverLetter !== undefined && typeof coverLetter !== "string") ||
      (resume !== undefined && typeof resume !== "string")
    ) {
      return res.status(400).json({
        success: false,
        message: "Cover letter and resume must be text",
      });
    }

    const student = await Student.findOne({
      user: req.user.userId,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const job = await Job.findOne({
      _id: jobId,
      isActive: true,
      isApproved: true,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (!job.isActive || !job.isApproved) {
      return res.status(400).json({
        success: false,
        message: "This job is not available for applications",
      });
    }

    const employer = await Employer.findOne({
      _id: job.employer,
      isApproved: true,
      isSuspended: false,
    }).populate({ path: "user", match: { isSuspended: false }, select: "_id" });

    if (!employer?.user) {
      return res.status(400).json({
        success: false,
        message: "This job is not available for applications",
      });
    }

    const existingApplication = await Application.findOne({
      job: job._id,
      student: student._id,
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    const application = await Application.create({
      job: job._id,
      student: student._id,
      employer: job.employer,
      coverLetter,
      resume: resume || student.resume,
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }
    if (error?.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to apply for job",
    });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const student = await Student.findOne({
      user: req.user.userId,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const applications = await Application.find({
      student: student._id,
    })
      .populate(
        "job",
        "title trade jobType location state salaryMin salaryMax"
      )
      .populate(
        "employer",
        "companyName contactPerson industry city state"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to get applications",
    });
  }
};

export const getJobApplications = async (req, res) => {
  try {
    const employer = await getApprovedEmployer(req.user.userId, res);
    if (!employer) return;

    const employerJobs = await Job.find({ employer: employer._id }).select("_id");
    const applications = await Application.find({
      employer: employer._id,
      job: { $in: employerJobs.map((job) => job._id) },
    })
      .populate(
        "student",
        "phone city state trade qualification skills experience resume resumeContentType resumeSize +resumeStorageKey user"
      )
      .populate("student.user", "name email")
      .populate(
        "job",
        "title trade jobType location state"
      )
      .sort({ createdAt: -1 });
    const applicationData = applications.map((application) => {
      const data = application.toObject();
      if (data.student) {
        data.student.hasPrivateResume = Boolean(
          data.student.resumeStorageKey
        );
        delete data.student.resumeStorageKey;
      }
      return data;
    });

    res.status(200).json({
      success: true,
      count: applicationData.length,
      applications: applicationData,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to get job applications",
    });
  }
};

export const downloadApplicationResume = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const employer = await getApprovedEmployer(req.user.userId, res);
    if (!employer) return;

    const application = await Application.findOne({
      _id: req.params.id,
      employer: employer._id,
    }).populate({
      path: "student",
      select: "resume resumeContentType resumeSize +resumeStorageKey",
    });

    if (!application?.student?.resumeStorageKey) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    const ownsJob = await Job.exists({
      _id: application.job,
      employer: employer._id,
    });
    if (!ownsJob) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    let resumePath;
    try {
      resumePath = getResumePath(application.student.resumeStorageKey);
    } catch {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    const fileName =
      path.basename(application.student.resume || "") || "resume";
    res.set("Cache-Control", "private, no-store");
    return res.download(resumePath, fileName, (error) => {
      if (error && !res.headersSent) {
        res.status(error.code === "ENOENT" ? 404 : 500).json({
          success: false,
          message:
            error.code === "ENOENT"
              ? "Resume not found"
              : "Resume download failed",
        });
      }
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Resume download failed",
    });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const { status } = req.body || {};

    const allowedStatuses = [
      "Applied",
      "Shortlisted",
      "Rejected",
      "Selected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const employer = await getApprovedEmployer(req.user.userId, res);
    if (!employer) return;

    const employerJobs = await Job.find({ employer: employer._id }).select("_id");
    const application = await Application.findOneAndUpdate(
      {
        _id: req.params.id,
        employer: employer._id,
        job: { $in: employerJobs.map((job) => job._id) },
      },
      {
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to update application status",
    });
  }
};