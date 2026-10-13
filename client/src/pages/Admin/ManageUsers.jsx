import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiSearch,
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiEye,
  FiMoreVertical,
  FiMail,
  FiPhone,
  FiMapPin,
  FiFilter,
  FiX,
  FiBookOpen,
  FiAward,
} from "react-icons/fi";

import { API_BASE_URL } from "../services/api.js";

const ManageUsers = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [openMenu, setOpenMenu] = useState(null);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(null);

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      setUsers(data.users || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openProfile = async (userId) => {
    try {
      setOpenMenu(null);
      setProfileLoading(true);
      setSelectedUser(null);

      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch profile");
      }

      setSelectedUser(data.user);
    } catch (error) {
      alert(error.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const updateStatus = async (userId, status) => {
    try {
      setActionLoading(userId);
      setOpenMenu(null);

      const endpoint =
        status === "Suspended"
          ? `${API_BASE_URL}/admin/users/${userId}/suspend`
          : `${API_BASE_URL}/admin/users/${userId}/activate`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user status");
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                status,
              }
            : user,
        ),
      );

      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser((currentUser) => ({
          ...currentUser,
          status,
        }));
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      user.name?.toLowerCase().includes(searchValue) ||
      user.email?.toLowerCase().includes(searchValue) ||
      user.trade?.toLowerCase().includes(searchValue) ||
      user.location?.toLowerCase().includes(searchValue);

    const matchesFilter = filter === "All" || user.status === filter;

    return matchesSearch && matchesFilter;
  });

  const activeUsers = users.filter((user) => user.status === "Active").length;

  const suspendedUsers = users.filter(
    (user) => user.status === "Suspended",
  ).length;

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border)] bg-white">
        <div className="container-main py-5">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:"
          >
            <FiArrowLeft />
            Back to Dashboard
          </Link>

          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)] md:text-3xl">
                Manage Users
              </h1>

              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                View and manage registered student accounts.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-[var(--color-primary-light)] px-4 py-3 text-sm font-semibold text-[var(--color-primary-dark)]">
              <FiUsers />
              {users.length} Registered Users
            </div>
          </div>
        </div>
      </header>

      <main className="container-main py-8">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Total Users
                </p>

                <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
                  {users.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-xl ">
                <FiUsers />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Active Users
                </p>

                <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
                  {activeUsers}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-xl ">
                <FiUserCheck />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Suspended
                </p>

                <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
                  {suspendedUsers}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
                <FiUserX />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users, trades or locations..."
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3 pl-11 pr-4 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="mr-1 hidden items-center gap-2 text-sm text-[var(--color-text-muted)] sm:flex">
                <FiFilter />
                Filter:
              </div>

              {["All", "Active", "Suspended"].map((item) => (
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
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
          {loading ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />

              <p className="mt-4 text-sm text-[var(--color-text-muted)]">
                Loading users...
              </p>
            </div>
          ) : error ? (
            <div className="px-6 py-16 text-center">
              <FiUserX className="mx-auto text-4xl text-red-500" />

              <h2 className="mt-4 text-lg font-bold text-[var(--color-text)]">
                Failed to load users
              </h2>

              <p className="mt-1 text-sm text-red-500">{error}</p>

              <button
                type="button"
                onClick={fetchUsers}
                className="mt-5 rounded-xl btn btn-primary text-white px-5 py-2.5 text-sm font-semibold !"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                        User
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                        Trade
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                        Location
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                        Joined
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-[var(--color-border)] last:border-0"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary-light)] font-bold text-[var(--color-primary-dark)]">
                              {user.name
                                ?.split(" ")
                                .map((word) => word[0])
                                .join("")
                                .slice(0, 2)}
                            </div>

                            <div>
                              <p className="text-sm font-bold text-[var(--color-text)]">
                                {user.name}
                              </p>

                              <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                                <FiMail />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="rounded-lg bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-dark)]">
                            {user.trade || "Not provided"}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                            <FiMapPin />
                            {user.location}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-[var(--color-text-muted)]">
                          {formatDate(user.joined)}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                              user.status === "Active"
                                ? "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>

                        <td className="relative px-6 py-5 text-right">
                          <button
                            type="button"
                            disabled={actionLoading === user.id}
                            onClick={() =>
                              setOpenMenu(openMenu === user.id ? null : user.id)
                            }
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface)] disabled:opacity-50"
                          >
                            <FiMoreVertical />
                          </button>

                          {openMenu === user.id && (
                            <div className="absolute right-6 top-16 z-20 w-48 rounded-xl border border-[var(--color-border)] bg-white p-1.5 text-left shadow-lg">
                              <button
                                type="button"
                                onClick={() => openProfile(user.id)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
                              >
                                <FiEye />
                                View Profile
                              </button>

                              <a
                                href={`mailto:${user.email}`}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
                                onClick={() => setOpenMenu(null)}
                              >
                                <FiMail />
                                Contact User
                              </a>

                              {user.status === "Active" ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateStatus(user.id, "Suspended")
                                  }
                                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                                >
                                  <FiUserX />
                                  Suspend User
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateStatus(user.id, "Active")
                                  }
                                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium  transition hover:bg-[var(--color-primary-light)]"
                                >
                                  <FiUserCheck />
                                  Activate User
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-[var(--color-border)] md:hidden">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] font-bold text-[var(--color-primary-dark)]">
                          {user.name
                            ?.split(" ")
                            .map((word) => word[0])
                            .join("")
                            .slice(0, 2)}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-[var(--color-text)]">
                            {user.name}
                          </p>

                          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.status === "Active"
                            ? "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          Trade
                        </p>

                        <p className="mt-1 font-semibold text-[var(--color-text)]">
                          {user.trade || "Not provided"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          Joined
                        </p>

                        <p className="mt-1 font-semibold text-[var(--color-text)]">
                          {formatDate(user.joined)}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-xs text-[var(--color-text-muted)]">
                          Location
                        </p>

                        <p className="mt-1 flex items-center gap-2 font-semibold text-[var(--color-text)]">
                          <FiMapPin />
                          {user.location}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-xs text-[var(--color-text-muted)]">
                          Contact
                        </p>

                        <p className="mt-1 flex items-center gap-2 font-semibold text-[var(--color-text)]">
                          <FiPhone />
                          {user.phone || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openProfile(user.id)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)]"
                      >
                        <FiEye />
                        View
                      </button>

                      {user.status === "Active" ? (
                        <button
                          type="button"
                          disabled={actionLoading === user.id}
                          onClick={() => updateStatus(user.id, "Suspended")}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 disabled:opacity-50"
                        >
                          <FiUserX />
                          Suspend
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={actionLoading === user.id}
                          onClick={() => updateStatus(user.id, "Active")}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl btn btn-primary text-white px-4 py-2.5 text-sm font-semibold ! disabled:opacity-50"
                        >
                          <FiUserCheck />
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <FiUsers className="mx-auto text-4xl text-[var(--color-text-muted)]" />

                  <h2 className="mt-4 text-lg font-bold text-[var(--color-text)]">
                    No users found
                  </h2>

                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Try changing your search or filter.
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {profileLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="rounded-2xl bg-white px-8 py-7 text-center shadow-xl">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />

            <p className="mt-4 text-sm font-medium text-[var(--color-text)]">
              Loading profile...
            </p>
          </div>
        </div>
      )}

      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border)] bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text)]">
                  Student Profile
                </h2>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Complete registered user details
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface)]"
              >
                <FiX />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-4 rounded-2xl bg-[var(--color-surface)] p-5 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xl font-bold text-[var(--color-primary-dark)]">
                  {selectedUser.name
                    ?.split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[var(--color-text)]">
                    {selectedUser.name}
                  </h3>

                  <p className="mt-1 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                    <FiMail />
                    {selectedUser.email}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
                    selectedUser.status === "Active"
                      ? "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {selectedUser.status}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--color-border)] p-4">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Phone
                  </p>

                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
                    <FiPhone />
                    {selectedUser.phone || "Not provided"}
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] p-4">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Trade
                  </p>

                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
                    <FiBookOpen />
                    {selectedUser.trade || "Not provided"}
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] p-4">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Location
                  </p>

                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
                    <FiMapPin />
                    {selectedUser.city || "Not provided"}
                    {selectedUser.state ? `, ${selectedUser.state}` : ""}
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] p-4">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Qualification
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                    {selectedUser.qualification || "Not provided"}
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] p-4">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Institute
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                    {selectedUser.institute || "Not provided"}
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] p-4">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Completion Year
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                    {selectedUser.completionYear || "Not provided"}
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] p-4">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Experience
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                    {selectedUser.experience || 0} years
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] p-4">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Joined
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                    {formatDate(selectedUser.joined)}
                  </p>
                </div>
              </div>

              {selectedUser.skills?.length > 0 && (
                <div className="mt-6">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                    <FiAward />
                    Skills
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedUser.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-lg bg-[var(--color-primary-light)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-dark)]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedUser.about && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-[var(--color-text)]">
                    About
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                    {selectedUser.about}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`mailto:${selectedUser.email}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
                >
                  <FiMail />
                  Contact User
                </a>

                {selectedUser.status === "Active" ? (
                  <button
                    type="button"
                    disabled={actionLoading === selectedUser.id}
                    onClick={() => updateStatus(selectedUser.id, "Suspended")}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold ! disabled:opacity-50"
                  >
                    <FiUserX />
                    Suspend User
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={actionLoading === selectedUser.id}
                    onClick={() => updateStatus(selectedUser.id, "Active")}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl btn btn-primary text-white px-4 py-3 text-sm font-semibold ! disabled:opacity-50"
                  >
                    <FiUserCheck />
                    Activate User
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
