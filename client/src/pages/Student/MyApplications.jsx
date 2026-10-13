import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiArrowRight,
  FiXCircle,
  FiFileText,
  FiSearch,
} from "react-icons/fi";

import { API_BASE_URL } from "../services/api.js";
const API_URL = API_BASE_URL;

const getStatusStyles = (status) => {
  switch (status) {
    case "Shortlisted":
      return {
        wrapper:
          "bg-[var(--color-success-light)] text-[var(--color-success-dark)]",
        icon: <FiCheckCircle />,
        label: "Shortlisted",
      };

    case "Selected":
      return {
        wrapper:
          "bg-[var(--color-success-light)] text-[var(--color-success-dark)]",
        icon: <FiCheckCircle />,
        label: "Selected",
      };

    case "Rejected":
      return {
        wrapper: "bg-red-50 text-red-700",
        icon: <FiXCircle />,
        label: "Rejected",
      };

    case "Applied":
      return {
        wrapper: "bg-[var(--color-primary-light)] ",
        icon: <FiClock />,
        label: "Under Review",
      };

    default:
      return {
        wrapper: "bg-[var(--color-primary-light)] ",
        icon: <FiClock />,
        label: "Under Review",
      };
  }
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken")
    );
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login to view your applications.");
        return;
      }

      const response = await fetch(`${API_URL}/applications/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to load your applications.",
        );
      }

      const applicationList = Array.isArray(data)
        ? data
        : data.applications || [];

      setApplications(applicationList);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const totalApplications = applications.length;

  const shortlisted = applications.filter(
    (application) => application.status === "Shortlisted",
  ).length;

  const underReview = applications.filter(
    (application) =>
      application.status === "Applied" || application.status === "Under Review",
  ).length;

  const interviews = applications.filter(
    (application) => application.status === "Interview Scheduled",
  ).length;

  const getJob = (application) => {
    return application.job || {};
  };

  const getCompany = (application) => {
    const job = getJob(application);

    return (
      application.employer?.companyName ||
      job.employer?.companyName ||
      "Company"
    );
  };

  const getLocation = (application) => {
    const job = getJob(application);

    if (job.location && job.state) {
      return `${job.location}, ${job.state}`;
    }

    return job.location || job.state || "Location not specified";
  };

  const getAppliedDate = (application) => {
    if (!application.createdAt) {
      return "Recently";
    }

    return new Date(application.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getJobType = (application) => {
    const job = getJob(application);

    if (job.jobType === "Full-time") {
      return "Full Time";
    }

    if (job.jobType === "Part-time") {
      return "Part Time";
    }

    return job.jobType || "Job";
  };

  const getTrade = (application) => {
    const job = getJob(application);

    return job.trade || "Trade not specified";
  };

  const getJobTitle = (application) => {
    const job = getJob(application);

    return job.title || "Job Opportunity";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-background)]">
        <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="container-main py-10 md:py-14">
            <div className="max-w-3xl">
              <div className="mb-4 h-9 w-48 animate-pulse rounded-full bg-[var(--color-primary-light)]" />

              <div className="h-10 w-72 animate-pulse rounded-lg bg-[var(--color-border)] md:h-12 md:w-96" />

              <div className="mt-4 h-5 w-full max-w-2xl animate-pulse rounded bg-[var(--color-border)]" />
            </div>
          </div>
        </section>

        <section className="container-main py-8 md:py-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
              />
            ))}
          </div>

          <div className="mt-10 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
              />
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="container-main py-10 md:py-14">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-light)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-dark)]">
              <FiFileText />
              Application Tracker
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
              My Applications
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--color-text-secondary)] md:text-lg">
              Track your apprenticeship and trade job applications, check
              current status, and stay updated on your next opportunity.
            </p>
          </div>
        </div>
      </section>

      <section className="container-main py-8 md:py-10">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-xl ">
                <FiFileText />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Total
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-[var(--color-text-primary)]">
              {totalApplications}
            </p>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Applications submitted
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-secondary-light)] text-xl text-[var(--color-secondary-dark)]">
                <FiCheckCircle />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Progress
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-[var(--color-text-primary)]">
              {shortlisted}
            </p>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Shortlisted applications
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-700">
                <FiClock />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Pending
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-[var(--color-text-primary)]">
              {underReview}
            </p>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Applications under review
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl text-[var(--color-secondary)]">
                <FiCalendar />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Next Step
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-[var(--color-text-primary)]">
              {interviews}
            </p>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Interviews scheduled
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              Application History
            </h2>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              View the latest updates from employers.
            </p>
          </div>

          <Link
            to="/jobs"
            className="inline-flex w-fit items-center gap-2 rounded-xl btn btn-primary text-white px-5 py-3 text-sm font-semibold ! transition hover:bg-[var(--color-primary-dark)]"
          >
            <FiSearch />
            Find More Jobs
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {applications.length > 0 ? (
            applications.map((application) => {
              const job = getJob(application);
              const status = getStatusStyles(application.status);

              return (
                <article
                  key={application._id}
                  className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-xl ">
                        <FiBriefcase />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                            {getJobTitle(application)}
                          </h3>

                          <span className="rounded-full bg-[var(--color-background-muted)] px-3 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
                            {getJobType(application)}
                          </span>
                        </div>

                        <p className="mt-1 font-medium text-[var(--color-text-secondary)]">
                          {getCompany(application)}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--color-text-muted)]">
                          <span className="inline-flex items-center gap-1.5">
                            <FiBriefcase />
                            {getTrade(application)}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <FiMapPin />
                            {getLocation(application)}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <FiCalendar />
                            Applied {getAppliedDate(application)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${status.wrapper}`}
                      >
                        {status.icon}
                        {status.label}
                      </span>

                      <Link
                        to={`/jobs/${job._id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold  transition hover:text-[var(--color-primary-dark)]"
                      >
                        View Details
                        <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xl ">
                <FiFileText />
              </div>

              <h3 className="mt-4 text-lg font-bold text-[var(--color-text-primary)]">
                No applications yet
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">
                You have not applied to any apprenticeship or trade job yet.
                Explore available opportunities and submit your first
                application.
              </p>

              <Link
                to="/jobs"
                className="mt-5 inline-flex items-center gap-2 rounded-xl btn btn-primary text-white px-5 py-3 text-sm font-semibold ! transition hover:bg-[var(--color-primary-dark)]"
              >
                Find Jobs
                <FiArrowRight />
              </Link>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xl ">
            <FiSearch />
          </div>

          <h3 className="mt-4 text-lg font-bold text-[var(--color-text-primary)]">
            Looking for your next opportunity?
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Explore apprenticeships and trade jobs matched to your skills,
            trade, and preferred location.
          </p>

          <Link
            to="/jobs"
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[var(--color-primary)] px-5 py-3 text-sm font-semibold  transition hover:btn btn-primary text-white hover:"
          >
            Explore Opportunities
            <FiArrowRight />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default MyApplications;
