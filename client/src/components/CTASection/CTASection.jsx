import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiBriefcase, FiUser } from "react-icons/fi";

function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="px-5 py-20 sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--color-secondary-dark)] px-6 py-14 text-center shadow-[var(--shadow-lg)] sm:px-10 md:py-16 lg:px-16">
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-white opacity-[0.06]" />

          <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-black opacity-10" />

          <div className="relative z-10 mx-auto max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ">
              Your Next Step Starts Here
            </span>

            <h2 className="mt-5 text-3xl font-extrabold tracking-tight !text-white/85 sm:text-4xl md:text-5xl">
              Ready to Build Your Career?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 !text-white/65 sm:text-base">
              Connect your skills with the right apprenticeship, job, or skilled
              talent opportunity and take the next step with confidence.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/jobs")}
                className="group inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-white px-6 py-3.5 text-sm font-bold text-[var(--color-secondary-dark)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-background)]"
              >
                <FiUser size={17} />
                Find Opportunities
                <FiArrowRight
                  size={17}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </button>

              <button
                type="button"
                onClick={() => navigate("/employer/jobs")}
                className="group inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold  transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/15"
              >
                <FiBriefcase size={17} />
                Hire Skilled Talent
                <FiArrowRight
                  size={17}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
