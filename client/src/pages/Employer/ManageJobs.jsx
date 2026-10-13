import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiPlus,
  FiSearch,
  FiMapPin,
  FiUsers,
  FiCalendar,
  FiMoreVertical,
  FiEye,
  FiEdit3,
  FiTrash2,
  FiBriefcase,
} from "react-icons/fi";

import { API_BASE_URL } from "../services/api.js";

const ManageJobs = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          throw new Error("Authentication required. Please login again.");
        }

        const [jobsResponse, applicationsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/jobs/employer`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/applications/employer`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const jobsData = await jobsResponse.json();
        const applicationsData = await applicationsResponse.json();

        if (!jobsResponse.ok) {
          throw new Error(jobsData.message || "Failed to load jobs");
        }

        if (!applicationsResponse.ok) {
          throw new Error(
            applicationsData.message || "Failed to load applications",
          );
        }

        setJobs(jobsData.jobs || []);
        setApplications(applicationsData.applications || []);
      } catch (err) {
        console.error("Manage jobs error:", err);
        setError(err.message || "Unable to load jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [token]);

  const getApplicationCount = (jobId) => {
    return applications.filter((application) => {
      const applicationJobId = application.job?._id || application.job;

      return applicationJobId === jobId;
    }).length;
  };

  const formatDate = (date) => {
    if (!date) return "Recently";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const mappedJobs = jobs.map((job) => ({
    ...job,
    id: job._id,
    title: job.title,
    trade: job.trade,
    location: `${job.location}, ${job.state}`,
    type: job.jobType,
    vacancies: job.vacancies,
    applications: getApplicationCount(job._id),
    posted: formatDate(job.createdAt),
    status: job.isActive === false ? "Closed" : "Active",
  }));

  const filteredJobs = mappedJobs.filter((job) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      job.title.toLowerCase().includes(searchText) ||
      job.trade.toLowerCase().includes(searchText) ||
      job.location.toLowerCase().includes(searchText);

    const matchesFilter = filter === "All" || job.status === filter;

    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete job");
      }

      setJobs((currentJobs) => currentJobs.filter((job) => job._id !== id));

      setOpenMenu(null);
    } catch (err) {
      console.error("Delete job error:", err);
      alert(err.message || "Unable to delete job");
    }
  };

  const activeJobs = mappedJobs.filter((job) => job.status === "Active");

  const totalApplications = mappedJobs.reduce(
    (total, job) => total + job.applications,
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="container-main py-16 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary-light)] border-t-[var(--color-primary)]" />

          <p className="mt-4 text-sm text-[var(--color-text-muted)]">
            Loading your jobs...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="container-main py-8">
          <Link
            to="/employer/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:"
          >
            <FiArrowLeft />
            Back to Dashboard
          </Link>

          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <h2 className="text-lg font-bold text-red-700">
              Unable to load jobs
            </h2>

            <p className="mt-2 text-sm text-red-600">{error}</p>
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

          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)] md:text-3xl">
                Manage Jobs
              </h1>

              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                View, edit and manage your posted opportunities.
              </p>
            </div>

            <Link
              to="/employer/post-job"
              className="inline-flex w-fit items-center gap-2 rounded-xl btn btn-primary text-white px-5 py-3 text-sm font-semibold ! transition hover:bg-[var(--color-primary-dark)]"
            >
              <FiPlus />
              Post New Job
            </Link>
          </div>
        </div>
      </div>

      <main className="container-main py-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Total Jobs
                </p>

                <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
                  {jobs.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-xl ">
                <FiBriefcase />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Active Jobs
                </p>

                <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
                  {activeJobs.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-xl ">
                <FiEye />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Applications
                </p>

                <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
                  {totalApplications}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-secondary)]/10 text-xl text-[var(--color-secondary-dark)]">
                <FiUsers />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs, trades or locations..."
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3 pl-11 pr-4 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="flex gap-2">
              {["All", "Active", "Closed"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    filter === item
                      ? "btn btn-primary text-white !"
                      : "border border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="relative rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm transition hover:shadow-md md:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex gap-4">
                    <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-xl  sm:flex">
                      <FiBriefcase />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-[var(--color-text)]">
                          {job.title}
                        </h2>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            job.status === "Active"
                              ? "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-medium ">{job.trade}</p>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--color-text-muted)]">
                        <span className="inline-flex items-center gap-1.5">
                          <FiMapPin />
                          {job.location}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <FiBriefcase />
                          {job.type}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <FiUsers />
                          {job.vacancies} vacancies
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <FiCalendar />
                          {job.posted}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4 lg:border-t-0 lg:pt-0">
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Applications
                      </p>

                      <p className="mt-1 text-xl font-bold text-[var(--color-text)]">
                        {job.applications}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
                      >
                        <FiEye />
                        View
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu(openMenu === job.id ? null : job.id)
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface)]"
                      >
                        <FiMoreVertical />
                      </button>
                    </div>
                  </div>
                </div>

                {openMenu === job.id && (
                  <div className="absolute right-5 top-20 z-20 w-44 rounded-xl border border-[var(--color-border)] bg-white p-1.5 shadow-lg">
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
                      onClick={() => setOpenMenu(null)}
                    >
                      <FiEdit3 />
                      Edit Job
                    </button>

                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                      onClick={() => handleDelete(job.id)}
                    >
                      <FiTrash2 />
                      Delete Job
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-[var(--color-border)] bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface)] text-2xl text-[var(--color-text-muted)]">
                <FiBriefcase />
              </div>

              <h2 className="mt-4 text-lg font-bold text-[var(--color-text)]">
                No jobs found
              </h2>

              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Try changing your search or filter.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageJobs;
