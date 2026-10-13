import React, { useEffect, useState } from "react";

import { API_BASE_URL } from "../../pages/services/api.js";
const API_URL = `${API_BASE_URL}/jobs/stats`;

const statLabels = [
  ["students", "Registered Students"],
  ["jobs", "Job Opportunities"],
  ["hiringEmployers", "Hiring Employers"],
  ["applications", "Applications Received"],
];

const StatsSection = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load portal statistics");
        }
        setStats(data.stats);
      } catch (err) {
        setError(err.message || "Unable to load portal statistics");
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="bg-[var(--color-background)] pt-4 pb-16 md:pt-2 md:pb-20">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-2 overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)] md:grid-cols-4">
          {statLabels.map(([key, label], index) => (
            <div
              key={key}
              className={`
                flex flex-col items-center justify-center px-5 py-8 text-center
                md:py-10
                ${index < 2 ? "border-b border-[var(--color-border)]" : ""}
                md:border-b-0
                ${index !== 3 ? "md:border-r md:border-[var(--color-border)]" : ""}
                ${index % 2 === 0 ? "border-r border-[var(--color-border)]" : ""}
              `}
            >
              <span className="text-3xl font-bold tracking-tight  md:text-4xl">
                {stats ? stats[key].toLocaleString("en-IN") : "—"}
              </span>

              <span className="mt-2 text-sm font-medium text-[var(--color-text-muted)] md:text-base">
                {label}
              </span>
            </div>
          ))}
        </div>
        {error && (
          <p role="alert" className="mt-3 text-center text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </section>
  );
};

export default StatsSection;
