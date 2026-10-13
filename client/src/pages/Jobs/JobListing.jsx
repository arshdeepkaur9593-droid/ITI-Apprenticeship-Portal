import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiBriefcase,
  FiChevronDown,
  FiClock,
  FiMapPin,
  FiSearch,
  FiTool,
  FiZap,
  FiSettings,
  FiCpu,
  FiTruck,
  FiArrowUpRight,
  FiSliders,
  FiBookmark,
} from "react-icons/fi";

import { API_BASE_URL } from "../services/api.js";
const API_URL = `${API_BASE_URL}/jobs`;

const tradeOptions = [
  "All Trades",
  "Electrician",
  "Fitter",
  "Welder",
  "Mechanic",
  "Motor Vehicle Mechanic",
  "Electronics Mechanic",
];

const locationOptions = [
  "All Locations",
  "Haryana",
  "Maharashtra",
  "Tamil Nadu",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Punjab",
  "Chandigarh",
];

const typeOptions = [
  "All Types",
  "Full Time",
  "Apprenticeship",
  "Part Time",
  "Contract",
];

const getJobIcon = (trade) => {
  switch (trade) {
    case "Electrician":
      return FiZap;
    case "Fitter":
      return FiSettings;
    case "Welder":
      return FiTool;
    case "Mechanic":
      return FiTruck;
    case "Motor Vehicle Mechanic":
      return FiTruck;
    case "Electronics Mechanic":
      return FiCpu;
    default:
      return FiBriefcase;
  }
};

const formatSalary = (salaryMin, salaryMax) => {
  if (salaryMin && salaryMax) {
    return `₹${salaryMin.toLocaleString(
      "en-IN",
    )} - ₹${salaryMax.toLocaleString("en-IN")}/month`;
  }

  if (salaryMin) {
    return `₹${salaryMin.toLocaleString("en-IN")}/month`;
  }

  if (salaryMax) {
    return `₹${salaryMax.toLocaleString("en-IN")}/month`;
  }

  return "Not specified";
};

const formatExperience = (experience) => {
  if (experience === 0) {
    return "Fresher";
  }

  if (experience === 1) {
    return "1 year";
  }

  return `${experience} years`;
};

const formatJobType = (jobType) => {
  switch (jobType) {
    case "Full-time":
      return "Full Time";
    case "Part-time":
      return "Part Time";
    case "Apprenticeship":
      return "Apprenticeship";
    case "Contract":
      return "Contract";
    default:
      return jobType;
  }
};

const formatPostedTime = (createdAt) => {
  if (!createdAt) {
    return "Recently";
  }

  const postedDate = new Date(createdAt);
  const currentDate = new Date();

  const difference = currentDate - postedDate;
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));

  if (days <= 0) {
    return "today";
  }

  if (days === 1) {
    return "1 day ago";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  const weeks = Math.floor(days / 7);

  if (weeks === 1) {
    return "1 week ago";
  }

  return `${weeks} weeks ago`;
};

const transformJob = (job) => {
  return {
    id: job._id,
    company: job.employer?.companyName || "Company",
    title: job.title,
    trade: job.trade,
    location: job.state
      ? `${job.location}, ${job.state}`
      : job.location || "Location not specified",
    state: job.state || "",
    type: formatJobType(job.jobType),
    salary: formatSalary(job.salaryMin, job.salaryMax),
    experience: formatExperience(job.experience),
    posted: formatPostedTime(job.createdAt),
    icon: getJobIcon(job.trade),
  };
};

