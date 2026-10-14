import React from "react";
import {
  FiArrowUpRight,
  FiFacebook,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiMapPin,
  FiPhone,
  FiTwitter,
} from "react-icons/fi";

function Footer() {
  return (
    <footer className="bg-[var(--color-primary-dark)] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
            <a href="/" className="inline-flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-secondary-dark)] text-lg font-extrabold text-white shadow-md">
                I
              </span>

              <span className="text-xl font-extrabold tracking-tight text-white">
                ITI
                <span className="text-[var(--color-secondary-light)]">
                  Connect
                </span>
              </span>
            </a>

            <p className="mt-5 max-w-sm text-sm leading-7 !text-white/70">
              Connecting skilled ITI candidates with meaningful apprenticeships
              and job opportunities across India.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition-all hover:border-[var(--color-secondary-dark)] hover:bg-[var(--color-secondary-dark)]"
              >
                <FiLinkedin size={16} />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition-all hover:border-[var(--color-secondary-dark)] hover:bg-[var(--color-secondary-dark)]"
              >
                <FiInstagram size={16} />
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition-all hover:border-[var(--color-secondary-dark)] hover:bg-[var(--color-secondary-dark)]"
              >
                <FiFacebook size={16} />
              </a>

              <a
                href="#"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition-all hover:border-[var(--color-secondary-dark)] hover:bg-[var(--color-secondary-dark)]"
              >
                <FiTwitter size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="border-l-2 border-[var(--color-secondary)] pl-3 !text-[11px] font-bold uppercase !tracking-[0.16em] !text-[var(--color-background)]">
              For Candidates
            </h4>

            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-white/65 transition-colors hover:text-[var(--color-secondary-light)]"
                >
                  Find Jobs
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-white/65 transition-colors hover:text-[var(--color-secondary-light)]"
                >
                  Apprenticeships
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-white/65 transition-colors hover:text-[var(--color-secondary-light)]"
                >
                  Explore Trades
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-white/65 transition-colors hover:text-[var(--color-secondary-light)]"
                >
                  Build Your Profile
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="border-l-2 border-[var(--color-secondary)] pl-3 !text-[11px] font-bold uppercase !tracking-[0.16em] !text-[var(--color-background)]">
              For Employers
            </h4>

            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-white/65 transition-colors hover:text-[var(--color-secondary-light)]"
                >
                  Post a Job
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-white/65 transition-colors hover:text-[var(--color-secondary-light)]"
                >
                  Find Candidates
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-white/65 transition-colors hover:text-[var(--color-secondary-light)]"
                >
                  Hire Skilled Talent
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-white/65 transition-colors hover:text-[var(--color-secondary-light)]"
                >
                  Employer Dashboard
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="border-l-2 border-[var(--color-secondary)] pl-3 !text-[11px] font-bold uppercase !tracking-[0.16em] !text-[var(--color-background)]">
              Get In Touch
            </h4>

            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <FiMapPin
                  size={16}
                  className="mt-0.5 shrink-0 text-[var(--color-secondary-light)]"
                />

                <span className="text-sm leading-6 text-white/65">
                  New Delhi, India
                </span>
              </div>

              <div className="flex items-center gap-3">
                <FiMail
                  size={16}
                  className="shrink-0 text-[var(--color-secondary-light)]"
                />

                <span className="text-sm text-white/65">
                  support@iticonnect.in
                </span>
              </div>

              <div className="flex items-center gap-3">
                <FiPhone
                  size={16}
                  className="shrink-0 text-[var(--color-secondary-light)]"
                />

                <span className="text-sm text-white/65">+91 1800 123 4567</span>
              </div>
            </div>

            <button
              type="button"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-secondary-light)] transition-all hover:gap-3 hover:text-white"
            >
              Contact Support
              <FiArrowUpRight size={16} />
            </button>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p className="text-xs !text-white">
              © 2026 ITIConnect. All rights reserved.
            </p>

            <div className="flex items-center justify-center gap-5">
              <a
                href="#"
                className="text-xs text-white/45 transition-colors hover:text-[var(--color-secondary-light)]"
              >
                Privacy Policy
              </a>

              <a
                href="#"
                className="text-xs text-white/45 transition-colors hover:text-[var(--color-secondary-light)]"
              >
                Terms of Service
              </a>

              <a
                href="#"
                className="text-xs text-white/45 transition-colors hover:text-[var(--color-secondary-light)]"
              >
                Help Center
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
