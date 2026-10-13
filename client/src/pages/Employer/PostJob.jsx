import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiBriefcase,
  FiMapPin,
  FiFileText,
  FiClock,
  FiUsers,
  FiPlus,
  FiCheckCircle,
} from "react-icons/fi";

import { API_BASE_URL } from "../services/api.js";

const initialFormData = {
  title: "",
  trade: "",
  jobType: "",
  location: "",
  state: "",
  vacancies: "",
  experience: "",
  stipend: "",
  description: "",
  requirements: "",
};

const PostJob = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getExperienceValue = (experience) => {
    if (experience === "Freshers") return 0;
    if (experience === "0-1 Years") return 0;
    if (experience === "1-2 Years") return 1;
    if (experience === "2-3 Years") return 2;
    if (experience === "3+ Years") return 3;

    return 0;
  };

  const getSalaryValues = (stipend) => {
    const numbers = stipend.match(/\d[\d,]*/g);

    if (!numbers || numbers.length === 0) {
      return {
        salaryMin: undefined,
        salaryMax: undefined,
      };
    }

    const values = numbers.map((value) => Number(value.replace(/,/g, "")));

    return {
      salaryMin: values[0],
      salaryMax: values[1] || values[0],
    };
  };

  const getSkills = (requirements) => {
    return requirements
      .split(/[,|\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login as an employer before posting a job.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { salaryMin, salaryMax } = getSalaryValues(formData.stipend);

      const skills = getSkills(formData.requirements);

      const payload = {
        title: formData.title.trim(),
        trade: formData.trade,
        jobType: formData.jobType,
        location: formData.location.trim(),
        state: formData.state.trim(),
        vacancies: Number(formData.vacancies),
        experience: getExperienceValue(formData.experience),
        description: formData.description.trim(),
        responsibilities: [formData.description.trim()],
        qualifications: skills,
        skills,
      };

      if (salaryMin !== undefined) {
        payload.salaryMin = salaryMin;
      }

      if (salaryMax !== undefined) {
        payload.salaryMax = salaryMax;
      }

      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to publish job");
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Post job error:", error);
      setError(error.message || "Failed to publish job.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setError("");
    setFormData(initialFormData);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="container-main flex min-h-screen items-center justify-center py-10">
          <div className="w-full max-w-xl rounded-3xl border border-[var(--color-border)] bg-white p-8 text-center shadow-sm md:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-4xl ">
              <FiCheckCircle />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-[var(--color-text)] md:text-3xl">
              Job Posted Successfully
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
              Your job opening has been submitted successfully. Candidates will
              be able to view the opportunity once it is approved.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
              >
                <FiPlus />
                Post Another Job
              </button>

              <button
                type="button"
                onClick={() => navigate("/employer/dashboard")}
                className="rounded-xl btn btn-primary text-white px-5 py-3 text-sm font-semibold ! transition hover:bg-[var(--color-primary-dark)]"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="border-b border-[var(--color-border)] bg-white">
        <div className="container-main py-5">
          <Link
            to="/employer/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:"
          >
            <FiArrowLeft />
            Back to Dashboard
          </Link>

          <div className="mt-4">
            <h1 className="text-2xl font-bold text-[var(--color-text)] md:text-3xl">
              Post a New Job
            </h1>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Find skilled ITI students and trade professionals for your
              workplace.
            </p>
          </div>
        </div>
      </div>

      <main className="container-main py-8">
        <form onSubmit={handleSubmit} className="mx-auto max-w-5xl">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-6">
            <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm md:p-8">
              <div className="mb-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-xl ">
                    <FiBriefcase />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[var(--color-text)]">
                      Job Information
                    </h2>

                    <p className="text-sm text-[var(--color-text-muted)]">
                      Basic details about the opportunity.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                    Job Title
                  </label>

                  <div className="relative">
                    <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />

                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Electrician Apprentice"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3.5 pl-11 pr-4 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                    Trade
                  </label>

                  <select
                    name="trade"
                    value={formData.trade}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
                  >
                    <option value="">Select Trade</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Fitter">Fitter</option>
                    <option value="Welder">Welder</option>
                    <option value="Mechanic">Mechanic</option>
                    <option value="Turner">Turner</option>
                    <option value="Plumber">Plumber</option>
                    <option value="COPA">COPA</option>
                    <option value="Machinist">Machinist</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                    Job Type
                  </label>

                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
                  >
                    <option value="">Select Job Type</option>
                    <option value="Apprenticeship">Apprenticeship</option>
                    <option value="Full-time">Full Time</option>
                    <option value="Part-time">Part Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                    Location
                  </label>

                  <div className="relative">
                    <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />

                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Chandigarh"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3.5 pl-11 pr-4 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Punjab"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                    Number of Vacancies
                  </label>

                  <div className="relative">
                    <FiUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />

                    <input
                      type="number"
                      name="vacancies"
                      value={formData.vacancies}
                      onChange={handleChange}
                      min="1"
                      required
                      placeholder="e.g. 5"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3.5 pl-11 pr-4 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                    Experience Required
                  </label>

                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
                  >
                    <option value="">Select Experience</option>
                    <option value="Freshers">Freshers</option>
                    <option value="0-1 Years">0-1 Years</option>
                    <option value="1-2 Years">1-2 Years</option>
                    <option value="2-3 Years">2-3 Years</option>
                    <option value="3+ Years">3+ Years</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                    Stipend / Salary
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--color-text-muted)]">
                      ₹
                    </span>

                    <input
                      type="text"
                      name="stipend"
                      value={formData.stipend}
                      onChange={handleChange}
                      placeholder="e.g. 12000 - 15000 / month"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3.5 pl-9 pr-4 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm md:p-8">
              <div className="mb-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-secondary)]/10 text-xl text-[var(--color-secondary-dark)]">
                    <FiFileText />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[var(--color-text)]">
                      Job Description
                    </h2>

                    <p className="text-sm text-[var(--color-text-muted)]">
                      Tell candidates what they will do in this role.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Describe the responsibilities, daily work, workplace environment and other important details..."
                    className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 text-sm leading-6 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                    Required Skills & Qualifications
                  </label>

                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    required
                    rows="5"
                    placeholder="e.g. ITI Electrician certification, basic wiring knowledge, safety awareness"
                    className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 text-sm leading-6 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
                  />

                  <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                    Separate multiple skills with commas.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="flex items-start gap-3">
                <FiClock className="mt-1 " />

                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text)]">
                    Before publishing
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
                    Make sure the trade, location, vacancy count, eligibility
                    and job description are accurate. This information will be
                    visible to candidates.
                  </p>
                </div>
              </div>
            </section>

            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <Link
                to="/employer/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-6 py-3.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl btn btn-primary text-white px-7 py-3.5 text-sm font-semibold ! transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiBriefcase />
                {loading ? "Publishing..." : "Publish Job"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default PostJob;
