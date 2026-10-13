import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiSearch,
  FiMapPin,
  FiPhone,
  FiMail,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiEye,
  FiDownload,
} from "react-icons/fi";

import { API_BASE_URL } from "../services/api.js";
const API_URL = API_BASE_URL;

const Applications = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

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
        setError("Please login as an employer to view applications.");
        return;
      }

      const response = await fetch(`${API_URL}/applications/employer`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to load applications.",
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

  const downloadResume = async (application) => {
    const token = getToken();
    if (!token) {
      setError("Please login again to download this resume.");
      return;
    }

    try {
      setError("");
      const response = await fetch(
        `${API_URL}/applications/${application._id}/resume`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Resume download failed.");
      }

      const fileUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = application.student?.resume || "resume";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileUrl);
    } catch (err) {
      setError(err.message || "Resume download failed.");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);

      const token = getToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(`${API_URL}/applications/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to update application status.",
        );
      }

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application._id === id
            ? {
                ...application,
                status,
              }
            : application,
        ),
      );
    } catch (err) {
      setError(err.message || "Failed to update application.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStudent = (application) => {
    return application.student || {};
  };

  const getJob = (application) => {
    return application.job || {};
  };

  const getStudentName = (application) => {
    const student = getStudent(application);

    return student.user?.name || student.name || "Candidate";
  };

  const getStudentEmail = (application) => {
    const student = getStudent(application);

    return student.user?.email || student.email || "";
  };

  const getStudentPhone = (application) => {
    const student = getStudent(application);

    return student.phone || "";
  };

  const getStudentTrade = (application) => {
    const student = getStudent(application);
    const job = getJob(application);

    return student.trade || job.trade || "Trade not specified";
  };

  const getStudentLocation = (application) => {
    const student = getStudent(application);

    if (student.city && student.state) {
      return `${student.city}, ${student.state}`;
    }

    return student.city || student.state || "Location not specified";
  };

  const getExperience = (application) => {
    const student = getStudent(application);

    if (student.experience) {
      return student.experience;
    }

    return "Fresher";
  };

  const getJobTitle = (application) => {
    const job = getJob(application);

    return job.title || "Job Opportunity";
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

  const filteredApplications = applications.filter((application) => {
    const studentName = getStudentName(application).toLowerCase();
    const trade = getStudentTrade(application).toLowerCase();
    const job = getJobTitle(application).toLowerCase();

    const searchText = search.toLowerCase();

    const matchesSearch =
      studentName.includes(searchText) ||
      trade.includes(searchText) ||
      job.includes(searchText);

    const matchesFilter =
      filter === "All" ||
      (filter === "Under Review" && application.status === "Applied") ||
      application.status === filter;

    return matchesSearch && matchesFilter;
  });

  const totalApplications = applications.length;

  const underReviewCount = applications.filter(
    (application) =>
      application.status === "Applied" || application.status === "Under Review",
  ).length;

  const shortlistedCount = applications.filter(
    (application) => application.status === "Shortlisted",
  ).length;

  const getStatusLabel = (status) => {
    if (status === "Applied") {
      return "Under Review";
    }

    return status || "Under Review";
  };

  const statusStyle = {
    Shortlisted:
      "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]",
    Applied:
      "bg-[var(--color-secondary)]/10 text-[var(--color-secondary-dark)]",
    "Under Review":
      "bg-[var(--color-secondary)]/10 text-[var(--color-secondary-dark)]",
    Rejected: "bg-red-50 text-red-600",
    Selected:
      "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]",
  };

  if (loading) {
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
                Applications
              </h1>

              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Review candidates who have applied to your job openings.
              </p>
            </div>
          </div>
        </div>

        <main className="container-main py-8">
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl border border-[var(--color-border)] bg-white"
              />
            ))}
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-2xl border border-[var(--color-border)] bg-white"
              />
            ))}
          </div>
        </main>
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
              Applications
            </h1>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Review candidates who have applied to your job openings.
            </p>
          </div>
        </div>
      </div>

      <main className="container-main py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <p className="text-sm text-[var(--color-text-muted)]">
              Total Applications
            </p>

            <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
              {totalApplications}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <p className="text-sm text-[var(--color-text-muted)]">
              Under Review
            </p>

            <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
              {underReviewCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <p className="text-sm text-[var(--color-text-muted)]">
              Shortlisted
            </p>

            <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
              {shortlistedCount}
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate, trade or job..."
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3 pl-11 pr-4 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {["All", "Under Review", "Shortlisted", "Rejected"].map(
                (item) => (
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
                ),
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((application) => {
              const studentName = getStudentName(application);
              const studentEmail = getStudentEmail(application);
              const studentPhone = getStudentPhone(application);
              const studentTrade = getStudentTrade(application);
              const studentLocation = getStudentLocation(application);
              const experience = getExperience(application);
              const jobTitle = getJobTitle(application);
              const appliedDate = getAppliedDate(application);
              const status = application.status || "Applied";
              const statusLabel = getStatusLabel(status);

              return (
                <div
                  key={application._id}
                  className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm transition hover:shadow-md md:p-6"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-lg font-bold text-[var(--color-primary-dark)]">
                        {studentName
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-bold text-[var(--color-text)]">
                            {studentName}
                          </h2>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              statusStyle[status] || "bg-gray-100 "
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </div>

                        <p className="mt-1 text-sm font-semibold ">
                          {studentTrade}
                        </p>

                        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                          Applied for {jobTitle}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--color-text-muted)]">
                          <span className="inline-flex items-center gap-1.5">
                            <FiMapPin />
                            {studentLocation}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <FiClock />
                            {experience}
                          </span>

                          <span>Applied {appliedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-4 xl:border-t-0 xl:pt-0">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
                      >
                        <FiEye />
                        View Profile
                      </button>

                      {application.student?.hasPrivateResume ? (
                        <button
                          type="button"
                          onClick={() => downloadResume(application)}
                          className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
                        >
                          <FiFileText />
                          Resume
                        </button>
                      ) : application.resume ? (
                        <a
                          href={application.resume}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
                        >
                          <FiFileText />
                          Resume
                        </a>
                      ) : null}

                      {status !== "Shortlisted" && status !== "Selected" && (
                        <button
                          type="button"
                          disabled={updatingId === application._id}
                          onClick={() =>
                            updateStatus(application._id, "Shortlisted")
                          }
                          className="inline-flex items-center gap-2 rounded-xl btn btn-primary text-white px-4 py-2.5 text-sm font-semibold ! transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <FiCheckCircle />
                          {updatingId === application._id
                            ? "Updating..."
                            : "Shortlist"}
                        </button>
                      )}

                      {status !== "Rejected" && (
                        <button
                          type="button"
                          disabled={updatingId === application._id}
                          onClick={() =>
                            updateStatus(application._id, "Rejected")
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <FiXCircle />
                          {updatingId === application._id
                            ? "Updating..."
                            : "Reject"}
                        </button>
                      )}
                    </div>
                  </div>

                  {status === "Shortlisted" && (
                    <div className="mt-5 flex flex-col gap-3 rounded-xl bg-[var(--color-primary-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-primary-dark)]">
                          Candidate shortlisted
                        </p>

                        <p className="mt-1 text-xs text-[var(--color-primary-dark)]/80">
                          You can contact the candidate using the details below.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm">
                        {studentPhone && (
                          <a
                            href={`tel:${studentPhone}`}
                            className="inline-flex items-center gap-2 font-semibold text-[var(--color-primary-dark)]"
                          >
                            <FiPhone />
                            Call
                          </a>
                        )}

                        {studentEmail && (
                          <a
                            href={`mailto:${studentEmail}`}
                            className="inline-flex items-center gap-2 font-semibold text-[var(--color-primary-dark)]"
                          >
                            <FiMail />
                            Email
                          </a>
                        )}

                        {application.student?.hasPrivateResume ? (
                          <button
                            type="button"
                            onClick={() => downloadResume(application)}
                            className="inline-flex items-center gap-2 font-semibold text-[var(--color-primary-dark)]"
                          >
                            <FiDownload />
                            Resume
                          </button>
                        ) : application.resume ? (
                          <a
                            href={application.resume}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 font-semibold text-[var(--color-primary-dark)]"
                          >
                            <FiDownload />
                            Resume
                          </a>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-[var(--color-border)] bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface)] text-2xl text-[var(--color-text-muted)]">
                <FiFileText />
              </div>

              <h2 className="mt-4 text-lg font-bold text-[var(--color-text)]">
                No applications found
              </h2>

              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Try changing your search or application filter.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Applications;
