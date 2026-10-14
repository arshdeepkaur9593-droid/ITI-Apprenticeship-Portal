import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBriefcase,
  FiUsers,
  FiFileText,
  FiPlus,
  FiArrowRight,
  FiMapPin,
  FiClock,
  FiEye,
  FiUserCheck,
} from "react-icons/fi";

import { API_BASE_URL } from "../services/api.js";

const getStatusStyle = (status) => {
  if (status === "Shortlisted") {
    return "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]";
  }

  if (status === "Applied") {
    return "bg-[var(--color-secondary-light)] text-[var(--color-secondary-dark)]";
  }

  if (status === "Selected") {
    return "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]";
  }

  return "bg-amber-50 text-amber-700";
};

const formatAppliedDate = (date) => {
  if (!date) {
    return "Recently";
  }

  const createdDate = new Date(date);
  const now = new Date();

  const differenceInMs = now - createdDate;
  const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));

  if (differenceInDays <= 0) {
    return "Today";
  }

  if (differenceInDays === 1) {
    return "Yesterday";
  }

  if (differenceInDays < 7) {
    return `${differenceInDays} days ago`;
  }

  return createdDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const EmployerDashboard = () => {
  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to access the employer dashboard.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [profileResponse, jobsResponse, applicationsResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/employers/profile`, {
              headers,
            }),
            fetch(`${API_BASE_URL}/jobs/employer`, {
              headers,
            }),
            fetch(`${API_BASE_URL}/applications/employer`, {
              headers,
            }),
          ]);

        const profileData = await profileResponse.json();
        const jobsData = await jobsResponse.json();
        const applicationsData = await applicationsResponse.json();

        if (!profileResponse.ok) {
          throw new Error(
            profileData.message || "Failed to fetch employer profile",
          );
        }

        if (!jobsResponse.ok) {
          throw new Error(jobsData.message || "Failed to fetch employer jobs");
        }

        if (!applicationsResponse.ok) {
          throw new Error(
            applicationsData.message || "Failed to fetch employer applications",
          );
        }

        setEmployer(profileData.employer);

        setJobs(Array.isArray(jobsData) ? jobsData : jobsData.jobs || []);

        setApplications(
          Array.isArray(applicationsData)
            ? applicationsData
            : applicationsData.applications || [],
        );
      } catch (error) {
        console.error("Employer dashboard error:", error);
        setError(error.message || "Failed to load employer dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const activeJobs = jobs.filter((job) => job.isActive !== false);

  const applicationsToReview = applications.filter(
    (application) => application.status === "Applied",
  );

  const shortlistedApplications = applications.filter(
    (application) => application.status === "Shortlisted",
  );

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3);

  const getJobApplicationsCount = (jobId) => {
    return applications.filter((application) => {
      const applicationJobId = application.job?._id || application.job;

      return applicationJobId?.toString() === jobId?.toString();
    }).length;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-background)]">
        <section className="container-main py-16">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary-light)] border-t-[var(--color-primary)]" />

            <p className="mt-4 text-sm font-medium text-[var(--color-text-secondary)]">
              Loading employer dashboard...
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--color-background)]">
        <section className="container-main py-16">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h2 className="text-xl font-bold text-red-700">
              Unable to load dashboard
            </h2>

            <p className="mt-2 text-sm text-red-600">{error}</p>
          </div>
        </section>
      </main>
    );
  }

  const companyName = employer?.companyName || "Your Company";

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="container-main py-10 md:py-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-light)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-dark)]">
                <FiBriefcase />
                Employer Portal
              </span>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
                Welcome back, {companyName}
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--color-text-secondary)]">
                Manage your job openings, review applications, and connect with
                skilled ITI candidates.
              </p>
            </div>

            <Link
              to="/employer/post-job"
              className="inline-flex w-fit items-center gap-2 rounded-xl btn btn-primary text-white px-5 py-3 text-sm font-semibold ! transition hover:bg-[var(--color-primary-dark)]"
            >
              <FiPlus />
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      <section className="container-main py-8 md:py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-xl ">
                <FiBriefcase />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Active
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-[var(--color-text-primary)]">
              {activeJobs.length}
            </p>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Active job openings
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl text-[var(--color-secondary)]">
                <FiUsers />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Candidates
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-[var(--color-text-primary)]">
              {applications.length}
            </p>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Applications received
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-700">
                <FiFileText />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Review
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-[var(--color-text-primary)]">
              {applicationsToReview.length}
            </p>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Applications to review
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-xl ">
                <FiUserCheck />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Shortlisted
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-[var(--color-text-primary)]">
              {shortlistedApplications.length}
            </p>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Candidates shortlisted
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] p-5 md:p-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                  Recent Applications
                </h2>

                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  Candidates who recently applied to your openings.
                </p>
              </div>

              <Link
                to="/employer/applications"
                className="hidden items-center gap-1.5 text-sm font-semibold  sm:inline-flex"
              >
                View All
                <FiArrowRight />
              </Link>
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {recentApplications.length > 0 ? (
                recentApplications.map((application) => {
                  const student = application.student;
                  const job = application.job;

                  const studentName =
                    student?.user?.name || student?.name || "Candidate";

                  const trade =
                    student?.trade || job?.trade || "Trade not specified";

                  const jobTitle = job?.title || "Job opening";

                  const location =
                    student?.city || job?.location || "Location not specified";

                  return (
                    <div
                      key={application._id}
                      className="p-5 transition hover:bg-[var(--color-background-muted)] md:p-6"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] font-bold ">
                            {studentName.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <h3 className="font-semibold text-[var(--color-text-primary)]">
                              {studentName}
                            </h3>

                            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                              {trade} · {jobTitle}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-4 text-xs text-[var(--color-text-muted)]">
                              <span className="inline-flex items-center gap-1">
                                <FiMapPin />
                                {location}
                              </span>

                              <span className="inline-flex items-center gap-1">
                                <FiClock />
                                {formatAppliedDate(application.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                              application.status,
                            )}`}
                          >
                            {application.status}
                          </span>

                          <Link
                            to="/employer/applications"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:"
                          >
                            <FiEye />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <FiUsers className="mx-auto text-3xl text-[var(--color-text-muted)]" />

                  <p className="mt-3 text-sm font-medium text-[var(--color-text-primary)]">
                    No applications yet
                  </p>

                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    Applications from candidates will appear here.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-[var(--color-border)] p-5 sm:hidden">
              <Link
                to="/employer/applications"
                className="inline-flex items-center gap-2 text-sm font-semibold "
              >
                View All Applications
                <FiArrowRight />
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] p-5 md:p-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                  Active Job Openings
                </h2>

                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  Your currently published opportunities.
                </p>
              </div>

              <Link
                to="/employer/jobs"
                className="flex items-center gap-1.5 text-sm font-semibold "
              >
                Manage
                <FiArrowRight />
              </Link>
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {activeJobs.length > 0 ? (
                activeJobs.map((job) => (
                  <div key={job._id} className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[var(--color-text-primary)]">
                          {job.title}
                        </h3>

                        <span className="mt-2 inline-flex rounded-full bg-[var(--color-primary-light)] px-3 py-1 text-xs font-medium text-[var(--color-primary-dark)]">
                          {job.trade}
                        </span>
                      </div>

                      <span className="rounded-full bg-[var(--color-primary-light)] px-2.5 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
                        Active
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-[var(--color-text-secondary)]">
                      <p className="flex items-center gap-2">
                        <FiMapPin className="" />
                        {job.location}
                        {job.state ? `, ${job.state}` : ""}
                      </p>

                      <p className="flex items-center gap-2">
                        <FiUsers className="" />
                        {getJobApplicationsCount(job._id)} applications
                      </p>

                      <p className="flex items-center gap-2">
                        <FiClock className="" />
                        Posted {formatAppliedDate(job.createdAt)}
                      </p>
                    </div>

                    <Link
                      to={`/jobs/${job._id}`}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold "
                    >
                      View Job
                      <FiArrowRight />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <FiBriefcase className="mx-auto text-3xl text-[var(--color-text-muted)]" />

                  <p className="mt-3 text-sm font-medium text-[var(--color-text-primary)]">
                    No active jobs
                  </p>

                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    Create your first job opening to start receiving
                    applications.
                  </p>

                  <Link
                    to="/employer/post-job"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl btn btn-primary text-white px-4 py-2.5 text-sm font-semibold !"
                  >
                    <FiPlus />
                    Post a Job
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-secondary-light)] text-[var(--color-secondary)]">
                  <FiPlus />
                </div>

                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                  Looking for skilled ITI candidates?
                </h2>
              </div>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Create a new apprenticeship or trade job opening and connect
                with candidates matching your requirements.
              </p>
            </div>

            <Link
              to="/employer/post-job"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-[var(--color-secondary-dark)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              Post New Opening
              <FiArrowRight />
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
};

export default EmployerDashboard;
