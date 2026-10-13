import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiMapPin,
  FiBriefcase,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiMoreVertical,
  FiClock,
  FiUsers,
} from "react-icons/fi";

import { API_BASE_URL } from "../services/api.js";

const getStatus = (job) =>
  !job.isApproved ? "Pending" : job.isActive ? "Approved" : "Suspended";

function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const token = localStorage.getItem("token");

  const loadJobs = useCallback(async () => {
    if (!token) throw new Error("Authentication required. Please login again.");
    const response = await fetch(`${API_BASE_URL}/admin/jobs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to load jobs");
    return data.jobs || [];
  }, [token]);

  useEffect(() => {
    let active = true;
    loadJobs()
      .then((loadedJobs) => {
        if (active) setJobs(loadedJobs);
      })
      .catch((err) => {
        if (active) setError(err.message || "Unable to load jobs");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadJobs]);

  const fetchJobs = useCallback(async () => {
    try {
      setJobs(await loadJobs());
    } catch (err) {
      setError(err.message || "Unable to load jobs");
    } finally {
      setLoading(false);
    }
  }, [loadJobs]);

  const updateStatus = async (id, status) => {
    const action = {
      Approved: "approve",
      Suspended: "suspend",
      Active: "activate",
    }[status];
    if (!action || !token) return;

    try {
      setUpdatingId(id);
      setLoading(true);
      setError("");
      const response = await fetch(
        `${API_BASE_URL}/admin/jobs/${id}/${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update job");
      await fetchJobs();
    } catch (err) {
      setError(err.message || "Unable to update job");
    } finally {
      setLoading(false);
      setUpdatingId(null);
    }
  };

  const deleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    if (!token) {
      setError("Authentication required. Please login again.");
      return;
    }

    try {
      setUpdatingId(id);
      setError("");
      const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete job");
      setJobs((current) => current.filter((job) => job._id !== id));
    } catch (err) {
      setError(err.message || "Unable to delete job");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusClasses = (status) => {
    if (status === "Approved") {
      return "bg-green-50 text-green-700 border-green-200";
    }

    if (status === "Pending") {
      return "bg-orange-50 text-orange-700 border-orange-200";
    }

    return "bg-red-50 text-red-700 border-red-200";
  };

  const mappedJobs = useMemo(
    () =>
      jobs.map((job) => ({
        ...job,
        id: job._id,
        company: job.employer?.companyName || "Company",
        location: [job.location, job.state].filter(Boolean).join(", "),
        type: job.jobType,
        applications: job.applicationCount || 0,
        posted: job.createdAt
          ? new Date(job.createdAt).toLocaleDateString("en-GB")
          : "Recently",
        status: getStatus(job),
      })),
    [jobs],
  );
  const totalJobs = mappedJobs.length;
  const approvedJobs = mappedJobs.filter((job) => job.status === "Approved").length;
  const pendingJobs = mappedJobs.filter((job) => job.status === "Pending").length;
  const suspendedJobs = mappedJobs.filter((job) => job.status === "Suspended").length;

  const filteredJobs = useMemo(() => {
    const searchText = search.toLowerCase();
    return mappedJobs.filter((job) => {
      const matchesSearch = [job.title, job.company, job.trade, job.location]
        .some((value) => (value || "").toLowerCase().includes(searchText));
      return matchesSearch && (filter === "All" || job.status === filter);
    });
  }, [mappedJobs, search, filter]);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="container-main py-8 md:py-10">
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] ">
                Admin Panel
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl">
                Manage Jobs
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)] md:text-base">
                Review job postings, approve legitimate opportunities and
                monitor apprenticeship and trade vacancies.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 shadow-sm">
              <FiBriefcase className="" />

              <span className="text-sm font-semibold text-[var(--color-text)]">
                Job Management
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <p className="mb-4 text-sm text-[var(--color-text-muted)]">
            Loading jobs from the database...
          </p>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 ">
              <FiBriefcase size={21} />
            </div>

            <p className="text-sm text-[var(--color-text-muted)]">Total Jobs</p>

            <h2 className="mt-1 text-2xl font-bold text-[var(--color-text)]">
              {totalJobs}
            </h2>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <FiCheckCircle size={21} />
            </div>

            <p className="text-sm text-[var(--color-text-muted)]">Approved</p>

            <h2 className="mt-1 text-2xl font-bold text-[var(--color-text)]">
              {approvedJobs}
            </h2>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <FiClock size={21} />
            </div>

            <p className="text-sm text-[var(--color-text-muted)]">
              Pending Review
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[var(--color-text)]">
              {pendingJobs}
            </h2>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <FiXCircle size={21} />
            </div>

            <p className="text-sm text-[var(--color-text-muted)]">Suspended</p>

            <h2 className="mt-1 text-2xl font-bold text-[var(--color-text)]">
              {suspendedJobs}
            </h2>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <FiSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                size={18}
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs, company, trade..."
                className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] pl-11 pr-4 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {["All", "Approved", "Pending", "Suspended"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    filter === item
                      ? "btn btn-primary text-white text-white"
                      : "border border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:bg-[var(--color-background)]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px]">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Job
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Trade
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Location
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Vacancies
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Applications
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="transition hover:bg-[var(--color-background)]"
                  >
                    <td className="px-6 py-5">
                      <p className="font-semibold text-[var(--color-text)]">
                        {job.title}
                      </p>

                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        {job.company}
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                        <FiClock size={13} />
                        {job.posted}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div>
                        <span className="rounded-lg bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          {job.trade}
                        </span>

                        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                          {job.type}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                        <FiMapPin size={15} />
                        {job.location}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className="text-sm font-semibold text-[var(--color-text)]">
                        {job.vacancies}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                        <FiUsers size={15} className="" />
                        {job.applications}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          job.status,
                        )}`}
                      >
                        {job.status}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          title="View Job"
                          className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:"
                        >
                          <FiEye size={17} />
                        </button>

                        {job.status === "Pending" && (
                          <button
                            type="button"
                            disabled={updatingId === job.id}
                            onClick={() => updateStatus(job.id, "Approved")}
                            className="rounded-lg btn btn-primary text-white px-3 py-2 text-xs font-semibold  transition hover:bg-[var(--color-primary-dark)]"
                          >
                            Approve
                          </button>
                        )}

                        {job.status === "Approved" && (
                          <button
                            type="button"
                            disabled={updatingId === job.id}
                            onClick={() => updateStatus(job.id, "Suspended")}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Suspend
                          </button>
                        )}

                        {job.status === "Suspended" && (
                          <button
                            type="button"
                            disabled={updatingId === job.id}
                            onClick={() => updateStatus(job.id, "Active")}
                            className="rounded-lg border border-green-200 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-50"
                          >
                            Activate
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={updatingId === job.id}
                          onClick={() => deleteJob(job.id)}
                          title="Delete Job"
                          className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                        >
                          <FiTrash2 size={17} />
                        </button>

                        <button
                          type="button"
                          className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-text-muted)]"
                        >
                          <FiMoreVertical size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4 lg:hidden">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[var(--color-text)]">
                    {job.title}
                  </h3>

                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {job.company}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                    job.status,
                  )}`}
                >
                  {job.status}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <FiBriefcase />
                  <span>{job.trade}</span>
                </div>

                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <FiMapPin />
                  <span>{job.location}</span>
                </div>

                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <FiUsers />
                  <span>
                    {job.vacancies} vacancies · {job.applications} applications
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <FiClock />
                  <span>{job.posted}</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-4">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-text)]"
                >
                  <FiEye size={16} />
                  View
                </button>

                {job.status === "Pending" && (
                  <button
                    type="button"
                    disabled={updatingId === job.id}
                    onClick={() => updateStatus(job.id, "Approved")}
                    className="rounded-lg btn btn-primary text-white px-3 py-2 text-sm font-semibold "
                  >
                    Approve
                  </button>
                )}

                {job.status === "Approved" && (
                  <button
                    type="button"
                    disabled={updatingId === job.id}
                    onClick={() => updateStatus(job.id, "Suspended")}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600"
                  >
                    Suspend
                  </button>
                )}

                {job.status === "Suspended" && (
                  <button
                    type="button"
                    disabled={updatingId === job.id}
                    onClick={() => updateStatus(job.id, "Active")}
                    className="rounded-lg border border-green-200 px-3 py-2 text-sm font-semibold text-green-700"
                  >
                    Activate
                  </button>
                )}

                <button
                  type="button"
                  disabled={updatingId === job.id}
                  onClick={() => deleteJob(job.id)}
                  className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600"
                >
                  <FiTrash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-white px-6 py-16 text-center shadow-sm">
            <FiBriefcase
              size={36}
              className="mx-auto text-[var(--color-text-muted)]"
            />

            <h3 className="mt-4 text-lg font-bold text-[var(--color-text)]">
              No jobs found
            </h3>

            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Try changing your search or status filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageJobs;
