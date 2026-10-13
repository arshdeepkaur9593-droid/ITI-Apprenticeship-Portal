import React, { useEffect, useState } from "react";
import {
  FiUsers,
  FiBriefcase,
  FiFileText,
  FiCheckCircle,
  FiTrendingUp,
  FiMapPin,
  FiBarChart2,
} from "react-icons/fi";
import { API_BASE_URL } from "../services/api.js";

const numberFormatter = new Intl.NumberFormat("en-IN");

const isNonNegativeNumber = (value) =>
  Number.isFinite(value) && value >= 0;

const isValidAnalytics = (data) => {
  const analytics = data?.analytics;
  const metrics = analytics?.metrics;
  return (
    data?.success === true &&
    typeof analytics?.generatedAt === "string" &&
    metrics &&
    isNonNegativeNumber(metrics.registeredStudents) &&
    isNonNegativeNumber(metrics.employers) &&
    isNonNegativeNumber(metrics.totalJobs) &&
    isNonNegativeNumber(metrics.totalApplications) &&
    (metrics.successfulPlacements === null ||
      isNonNegativeNumber(metrics.successfulPlacements)) &&
    typeof metrics.placementsTracked === "boolean" &&
    analytics.growth &&
    ["students", "employers", "applications"].every(
      (key) =>
        analytics.growth[key] === null ||
        Number.isFinite(analytics.growth[key])
    ) &&
    Array.isArray(analytics.monthlyActivity) &&
    analytics.monthlyActivity.every(
      (item) =>
        typeof item.month === "string" &&
        Number.isInteger(item.year) &&
        ["students", "employers", "applications", "jobs"].every((key) =>
          isNonNegativeNumber(item[key])
        )
    ) &&
    Array.isArray(analytics.applicationStatuses) &&
    analytics.applicationStatuses.every(
      (item) =>
        typeof item.status === "string" &&
        isNonNegativeNumber(item.count)
    ) &&
    Array.isArray(analytics.jobsByTrade) &&
    analytics.jobsByTrade.every(
      (item) =>
        typeof item.trade === "string" &&
        isNonNegativeNumber(item.jobs) &&
        isNonNegativeNumber(item.applications)
    ) &&
    Array.isArray(analytics.locations) &&
    analytics.locations.every(
      (item) =>
        typeof item.location === "string" &&
        isNonNegativeNumber(item.students) &&
        isNonNegativeNumber(item.jobs)
    )
  );
};

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const fetchAnalytics = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("Please log in again to view portal analytics.");
        }

        const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load portal analytics.");
        }
        if (!isValidAnalytics(data)) {
          throw new Error("The analytics response was incomplete or invalid.");
        }
        setAnalytics(data.analytics);
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(
            fetchError.message || "Failed to load portal analytics."
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => controller.abort();
  }, []);

  const monthlyData = analytics?.monthlyActivity || [];
  const tradeData = analytics?.jobsByTrade || [];
  const locationData = analytics?.locations || [];
  const applicationStatuses = analytics?.applicationStatuses || [];
  const maxApplications = Math.max(
    0,
    ...monthlyData.map((item) => item.applications)
  );
  const maxTradeJobs = Math.max(0, ...tradeData.map((item) => item.jobs));
  const totalApplications = analytics?.metrics.totalApplications || 0;
  const metrics = analytics?.metrics;
  const growth = analytics?.growth;
  const metricCards = [
    {
      label: "Registered Students",
      value: metrics?.registeredStudents,
      growth: growth?.students,
      icon: <FiUsers size={21} />,
      iconClass: "bg-green-50",
    },
    {
      label: "Employers",
      value: metrics?.employers,
      growth: growth?.employers,
      icon: <FiBriefcase size={21} />,
      iconClass: "bg-orange-50 text-orange-600",
    },
    {
      label: "Total Jobs",
      value: metrics?.totalJobs,
      icon: <FiBriefcase size={21} />,
      iconClass: "bg-green-50 text-green-600",
    },
    {
      label: "Job Applications",
      value: metrics?.totalApplications,
      growth: growth?.applications,
      icon: <FiFileText size={21} />,
      iconClass: "bg-green-50 text-green-600",
    },
    {
      label: "Successful Placements",
      value: metrics?.successfulPlacements,
      tracked: metrics?.placementsTracked,
      icon: <FiCheckCircle size={21} />,
      iconClass: "bg-orange-50 text-orange-600",
    },
  ];

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
                Portal Analytics
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)] md:text-base">
                Monitor student registrations, employer activity, job postings
                and application trends across the portal.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 shadow-sm">
              <FiBarChart2 className="" />

              <span className="text-sm font-semibold text-[var(--color-text)]">
                {analytics
                  ? `Overview · ${new Date(analytics.generatedAt).getUTCFullYear()}`
                  : "Overview"}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metricCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconClass}`}
                >
                  {card.icon}
                </div>
                {Number.isFinite(card.growth) && (
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold ${
                      card.growth >= 0 ? "text-green-700" : "text-red-600"
                    }`}
                    title={growth?.comparison}
                  >
                    <FiTrendingUp />
                    {card.growth > 0 ? "+" : ""}
                    {card.growth}%
                  </span>
                )}
              </div>

              <p className="text-sm text-[var(--color-text-muted)]">
                {card.label}
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[var(--color-text)]">
                {loading || !analytics
                  ? "—"
                  : card.value === null && card.tracked === false
                    ? "Not tracked"
                    : numberFormatter.format(card.value ?? 0)}
              </h2>
            </div>
          ))}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm md:p-6">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text)]">
                  Portal Growth
                </h2>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Student, employer and application activity
                </p>
              </div>

              <span className="rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
                Last 6 Months
              </span>
            </div>

            <div className="space-y-5">
              {loading ? (
                <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                  Loading activity...
                </p>
              ) : monthlyData.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                  No monthly activity data is available.
                </p>
              ) : (
                monthlyData.map((item) => (
                <div key={item.key}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="w-10 text-sm font-semibold text-[var(--color-text)]">
                      {item.month} {item.year}
                    </span>

                    <span className="text-xs text-[var(--color-text-muted)]">
                      {item.applications} applications
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-[var(--color-background)]">
                    <div
                      className="h-full rounded-full btn btn-primary text-white transition-all"
                      style={{
                        width: `${
                          maxApplications > 0
                            ? (item.applications / maxApplications) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex gap-4 text-xs text-[var(--color-text-muted)]">
                    <span>{item.students} students</span>
                    <span>{item.employers} employers</span>
                    <span>{item.jobs} jobs</span>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm md:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[var(--color-text)]">
                Application Funnel
              </h2>

              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Current application status distribution
              </p>
            </div>

            <div className="space-y-5">
              {loading ? (
                <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                  Loading application statuses...
                </p>
              ) : applicationStatuses.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                  No application status data is available.
                </p>
              ) : (
                applicationStatuses.map((item) => {
                  const width =
                    totalApplications > 0
                      ? (item.count / totalApplications) * 100
                      : 0;
                  const barClass =
                    item.status === "Selected"
                      ? "bg-green-700"
                      : item.status === "Shortlisted"
                        ? "bg-orange-500"
                        : "btn btn-primary text-white";

                  return (
                    <div key={item.status}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium text-[var(--color-text)]">
                          {item.status}
                        </span>
                        <span className="font-semibold text-[var(--color-text)]">
                          {numberFormatter.format(item.count)}
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-[var(--color-background)]">
                        <div
                          className={`h-full rounded-full ${barClass}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-7 rounded-xl bg-[var(--color-background)] p-4">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                Placement activity
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                {analytics?.metrics.placementsTracked
                  ? `${numberFormatter.format(
                      analytics.metrics.successfulPlacements
                    )} placements are recorded in the portal.`
                  : "Confirmed placements are not tracked by the current application data model."}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm md:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[var(--color-text)]">
                Jobs by Trade
              </h2>

              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Demand across major ITI trades
              </p>
            </div>

            <div className="space-y-4">
              {loading ? (
                <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                  Loading trade data...
                </p>
              ) : tradeData.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                  No job records are available by trade.
                </p>
              ) : tradeData.map((item) => (
                <div
                  key={item.trade}
                  className="rounded-xl border border-[var(--color-border)] p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-[var(--color-text)]">
                        {item.trade}
                      </h3>

                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {item.applications} applications
                      </p>
                    </div>

                    <span className="rounded-lg bg-green-50 px-3 py-2 text-sm font-bold text-green-700">
                      {item.jobs} jobs
                    </span>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-[var(--color-background)]">
                    <div
                      className="h-full rounded-full btn btn-primary text-white"
                      style={{
                        width: `${
                          maxTradeJobs > 0
                            ? (item.jobs / maxTradeJobs) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm md:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[var(--color-text)]">
                Location Insights
              </h2>

              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Jobs and student activity by location
              </p>
            </div>

            <div className="space-y-3">
              {loading ? (
                <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                  Loading location data...
                </p>
              ) : locationData.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                  No student or job location data is available.
                </p>
              ) : locationData.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <FiMapPin size={18} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-[var(--color-text)]">
                        {item.location}
                      </h3>

                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {item.students} registered students
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-bold text-[var(--color-text)]">
                      {item.jobs}
                    </p>

                    <p className="text-xs text-[var(--color-text-muted)]">
                      jobs
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-bold text-green-900">
                Admin Analytics Overview
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-green-800">
                Growth compares the most recent three months with the preceding
                three months. Percentages are omitted when history or a
                non-zero baseline is unavailable. Confirmed placements are not
                recorded separately in the current application model.
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white  shadow-sm">
              <FiBarChart2 size={22} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