function JobListing() {
  const [searchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialTrade = searchParams.get("trade") || "All Trades";
  const initialLocation = searchParams.get("location") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const [trade, setTrade] = useState(
    tradeOptions.includes(initialTrade) ? initialTrade : "All Trades",
  );

  const [location, setLocation] = useState(
    locationOptions.includes(initialLocation)
      ? initialLocation
      : "All Locations",
  );

  const [jobType, setJobType] = useState("All Types");
  const [showFilters, setShowFilters] = useState(false);

  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [savedJobsLoading, setSavedJobsLoading] = useState(true);

  const [savingJobId, setSavingJobId] = useState("");
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch jobs");
        }

        const formattedJobs = (data.jobs || []).map(transformJob);

        setJobs(formattedJobs);
      } catch (error) {
        console.error("Fetch jobs error:", error);

        setError(
          error.message || "Unable to load opportunities. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setSavedJobsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/students/saved-jobs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch saved jobs");
        }

        const savedJobIds = (data.savedJobs || []).map((job) => job._id);

        setSavedJobs(savedJobIds);
      } catch (error) {
        console.error("Fetch saved jobs error:", error);
      } finally {
        setSavedJobsLoading(false);
      }
    };

    fetchSavedJobs();
  }, []);

  const handleSaveJob = async (jobId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setSaveMessage("Please login to save a job.");
      return;
    }

    if (savedJobs.includes(jobId)) {
      setSaveMessage("Job is already saved.");
      return;
    }

    try {
      setSavingJobId(jobId);
      setSaveMessage("");

      const response = await fetch(
        `${API_BASE_URL}/students/saved-jobs/${jobId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save job");
      }

      setSavedJobs((prev) => [...prev, jobId]);
      setSaveMessage("Job saved successfully.");
    } catch (error) {
      console.error("Save job error:", error);

      setSaveMessage(error.message || "Unable to save job.");
    } finally {
      setSavingJobId("");
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        job.title.toLowerCase().includes(search) ||
        job.company.toLowerCase().includes(search) ||
        job.trade.toLowerCase().includes(search) ||
        job.location.toLowerCase().includes(search);

      const matchesTrade = trade === "All Trades" || job.trade === trade;

      const matchesLocation =
        location === "All Locations" ||
        job.state.toLowerCase() === location.toLowerCase();

      const matchesType = jobType === "All Types" || job.type === jobType;

      return matchesSearch && matchesTrade && matchesLocation && matchesType;
    });
  }, [jobs, searchTerm, trade, location, jobType]);

  const clearFilters = () => {
    setSearchTerm("");
    setTrade("All Trades");
    setLocation("All Locations");
    setJobType("All Types");
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <section className="border-b border-[var(--color-border-light)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-[var(--container-width)] px-4 pb-10 pt-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-surface-green)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary-light)]" />
              Career Opportunities
            </span>

            <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-[var(--color-heading)] sm:text-4xl lg:text-5xl">
              Find the right opportunity for{" "}
              <span className="text-[var(--color-secondary)]">skills.</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-body)] sm:text-base">
              Explore apprenticeships and trade jobs from workshops, factories,
              and leading companies looking for skilled ITI candidates.
            </p>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-3 shadow-[var(--shadow-sm)]">
            <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto]">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[var(--color-muted)]" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by job, company or trade"
                  className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white pl-11 pr-4 text-sm text-[var(--color-heading)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]/20"
                />
              </div>

              <div className="relative">
                <FiTool className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-[var(--color-muted)]" />

                <select
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  className="h-12 w-full appearance-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white pl-11 pr-10 text-sm text-[var(--color-heading)] outline-none transition focus:border-[var(--color-primary)]"
                >
                  {tradeOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>

                <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              </div>

              <div className="relative">
                <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-[var(--color-muted)]" />

                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-12 w-full appearance-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white pl-11 pr-10 text-sm text-[var(--color-heading)] outline-none transition focus:border-[var(--color-primary)]"
                >
                  {locationOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>

                <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-primary)] px-5 text-sm font-semibold  transition hover:bg-[var(--color-surface-green)]"
              >
                <FiSliders />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="mt-3 grid gap-3 border-t border-[var(--color-border)] pt-3 sm:grid-cols-2">
                <div className="relative">
                  <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-[var(--color-muted)]" />

                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="h-12 w-full appearance-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white pl-11 pr-10 text-sm text-[var(--color-heading)] outline-none transition focus:border-[var(--color-primary)]"
                  >
                    {typeOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>

                  <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                </div>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-12 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-5 text-sm font-semibold text-[var(--color-body)] transition hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)]"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--container-width)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] ">
              Available Opportunities
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[var(--color-heading)]">
              {loading
                ? "Loading opportunities..."
                : `${filteredJobs.length} opportunities found`}
            </h2>
          </div>

          <div className="text-sm text-[var(--color-muted)]">
            Showing relevant trade opportunities
          </div>
        </div>

        {saveMessage && (
          <div className="mb-5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-green)] px-4 py-3 text-sm font-medium ">
            {saveMessage}
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="min-h-[340px] animate-pulse rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-[var(--radius-md)] bg-[var(--color-surface-green)]" />

                  <div className="flex-1">
                    <div className="h-5 w-3/4 rounded bg-[var(--color-border-light)]" />
                    <div className="mt-3 h-4 w-1/2 rounded bg-[var(--color-border-light)]" />
                  </div>
                </div>

                <div className="mt-6 h-6 w-1/3 rounded-full bg-[var(--color-border-light)]" />

                <div className="mt-8 space-y-4">
                  <div className="h-4 w-3/4 rounded bg-[var(--color-border-light)]" />
                  <div className="h-4 w-1/2 rounded bg-[var(--color-border-light)]" />
                  <div className="h-4 w-2/3 rounded bg-[var(--color-border-light)]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-green)] text-2xl ">
              <FiBriefcase />
            </div>

            <h3 className="mt-5 text-xl font-bold text-[var(--color-heading)]">
              Unable to load opportunities
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-body)]">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-[var(--radius-md)] btn btn-primary text-white px-5 py-2.5 text-sm font-semibold  transition hover:bg-[var(--color-primary-dark)]"
            >
              Try Again
            </button>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredJobs.map((job) => {
              const Icon = job.icon;
              const isSaved = savedJobs.includes(job.id);

              return (
                <article
                  key={job.id}
                  className="group relative flex min-h-[340px] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-green)] text-xl ">
                      <Icon />
                    </div>

                    <div className="min-w-0 pr-2">
                      <h3 className="line-clamp-2 text-lg font-bold leading-6 text-[var(--color-heading)]">
                        {job.title}
                      </h3>

                      <p className="mt-1 text-sm font-medium ">{job.company}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[var(--color-surface-green)] px-3 py-1.5 text-xs font-medium ">
                      {job.trade}
                    </span>

                    <span className="rounded-full bg-[var(--color-surface-orange)] px-3 py-1.5 text-xs font-medium text-[var(--color-secondary-dark)]">
                      {job.type}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 border-t border-[var(--color-border-light)] pt-5">
                    <div className="flex items-center gap-2.5 text-sm text-[var(--color-body)]">
                      <FiMapPin className="shrink-0 text-[var(--color-muted)]" />
                      <span>{job.location}</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-sm text-[var(--color-body)]">
                      <FiBriefcase className="shrink-0 text-[var(--color-muted)]" />
                      <span>{job.experience}</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-sm text-[var(--color-body)]">
                      <FiClock className="shrink-0 text-[var(--color-muted)]" />
                      <span>Posted {job.posted}</span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-4 border-t border-[var(--color-border-light)] pt-5">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
                        Salary
                      </p>

                      <p className="mt-1 text-sm font-bold text-[var(--color-heading)]">
                        {job.salary}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveJob(job.id)}
                        disabled={
                          savingJobId === job.id || isSaved || savedJobsLoading
                        }
                        className={`inline-flex items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2.5 text-sm font-semibold transition ${
                          isSaved
                            ? "border-[var(--color-primary)] bg-[var(--color-surface-green)] "
                            : "border-[var(--color-border)] bg-white text-[var(--color-body)] hover:border-[var(--color-primary)] hover:"
                        }`}
                      >
                        <FiBookmark />

                        {savingJobId === job.id
                          ? "Saving..."
                          : isSaved
                            ? "Saved"
                            : "Save"}
                      </button>

                      <Link
                        to={`/jobs/${job.id}`}
                        className="inline-flex items-center gap-2 rounded-[var(--radius-md)] btn btn-primary text-white px-4 py-2.5 text-sm font-semibold ! transition hover:bg-[var(--color-primary-dark)]"
                      >
                        View Details
                        <FiArrowUpRight />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-green)] text-2xl ">
              <FiSearch />
            </div>

            <h3 className="mt-5 text-xl font-bold text-[var(--color-heading)]">
              No opportunities found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-body)]">
              Try changing your search or removing some filters to discover more
              trade opportunities.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-[var(--radius-md)] btn btn-primary text-white px-5 py-2.5 text-sm font-semibold  transition hover:bg-[var(--color-primary-dark)]"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default JobListing;
