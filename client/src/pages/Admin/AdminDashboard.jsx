import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiBriefcase,
  FiFileText,
  FiUserCheck,
  FiBarChart2,
  FiShield,
  FiCheckCircle,
  FiClock,
  FiArrowRight,
  FiSettings,
  FiAlertCircle,
} from "react-icons/fi";

import { API_BASE_URL } from "../services/api.js";

const AdminDashboard = () => {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    pendingJobs: 0,
    pendingEmployers: 0,
    activeJobs: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [approvingJobId, setApprovingJobId] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPendingJobs = async () => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          throw new Error("Authentication required. Please login again.");
        }

        const response = await fetch(`${API_BASE_URL}/admin/jobs/pending`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load pending jobs");
        }

        setPendingJobs(data.jobs || []);
      } catch (err) {
        console.error("Admin dashboard error:", err);
        setError(err.message || "Unable to load admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingJobs();
  }, [token]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load dashboard statistics");
        }
        setDashboardStats(data.stats);
      } catch (err) {
        setError(err.message || "Unable to load dashboard statistics");
      }
    };

    fetchDashboardStats();
  }, [token]);

  const handleApproveJob = async (jobId) => {
    try {
      setApprovingJobId(jobId);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/admin/jobs/${jobId}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve job");
      }

      setPendingJobs((currentJobs) =>
        currentJobs.filter((job) => job._id !== jobId),
      );
      setDashboardStats((current) => ({
        ...current,
        pendingJobs: Math.max(0, current.pendingJobs - 1),
        activeJobs: current.activeJobs + (data.job?.isActive ? 1 : 0),
      }));
    } catch (err) {
      console.error("Approve job error:", err);
      setError(err.message || "Unable to approve job");
    } finally {
      setApprovingJobId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Recently";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const stats = [
    {
      title: "Pending Jobs",
      value: dashboardStats.pendingJobs,
      change: "Needs review",
      icon: FiFileText,
      bg: "bg-[var(--color-primary-light)]",
      iconColor: "",
    },
    {
      title: "Pending Employers",
      value: dashboardStats.pendingEmployers,
      change: "Awaiting verification",
      icon: FiBriefcase,
      bg: "bg-[var(--color-secondary)]/10",
      iconColor: "text-[var(--color-secondary-dark)]",
    },
    {
      title: "Active Job Listings",
      value: dashboardStats.activeJobs,
      change: "Approved and available",
      icon: FiCheckCircle,
      bg: "bg-[var(--color-primary-light)]",
      iconColor: "",
    },
    {
      title: "Total Applications",
      value: dashboardStats.totalApplications,
      change: "Across all job listings",
      icon: FiUserCheck,
      bg: "bg-[var(--color-secondary)]/10",
      iconColor: "text-[var(--color-secondary-dark)]",
    },
  ];

  const pendingItems = [
    {
      title: "Employer Approvals",
      count: dashboardStats.pendingEmployers,
      description: "Employers waiting for verification",
      icon: FiBriefcase,
      link: "/admin/employers",
    },
    {
      title: "Job Approvals",
      count: dashboardStats.pendingJobs,
      description: "New job listings awaiting review",
      icon: FiFileText,
      link: "#pending-jobs",
    },
    {
      title: "Reported Listings",
      count: 0,
      description: "Listings reported by users",
      icon: FiAlertCircle,
      link: "/admin/jobs",
    },
  ];

  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage student accounts",
      icon: FiUsers,
      link: "/admin/users",
    },
    {
      title: "Manage Employers",
      description: "Approve and manage employers",
      icon: FiBriefcase,
      link: "/admin/employers",
    },
    {
      title: "Manage Jobs",
      description: "Review and manage job listings",
      icon: FiFileText,
      link: "#pending-jobs",
    },
    {
      title: "View Analytics",
      description: "Monitor portal performance",
      icon: FiBarChart2,
      link: "/admin/analytics",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border)] bg-white">
        <div className="container-main flex flex-col justify-between gap-4 py-5 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl btn btn-primary text-white text-xl !">
                <FiShield />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider ">
                  Administration
                </p>

                <h1 className="text-2xl font-bold text-[var(--color-text)]">
                  Admin Dashboard
                </h1>
              </div>
            </div>

            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              Monitor students, employers, jobs and applications across the
              portal.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
          >
            View Portal
            <FiArrowRight />
          </Link>
        </div>
      </header>

      <main className="container-main py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {stat.title}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                      {loading ? "..." : stat.value}
                    </p>

                    <p className="mt-2 text-xs font-semibold ">{stat.change}</p>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.iconColor} text-xl`}
                  >
                    <Icon />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text)]">
                  Pending Actions
                </h2>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Items that need administrator attention.
                </p>
              </div>

              <FiClock className="text-xl text-[var(--color-text-muted)]" />
            </div>

            <div className="mt-6 space-y-3">
              {pendingItems.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.title}
                    href={item.link}
                    className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] p-4 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-lg ">
                        <Icon />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-[var(--color-text)]">
                          {item.title}
                        </h3>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-[var(--color-secondary)]/10 px-2 text-sm font-bold text-[var(--color-secondary-dark)]">
                        {item.count}
                      </span>

                      <FiArrowRight className="text-[var(--color-text-muted)]" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text)]">
                Portal Status
              </h2>

              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Current platform overview.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  Platform Status
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary-light)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-dark)]">
                  <span className="h-1.5 w-1.5 rounded-full btn btn-primary text-white" />
                  Operational
                </span>
              </div>

              <div className="border-t border-[var(--color-border)] pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-muted)]">
                    Pending Job Approvals
                  </span>

                  <span className="text-sm font-bold text-[var(--color-text)]">
                    {pendingJobs.length}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-surface)]">
                  <div
                    className="h-full rounded-full btn btn-primary text-white"
                    style={{
                      width: `${Math.min(pendingJobs.length * 20, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-muted)]">
                    Admin API
                  </span>

                  <span className="text-sm font-bold text-[var(--color-text)]">
                    Connected
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-surface)]">
                  <div className="h-full w-full rounded-full bg-[var(--color-secondary)]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-muted)]">
                    Job Approval
                  </span>

                  <span className="text-sm font-bold text-[var(--color-text)]">
                    Available
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-surface)]">
                  <div className="h-full w-full rounded-full btn btn-primary text-white" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="pending-jobs"
          className="mt-8 rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text)]">
                Pending Job Approvals
              </h2>

              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Review job openings submitted by employers.
              </p>
            </div>

            <span className="w-fit rounded-full bg-[var(--color-secondary)]/10 px-3 py-1.5 text-xs font-bold text-[var(--color-secondary-dark)]">
              {pendingJobs.length} pending
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="py-10 text-center text-sm text-[var(--color-text-muted)]">
                Loading pending jobs...
              </div>
            ) : pendingJobs.length === 0 ? (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 text-center">
                <FiCheckCircle className="mx-auto text-3xl " />

                <h3 className="mt-3 text-base font-bold text-[var(--color-text)]">
                  No pending jobs
                </h3>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  All submitted jobs have been reviewed.
                </p>
              </div>
            ) : (
              pendingJobs.map((job) => (
                <div
                  key={job._id}
                  className="rounded-xl border border-[var(--color-border)] p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-[var(--color-text)]">
                          {job.title}
                        </h3>

                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          Pending
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-medium ">{job.trade}</p>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--color-text-muted)]">
                        <span>
                          {job.location}, {job.state}
                        </span>

                        <span>{job.jobType}</span>

                        <span>{job.vacancies} vacancies</span>

                        <span>Posted {formatDate(job.createdAt)}</span>
                      </div>

                      <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                        Employer:{" "}
                        <span className="font-semibold text-[var(--color-text)]">
                          {job.employer?.companyName || "Unknown Employer"}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
                      >
                        <FiFileText />
                        View
                      </Link>

                      <button
                        type="button"
                        disabled={approvingJobId === job._id}
                        onClick={() => handleApproveJob(job._id)}
                        className="inline-flex items-center gap-2 rounded-xl btn btn-primary text-white px-4 py-2.5 text-sm font-semibold ! transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <FiCheckCircle />
                        {approvingJobId === job._id
                          ? "Approving..."
                          : "Approve"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Access important administration areas.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <a
                  key={action.title}
                  href={action.link}
                  className="group rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-xl ">
                    <Icon />
                  </div>

                  <h3 className="mt-5 text-base font-bold text-[var(--color-text)]">
                    {action.title}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
                    {action.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold ">
                    Open
                    <FiArrowRight className="transition group-hover:translate-x-1" />
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <section className="mt-8 flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] btn btn-primary text-white p-6  md:flex-row md:items-center md:justify-between md:p-7">
          <div>
            <div className="flex items-center gap-2">
              <FiSettings className="text-lg" />

              <h2 className="text-lg font-bold">Administration & Security</h2>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 /80">
              Review user activity, employer verification and job listings
              regularly to keep the portal reliable and secure.
            </p>
          </div>

          <Link
            to="/admin/users"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold !text-[var(--color-primary-dark)] transition hover:bg-[var(--color-background)]"
          >
            Manage Portal
            <FiArrowRight />
          </Link>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
