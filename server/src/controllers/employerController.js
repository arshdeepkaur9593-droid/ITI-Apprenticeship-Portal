import Employer from "../models/Employer.js";

const editableEmployerFields = [
  "companyName",
  "contactPerson",
  "phone",
  "industry",
  "city",
  "state",
  "address",
  "description",
  "website",
];

const getEmployerProfileInput = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Employer details must be an object" };
  }

  const unknownField = Object.keys(body).find(
    (field) => !editableEmployerFields.includes(field)
  );
  if (unknownField) {
    return { error: `Field "${unknownField}" cannot be set` };
  }

  for (const [field, value] of Object.entries(body)) {
    if (typeof value !== "string") {
      return { error: `${field} must be text` };
    }
  }

  return { data: body };
};

export const getEmployerProfile = async (req, res) => {
  try {
    const employer = await Employer.findOne({
      user: req.user.userId,
    }).populate("user", "name email role");

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer profile not found",
      });
    }

    res.status(200).json({
      success: true,
      employer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get employer profile",
    });
  }
};

export const createEmployerProfile = async (req, res) => {
  try {
    const input = getEmployerProfileInput(req.body);
    if (input.error) {
      return res.status(400).json({ success: false, message: input.error });
    }
    if (!input.data.companyName?.trim() || !input.data.contactPerson?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name and contact person are required",
      });
    }

    const existingProfile = await Employer.findOne({
      user: req.user.userId,
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Employer profile already exists",
      });
    }

    const employer = await Employer.create({
      user: req.user.userId,
      ...input.data,
    });

    res.status(201).json({
      success: true,
      message: "Employer profile created successfully",
      employer,
    });
  } catch (error) {
    const status = error?.name === "ValidationError" ? 400 : 500;
    res.status(status).json({
      success: false,
      message:
        status === 400
          ? "Provide valid employer profile details"
          : "Failed to create employer profile",
    });
  }
};

export const updateEmployerProfile = async (req, res) => {
  try {
    const input = getEmployerProfileInput(req.body);
    if (input.error) {
      return res.status(400).json({ success: false, message: input.error });
    }
    if (Object.keys(input.data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one employer profile field is required",
      });
    }

    const employer = await Employer.findOneAndUpdate(
      { user: req.user.userId },
      { $set: input.data },
      { new: true, runValidators: true }
    );

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employer profile updated successfully",
      employer,
    });
  } catch (error) {
    const status = error?.name === "ValidationError" ? 400 : 500;
    res.status(status).json({
      success: false,
      message:
        status === 400
          ? "Provide valid employer profile details"
          : "Failed to update employer profile",
    });
  }
};