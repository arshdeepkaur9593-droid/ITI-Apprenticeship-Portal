import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";

const TradeCard = ({ icon, title, description, opportunities = 0 }) => {
  const navigate = useNavigate();

  const handleExploreTrade = () => {
    navigate(`/jobs?trade=${encodeURIComponent(title)}`);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-2xl text-green-700 transition-all duration-300 group-hover:bg-green-700 group-hover:text-white group-focus-within:bg-green-700 group-focus-within:text-white">
          {icon}
        </div>

        <button
          type="button"
          onClick={handleExploreTrade}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-all duration-300 hover:border-green-600 hover:bg-green-600 hover:text-white focus-visible:border-green-600 focus-visible:bg-green-600 focus-visible:text-white active:border-green-700 active:bg-green-700 active:text-white"
          aria-label={`Explore ${title}`}
        >
          <FiArrowUpRight size={18} />
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>

        <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm font-medium text-slate-500">
          {opportunities === null ? "—" : opportunities} opportunities
        </span>

        <button
          type="button"
          onClick={handleExploreTrade}
          className="text-sm font-semibold text-green-700 transition-colors duration-200 hover:text-green-900"
        >
          Explore Trade
        </button>
      </div>
    </div>
  );
};

export default TradeCard;
