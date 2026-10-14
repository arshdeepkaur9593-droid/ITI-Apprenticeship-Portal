import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiArrowUpRight,
  FiTool,
  FiUser,
  FiChevronDown,
  FiLogOut,
} from "react-icons/fi";

import { API_BASE_URL } from "../../pages/services/api.js";
const API_URL = API_BASE_URL;

const accountLinks = {
  student: [
    { name: "Student Profile", path: "/student/profile" },
    { name: "My Applications", path: "/student/applications" },
    { name: "Saved Jobs", path: "/student/saved-jobs" },
  ],
  employer: [
    { name: "Employer Profile", path: "/employer/profile" },
    { name: "Dashboard", path: "/employer/dashboard" },
    { name: "Manage Jobs", path: "/employer/jobs" },
    { name: "Applications / Candidates", path: "/employer/applications" },
  ],
  admin: [
    { name: "Admin Dashboard", path: "/admin/dashboard" },
    { name: "Manage Users", path: "/admin/users" },
    { name: "Manage Employers", path: "/admin/employers" },
    { name: "Manage Jobs", path: "/admin/jobs" },
    { name: "Analytics", path: "/admin/analytics" },
  ],
};

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

function AccountMenu({ role, displayName, onLogout, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        className="inline-flex max-w-[220px] items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-heading)] shadow-sm transition hover:border-[var(--color-primary)]"
      >
        <FiUser className="shrink-0 text-[var(--color-primary)]" />
        <span className="truncate">{displayName}</span>
        <FiChevronDown className="shrink-0 text-[var(--color-secondary)]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-[60] mt-2 w-60 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-2 shadow-lg">
          {accountLinks[role]?.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => {
                setIsOpen(false);
                onNavigate();
              }}
              className="block rounded px-3 py-2.5 text-sm font-medium text-[var(--color-heading)] transition hover:bg-[var(--color-surface-green)] hover:text-[var(--color-primary-dark)]"
            >
              {link.name}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="mt-1 flex w-full items-center gap-2 border-t border-[var(--color-border-light)] px-3 py-2.5 text-left text-sm font-semibold text-[var(--color-secondary)]"
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function Navbar({ accountOnly = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState(() => {
    const user = readStoredUser();
    return {
      user,
      role: user?.role || localStorage.getItem("role") || "",
      companyName: "",
    };
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken");
    if (session.role === "employer" && token) {
      fetch(`${API_URL}/employers/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (active && data?.employer?.companyName) {
            setSession((previous) => ({
              ...previous,
              companyName: data.employer.companyName,
            }));
          }
        })
        .catch(() => {});
    }

    return () => {
      active = false;
    };
  }, [location.pathname, session.role]);

  const navLinks = [
    { name: "Home", type: "page", path: "/" },
    { name: "Trades", type: "section", section: "trades" },
    { name: "Find Jobs", type: "page", path: "/jobs" },
    { name: "Apprenticeships", type: "page", path: "/apprenticeships" },
    { name: "How It Works", type: "section", section: "how-it-works" },
  ];

  const handleNavigation = (link) => {
    setIsOpen(false);

    if (link.type === "page") {
      navigate(link.path);
      return;
    }

    if (location.pathname !== "/") {
      navigate("/");

      setTimeout(() => {
        const section = document.getElementById(link.section);

        if (section) {
          section.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 300);

      return;
    }

    const section = document.getElementById(link.section);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleLogout = () => {
    ["token", "authToken", "accessToken", "user", "role"].forEach((key) =>
      localStorage.removeItem(key),
    );
    setSession({ user: null, role: "", companyName: "" });
    setIsOpen(false);
    navigate("/");
  };

  const displayName =
    session.role === "employer"
      ? session.companyName || session.user?.name || "Employer"
      : session.user?.name || (session.role === "admin" ? "Admin" : "Student");
  const isOverlayPage =
    location.pathname === "/" || location.pathname === "/apprenticeships";

  if (accountOnly) {
    return session.role ? (
      <AccountMenu
        role={session.role}
        displayName={displayName}
        onLogout={handleLogout}
        onNavigate={() => setIsOpen(false)}
      />
    ) : null;
  }

  return (
    <nav
      className={
        isOverlayPage
          ? "absolute left-0 top-0 z-50 w-full"
          : "relative z-50 w-full border-b border-[var(--color-border-light)] bg-white/95"
      }
    >
      <div className="container-main">
        <div className="flex h-[82px] items-center justify-between">
          <Link to="/" className="group flex items-center gap-3">
            <div
              className="
    flex h-10 w-10 shrink-0 items-center justify-center
    rounded-[var(--radius-md)]
    bg-[var(--color-primary)] text-white
    shadow-md
    transition-all duration-200
    group-hover:bg-[var(--color-secondary-dark)]
    group-hover:shadow-lg
  "
            >
              <FiTool size={20} strokeWidth={2.2} />
            </div>

            <div className="leading-none">
              <div className="flex items-center">
                <span
                  className="
                    text-[19px]
                    font-bold
                    tracking-[-0.04em]
                    text-primary
                    drop-shadow-sm
                  "
                >
                  Skill
                </span>

                <span
                  className="
                    text-[19px]
                    font-bold
                    tracking-[-0.04em]
                    text-secondary
                    drop-shadow-sm
                  "
                >
                  Path
                </span>
              </div>

              <p
                className="
                  mt-1
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.15em]
                  /80
                "
              >
                Apprenticeship & Jobs
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <button
                key={link.name}
                type="button"
                onClick={() => handleNavigation(link)}
                className="group relative cursor-pointer border-0 bg-transparent py-2 text-[14px] font-medium text-[var(--color-heading)]"
              >
                {link.name}

                <span
                  className="
    absolute
    -bottom-1
    left-1/2
    h-1.5
    w-0
    -translate-x-1/2
    rounded-full
    bg-[var(--color-primary)]
    transition-all
    duration-200
    group-hover:w-7
  "
                />
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-5 lg:flex">
            {session.role ? (
              <AccountMenu
                role={session.role}
                displayName={displayName}
                onLogout={handleLogout}
                onNavigate={() => setIsOpen(false)}
              />
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-primary px-5 py-2.5 text-sm"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="
                group
                inline-flex
                items-center
                gap-2
                rounded-[var(--radius-md)]
                border-2
                border-secondary
                bg-transparent
                px-5
                py-2.5
                text-sm
                font-semibold
                text-secondary
                shadow-[0_4px_14px_rgba(249,115,22,0.20)]
                backdrop-blur-sm
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-[var(--color-secondary-dark)]
                hover:text-white
                hover:shadow-[0_8px_20px_rgba(249,115,22,0.32)]
                active:translate-y-0
                active:bg-[var(--color-secondary-dark)]
                active:text-white
                  "
                >
                  Register
                  <FiArrowUpRight
                    size={16}
                    strokeWidth={2.2}
                    className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-0.5
                  group-hover:-translate-y-0.5
                "
                  />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-[var(--radius-md)]
              border
              border-white/30
              bg-[var(--color-primary-dark)]
              text-white
              shadow-md
              backdrop-blur-sm
              transition
              hover:bg-[var(--color-secondary-dark)]
              hover:text-white
              active:bg-[var(--color-secondary-dark)]
              active:text-white
              lg:hidden
            "
          >
            {isOpen ? <FiX size={21} /> : <FiMenu size={21} />}
          </button>
        </div>

        {isOpen && (
          <div
            className="
              rounded-[var(--radius-lg)]
              border
              border-white/10
              bg-primary-dark/95
              p-5
              shadow-lg
              backdrop-blur-md
              lg:hidden
            "
          >
            <div className="flex flex-col">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => handleNavigation(link)}
                  className="
                    border-b
                    border-white/10
                    bg-transparent
                    py-3.5
                    text-left
                    text-sm
                    font-medium
                    
                    transition
                    hover:text-secondary
                    cursor-pointer
                  "
                >
                  {link.name}
                </button>
              ))}

              {session.role ? (
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="mb-2 truncate text-sm font-semibold text-white">
                    {displayName}
                  </p>
                  {accountLinks[session.role]?.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className="block border-b border-white/10 py-3 text-sm font-medium text-white transition hover:text-secondary"
                    >
                      {link.name}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-3 inline-flex items-center gap-2 py-2 text-sm font-semibold text-secondary"
                  >
                    <FiLogOut />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="mt-5 flex gap-3">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="
                    flex-1
                    rounded-[var(--radius-md)]
                    border-2
                    border-primary
                    bg-primary
                    px-4
                    py-2.5
                    text-center
                    text-sm
                    font-semibold
                    !
                    shadow-[0_4px_14px_rgba(22,101,52,0.20)]
                    transition-all
                    duration-200
                    hover:bg-primary-dark
                    hover:border-primary-dark
                    focus:bg-primary
                    focus:!
                    focus:outline-none
                    focus:ring-0
                    active:bg-primary-dark
                  "
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="
                    group
                    inline-flex
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-[var(--radius-md)]
                    border-2
                    border-secondary
                    bg-transparent
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-secondary
                    shadow-[0_4px_14px_rgba(249,115,22,0.18)]
                    backdrop-blur-sm
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:bg-secondary
                    hover:
                    hover:shadow-[0_7px_20px_rgba(249,115,22,0.30)]
                    active:translate-y-0
                  "
                  >
                    Register
                    <FiArrowUpRight
                      size={16}
                      strokeWidth={2.2}
                      className="
                      transition-transform
                      duration-200
                      group-hover:translate-x-0.5
                      group-hover:-translate-y-0.5
                    "
                    />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
