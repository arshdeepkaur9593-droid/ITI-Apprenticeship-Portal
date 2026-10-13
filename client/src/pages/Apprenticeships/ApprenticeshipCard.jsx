import React from "react";
import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiTool,
} from "react-icons/fi";

const ApprenticeshipCard = ({ apprenticeship }) => {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl">
      <div className="flex items-start justify-between border-b border-slate-100 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl text-green-700">
          {apprenticeship.icon}
        </div>

        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
          Apprenticeship
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-sm font-medium text-green-700">
          {apprenticeship.company}
        </p>

        <h2 className="mt-2 text-xl font-semibold leading-7 text-slate-900">
          {apprenticeship.title}
        </h2>

        <div className="mt-4 space-y-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <FiTool className="shrink-0 text-green-700" />
            <span>{apprenticeship.trade}</span>
          </div>

          <div className="flex items-center gap-2">
            <FiMapPin className="shrink-0 text-green-700" />
            <span>{apprenticeship.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <FiClock className="shrink-0 text-green-700" />
            <span>{apprenticeship.duration}</span>
          </div>

          <div className="flex items-center gap-2">
            <FiCalendar className="shrink-0 text-green-700" />
            <span>{apprenticeship.stipend}</span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
            {apprenticeship.experience}
          </span>

          <span className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
            {apprenticeship.qualification}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
          <div>
            <p className="text-xs text-slate-400">Posted</p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {apprenticeship.posted}
            </p>
          </div>

          <Link
            to={`/jobs/${apprenticeship.jobId}`}
            className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold  transition-all duration-200 hover:bg-green-800"
          >
            View Details
            <FiArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ApprenticeshipCard;
