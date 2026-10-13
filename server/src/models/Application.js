import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employer",
      required: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Shortlisted", "Rejected", "Selected"],
      default: "Applied",
    },
    coverLetter: {
      type: String,
      trim: true,
    },
    resume: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index(
  { job: 1, student: 1 },
  { unique: true }
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;