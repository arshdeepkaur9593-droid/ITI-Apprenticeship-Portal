import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const validateEnvironment = () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be configured");
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters");
  }
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.CORS_ORIGINS || !process.env.CLIENT_ORIGIN)
  ) {
    throw new Error(
      "Production requires CORS_ORIGINS and CLIENT_ORIGIN"
    );
  }
  if (process.env.CLIENT_ORIGIN) {
    let clientUrl;
    try {
      clientUrl = new URL(process.env.CLIENT_ORIGIN);
    } catch {
      throw new Error("CLIENT_ORIGIN must be a valid absolute URL");
    }
    if (
      process.env.NODE_ENV === "production" &&
      clientUrl.protocol !== "https:"
    ) {
      throw new Error("CLIENT_ORIGIN must use HTTPS in production");
    }
    if (process.env.NODE_ENV === "production") {
      const configuredOrigins = process.env.CORS_ORIGINS.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
      if (!configuredOrigins.includes(clientUrl.origin)) {
        throw new Error("CLIENT_ORIGIN must be included in CORS_ORIGINS");
      }
    }
  }
};

const startServer = async () => {
  validateEnvironment();
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error(`Server startup failed: ${error.message}`);
  process.exitCode = 1;
});