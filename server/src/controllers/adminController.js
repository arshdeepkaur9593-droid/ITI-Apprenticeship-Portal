import bcrypt from "bcryptjs";
import Job from "../models/Job.js";
import User from "../models/User.js";
import Employer from "../models/Employer.js";
import Student from "../models/Student.js";
import Application from "../models/Application.js";

const MIN_PASSWORD_LENGTH = 12;

export const getDashboardStats = async (req, res) => {
  try {
    const [pendingJobs, activeJobs, totalApplications, pendingEmployers] =
      await Promise.all([
        Job.countDocuments({ isApproved: false }),
        Job.countDocuments({ isApproved: true, isActive: true }),
        Application.countDocuments(),
        Employer.countDocuments({ isApproved: false, isSuspended: false }),
      ]);

    res.status(200).json({
      success: true,
      stats: { pendingJobs, activeJobs, totalApplications, pendingEmployers },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to get admin dashboard statistics",
    });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const [jobs, applicationCounts] = await Promise.all([
      Job.find()
        .populate("employer", "companyName contactPerson industry city state")
        .sort({ createdAt: -1 })
        .lean(),
      Application.aggregate([
        { $group: { _id: "$job", count: { $sum: 1 } } },
      ]),
    ]);
    const countsByJob = new Map(
      applicationCounts.map(({ _id, count }) => [_id.toString(), count])
    );

    const jobsWithCounts = jobs.map((job) => ({
      ...job,
      applicationCount: countsByJob.get(job._id.toString()) || 0,
    }));

    res.status(200).json({
      success: true,
      count: jobsWithCounts.length,
      jobs: jobsWithCounts,
    });
  } catch {
    res.status(500).json({ success: false, message: "Failed to get jobs" });
  }
};

export const suspendJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true, runValidators: true }
    ).populate("employer", "companyName contactPerson industry city state");

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({ success: true, message: "Job suspended successfully", job });
  } catch (error) {
    const status = error?.name === "CastError" ? 400 : 500;
    res.status(status).json({
      success: false,
      message: status === 400 ? "Invalid job ID" : "Failed to suspend job",
    });
  }
};

export const activateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, isApproved: true },
      { isActive: true },
      { new: true, runValidators: true }
    ).populate("employer", "companyName contactPerson industry city state");

    if (!job) {
      const exists = await Job.exists({ _id: req.params.id });
      return res.status(exists ? 409 : 404).json({
        success: false,
        message: exists
          ? "Pending jobs must be approved before activation"
          : "Job not found",
      });
    }

    res.status(200).json({ success: true, message: "Job activated successfully", job });
  } catch (error) {
    const status = error?.name === "CastError" ? 400 : 500;
    res.status(status).json({
      success: false,
      message: status === 400 ? "Invalid job ID" : "Failed to activate job",
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    const status = error?.name === "CastError" ? 400 : 500;
    res.status(status).json({
      success: false,
      message: status === 400 ? "Invalid job ID" : "Failed to delete job",
    });
  }
};

export const getPendingJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      isApproved: false,
    })
      .populate(
        "employer",
        "companyName contactPerson industry city state"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to get pending jobs",
    });
  }
};

export const approveJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job approved successfully",
      job,
    });
  } catch (error) {
    const status = error?.name === "CastError" ? 400 : 500;
    res.status(status).json({
      success: false,
      message: status === 400 ? "Invalid job ID" : "Failed to approve job",
    });
  }
};

export const getEmployers = async (req, res) => {
  try {
    const employers = await Employer.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    const employerIds = employers.map(
      (employer) => employer._id
    );

    const jobs = await Job.find({
      employer: { $in: employerIds },
    }).select("employer isActive");

    const employerData = employers.map((employer) => {
      const employerJobs = jobs.filter(
        (job) =>
          job.employer &&
          job.employer.toString() ===
            employer._id.toString()
      );

      const activeJobs = employerJobs.filter(
        (job) => job.isActive
      ).length;

      let status = "Pending";

      if (employer.isSuspended) {
        status = "Suspended";
      } else if (employer.isApproved) {
        status = "Approved";
      }

      return {
        ...employer.toObject(),
        activeJobs,
        totalJobs: employerJobs.length,
        status,
      };
    });

    res.status(200).json({
      success: true,
      count: employerData.length,
      employers: employerData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get employers",
    });
  }
};

