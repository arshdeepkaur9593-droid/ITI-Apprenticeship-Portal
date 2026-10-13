import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiBriefcase,
  FiChevronDown,
  FiMapPin,
  FiSearch,
  FiTool,
  FiUsers,
  FiZap,
  FiSettings,
  FiTruck,
  FiCpu,
} from "react-icons/fi";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ApprenticeshipCard from "./ApprenticeshipCard";

import { API_BASE_URL } from "../services/api.js";
const API_URL = `${API_BASE_URL}/jobs`;

const getTradeIcon = (trade) => {
  if (trade === "Electrician") return <FiZap />;
  if (trade === "Welder") return <FiTool />;
  if (trade === "Fitter") return <FiSettings />;
  if (trade?.includes("Mechanic")) return <FiTruck />;
  if (trade === "Electronics Mechanic") return <FiCpu />;
  return <FiBriefcase />;
};

const formatSalary = (minimum, maximum) => {
  if (minimum && maximum) return `₹${minimum} - ₹${maximum}/month`;
  if (minimum || maximum) return `₹${minimum || maximum}/month`;
  return "Stipend not specified";
};

const Apprenticeships = () => {
  const [apprenticeships, setApprenticeships] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [trade, setTrade] = useState("All Trades");

  useEffect(() => {
    const fetchApprenticeships = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load apprenticeships");
        }
        setApprenticeships(
          (data.jobs || [])
            .filter((job) => job.jobType === "Apprenticeship")
            .map((job) => ({
              id: job._id,
              jobId: job._id,
              company: job.employer?.companyName || "Company",
              title: job.title,
              trade: job.trade,
              location: [job.location, job.state].filter(Boolean).join(", "),
              duration: "Apprenticeship",
              stipend: formatSalary(job.salaryMin, job.salaryMax),
              experience: job.experience === 0 ? "Fresher" : `${job.experience} years`,
              qualification:
                job.qualifications?.slice(0, 2).join(", ") || "ITI candidates",
              posted: job.createdAt
                ? new Date(job.createdAt).toLocaleDateString("en-IN")
                : "Recently",
              icon: getTradeIcon(job.trade),
            })),
        );
      } catch (error) {
        setLoadError(error.message || "Unable to load apprenticeships");
      }
    };

    fetchApprenticeships();
  }, []);

  const filteredApprenticeships = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    const locationValue = location.trim().toLowerCase();

    return apprenticeships.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.title.toLowerCase().includes(searchValue) ||
        item.company.toLowerCase().includes(searchValue) ||
        item.trade.toLowerCase().includes(searchValue);

      const matchesLocation =
        !locationValue || item.location.toLowerCase().includes(locationValue);

      const matchesTrade = trade === "All Trades" || item.trade === trade;

      return matchesSearch && matchesLocation && matchesTrade;
    });
  }, [search, location, trade, apprenticeships]);

  const handleSearch = (event) => {
    event.preventDefault();
  };

  const handleClearFilters = () => {
    setSearch("");
    setLocation("");
    setTrade("All Trades");
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#fffdf7]">
        <section className="border-b border-green-100 bg-gradient-to-br from-green-50 via-[#fffdf7] to-orange-50">
          <div className="container-main py-14 lg:py-20">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-green-700"
            >
              <FiArrowLeft size={16} />
              Back to Home
            </Link>

            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700">
                <FiBriefcase size={16} />
                Apprenticeship Opportunities
              </div>

              <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
                Start Your Career With
                <span className="block text-green-700">
                  Practical Experience
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Find apprenticeship opportunities from companies and industries
                looking for skilled ITI candidates.
              </p>
            </div>

            <form
              onSubmit={handleSearch}
              className="mt-10 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg"
            >
              <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4">
                  <FiSearch className="shrink-0 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search trade, role or company"
                    className="h-12 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4">
                  <FiMapPin className="shrink-0 text-slate-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Location"
                    className="h-12 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="relative flex items-center gap-3 rounded-xl border border-slate-200 px-4">
                  <FiTool className="shrink-0 text-slate-400" />

                  <select
                    value={trade}
                    onChange={(event) => setTrade(event.target.value)}
                    className="h-12 w-full appearance-none bg-transparent pr-6 text-sm text-slate-700 outline-none"
                  >
                    <option>All Trades</option>
                    <option>Electrician</option>
                    <option>Welder</option>
                    <option>Fitter</option>
                    <option>Motor Vehicle Mechanic</option>
                    <option>Electronics Mechanic</option>
                  </select>

                  <FiChevronDown className="pointer-events-none absolute right-4 text-slate-400" />
                </div>

                <button
                  type="submit"
                  className="h-12 rounded-xl bg-green-700 px-7 text-sm font-semibold  transition-colors hover:bg-green-800"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="container-main py-12 lg:py-16">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
                Available Opportunities
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Apprenticeships For ITI Candidates
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {filteredApprenticeships.length} opportunities found
              </p>
            </div>

            {loadError && (
              <p className="mb-5 text-sm text-red-600">{loadError}</p>
            )}

            {(search || location || trade !== "All Trades") && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-green-600 hover:text-green-700"
              >
                Clear Filters
              </button>
            )}
          </div>

          {filteredApprenticeships.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredApprenticeships.map((apprenticeship) => (
                <ApprenticeshipCard
                  key={apprenticeship.id}
                  apprenticeship={apprenticeship}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-700">
                <FiSearch size={26} />
              </div>

              <h3 className="mt-5 text-xl font-semibold text-slate-900">
                No apprenticeships found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try changing your trade, location or search keyword to find more
                opportunities.
              </p>

              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-6 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold  transition-colors hover:bg-green-800"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>

        <section className="border-t border-slate-100 bg-white">
          <div className="container-main py-14 lg:py-16">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-[#fffdf7] p-6">
                <FiTool className="text-2xl text-green-700" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  Learn Your Trade
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Build practical skills while working in a real industrial
                  environment.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-[#fffdf7] p-6">
                <FiUsers className="text-2xl text-green-700" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  Work With Industry
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Get exposure to professional teams, tools and workplace
                  practices.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-[#fffdf7] p-6">
                <FiSettings className="text-2xl text-green-700" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  Build Your Career
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Turn practical apprenticeship experience into future career
                  opportunities.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Apprenticeships;
