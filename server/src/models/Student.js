import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    preferredLocation: {
      type: String,
      trim: true,
    },

    trade: {
      type: String,
      trim: true,
    },

    institute: {
      type: String,
      trim: true,
    },

    qualification: {
      type: String,
      trim: true,
    },

    completionYear: {
      type: String,
      trim: true,
    },

    experience: {
      type: Number,
      default: 0,
      min: 0,
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    about: {
      type: String,
      trim: true,
    },

    certifications: [
      {
        name: {
          type: String,
          trim: true,
        },
        issuer: {
          type: String,
          trim: true,
        },
        year: {
          type: String,
          trim: true,
        },
      },
    ],

    resume: {
      type: String,
      trim: true,
    },

    resumeStorageKey: {
      type: String,
      select: false,
    },

    resumeContentType: {
      type: String,
      enum: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    },

    resumeSize: {
      type: Number,
      min: 1,
      max: 5 * 1024 * 1024,
    },

    profileImage: {
      type: String,
      trim: true,
    },

    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;