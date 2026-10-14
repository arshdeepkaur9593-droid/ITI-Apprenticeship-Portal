import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBookmark,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiEdit3,
  FiFileText,
  FiMapPin,
  FiSearch,
  FiUser,
  FiZap,
} from "react-icons/fi";

import { API_BASE_URL } from "../services/api.js";
const API_URL = API_BASE_URL;

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken")
  );
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatSalary = (min, max) => {
  if (!min && !max) return "Salary not specified";

  const formatAmount = (amount) => {
    return Number(amount).toLocaleString("en-IN");
  };

  if (min && max) {
    return `₹${formatAmount(min)}–₹${formatAmount(max)}/month`;
  }

  if (min) {
    return `₹${formatAmount(min)}/month`;
  }

  return `₹${formatAmount(max)}/month`;
};

const getStatusDetails = (status) => {
  switch (status) {
    case "Shortlisted":
      return {
        label: "Shortlisted",
        className: "bg-green-50 text-green-700 border-green-200",
      };

    case "Rejected":
      return {
        label: "Rejected",
        className: "bg-red-50 text-red-700 border-red-200",
      };

    case "Selected":
      return {
        label: "Selected",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };

    case "Applied":
    default:
      return {
        label: "Under Review",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
  }
};

const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;

  const fields = [
    profile.phone,
    profile.dateOfBirth,
    profile.gender,
    profile.city,
    profile.state,
    profile.trade,
    profile.qualification,
    profile.skills?.length > 0,
    profile.experience !== undefined && profile.experience !== null,
    profile.resume,
    profile.profileImage,
  ];

  const completedFields = fields.filter(Boolean).length;

  return Math.round((completedFields / fields.length) * 100);
};

