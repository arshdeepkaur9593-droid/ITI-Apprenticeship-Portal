import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiTool,
  FiZap,
  FiSettings,
  FiCpu,
  FiTruck,
} from "react-icons/fi";

import { API_BASE_URL } from "../services/api.js";
const API_URL = `${API_BASE_URL}/jobs`;

const getJobIcon = (trade) => {
  switch (trade) {
    case "Electrician":
      return FiZap;
    case "Fitter":
      return FiSettings;
    case "Welder":
      return FiTool;
    case "Mechanic":
      return FiTruck;
    case "Motor Vehicle Mechanic":
      return FiTruck;
    case "Electronics Mechanic":
      return FiCpu;
    default:
      return FiBriefcase;
  }
};

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

  return "Not specified";
};

const formatExperience = (experience) => {
  if (experience === 0) {
    return "Fresher";
  }

  if (experience === 1) {
    return "1 year";
  }

  return `${experience} years`;
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
      return jobType;
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

function JobDetails() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch job details");
        }

        setJob(data.job);
      } catch (error) {
        console.error("Fetch job details error:", error);
        setError(
          error.message || "Unable to load job details. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-background)]">
        <section className="mx-auto max-w-[var(--container-width)] px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-5 w-32 rounded bg-[var(--color-border-light)]" />

            <div className="mt-8 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                <div className="h-16 w-16 rounded-[var(--radius-lg)] bg-[var(--color-surface-green)]" />

                <div className="flex-1">
                  <div className="h-8 w-3/4 rounded bg-[var(--color-border-light)]" />
                  <div className="mt-3 h-5 w-1/3 rounded bg-[var(--color-border-light)]" />
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-20 rounded-[var(--radius-md)] bg-[var(--color-border-light)]"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="min-h-screen bg-[var(--color-background)]">
        <section className="mx-auto max-w-[var(--container-width)] px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-green)] text-2xl ">
              <FiBriefcase />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-[var(--color-heading)]">
              Job opportunity not found
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-body)]">
              {error || "This job may no longer be available."}
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

  const Icon = getJobIcon(job.trade);

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <section className="border-b border-[var(--color-border-light)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-[var(--container-width)] px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold ! transition hover:!text-[var(--color-primary-dark)]"
          >
            <FiArrowLeft />
            Back to Opportunities
          </Link>

          <div className="mt-7 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-surface-green)] text-2xl ">
                  <Icon />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[var(--color-surface-green)] px-3 py-1.5 text-xs font-semibold ">
                      {job.trade}
                    </span>

                    <span className="rounded-full bg-[var(--color-surface-orange)] px-3 py-1.5 text-xs font-semibold text-[var(--color-secondary-dark)]">
                      {formatJobType(job.jobType)}
                    </span>
                  </div>

                  <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-[var(--color-heading)] sm:text-4xl">
                    {job.title}
                  </h1>

                  <p className="mt-2 text-base font-semibold ">
                    {job.employer?.companyName || "Company"}
                  </p>
                </div>
              </div>

              <Link
                to={`/jobs/${job._id}/apply`}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-md)] btn btn-primary text-white px-6 py-3 text-sm font-semibold ! transition hover:bg-[var(--color-primary-dark)]"
              >
                Apply Now
                <FiArrowUpRight />
              </Link>
            </div>

            <div className="mt-8 grid gap-4 border-t border-[var(--color-border)] pt-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                  <FiMapPin />
                  Location
                </div>

                <p className="mt-2 text-sm font-semibold text-[var(--color-heading)]">
                  {job.location}
                  {job.state ? `, ${job.state}` : ""}
                </p>
              </div>

              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                  <FiBriefcase />
                  Experience
                </div>

                <p className="mt-2 text-sm font-semibold text-[var(--color-heading)]">
                  {formatExperience(job.experience)}
                </p>
              </div>

              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                  <FiClock />
                  Posted
                </div>

                <p className="mt-2 text-sm font-semibold text-[var(--color-heading)]">
                  {formatPostedDate(job.createdAt)}
                </p>
              </div>

              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                  <FiBriefcase />
                  Vacancies
                </div>

                <p className="mt-2 text-sm font-semibold text-[var(--color-heading)]">
                  {job.vacancies}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--container-width)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <article className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
              <h2 className="text-xl font-bold text-[var(--color-heading)]">
                About the Opportunity
              </h2>

              <p className="mt-4 text-sm leading-7 text-[var(--color-body)]">
                {job.description}
              </p>
            </article>

            {job.responsibilities?.length > 0 && (
              <article className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
                <h2 className="text-xl font-bold text-[var(--color-heading)]">
                  Responsibilities
                </h2>

                <div className="mt-5 space-y-3">
                  {job.responsibilities.map((responsibility, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 text-sm leading-6 text-[var(--color-body)]"
                    >
                      <FiCheckCircle className="mt-1 shrink-0 " />
                      <span>{responsibility}</span>
                    </div>
                  ))}
                </div>
              </article>
            )}

            {job.qualifications?.length > 0 && (
              <article className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
                <h2 className="text-xl font-bold text-[var(--color-heading)]">
                  Qualifications
                </h2>

                <div className="mt-5 space-y-3">
                  {job.qualifications.map((qualification, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 text-sm leading-6 text-[var(--color-body)]"
                    >
                      <FiCheckCircle className="mt-1 shrink-0 " />
                      <span>{qualification}</span>
                    </div>
                  ))}
                </div>
              </article>
            )}

            {job.skills?.length > 0 && (
              <article className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
                <h2 className="text-xl font-bold text-[var(--color-heading)]">
                  Required Skills
                </h2>

                <div className="mt-5 flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-[var(--color-surface-green)] px-3 py-2 text-xs font-medium "
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </article>
            )}
          </div>

          <aside className="h-fit space-y-5 lg:sticky lg:top-24">
            <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
              <h2 className="text-lg font-bold text-[var(--color-heading)]">
                Job Summary
              </h2>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
                    Salary
                  </p>

                  <p className="mt-1 text-sm font-bold text-[var(--color-heading)]">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </p>
                </div>

                <div className="border-t border-[var(--color-border-light)] pt-4">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
                    Job Type
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[var(--color-heading)]">
                    {formatJobType(job.jobType)}
                  </p>
                </div>

                <div className="border-t border-[var(--color-border-light)] pt-4">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
                    Trade
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[var(--color-heading)]">
                    {job.trade}
                  </p>
                </div>

                <div className="border-t border-[var(--color-border-light)] pt-4">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
                    Vacancies
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[var(--color-heading)]">
                    {job.vacancies}
                  </p>
                </div>
              </div>

              <Link
                to={`/jobs/${job._id}/apply`}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] btn btn-primary text-white px-5 py-3 text-sm font-semibold transition hover:bg-[var(--color-primary-dark)]"
              >
                Apply for this Job
                <FiArrowUpRight />
              </Link>
            </div>

            {job.employer && (
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
                <h2 className="text-lg font-bold text-[var(--color-heading)]">
                  About the Employer
                </h2>

                <p className="mt-4 text-base font-semibold ">
                  {job.employer.companyName}
                </p>

                {job.employer.industry && (
                  <p className="mt-2 text-sm text-[var(--color-body)]">
                    {job.employer.industry}
                  </p>
                )}

                {job.employer.city && (
                  <div className="mt-4 flex items-start gap-2 text-sm text-[var(--color-body)]">
                    <FiMapPin className="mt-0.5 shrink-0 text-[var(--color-muted)]" />
                    <span>
                      {job.employer.city}
                      {job.employer.state ? `, ${job.employer.state}` : ""}
                    </span>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

export default JobDetails;
