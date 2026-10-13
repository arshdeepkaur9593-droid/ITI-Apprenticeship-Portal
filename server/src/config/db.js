
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI must be configured");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch {
    console.error("MongoDB connection failed. Check the server database configuration.");
    process.exit(1);
  }
};

export default connectDB;