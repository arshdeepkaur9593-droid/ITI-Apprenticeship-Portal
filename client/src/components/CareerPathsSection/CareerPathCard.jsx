import React from "react";
import { FiArrowUpRight, FiCheck } from "react-icons/fi";

function CareerPathCard({
  type,
  title,
  description,
  items = [],
  icon,
  buttonText,
  featured,
  onClick,
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border p-7 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] md:p-9 ${
        featured
          ? "border-[var(--color-primary-dark)] btn btn-primary text-white"
          : "border-[var(--color-border)] bg-[var(--color-surface)]"
      }`}
    >
      <div
        className={`absolute -right-20 -top-20 h-48 w-48 rounded-full transition-transform duration-500 group-hover:scale-125 ${
          featured
            ? "bg-white opacity-[0.08]"
            : "bg-[var(--color-primary-light)] opacity-[0.08]"
        }`}
      />

      <div
        className={`absolute -bottom-24 -left-20 h-44 w-44 rounded-full ${
          featured
            ? "bg-black opacity-[0.08]"
            : "bg-[var(--color-primary-light)] opacity-[0.05]"
        }`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
              featured ? "bg-white " : "bg-[var(--color-surface-green)] "
            }`}
          >
            {icon}
          </div>

          <span
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              featured
                ? "bg-white/15 text-white ring-1 ring-white/20"
                : "bg-[var(--color-surface-green)] "
            }`}
          >
            {type}
          </span>
        </div>

        <h3
          className={`mt-7 max-w-xl text-2xl font-bold leading-tight tracking-tight md:text-[28px] ${
            featured ? "text-white" : "text-[var(--color-heading)]"
          }`}
        >
          {title}
        </h3>

        <p
          className={`mt-4 max-w-xl text-sm leading-7 ${
            featured ? "!text-white" : "text-[var(--color-body)]"
          }`}
        >
          {description}
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  featured
                    ? "bg-white text-green-800"
                    : "bg-[var(--color-surface-green)] text-green-700"
                }`}
              >
                <FiCheck size={12} strokeWidth={3} />
              </span>

              <span
                className={`text-sm font-medium ${
                  featured ? "text-white/90" : "text-[var(--color-body)]"
                }`}
              >
                {item}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClick}
          className={`btn mt-9 px-5 py-3 text-sm hover:gap-3 ${
            featured ? "btn-white" : "btn-primary"
          }`}
        >
          {buttonText}
          <FiArrowUpRight size={17} />
        </button>
      </div>
    </article>
  );
}

export default CareerPathCard;
