import React, { useEffect, useState } from "react";
import {
  FiZap,
  FiTool,
  FiWind,
  FiSettings,
  FiMonitor,
  FiCpu,
  FiDroplet,
  FiTruck,
  FiArrowRight,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import TradeCard from "./TradeCard";

const trades = [
  {
    icon: <FiZap size={22} />,
    title: "Electrician",
    description:
      "Electrical wiring, installation, maintenance and industrial electrical work.",
  },
  {
    icon: <FiTool size={22} />,
    title: "Fitter",
    description:
      "Machine fitting, assembly, maintenance and precision mechanical work.",
  },
  {
    icon: <FiWind size={22} />,
    title: "Welder",
    description:
      "Arc welding, gas welding, fabrication and metal joining techniques.",
  },
  {
    icon: <FiSettings size={22} />,
    title: "Mechanic",
    description:
      "Vehicle servicing, repair, diagnostics and mechanical maintenance.",
  },
  {
    icon: <FiMonitor size={22} />,
    title: "COPA",
    description:
      "Computer operations, programming basics, office tools and IT skills.",
  },
  {
    icon: <FiCpu size={22} />,
    title: "Electronics Mechanic",
    description:
      "Electronic systems, circuits, equipment servicing and troubleshooting.",
  },
  {
    icon: <FiDroplet size={22} />,
    title: "Plumber",
    description:
      "Pipe installation, water systems, maintenance and plumbing services.",
  },
  {
    icon: <FiTruck size={22} />,
    title: "Motor Vehicle Mechanic",
    description:
      "Automobile servicing, engine maintenance and vehicle repair skills.",
  },
];

import { API_BASE_URL } from "../../pages/services/api.js";
const API_URL = `${API_BASE_URL}/jobs/stats`;

function TradesSection() {
  const [jobsByTrade, setJobsByTrade] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTradeCounts = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load trade job counts");
        }
        setJobsByTrade(data.stats.jobsByTrade || {});
      } catch (err) {
        setError(err.message || "Unable to load trade job counts");
      }
    };

    fetchTradeCounts();
  }, []);

  return (
    <section className="bg-[var(--color-surface-soft)] py-20 md:py-24">
      <div className="container-main">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span
              className="
                inline-flex
                items-center
                rounded-full
                border
                border-[var(--color-primary-light)]
                bg-[var(--color-surface)]
                px-3.5
                py-1.5
                text-xs
                font-bold
                uppercase
                tracking-widest
                
              "
            >
              Popular ITI Trades
            </span>

            <h2
              className="
                mt-4
                text-3xl
                font-extrabold
                leading-tight
                tracking-tight
                text-[var(--color-heading)]
                md:text-4xl
              "
            >
              Turn Your Trade Skills Into
              <span className=""> Real Opportunities</span>
            </h2>

            <p
              className="
                mt-4
                max-w-xl
                text-sm
                leading-7
                text-[var(--color-body)]
                md:text-base
              "
            >
              Explore in-demand ITI trades and find apprenticeships and jobs
              that match the skills you have built.
            </p>
          </div>

          <Link
            to="/jobs"
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-[var(--radius-md)]
              border
              border-[var(--color-primary)]
              px-4
              py-2.5
              text-sm
              font-semibold
              
              transition-all
              duration-200
              hover:btn btn-primary text-white
              hover:
            "
          >
            Browse Opportunities
            <FiArrowRight size={17} />
          </Link>
        </div>

        <div
          className="
            mt-12
            grid
            gap-5
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          {trades.map((trade) => (
            <TradeCard
              key={trade.title}
              icon={trade.icon}
              title={trade.title}
              description={trade.description}
              opportunities={
                jobsByTrade === null ? null : jobsByTrade[trade.title] || 0
              }
            />
          ))}
        </div>
        {error && (
          <p role="alert" className="mt-4 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-10 flex justify-center lg:hidden">
          <Link
            to="/jobs"
            className="
              inline-flex
              items-center
              gap-2
              rounded-[var(--radius-md)]
              btn btn-primary text-white
              px-5
              py-2.5
              text-sm
              font-semibold
              
              transition-all
              duration-200
              hover:bg-[var(--color-primary-dark)]
            "
          >
            View All Trades
            <FiArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default TradesSection;
