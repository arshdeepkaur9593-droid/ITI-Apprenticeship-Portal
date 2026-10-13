import React from "react";
import { FiArrowUpRight, FiBriefcase, FiMapPin, FiClock } from "react-icons/fi";

function OpportunityCard({
  company,
  title,
  trade,
  location,
  type,
  salary,
  featured,
  onView,
}) {
  return (
    <article
      className={`group flex min-h-[360px] w-full flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] ${
        featured
          ? "border-[var(--color-primary)]/25"
          : "border-[var(--color-border)]"
      }`}
    >
      <div
        className={`h-1 w-full ${
          featured
            ? "btn btn-primary text-white"
            : "bg-[var(--color-primary-light)]"
        }`}
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-green)] ">
            <FiBriefcase size={19} />
          </div>

          {featured && (
            <span className="rounded-full bg-[var(--color-primary-light)] px-3 py-1 text-[10px] font-bold uppercase tracking-wide ">
              Featured
            </span>
          )}
        </div>

        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-wider ">
            {company}
          </p>

          <h3 className="mt-2 min-h-[52px] text-lg font-bold leading-6 text-[var(--color-heading)]">
            {title}
          </h3>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-[var(--color-surface-green)] px-3 py-1.5 text-[11px] font-semibold ">
            {trade}
          </span>

          <span className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-body)]">
            {type}
          </span>
        </div>

        <div className="mt-6 space-y-3 border-t border-[var(--color-border)] pt-5">
          <div className="flex items-center gap-2.5 text-xs text-[var(--color-body)]">
            <FiMapPin size={15} className="shrink-0 " />

            <span className="truncate">{location}</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-[var(--color-body)]">
            <FiClock size={15} className="shrink-0 " />

            <span className="truncate">{salary}</span>
          </div>
        </div>

        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={onView}
            className="group/button inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl btn btn-primary text-white px-4 text-sm font-semibold  transition-all duration-200 hover:bg-[var(--color-primary-dark)]"
          >
            View Opportunity
            <FiArrowUpRight
              size={16}
              className="transition-transform duration-200 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5"
            />
          </button>
        </div>
      </div>
    </article>
  );
}

export default OpportunityCard;
