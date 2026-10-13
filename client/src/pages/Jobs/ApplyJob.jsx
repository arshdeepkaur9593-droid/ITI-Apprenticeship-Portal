import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiMapPin,
  FiPhone,
  FiTool,
  FiUpload,
  FiUser,
  FiMail,
} from "react-icons/fi";

import { API_BASE_URL } from "../services/api.js";
const API_URL = API_BASE_URL;

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("accessToken");

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const ApplyJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    trade: "",
    experience: "",
    coverMessage: "",
  });

  const [resume, setResume] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setApiError("");

        // 1. Auth + role guard
        const token = getToken();
        const storedUser = getStoredUser();

        if (!token) {
          setApiError("Please login as a student to apply for this job.");
          setLoading(false);
          return;
        }

        if (storedUser && storedUser.role !== "student") {
          setApiError(
            "Only student accounts can apply for jobs. Please login with a student account.",
          );
          setLoading(false);
          return;
        }

        // 2. Fetch job details
        const jobResponse = await fetch(`${API_URL}/jobs/${id}`);
        const jobData = await jobResponse.json();

        if (!jobResponse.ok) {
          throw new Error(jobData.message || "Failed to load job.");
        }

        setJob(jobData.job);

        // 3. Pre-fill form from student profile (non-fatal if it fails)
        try {
          const profileResponse = await fetch(`${API_URL}/students/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const profileData = await profileResponse.json();

          if (profileResponse.ok && profileData.success && profileData.student) {
            const p = profileData.student;
            const u = p.user || {};
            setFormData((prev) => ({
              ...prev,
              fullName: u.name || storedUser?.name || prev.fullName,
              email: u.email || storedUser?.email || prev.email,
              phone: p.phone || prev.phone,
              trade: p.trade || prev.trade,
            }));
          }
        } catch {
          // Profile prefill failure is non-fatal — student can fill manually
        }
      } catch (error) {
        setApiError(error.message || "Failed to load job opportunity.");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleResumeChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setResume(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors((previous) => ({
        ...previous,
        resume: "Please upload a PDF or Word document.",
      }));
      setResume(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        resume: "Resume size must be less than 5 MB.",
      }));
      setResume(null);
      return;
    }

    setResume(file);

    setErrors((previous) => ({
      ...previous,
      resume: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (!formData.trade) {
      newErrors.trade = "Please select your ITI trade.";
    }

    if (!formData.experience) {
      newErrors.experience = "Please select your experience.";
    }


    // Resume is optional here — if the student has one stored in their profile,
    // the backend will use it as a fallback. File upload storage is not yet implemented.

    if (!formData.coverMessage.trim()) {
      newErrors.coverMessage = "Please write a short application message.";
    } else if (formData.coverMessage.trim().length < 20) {
      newErrors.coverMessage =
        "Application message should be at least 20 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setErrors((previous) => ({
        ...previous,
        submit: "",
      }));

      const token = getToken();

      if (!token) {
        setErrors((previous) => ({
          ...previous,
          submit: "Your session has expired. Please login again to apply.",
        }));
        return;
      }

      // Build the request body.
      // The backend's applyForJob controller uses student.resume as a fallback
      // when no resume URL is provided, so we only send coverLetter + jobId.
      const payload = {
        jobId: id,
        coverLetter: formData.coverMessage.trim(),
      };

      const response = await fetch(`${API_URL}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 401) {
        setErrors((previous) => ({
          ...previous,
          submit: "Your session has expired. Please login again to apply.",
        }));
        return;
      }

      if (response.status === 409) {
        setErrors((previous) => ({
          ...previous,
          submit:
            "You have already applied for this job. Visit My Applications to track your status.",
        }));
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit application.");
      }

      setSubmitted(true);
    } catch (error) {
      setErrors((previous) => ({
        ...previous,
        submit: error.message || "Something went wrong. Please try again.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-background)]">
        <section className="mx-auto max-w-[var(--container-width)] px-4 py-16 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-40 rounded bg-gray-200" />
            <div className="mt-8 h-10 w-3/4 rounded bg-gray-200" />
            <div className="mt-4 h-5 w-1/2 rounded bg-gray-200" />

            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_330px]">
              <div className="h-[650px] rounded-[var(--radius-xl)] bg-gray-200" />
              <div className="h-[420px] rounded-[var(--radius-xl)] bg-gray-200" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (apiError || !job) {
    return (
      <main className="min-h-screen bg-[var(--color-background)]">
        <section className="mx-auto flex min-h-screen max-w-[var(--container-width)] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full max-w-lg rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 text-center shadow-[var(--shadow-sm)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-green)] text-2xl ">
              <FiBriefcase />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-[var(--color-heading)]">
              Opportunity not found
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
              {apiError || "The job opportunity is not available."}
            </p>

            <Link
              to="/jobs"
              className="mt-6 inline-flex items-center gap-2 rounded-[var(--radius-md)] btn btn-primary text-white px-5 py-2.5 text-sm font-semibold ! transition hover:bg-[var(--color-primary-dark)]"
            >
              <FiArrowLeft />
              Back to Jobs
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const companyName = job.employer?.companyName || "Company";
  const location = job.state ? `${job.location}, ${job.state}` : job.location;

  const jobType =
    job.jobType === "Full-time"
      ? "Full Time"
      : job.jobType === "Part-time"
        ? "Part Time"
        : job.jobType;

  if (submitted) {
    return (
      <main className="min-h-screen bg-[var(--color-background)]">
        <section className="mx-auto flex min-h-screen max-w-[var(--container-width)] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-[var(--shadow-sm)] sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-green)] text-3xl ">
              <FiCheckCircle />
            </div>

            <h1 className="mt-6 text-3xl font-bold text-[var(--color-heading)]">
              Application Submitted
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--color-body)] sm:text-base">
              Your application for{" "}
              <span className="font-semibold text-[var(--color-heading)]">
                {job.title}
              </span>{" "}
              at <span className="font-semibold ">{companyName}</span> has been
              submitted successfully.
            </p>

            <div className="mt-8 rounded-[var(--radius-lg)] bg-[var(--color-surface-green)] p-5 text-left">
              <div className="flex items-start gap-3">
                <FiBriefcase className="mt-1 shrink-0 " />

                <div>
                  <p className="text-sm font-semibold text-[var(--color-heading)]">
                    {job.title}
                  </p>

                  <p className="mt-1 text-sm text-[var(--color-body)]">
                    {companyName}
                  </p>

                  <p className="mt-2 text-xs text-[var(--color-muted)]">
                    Application received successfully
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/student/applications")}
                className="btn btn-primary px-5 py-3 text-sm"
              >
                View My Applications
                <FiArrowUpRight />
              </button>

              <Link
                to="/jobs"
                className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 text-sm font-semibold text-[var(--color-heading)] transition hover:border-[var(--color-primary)] hover:"
              >
                Browse More Jobs
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <section className="border-b border-[var(--color-border-light)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-[var(--container-width)] px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to={`/jobs/${job._id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold  transition hover:text-[var(--color-primary-dark)]"
          >
            <FiArrowLeft />
            Back to opportunity
          </Link>

          <div className="mt-8">
            <p className="text-sm font-semibold ">Apply for opportunity</p>

            <h1 className="mt-2 text-3xl font-bold leading-tight text-[var(--color-heading)] sm:text-4xl">
              {job.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm text-[var(--color-body)]">
              <span className="inline-flex items-center gap-2">
                <FiBriefcase className="" />
                {companyName}
              </span>

              <span className="inline-flex items-center gap-2">
                <FiMapPin className="" />
                {location}
              </span>

              <span className="inline-flex items-center gap-2">
                <FiTool className="" />
                {job.trade}
              </span>

              <span className="inline-flex items-center gap-2">
                <FiClock className="" />
                {jobType}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--container-width)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_330px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] sm:p-8"
          >
            <div>
              <h2 className="text-xl font-bold text-[var(--color-heading)]">
                Candidate Information
              </h2>

              <p className="mt-1 text-sm text-[var(--color-body)]">
                Enter your details carefully before submitting your application.
              </p>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                >
                  Full Name
                </label>

                <div className="relative">
                  <FiUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-3 pl-10 pr-4 text-sm text-[var(--color-heading)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-100"
                  />
                </div>

                {errors.fullName && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                >
                  Email Address
                </label>

                <div className="relative">
                  <FiMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-3 pl-10 pr-4 text-sm text-[var(--color-heading)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-100"
                  />
                </div>

                {errors.email && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                >
                  Phone Number
                </label>

                <div className="relative">
                  <FiPhone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-3 pl-10 pr-4 text-sm text-[var(--color-heading)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-100"
                  />
                </div>

                {errors.phone && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="trade"
                  className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                >
                  ITI Trade
                </label>

                <select
                  id="trade"
                  name="trade"
                  value={formData.trade}
                  onChange={handleChange}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-heading)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-100"
                >
                  <option value="">Select your trade</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Fitter">Fitter</option>
                  <option value="Welder">Welder</option>
                  <option value="Mechanic">Mechanic</option>
                  <option value="COPA">COPA</option>
                  <option value="Electronics Mechanic">
                    Electronics Mechanic
                  </option>
                  <option value="Plumber">Plumber</option>
                  <option value="Motor Vehicle Mechanic">
                    Motor Vehicle Mechanic
                  </option>
                </select>

                {errors.trade && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.trade}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="experience"
                  className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                >
                  Experience
                </label>

                <select
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-heading)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-100"
                >
                  <option value="">Select your experience</option>
                  <option value="Fresher">Fresher</option>
                  <option value="0-1 years">0-1 years</option>
                  <option value="0-2 years">0-2 years</option>
                  <option value="1-3 years">1-3 years</option>
                  <option value="3+ years">3+ years</option>
                </select>

                {errors.experience && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.experience}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 border-t border-[var(--color-border-light)] pt-8">
              <h2 className="text-xl font-bold text-[var(--color-heading)]">
                Resume & Application Message
              </h2>

              <div className="mt-6">
                <label
                  htmlFor="resume"
                  className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                >
                  Resume{" "}
                  <span className="text-xs font-normal text-[var(--color-muted)]">
                    (optional — your profile resume will be used if not uploaded)
                  </span>
                </label>

                <label
                  htmlFor="resume"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-background)] px-5 py-8 text-center transition hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-green)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-green)] text-xl ">
                    <FiUpload />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-[var(--color-heading)]">
                    {resume ? resume.name : "Upload your resume"}
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    PDF or Word document, maximum 5 MB
                  </p>

                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="hidden"
                  />
                </label>

                {errors.resume && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.resume}
                  </p>
                )}
              </div>

              <div className="mt-6">
                <label
                  htmlFor="coverMessage"
                  className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                >
                  Why are you interested in this opportunity?
                </label>

                <textarea
                  id="coverMessage"
                  name="coverMessage"
                  rows="5"
                  value={formData.coverMessage}
                  onChange={handleChange}
                  placeholder="Briefly introduce yourself and explain why you are suitable for this opportunity..."
                  className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm leading-6 text-[var(--color-heading)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-100"
                />

                {errors.coverMessage && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.coverMessage}
                  </p>
                )}
              </div>
            </div>

            {errors.submit && (
              <div className="mt-6 rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] btn btn-primary text-white px-5 py-3.5 text-sm font-semibold ! shadow-[var(--shadow-sm)] transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Application"}
              {!submitting && <FiArrowUpRight />}
            </button>
          </form>

          <aside className="h-fit rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] lg:sticky lg:top-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Applying for
            </p>

            <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-surface-green)] text-2xl ">
              <FiTool />
            </div>

            <h2 className="mt-5 text-xl font-bold leading-7 text-[var(--color-heading)]">
              {job.title}
            </h2>

            <p className="mt-2 text-sm font-semibold ">{companyName}</p>

            <div className="mt-6 space-y-4 border-t border-[var(--color-border-light)] pt-6">
              <div className="flex items-start gap-3">
                <FiMapPin className="mt-0.5 shrink-0 " />

                <div>
                  <p className="text-xs text-[var(--color-muted)]">Location</p>

                  <p className="mt-1 text-sm font-semibold text-[var(--color-heading)]">
                    {location}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiTool className="mt-0.5 shrink-0 " />

                <div>
                  <p className="text-xs text-[var(--color-muted)]">Trade</p>

                  <p className="mt-1 text-sm font-semibold text-[var(--color-heading)]">
                    {job.trade}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiFileText className="mt-0.5 shrink-0 " />

                <div>
                  <p className="text-xs text-[var(--color-muted)]">Job Type</p>

                  <p className="mt-1 text-sm font-semibold text-[var(--color-heading)]">
                    {jobType}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[var(--radius-lg)] bg-[var(--color-surface-green)] p-4">
              <p className="text-xs font-semibold ">Application tip</p>

              <p className="mt-1 text-xs leading-5 text-[var(--color-body)]">
                Make sure your trade, experience and resume details are accurate
                before submitting.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default ApplyJob;
