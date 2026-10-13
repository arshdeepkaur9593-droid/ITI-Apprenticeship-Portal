import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Employer from "../models/Employer.js";

const MIN_PASSWORD_LENGTH = 12;
const RESET_REQUEST_MESSAGE =
  "If an account exists for that email, password reset instructions will be sent.";
const ADMIN_LOGIN_DIAGNOSTIC_EMAIL = "admin@itiportal.com";

const logAdminLoginDiagnostic = (accountFound, passwordMatched) => {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.AUTH_LOGIN_DIAGNOSTICS === "true"
  ) {
    console.info("[auth-diagnostic] Admin login", {
      accountFound,
      passwordMatched,
    });
  }
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESET_EMAIL_FROM;
  if (!apiKey || !from) {
    throw new Error("Password reset email service is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Reset your ITI Apprenticeship Portal password",
      text: `Use this link to reset your password. It expires in 15 minutes: ${resetUrl}`,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error("Password reset email delivery failed");
  }
};

const getResetUrl = (token) => {
  const clientOrigin = process.env.CLIENT_ORIGIN;
  if (!clientOrigin) {
    throw new Error("Client origin is not configured");
  }
  const resetUrl = new URL("/reset-password", clientOrigin);
  resetUrl.hash = token;
  return resetUrl.toString();
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, companyName, industry } =
      req.body || {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== "string" ||
      password.length < MIN_PASSWORD_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message: `Valid name, email, and password of at least ${MIN_PASSWORD_LENGTH} characters are required`,
      });
    }

    if (role !== undefined && !["student", "employer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be student or employer",
      });
    }

    if (
      role === "employer" &&
      (typeof companyName !== "string" ||
        !companyName.trim() ||
        typeof industry !== "string" ||
        !industry.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Company name and industry are required for employer registration",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || "student",
    });

    if (user.role === "employer") {
      try {
        await Employer.create({
          user: user._id,
          companyName: companyName.trim(),
          contactPerson: user.name,
          industry: industry.trim(),
        });
      } catch (error) {
        await User.deleteOne({ _id: user._id });
        throw error;
      }
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const isAdminDiagnostic = normalizedEmail === ADMIN_LOGIN_DIAGNOSTIC_EMAIL;
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      if (isAdminDiagnostic) {
        logAdminLoginDiagnostic(false, false);
      }
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );
    if (isAdminDiagnostic) {
      logAdminLoginDiagnostic(
        user.role === "admin",
        user.role === "admin" && isPasswordMatch
      );
    }

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: "This account is suspended",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        tokenVersion: user.tokenVersion || 0,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required",
      });
    }

    if (
      !process.env.RESEND_API_KEY ||
      !process.env.RESET_EMAIL_FROM ||
      !process.env.CLIENT_ORIGIN
    ) {
      return res.status(503).json({
        success: false,
        message: "Password reset is temporarily unavailable",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      try {
        await sendPasswordResetEmail(user.email, getResetUrl(resetToken));
      } catch {
        console.error("Password reset email delivery failed.");
      }
    }

    res.status(200).json({
      success: true,
      message: RESET_REQUEST_MESSAGE,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Unable to process password reset request",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body || {};

    if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json({
        success: false,
        message: "Reset token is invalid or expired",
      });
    }

    if (typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset token is invalid or expired",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await User.updateOne(
      {
        _id: user._id,
        resetPasswordToken: tokenHash,
        resetPasswordExpires: { $gt: new Date() },
      },
      {
        $set: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
        $inc: { tokenVersion: 1 },
      }
    );

    if (result.modifiedCount !== 1) {
      return res.status(400).json({
        success: false,
        message: "Reset token is invalid or expired",
      });
    }

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};