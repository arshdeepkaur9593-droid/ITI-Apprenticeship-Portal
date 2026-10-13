import Student from "../models/Student.js";
import Job from "../models/Job.js";
import Employer from "../models/Employer.js";
import path from "node:path";
import {
  getResumePath,
  isValidResumeFile,
  removeResumeFile,
} from "../middleware/resumeUpload.js";

const editableStudentFields = [
  "phone",
  "dateOfBirth",
  "gender",
  "city",
  "state",
  "preferredLocation",
  "trade",
  "institute",
  "qualification",
  "completionYear",
  "experience",
  "skills",
  "about",
  "certifications",
  "profileImage",
];

const getSafeResumeName = (originalName) => {
  const baseName = path.basename(originalName);
  const sanitized = baseName.replace(/[^\w.\- ()]/g, "_").slice(0, 180);
  return sanitized || "resume";
};

const sendResumeFile = (res, student) => {
  let resumePath;
  try {
    resumePath = getResumePath(student.resumeStorageKey);
  } catch {
    return res.status(404).json({
      success: false,
      message: "Resume not found",
    });
  }

  res.set("Cache-Control", "private, no-store");
  return res.download(resumePath, student.resume, (error) => {
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
};

const getStudentProfileInput = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Student profile details must be an object" };
  }
  const unknownField = Object.keys(body).find(
    (field) => !editableStudentFields.includes(field)
  );
  if (unknownField) {
    return { error: `Field "${unknownField}" cannot be set` };
  }
  return { data: body };
};

export const getStudentProfile = async (req, res) => {
  try {
    let student = await Student.findOne({
      user: req.user.userId,
    }).populate("user", "name email role");

    if (!student) {
      student = await Student.create({
        user: req.user.userId,
      });

      student = await Student.findById(student._id).populate(
        "user",
        "name email role"
      );
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get student profile",
    });
  }
};

export const uploadStudentResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Select a PDF or DOCX resume to upload",
    });
  }

  try {
    const extension = path.extname(req.file.originalname).toLowerCase();
    const validFile = await isValidResumeFile(req.file.path, extension);
    if (!validFile) {
      await removeResumeFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: "The selected file is not a valid PDF or DOCX document",
      });
    }

    let student = await Student.findOne({ user: req.user.userId }).select(
      "+resumeStorageKey"
    );
    if (!student) {
      student = new Student({ user: req.user.userId });
    }

    const previousStorageKey = student.resumeStorageKey;
    student.resume = getSafeResumeName(req.file.originalname);
    student.resumeStorageKey = req.file.filename;
    student.resumeContentType =
      extension === ".pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    student.resumeSize = req.file.size;
    await student.save();

    if (previousStorageKey && previousStorageKey !== req.file.filename) {
      try {
        await removeResumeFile(previousStorageKey);
      } catch {
        console.error("Previous private resume cleanup failed.");
      }
    }

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resume: {
        fileName: student.resume,
        contentType: student.resumeContentType,
        size: student.resumeSize,
      },
    });
  } catch {
    try {
      await removeResumeFile(req.file.filename);
    } catch {
      console.error("Failed resume upload cleanup failed.");
    }
    return res.status(500).json({
      success: false,
      message: "Resume upload failed. Please try again.",
    });
  }
};

export const downloadStudentResume = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.userId })
      .select("+resumeStorageKey")
      .lean();
    if (!student?.resumeStorageKey) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    return sendResumeFile(res, student);
  } catch {
    return res.status(500).json({
      success: false,
      message: "Resume download failed",
    });
  }
};

export const createStudentProfile = async (req, res) => {
  try {
    const input = getStudentProfileInput(req.body);
    if (input.error) {
      return res.status(400).json({ success: false, message: input.error });
    }

    const existingProfile = await Student.findOne({
      user: req.user.userId,
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Student profile already exists",
      });
    }

    const student = await Student.create({
      user: req.user.userId,
      ...input.data,
    });

    const populatedStudent = await Student.findById(student._id).populate(
      "user",
      "name email role"
    );

    res.status(201).json({
      success: true,
      message: "Student profile created successfully",
      student: populatedStudent,
    });
  } catch (error) {
    const status = error?.name === "ValidationError" ? 400 : 500;
    res.status(status).json({
      success: false,
      message:
        status === 400
          ? "Provide valid student profile details"
          : "Failed to create student profile",
    });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const input = getStudentProfileInput(req.body);
    if (input.error) {
      return res.status(400).json({ success: false, message: input.error });
    }
    if (Object.keys(input.data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one student profile field is required",
      });
    }

    let student = await Student.findOne({
      user: req.user.userId,
    });

    if (!student) {
      student = await Student.create({
        user: req.user.userId,
      });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      student._id,
      { $set: input.data },
      {
        new: true,
        runValidators: true,
      }
    ).populate("user", "name email role");

    res.status(200).json({
      success: true,
      message: "Student profile updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    const status = error?.name === "ValidationError" ? 400 : 500;
    res.status(status).json({
      success: false,
      message:
        status === 400
          ? "Provide valid student profile details"
          : "Failed to update student profile",
    });
  }
};

export const saveJob = async (req, res) => {
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

    const job = await Job.findOne({
      _id: req.params.jobId,
      isActive: true,
      isApproved: true,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or unavailable",
      });
    }

    const employer = await Employer.findOne({
      _id: job.employer,
      isApproved: true,
      isSuspended: false,
    }).populate({ path: "user", match: { isSuspended: false }, select: "_id" });
    if (!employer?.user) {
      return res.status(404).json({
        success: false,
        message: "Job not found or unavailable",
      });
    }

    const alreadySaved = student.savedJobs.some(
      (savedJobId) => savedJobId.toString() === job._id.toString()
    );

    if (alreadySaved) {
      return res.status(409).json({
        success: false,
        message: "Job already saved",
      });
    }

    student.savedJobs.push(job._id);

    await student.save();

    res.status(200).json({
      success: true,
      message: "Job saved successfully",
      savedJobs: student.savedJobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save job",
    });
  }
};

export const removeSavedJob = async (req, res) => {
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

    student.savedJobs = student.savedJobs.filter(
      (jobId) => jobId.toString() !== req.params.jobId
    );

    await student.save();

    res.status(200).json({
      success: true,
      message: "Job removed from saved jobs",
      savedJobs: student.savedJobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove saved job",
    });
  }
};

export const getSavedJobs = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.userId }).populate(
      {
        path: "savedJobs",
        match: { isActive: true, isApproved: true },
        select:
          "title trade jobType location state experience salaryMin salaryMax vacancies skills description employer",
        populate: {
          path: "employer",
          match: { isApproved: true, isSuspended: false },
          select: "companyName contactPerson industry city state user",
          populate: {
            path: "user",
            match: { isSuspended: false },
            select: "_id",
          },
        },
      },
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    res.status(200).json({
      success: true,
      count: student.savedJobs.filter((job) => job?.employer?.user).length,
      savedJobs: student.savedJobs.filter((job) => job?.employer?.user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get saved jobs",
    });
  }
};