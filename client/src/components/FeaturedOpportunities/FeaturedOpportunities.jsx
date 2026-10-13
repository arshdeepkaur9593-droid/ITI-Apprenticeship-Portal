import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import OpportunityCard from "./OpportunityCard";

import { API_BASE_URL } from "../../pages/services/api.js";
const API_URL = `${API_BASE_URL}/jobs`;

const formatSalary = (salaryMin, salaryMax) => {
  if (salaryMin && salaryMax) return `₹${salaryMin} - ₹${salaryMax} / month`;
  if (salaryMin || salaryMax) return `₹${salaryMin || salaryMax} / month`;
  return "Salary not specified";
};

function FeaturedOpportunities() {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load opportunities");
        }
        setOpportunities((data.jobs || []).slice(0, 4).map((job) => ({
          id: job._id,
          company: job.employer?.companyName || "Company",
          title: job.title,
          trade: job.trade,
          location: [job.location, job.state].filter(Boolean).join(", "),
          type: job.jobType,
          salary: formatSalary(job.salaryMin, job.salaryMax),
          featured: false,
        })));
      } catch (error) {
        console.error("Fetch featured opportunities error:", error);
      }
    };

    fetchOpportunities();
  }, []);

  return (
    <section className="bg-[var(--color-background)] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-[var(--color-primary-light)] bg-opacity-10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ">
              Latest Opportunities
            </span>

            <h2 className="mt-5 text-3xl font-extrabold tracking-tight !text-[var(--color-heading)] sm:text-4xl md:text-5xl">
              Find Your Next Opportunity
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 !text-[var(--color-body)] sm:text-base">
              Explore apprenticeships and trade jobs from employers looking for
              skilled ITI candidates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/jobs")}
            className="btn btn-primary group w-fit px-5 py-3 text-sm"
          >
            View All Opportunities
            <FiArrowRight
              size={17}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>
        </div>

        <div className="mt-10 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {opportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              {...opportunity}
              onView={() => navigate(`/jobs/${opportunity.id}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedOpportunities;
