import React, { useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiMapPin,
  FiPhone,
  FiMail,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiMoreVertical,
  FiBriefcase,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { API_BASE_URL } from "../services/api.js";
const API_BASE = API_BASE_URL;

function ManageEmployers() {
  const [employers, setEmployers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchEmployers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/admin/employers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch employers");
      }

      setEmployers(data.employers || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployers();
  }, []);

  const getEmployerDetails = async (id) => {
    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/admin/employers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get employer details");
      }

      setSelectedEmployer(data.employer);
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const updateEmployerStatus = async (id, action) => {
    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/admin/employers/${id}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update employer");
      }

      setOpenMenu(null);

      await fetchEmployers();

      if (selectedEmployer?._id === id) {
        await getEmployerDetails(id);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const approveEmployer = async (id) => {
    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/admin/employers/${id}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve employer");
      }

      await fetchEmployers();
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredEmployers = useMemo(() => {
    return employers.filter((employer) => {
      const company = employer.companyName || "";
      const owner = employer.contactPerson || "";
      const industry = employer.industry || "";
      const location = employer.city || employer.location || "";
      const email = employer.user?.email || "";

      const searchText = search.toLowerCase();

      const matchesSearch =
        company.toLowerCase().includes(searchText) ||
        owner.toLowerCase().includes(searchText) ||
        industry.toLowerCase().includes(searchText) ||
        location.toLowerCase().includes(searchText) ||
        email.toLowerCase().includes(searchText);

      const matchesFilter = filter === "All" || employer.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [employers, search, filter]);

  const totalEmployers = employers.length;

  const approvedEmployers = employers.filter(
    (employer) => employer.status === "Approved",
  ).length;

  const pendingEmployers = employers.filter(
    (employer) => employer.status === "Pending",
  ).length;

  const suspendedEmployers = employers.filter(
    (employer) => employer.status === "Suspended",
  ).length;

  const getStatusClasses = (status) => {
    if (status === "Approved") {
      return "bg-green-50 text-green-700 border-green-200";
    }

    if (status === "Pending") {
      return "bg-orange-50 text-orange-700 border-orange-200";
    }

    return "bg-red-50 text-red-700 border-red-200";
  };

  const getLocation = (employer) => {
    return (
      employer.city ||
      employer.location ||
      employer.state ||
      "Location not available"
    );
  };

  const getEmail = (employer) => {
    return employer.user?.email || employer.email || "Email not available";
  };

  const getPhone = (employer) => {
    return employer.phone || "Phone not available";
  };

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
                Manage Employers
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)] md:text-base">
                Review employer accounts, approve businesses and monitor
                organizations posting apprenticeship and trade jobs.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 shadow-sm">
              <FiBriefcase className="" />

              <span className="text-sm font-semibold text-[var(--color-text)]">
                Employer Management
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-semibold"
            >
              <FiX />
            </button>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 ">
              <FiBriefcase size={21} />
            </div>

            <p className="text-sm text-[var(--color-text-muted)]">
              Total Employers
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[var(--color-text)]">
              {totalEmployers}
            </h2>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <FiCheckCircle size={21} />
            </div>

            <p className="text-sm text-[var(--color-text-muted)]">Approved</p>

            <h2 className="mt-1 text-2xl font-bold text-[var(--color-text)]">
              {approvedEmployers}
            </h2>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <FiEye size={21} />
            </div>

            <p className="text-sm text-[var(--color-text-muted)]">
              Pending Approval
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[var(--color-text)]">
              {pendingEmployers}
            </h2>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <FiXCircle size={21} />
            </div>

            <p className="text-sm text-[var(--color-text-muted)]">Suspended</p>

            <h2 className="mt-1 text-2xl font-bold text-[var(--color-text)]">
              {suspendedEmployers}
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
                placeholder="Search employer, owner, industry..."
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

        {loading ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />

            <p className="mt-4 text-sm text-[var(--color-text-muted)]">
              Loading employers...
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px]">
                  <thead className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                        Employer
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                        Industry
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                        Location
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                        Jobs
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
                    {filteredEmployers.map((employer) => (
                      <tr
                        key={employer._id}
                        className="transition hover:bg-[var(--color-background)]"
                      >
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-semibold text-[var(--color-text)]">
                              {employer.companyName}
                            </p>

                            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                              {employer.contactPerson}
                            </p>

                            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                              {getEmail(employer)}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="text-sm font-medium text-[var(--color-text)]">
                            {employer.industry || "Not specified"}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                            <FiMapPin size={15} />
                            {getLocation(employer)}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div>
                            <p className="text-sm font-semibold text-[var(--color-text)]">
                              {employer.activeJobs} Active
                            </p>

                            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                              {employer.totalJobs} total jobs
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              employer.status,
                            )}`}
                          >
                            {employer.status}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="relative flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => getEmployerDetails(employer._id)}
                              disabled={actionLoading}
                              className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:"
                              title="View Employer"
                            >
                              <FiEye size={17} />
                            </button>

                            {employer.status === "Pending" && (
                              <button
                                type="button"
                                onClick={() => approveEmployer(employer._id)}
                                disabled={actionLoading}
                                className="rounded-lg btn btn-primary text-white px-3 py-2 text-xs font-semibold  transition hover:bg-[var(--color-primary-dark)]"
                              >
                                Approve
                              </button>
                            )}

                            {employer.status === "Approved" && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateEmployerStatus(employer._id, "suspend")
                                }
                                disabled={actionLoading}
                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                Suspend
                              </button>
                            )}

                            {employer.status === "Suspended" && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateEmployerStatus(employer._id, "activate")
                                }
                                disabled={actionLoading}
                                className="rounded-lg border border-green-200 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-50"
                              >
                                Activate
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenu(
                                  openMenu === employer._id
                                    ? null
                                    : employer._id,
                                )
                              }
                              className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:"
                            >
                              <FiMoreVertical size={17} />
                            </button>

                            {openMenu === employer._id && (
                              <div className="absolute right-0 top-11 z-30 w-44 rounded-xl border border-[var(--color-border)] bg-white p-2 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => {
                                    getEmployerDetails(employer._id);
                                    setOpenMenu(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-background)]"
                                >
                                  <FiEye size={15} />
                                  View Details
                                </button>

                                {employer.status === "Approved" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateEmployerStatus(
                                        employer._id,
                                        "suspend",
                                      )
                                    }
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                                  >
                                    <FiXCircle size={15} />
                                    Suspend
                                  </button>
                                )}

                                {employer.status === "Suspended" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateEmployerStatus(
                                        employer._id,
                                        "activate",
                                      )
                                    }
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-green-700 hover:bg-green-50"
                                  >
                                    <FiCheckCircle size={15} />
                                    Activate
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4 lg:hidden">
              {filteredEmployers.map((employer) => (
                <div
                  key={employer._id}
                  className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-[var(--color-text)]">
                        {employer.companyName}
                      </h3>

                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        {employer.contactPerson}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        employer.status,
                      )}`}
                    >
                      {employer.status}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                      <FiBriefcase />
                      <span>
                        {employer.industry || "Industry not available"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                      <FiMapPin />
                      <span>{getLocation(employer)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                      <FiMail />
                      <span className="truncate">{getEmail(employer)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                      <FiPhone />
                      <span>{getPhone(employer)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                      <FiUsers />
                      <span>
                        {employer.activeJobs} active jobs · {employer.totalJobs}{" "}
                        total jobs
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-4">
                    <button
                      type="button"
                      onClick={() => getEmployerDetails(employer._id)}
                      className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-text)]"
                    >
                      <FiEye size={16} />
                      View
                    </button>

                    {employer.status === "Pending" && (
                      <button
                        type="button"
                        onClick={() => approveEmployer(employer._id)}
                        className="rounded-lg btn btn-primary text-white px-3 py-2 text-sm font-semibold "
                      >
                        Approve
                      </button>
                    )}

                    {employer.status === "Approved" && (
                      <button
                        type="button"
                        onClick={() =>
                          updateEmployerStatus(employer._id, "suspend")
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600"
                      >
                        Suspend
                      </button>
                    )}

                    {employer.status === "Suspended" && (
                      <button
                        type="button"
                        onClick={() =>
                          updateEmployerStatus(employer._id, "activate")
                        }
                        className="rounded-lg border border-green-200 px-3 py-2 text-sm font-semibold text-green-700"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredEmployers.length === 0 && (
              <div className="rounded-2xl border border-[var(--color-border)] bg-white px-6 py-16 text-center shadow-sm">
                <FiBriefcase
                  size={36}
                  className="mx-auto text-[var(--color-text-muted)]"
                />

                <h3 className="mt-4 text-lg font-bold text-[var(--color-text)]">
                  No employers found
                </h3>

                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  Try changing your search or status filter.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {selectedEmployer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider ">
                  Employer Details
                </p>

                <h2 className="mt-1 text-xl font-bold text-[var(--color-text)]">
                  {selectedEmployer.companyName}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEmployer(null)}
                className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-background)]"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">
                  Contact Person
                </p>

                <p className="mt-1 font-semibold text-[var(--color-text)]">
                  {selectedEmployer.contactPerson || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">
                  Industry
                </p>

                <p className="mt-1 font-semibold text-[var(--color-text)]">
                  {selectedEmployer.industry || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">
                  Email
                </p>

                <p className="mt-1 break-all font-semibold text-[var(--color-text)]">
                  {getEmail(selectedEmployer)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">
                  Phone
                </p>

                <p className="mt-1 font-semibold text-[var(--color-text)]">
                  {getPhone(selectedEmployer)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">
                  Location
                </p>

                <p className="mt-1 font-semibold text-[var(--color-text)]">
                  {getLocation(selectedEmployer)}
                  {selectedEmployer.state ? `, ${selectedEmployer.state}` : ""}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">
                  Status
                </p>

                <span
                  className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                    selectedEmployer.status,
                  )}`}
                >
                  {selectedEmployer.status}
                </span>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">
                  Description
                </p>

                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  {selectedEmployer.description ||
                    "No company description available."}
                </p>
              </div>

              <div className="rounded-xl bg-[var(--color-background)] p-4">
                <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">
                  Active Jobs
                </p>

                <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">
                  {selectedEmployer.activeJobs}
                </p>
              </div>

              <div className="rounded-xl bg-[var(--color-background)] p-4">
                <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">
                  Total Jobs
                </p>

                <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">
                  {selectedEmployer.totalJobs}
                </p>
              </div>
            </div>

            {selectedEmployer.jobs?.length > 0 && (
              <div className="border-t border-[var(--color-border)] px-6 py-5">
                <h3 className="font-bold text-[var(--color-text)]">
                  Posted Jobs
                </h3>

                <div className="mt-4 space-y-3">
                  {selectedEmployer.jobs.map((job) => (
                    <div
                      key={job._id}
                      className="rounded-xl border border-[var(--color-border)] p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-[var(--color-text)]">
                            {job.title}
                          </p>

                          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {job.trade} · {job.jobType} · {job.location}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            job.isApproved
                              ? "bg-green-50 text-green-700"
                              : "bg-orange-50 text-orange-700"
                          }`}
                        >
                          {job.isApproved ? "Approved" : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end border-t border-[var(--color-border)] px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedEmployer(null)}
                className="rounded-lg btn btn-primary text-white px-5 py-2.5 text-sm font-semibold  hover:bg-[var(--color-primary-dark)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageEmployers;