function StudentDashboard() {
  const [user] = useState(getStoredUser());
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = getToken();

      if (!token) {
        setError("Please login as a student to view your dashboard.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [
          profileResponse,
          applicationsResponse,
          savedJobsResponse,
          jobsResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/students/profile`, {
            headers,
          }),
          fetch(`${API_URL}/applications/my`, {
            headers,
          }),
          fetch(`${API_URL}/students/saved-jobs`, {
            headers,
          }),
          fetch(`${API_URL}/jobs`),
        ]);

        const profileData = await profileResponse.json();
        const applicationsData = await applicationsResponse.json();
        const savedJobsData = await savedJobsResponse.json();
        const jobsData = await jobsResponse.json();

        if (profileResponse.ok && profileData.success) {
          setProfile(profileData.student || profileData.profile || null);
        }

        if (applicationsResponse.ok) {
          setApplications(
            Array.isArray(applicationsData)
              ? applicationsData
              : applicationsData.applications || [],
          );
        }

        if (savedJobsResponse.ok) {
          setSavedJobs(
            Array.isArray(savedJobsData)
              ? savedJobsData
              : savedJobsData.savedJobs || [],
          );
        }

        if (jobsResponse.ok) {
          setJobs(Array.isArray(jobsData) ? jobsData : jobsData.jobs || []);
        }

        if (!applicationsResponse.ok && !savedJobsResponse.ok) {
          throw new Error(
            applicationsData.message ||
              savedJobsData.message ||
              "Failed to load dashboard data",
          );
        }
      } catch (err) {
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const profileCompletion = useMemo(() => {
    return calculateProfileCompletion(profile);
  }, [profile]);

  const shortlistedCount = useMemo(() => {
    return applications.filter(
      (application) => application.status === "Shortlisted",
    ).length;
  }, [applications]);

  const activeApplicationsCount = useMemo(() => {
    return applications.filter(
      (application) =>
        application.status === "Applied" ||
        application.status === "Shortlisted",
    ).length;
  }, [applications]);

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 4);
  }, [applications]);

  const recommendedJobs = useMemo(() => {
    const studentTrade = profile?.trade?.trim()?.toLowerCase();

    const activeJobs = jobs.filter(
      (job) => job.isActive !== false && job.isApproved !== false,
    );

    if (!studentTrade) {
      return activeJobs.slice(0, 3);
    }

    const matchingJobs = activeJobs.filter(
      (job) => job.trade?.trim()?.toLowerCase() === studentTrade,
    );

    const remainingJobs = activeJobs.filter(
      (job) => job.trade?.trim()?.toLowerCase() !== studentTrade,
    );

    return [...matchingJobs, ...remainingJobs].slice(0, 3);
  }, [jobs, profile]);

  const stats = [
    {
      label: "Applications",
      value: applications.length,
      detail: `${activeApplicationsCount} active`,
      icon: FiFileText,
      className: "bg-[var(--color-surface-green)] ",
    },
    {
      label: "Shortlisted",
      value: shortlistedCount,
      detail: "Current status",
      icon: FiCheckCircle,
      className:
        "bg-[var(--color-surface-orange)] text-[var(--color-secondary)]",
    },
    {
      label: "Saved Jobs",
      value: savedJobs.length,
      detail: "Saved opportunities",
      icon: FiBookmark,
      className: "bg-[var(--color-surface-green)] ",
    },
    {
      label: "Profile Views",
      value: "—",
      detail: "Not tracked yet",
      icon: FiUser,
      className:
        "bg-[var(--color-surface-orange)] text-[var(--color-secondary)]",
    },
  ];

  const studentName = profile?.name || user?.name || "Student";

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border-light)] bg-white">
        <div className="mx-auto flex max-w-[var(--container-width)] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] ">
              Student Dashboard
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[var(--color-heading)] sm:text-3xl">
              Welcome back, {studentName}
            </h1>

            <p className="mt-1 text-sm text-[var(--color-body)]">
              Keep building your profile and discover your next opportunity.
            </p>
          </div>

          <Link
            to="/jobs"
            className="hidden items-center gap-2 rounded-xl btn btn-primary text-white px-5 py-3 text-sm font-semibold ! transition hover:bg-[var(--color-primary-dark)] sm:flex"
          >
            <FiSearch size={16} className="!" />
            <span className="!">Find Jobs</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[var(--container-width)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <section className="mb-6 grid gap-5 lg:grid-cols-[1fr_330px]">
          <div className="rounded-2xl border border-green-100 bg-[var(--color-surface-green)] p-6 shadow-[var(--shadow-sm)] sm:p-7">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-dark)] shadow-sm">
                  <FiZap size={13} className="text-[var(--color-secondary-dark)]" />
                  <span>Candidate Profile</span>
                </div>

                <h2 className="max-w-xl text-2xl font-bold leading-tight text-[var(--color-heading)] sm:text-3xl">
                  Your skills are your strongest career asset.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-body)]">
                  Complete your profile to improve your visibility and get
                  matched with more relevant ITI jobs and apprenticeships.
                </p>

                <Link
                  to="/student/profile"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold !text-white shadow-sm transition hover:bg-[var(--color-primary-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                >
                  <span>Complete Profile</span>
                  <FiArrowRight size={16} />
                </Link>
              </div>

              <div
                className="mx-auto flex h-32 w-32 shrink-0 items-center justify-center rounded-full p-2 sm:mx-0"
                style={{
                  background: `conic-gradient(var(--color-primary) ${profileCompletion}%, var(--color-border) 0)`,
                }}
                role="img"
                aria-label={`Profile ${loading ? "completion loading" : `${profileCompletion}% complete`}`}
              >
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white shadow-inner">
                  <span className="text-3xl font-bold leading-none text-[var(--color-primary-dark)]">
                    {loading ? "—" : `${profileCompletion}%`}
                  </span>
                  <span className="mt-2 text-[11px] font-semibold text-[var(--color-muted)]">
                    Profile complete
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                  Profile Strength
                </p>

                <p
                  className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${
                    profileCompletion >= 60
                      ? "bg-[var(--color-surface-green)] text-[var(--color-primary-dark)]"
                      : "bg-[var(--color-surface-orange)] text-[var(--color-secondary-dark)]"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      profileCompletion >= 60
                        ? "bg-[var(--color-primary)]"
                        : "bg-[var(--color-secondary-dark)]"
                    }`}
                    aria-hidden="true"
                  />
                  {profileCompletion >= 80
                    ? "Excellent"
                    : profileCompletion >= 60
                      ? "Almost there"
                      : profileCompletion >= 40
                        ? "Keep going"
                        : "Getting started"}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface-green)] text-[var(--color-primary)]">
                <FiUser size={18} />
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-medium">
                <span className="text-[var(--color-muted)]">Profile completion</span>
                <span className="text-[var(--color-primary-dark)]">
                  {loading ? "—" : `${profileCompletion}%`}
                </span>
              </div>
              <div
                className="h-2.5 overflow-hidden rounded-full bg-[var(--color-surface-soft)]"
                role="progressbar"
                aria-label="Profile completion"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={profileCompletion}
                aria-valuetext={loading ? "Loading" : `${profileCompletion}%`}
              >
                <div
                  className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>

            <div className="mt-4 divide-y divide-[var(--color-border-light)]">
              <div className="flex items-center justify-between text-sm">
                <span className="py-2.5 text-[var(--color-body)]">Basic details</span>

                {profile?.phone && profile?.city && profile?.state ? (
                  <FiCheckCircle
                    size={16}
                    className="text-[var(--color-success)]"
                  />
                ) : (
                  <span className="rounded-full bg-[var(--color-surface-orange)] px-2.5 py-1 text-xs font-semibold text-[var(--color-secondary-dark)]">
                    Add now
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="py-2.5 text-[var(--color-body)]">
                  Education & Trade
                </span>

                {profile?.trade && profile?.qualification ? (
                  <FiCheckCircle
                    size={16}
                    className="text-[var(--color-success)]"
                  />
                ) : (
                  <span className="rounded-full bg-[var(--color-surface-orange)] px-2.5 py-1 text-xs font-semibold text-[var(--color-secondary-dark)]">
                    Add now
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="py-2.5 text-[var(--color-body)]">Skills</span>

                {profile?.skills?.length > 0 ? (
                  <FiCheckCircle
                    size={16}
                    className="text-[var(--color-success)]"
                  />
                ) : (
                  <span className="rounded-full bg-[var(--color-surface-orange)] px-2.5 py-1 text-xs font-semibold text-[var(--color-secondary-dark)]">
                    Add now
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="py-2.5 text-[var(--color-body)]">Resume</span>

                {profile?.resume ? (
                  <FiCheckCircle
                    size={16}
                    className="text-[var(--color-success)]"
                  />
                ) : (
                  <span className="rounded-full bg-[var(--color-surface-orange)] px-2.5 py-1 text-xs font-semibold text-[var(--color-secondary-dark)]">
                    Add now
                  </span>
                )}
              </div>
            </div>

            <Link
              to="/student/profile"
              className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold !text-[var(--color-primary-dark)] transition hover:bg-[var(--color-surface-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
            >
              Edit Profile
              <FiEdit3 size={15} />
            </Link>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-muted)]">
                      {stat.label}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[var(--color-heading)]">
                      {loading ? "—" : stat.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.className}`}
                  >
                    <Icon size={18} />
                  </div>
                </div>

                <p className="mt-3 text-xs font-medium text-[var(--color-muted)]">
                  {loading ? "Loading..." : stat.detail}
                </p>
              </div>
            );
          })}
        </section>

        <section className="mb-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] ">
                  Applications
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[var(--color-heading)]">
                  Recent Applications
                </h2>
              </div>

              <Link
                to="/student/applications"
                className="hidden items-center gap-1 text-sm font-semibold  sm:flex"
              >
                View All
                <FiArrowRight size={15} />
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
              {loading ? (
                <div className="p-6 text-sm text-[var(--color-muted)]">
                  Loading applications...
                </div>
              ) : recentApplications.length === 0 ? (
                <div className="p-6 text-center">
                  <FiFileText
                    size={28}
                    className="mx-auto text-[var(--color-muted)]"
                  />

                  <p className="mt-3 text-sm font-semibold text-[var(--color-heading)]">
                    No applications yet
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    Start exploring jobs and apply to your next opportunity.
                  </p>

                  <Link
                    to="/jobs"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl btn btn-primary text-white px-4 py-2.5 text-sm font-semibold !"
                  >
                    Find Jobs
                    <FiArrowRight size={15} className="!" />
                  </Link>
                </div>
              ) : (
                recentApplications.map((application, index) => {
                  const job = application.job || {};
                  const employer = job.employer || {};
                  const status = getStatusDetails(application.status);

                  return (
                    <div
                      key={application._id || index}
                      className={`p-5 ${
                        index !== recentApplications.length - 1
                          ? "border-b border-[var(--color-border-light)]"
                          : ""
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-4">
                          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-green)] font-bold  sm:flex">
                            {(employer.companyName || "J").charAt(0)}
                          </div>

                          <div>
                            <h3 className="font-semibold text-[var(--color-heading)]">
                              {job.title || "Job opportunity"}
                            </h3>

                            <p className="mt-1 text-sm font-medium text-[var(--color-body)]">
                              {employer.companyName || "Employer"}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-muted)]">
                              <span className="flex items-center gap-1">
                                <FiMapPin size={12} />
                                {job.location || "Location unavailable"}
                                {job.state ? `, ${job.state}` : ""}
                              </span>

                              <span className="flex items-center gap-1">
                                <FiBriefcase size={12} />
                                {job.trade || "Trade unavailable"}
                              </span>

                              <span className="flex items-center gap-1">
                                <FiCalendar size={12} />
                                {formatDate(application.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <Link
              to="/student/applications"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-heading)] sm:hidden"
            >
              View All Applications
              <FiArrowRight size={15} />
            </Link>
          </div>

          <div>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-secondary)]">
                  Saved
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[var(--color-heading)]">
                  Saved Jobs
                </h2>
              </div>

              <Link
                to="/student/saved-jobs"
                className="flex items-center gap-1 text-sm font-semibold "
              >
                View All
                <FiArrowRight size={15} />
              </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 text-sm text-[var(--color-muted)]">
                  Loading saved jobs...
                </div>
              ) : savedJobs.length === 0 ? (
                <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 text-center">
                  <FiBookmark
                    size={25}
                    className="mx-auto text-[var(--color-muted)]"
                  />

                  <p className="mt-3 text-sm font-semibold text-[var(--color-heading)]">
                    No saved jobs
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    Save jobs you want to apply for later.
                  </p>
                </div>
              ) : (
                savedJobs.slice(0, 3).map((job, index) => {
                  const jobData = job.job || job;
                  const employer = jobData.employer || {};

                  return (
                    <Link
                      to={`/jobs/${jobData._id}`}
                      key={jobData._id || index}
                      className="group block rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:border-[var(--color-primary)]"
                    >
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-orange)] text-sm font-bold text-[var(--color-secondary)]">
                          {(employer.companyName || "J").charAt(0)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="line-clamp-1 text-sm font-semibold text-[var(--color-heading)]">
                                {jobData.title || "Job opportunity"}
                              </h3>

                              <p className="mt-1 text-xs font-medium text-[var(--color-body)]">
                                {employer.companyName || "Employer"}
                              </p>
                            </div>

                            <FiBookmark
                              size={15}
                              className="shrink-0 fill-current text-[var(--color-secondary)]"
                            />
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[var(--color-muted)]">
                            <span className="flex items-center gap-1">
                              <FiMapPin size={11} />
                              {jobData.location || "Location unavailable"}
                            </span>

                            <span>{jobData.jobType || "Job"}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] ">
                Recommended For You
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[var(--color-heading)]">
                Opportunities Matching Your Trade
              </h2>

              <p className="mt-1 text-sm text-[var(--color-body)]">
                Based on your trade and available opportunities.
              </p>
            </div>

            <Link
              to="/jobs"
              className="flex items-center gap-1 text-sm font-semibold "
            >
              Explore All Jobs
              <FiArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-muted)]">
              Loading opportunities...
            </div>
          ) : recommendedJobs.length === 0 ? (
            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 text-center">
              <FiBriefcase
                size={28}
                className="mx-auto text-[var(--color-muted)]"
              />

              <p className="mt-3 text-sm font-semibold text-[var(--color-heading)]">
                No opportunities available
              </p>

              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Check back later for new apprenticeship and trade jobs.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recommendedJobs.map((job) => {
                const employer = job.employer || {};

                return (
                  <div
                    key={job._id}
                    className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-surface-green)] font-bold ">
                        {(employer.companyName || "J").charAt(0)}
                      </div>

                      <span className="rounded-full bg-[var(--color-surface-orange)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-secondary)]">
                        {job.jobType || "Job"}
                      </span>
                    </div>

                    <h3 className="mt-4 text-base font-bold text-[var(--color-heading)]">
                      {job.title || "Job opportunity"}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-[var(--color-body)]">
                      {employer.companyName || "Employer"}
                    </p>

                    <div className="mt-4 space-y-2 text-xs text-[var(--color-muted)]">
                      <span className="flex items-center gap-2">
                        <FiMapPin size={13} />
                        {job.location || "Location unavailable"}
                        {job.state ? `, ${job.state}` : ""}
                      </span>

                      <span className="flex items-center gap-2">
                        <FiBriefcase size={13} />
                        {job.trade || "Trade unavailable"}
                      </span>

                      <span className="flex items-center gap-2">
                        <FiCheckCircle size={13} />
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                    </div>

                    <Link
                      to={`/jobs/${job._id}`}
                      className="mt-5 flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-heading)] transition hover:border-[var(--color-primary)] hover:"
                    >
                      View Opportunity
                      <FiChevronRight size={16} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Link
            to="/jobs"
            className="group rounded-2xl btn btn-primary text-white p-5 transition hover:bg-[var(--color-primary-dark)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <FiSearch size={18} className="!" />
              </div>

              <FiArrowRight
                size={18}
                className="! transition group-hover:translate-x-1"
              />
            </div>

            <h3 className="mt-5 text-lg font-bold !">Find More Jobs</h3>

            <p className="mt-1 text-sm !/65">
              Explore apprenticeships and trade jobs across India.
            </p>
          </Link>

          <Link
            to="/student/profile"
            className="group rounded-2xl border border-[var(--color-border)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-primary)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface-green)] ">
                <FiEdit3 size={18} />
              </div>

              <FiArrowRight
                size={18}
                className="text-[var(--color-muted)] transition group-hover:translate-x-1"
              />
            </div>

            <h3 className="mt-5 text-lg font-bold text-[var(--color-heading)]">
              Update Profile
            </h3>

            <p className="mt-1 text-sm text-[var(--color-body)]">
              Add skills, certifications and your latest resume.
            </p>
          </Link>

          <Link
            to="/student/applications"
            className="group rounded-2xl border border-[var(--color-border)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-secondary)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface-orange)] text-[var(--color-secondary)]">
                <FiClock size={18} />
              </div>

              <FiArrowRight
                size={18}
                className="text-[var(--color-muted)] transition group-hover:translate-x-1"
              />
            </div>

            <h3 className="mt-5 text-lg font-bold text-[var(--color-heading)]">
              Track Applications
            </h3>

            <p className="mt-1 text-sm text-[var(--color-body)]">
              Check your application status and latest updates.
            </p>
          </Link>
        </section>
      </main>
    </div>
  );
}

export default StudentDashboard;
