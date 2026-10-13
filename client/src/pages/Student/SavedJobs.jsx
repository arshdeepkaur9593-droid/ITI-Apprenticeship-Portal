import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBookmark,
  FiMapPin,
  FiBriefcase,
  FiClock,
  FiCalendar,
  FiArrowRight,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";

import { API_BASE_URL } from "../services/api.js";
const API_URL = API_BASE_URL;

const formatSalary = (salaryMin, salaryMax) => {
  if (salaryMin && salaryMax) {
    return `₹${salaryMin.toLocaleString("en-IN")} - ₹${salaryMax.toLocaleString(
      "en-IN",
    )}/month`;
  }

  if (salaryMin) {
    return `₹${salaryMin.toLocaleString("en-IN")}/month`;
  }

  if (salaryMax) {
    return `₹${salaryMax.toLocaleString("en-IN")}/month`;
  }

  return "Salary not specified";
};

const formatJobType = (jobType) => {
  switch (jobType) {
    case "Full-time":
      return "Full Time";
    case "Part-time":
      return "Part Time";
    case "Apprenticeship":
      return "Apprenticeship";
    case "Contract":
      return "Contract";
    default:
      return jobType || "Job";
  }
};

const formatPostedDate = (createdAt) => {
  if (!createdAt) {
    return "Recently posted";
  }

  return new Date(createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingJobId, setRemovingJobId] = useState("");
  const [error, setError] = useState("");

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken");

      if (!token) {
        setError("Please login as a student to view your saved jobs.");
        return;
      }

      const response = await fetch(`${API_URL}/students/saved-jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load saved jobs.");
      }

      setSavedJobs(data.savedJobs || []);
    } catch (error) {
      console.error("Fetch saved jobs error:", error);
      setError(error.message || "Unable to load saved jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleRemoveJob = async (jobId) => {
    try {
      setRemovingJobId(jobId);
      setError("");

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken");

      if (!token) {
        setError("Please login as a student.");
        return;
      }

      const response = await fetch(`${API_URL}/students/saved-jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove saved job.");
      }

      setSavedJobs((previousJobs) =>
        previousJobs.filter((job) => job._id !== jobId),
      );
    } catch (error) {
      console.error("Remove saved job error:", error);
      setError(error.message || "Unable to remove saved job.");
    } finally {
      setRemovingJobId("");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="container-main py-10 md:py-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-light)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-dark)]">
                <FiBookmark />
                Your Shortlist
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
                Saved Jobs
              </h1>

              <p className="mt-3 text-base leading-7 text-[var(--color-text-secondary)] md:text-lg">
                Keep track of apprenticeships and trade jobs you are interested
                in and apply when you are ready.
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary-light)] text-2xl ">
              <FiBookmark />
            </div>
          </div>
        </div>
      </section>

      <section className="container-main py-8 md:py-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              {loading
                ? "Loading Saved Jobs..."
                : `${savedJobs.length} Saved Opportunities`}
            </h2>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Jobs you have bookmarked for later.
            </p>
          </div>

          <Link
            to="/jobs"
            className="inline-flex w-fit items-center gap-2 rounded-xl btn btn-primary text-white px-5 py-3 text-sm font-semibold  transition hover:bg-[var(--color-primary-dark)]"
          >
            <FiSearch />
            Find Jobs
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
              >
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-[var(--color-border)]" />

                  <div className="flex-1">
                    <div className="h-5 w-3/4 rounded bg-[var(--color-border)]" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-[var(--color-border)]" />
                  </div>
                </div>

                <div className="mt-5 h-6 w-32 rounded-full bg-[var(--color-border)]" />

                <div className="mt-5 space-y-3 border-t border-[var(--color-border)] pt-5">
                  <div className="h-4 w-2/3 rounded bg-[var(--color-border)]" />
                  <div className="h-4 w-1/2 rounded bg-[var(--color-border)]" />
                  <div className="h-4 w-2/3 rounded bg-[var(--color-border)]" />
                </div>
              </div>
            ))}
          </div>
        ) : savedJobs.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {savedJobs.map((job) => (
              <article
                key={job._id}
                className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md md:p-6"
              >
                <div className="absolute right-5 top-5">
                  <button
                    type="button"
                    aria-label={`Remove ${job.title} from saved jobs`}
                    onClick={() => handleRemoveJob(job._id)}
                    disabled={removingJobId === job._id}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                <div className="flex gap-4 pr-10">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-xl ">
                    <FiBriefcase />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                      {job.title}
                    </h3>

                    <p className="mt-1 font-medium text-[var(--color-text-secondary)]">
                      {job.employer?.companyName || "Company"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[var(--color-primary-light)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-dark)]">
                    {job.trade}
                  </span>

                  <span className="rounded-full bg-[var(--color-background-muted)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
                    {formatJobType(job.jobType)}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 border-t border-[var(--color-border)] pt-5 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <FiMapPin className="shrink-0 " />
                    <span>
                      {job.location}
                      {job.state ? `, ${job.state}` : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <FiBriefcase className="shrink-0 " />
                    <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <FiClock className="shrink-0 " />
                    <span>Posted {formatPostedDate(job.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <FiCalendar className="shrink-0 " />
                    <span>
                      {job.isActive
                        ? "Open for applications"
                        : "Applications closed"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold  transition hover:text-[var(--color-primary-dark)]"
                  >
                    View Job
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-2xl ">
              <FiBookmark />
            </div>

            <h3 className="mt-5 text-xl font-bold text-[var(--color-text-primary)]">
              No saved jobs yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-secondary)]">
              When you find an apprenticeship or trade job you like, save it
              here so you can easily come back to it later.
            </p>

            <Link
              to="/jobs"
              className="mt-6 inline-flex items-center gap-2 rounded-xl btn btn-primary text-white px-5 py-3 text-sm font-semibold  transition hover:bg-[var(--color-primary-dark)]"
            >
              <FiSearch />
              Explore Jobs
            </Link>
          </div>
        )}
      </section>
    </main>
  );
};

export default SavedJobs;
