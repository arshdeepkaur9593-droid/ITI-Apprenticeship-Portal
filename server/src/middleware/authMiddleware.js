import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Employer from "../models/Employer.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  try {
    const user = await User.findById(decoded.userId).select(
      "_id role isSuspended tokenVersion"
    );

    if (
      !user ||
      user.role !== decoded.role ||
      (decoded.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: "This account is suspended",
      });
    }

    if (user.role === "employer") {
      const employer = await Employer.findOne({ user: user._id })
        .select("isSuspended")
        .lean();

      if (employer?.isSuspended) {
        return res.status(403).json({
          success: false,
          message: "This employer account is suspended",
        });
      }
    }

    req.user = {
      ...decoded,
      role: user.role,
    };

    next();
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to verify account status",
    });
  }
};

export default authMiddleware;