export const getEmployerById = async (req, res) => {
  try {
    const employer = await Employer.findById(
      req.params.id
    ).populate(
      "user",
      "name email role createdAt"
    );

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found",
      });
    }

    const jobs = await Job.find({
      employer: employer._id,
    })
      .select(
        "title trade jobType location state vacancies isActive isApproved createdAt"
      )
      .sort({ createdAt: -1 });

    let status = "Pending";

    if (employer.isSuspended) {
      status = "Suspended";
    } else if (employer.isApproved) {
      status = "Approved";
    }

    res.status(200).json({
      success: true,
      employer: {
        ...employer.toObject(),
        status,
        activeJobs: jobs.filter(
          (job) => job.isActive
        ).length,
        totalJobs: jobs.length,
        jobs,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get employer",
    });
  }
};

export const approveEmployer = async (req, res) => {
  try {
    const employer = await Employer.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
        isSuspended: false,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employer approved successfully",
      employer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to approve employer",
    });
  }
};

export const suspendEmployer = async (req, res) => {
  try {
    const employer = await Employer.findByIdAndUpdate(
      req.params.id,
      {
        isSuspended: true,
      },
      {
        new: true,
      }
    );

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found",
      });
    }

    await User.updateOne(
      { _id: employer.user },
      { $inc: { tokenVersion: 1 } }
    );

    res.status(200).json({
      success: true,
      message: "Employer suspended successfully",
      employer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to suspend employer",
    });
  }
};

export const activateEmployer = async (req, res) => {
  try {
    const employer = await Employer.findByIdAndUpdate(
      req.params.id,
      {
        isSuspended: false,
        isApproved: true,
      },
      {
        new: true,
      }
    );

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employer activated successfully",
      employer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to activate employer",
    });
  }
};

export const resetEmployerPassword = async (
  req,
  res
) => {
  try {
    const { password } = req.body || {};

    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    const user = await User.findOne({
      _id: req.params.userId,
      role: "employer",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Employer user not found",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    user.password = hashedPassword;
    user.tokenVersion = (user.tokenVersion || 0) + 1;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Employer password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reset employer password",
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: "student",
    })
      .select(
        "-password -resetPasswordToken -resetPasswordExpires"
      )
      .sort({ createdAt: -1 })
      .lean();

    const userIds = users.map(
      (user) => user._id
    );

    const students = await Student.find({
      user: { $in: userIds },
    }).lean();

    const studentMap = new Map(
      students.map((student) => [
        student.user.toString(),
        student,
      ])
    );

    const userData = users.map((user) => {
      const student = studentMap.get(
        user._id.toString()
      );

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: student?.phone || "",
        trade: student?.trade || "",
        city: student?.city || "",
        state: student?.state || "",
        location:
          [student?.city, student?.state]
            .filter(Boolean)
            .join(", ") || "Not provided",
        joined: user.createdAt,
        status: user.isSuspended
          ? "Suspended"
          : "Active",
        role: user.role,
      };
    });

    res.status(200).json({
      success: true,
      count: userData.length,
      users: userData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get users",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: "student",
    })
      .select(
        "-password -resetPasswordToken -resetPasswordExpires"
      )
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student user not found",
      });
    }

    const student = await Student.findOne({
      user: user._id,
    }).lean();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.isSuspended
          ? "Suspended"
          : "Active",
        joined: user.createdAt,
        updatedAt: user.updatedAt,
        phone: student?.phone || "",
        dateOfBirth:
          student?.dateOfBirth || null,
        gender: student?.gender || "",
        city: student?.city || "",
        state: student?.state || "",
        preferredLocation:
          student?.preferredLocation || "",
        trade: student?.trade || "",
        institute: student?.institute || "",
        qualification:
          student?.qualification || "",
        completionYear:
          student?.completionYear || "",
        experience: student?.experience || 0,
        skills: student?.skills || [],
        about: student?.about || "",
        certifications:
          student?.certifications || [],
        resume: student?.resume || "",
        profileImage:
          student?.profileImage || "",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
    });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: "student",
      },
      {
        isSuspended: true,
        $inc: { tokenVersion: 1 },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student user not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User suspended successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to suspend user",
    });
  }
};

export const activateUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: "student",
      },
      {
        isSuspended: false,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student user not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User activated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to activate user",
    });
  }
};