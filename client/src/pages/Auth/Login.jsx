import { API_BASE_URL } from "../services/api.js";
import React, { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import {
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiTool,
  FiUser,
  FiZap,
} from "react-icons/fi";

function Login() {
  const loginInProgress = useRef(false);
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const [success, setSuccess] = useState(
    location.state?.registrationComplete
      ? "Account created successfully. Please sign in."
      : "",
  );

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    if (loginInProgress.current) return;
    loginInProgress.current = true;

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 && data.code === "RATE_LIMITED") {
          const retryAfter = Number(data.retryAfter);
          let waitMessage = "a little while";
          if (Number.isFinite(retryAfter) && retryAfter > 0) {
            if (retryAfter < 60) {
              waitMessage =
                retryAfter === 1 ? "1 second" : `${retryAfter} seconds`;
            } else {
              const minutes = Math.ceil(retryAfter / 60);
              waitMessage = `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
            }
          }
          throw new Error(
            `Too many sign-in attempts. Please try again in ${waitMessage}.`,
          );
        }
        throw new Error(data.message || "Login failed.");
      }

      if (!data.token) {
        throw new Error(
          "Login successful, but authentication token was not received.",
        );
      }

      localStorage.setItem("token", data.token);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.role || role);
      } else {
        localStorage.setItem("role", role);
      }

      if (data.user?.role === "employer") {
        navigate("/employer/dashboard");
      } else if (data.user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (error) {
      setError(error.message || "Unable to login. Please try again.");
    } finally {
      loginInProgress.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border-light)] bg-white/80">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-8">
          <Link
            to="/"
            className="flex items-center gap-3 text-[var(--color-heading)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
              <FiTool size={20} />
            </div>

            <div>
              <p className="text-[15px] font-bold leading-none tracking-tight">
                ITI
                <span className="text-[var(--color-secondary)]">Connect</span>
              </p>

              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Skills to Careers
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Navbar accountOnly />
            <Link
              to="/"
              className="text-sm font-medium text-[var(--color-body)] transition hover:text-[var(--color-primary-dark)]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8 lg:py-16">
        <div className="grid overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-lg)] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden bg-[var(--color-heading)] p-7 sm:p-10 lg:p-12">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--color-primary)] opacity-30 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[var(--color-secondary)] opacity-20 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] !text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-secondary)]" />
                  Career Portal
                </span>

                <h1 className="mt-8 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight !text-white sm:text-5xl">
                  Find where your
                  <span className="block text-[var(--color-secondary-light)]">
                    skills belong.
                  </span>
                </h1>

                <p className="mt-5 max-w-lg text-sm leading-7 !text-white/65 sm:text-base">
                  Connect with apprenticeships, workshops, factories and
                  employers looking for skilled ITI professionals.
                </p>
              </div>

              <div className="mt-12">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] !text-white/70">
                  Explore trade opportunities
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-secondary-dark)] !text-white">
                      <FiZap size={17} />
                    </div>

                    <p className="text-sm font-semibold !text-white">
                      Electrician
                    </p>

                    <p className="mt-1 text-xs !text-white/50">
                      Technical roles
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] !text-white">
                      <FiTool size={17} />
                    </div>

                    <p className="text-sm font-semibold !text-white">Fitter</p>

                    <p className="mt-1 text-xs !text-white/50">
                      Industrial roles
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 !text-white">
                      <FiTool size={17} />
                    </div>

                    <p className="text-sm font-semibold !text-white">Welder</p>

                    <p className="mt-1 text-xs !text-white/50">Manufacturing</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 !text-white">
                      <FiBriefcase size={17} />
                    </div>

                    <p className="text-sm font-semibold !text-white">
                      Mechanic
                    </p>

                    <p className="mt-1 text-xs !text-white/50">
                      Automobile roles
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-8 border-t border-white/10 pt-7">
                <div>
                  <p className="text-2xl font-bold !text-white">10K+</p>
                  <p className="mt-1 text-[11px] !text-white/50">Candidates</p>
                </div>

                <div>
                  <p className="text-2xl font-bold !text-white">500+</p>
                  <p className="mt-1 text-[11px] !text-white/50">Employers</p>
                </div>

                <div>
                  <p className="text-2xl font-bold !text-white">25+</p>
                  <p className="mt-1 text-[11px] !text-white/50">
                    Trade Categories
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="p-7 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-md">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-secondary)]">
                  Welcome back
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-heading)]">
                  Sign in to your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
                  Continue your journey towards the right opportunity.
                </p>
              </div>

              <div className="mb-7 grid grid-cols-2 rounded-xl bg-[var(--color-surface-soft)] p-1">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                    role === "student"
                      ? "bg-white  shadow-sm"
                      : "text-[var(--color-muted)]"
                  }`}
                >
                  <FiUser size={16} />
                  ITI Candidate
                </button>

                <button
                  type="button"
                  onClick={() => setRole("employer")}
                  className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                    role === "employer"
                      ? "bg-white  shadow-sm"
                      : "text-[var(--color-muted)]"
                  }`}
                >
                  <FiBriefcase size={16} />
                  Employer
                </button>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="login-email"
                    className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />

                    <input
                      id="login-email"
                      type="email"
                      name="email"
                      autoComplete="username"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] pl-11 pr-4 text-sm text-[var(--color-heading)] outline-none transition focus:border-[var(--color-primary)] focus:bg-white focus:ring-4 focus:ring-green-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <label
                      htmlFor="login-password"
                      className="text-sm font-semibold text-[var(--color-heading)]"
                    >
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="shrink-0 whitespace-nowrap text-xs font-semibold transition hover:text-[var(--color-primary-dark)]"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />

                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] pl-11 pr-12 text-sm text-[var(--color-heading)] outline-none transition focus:border-[var(--color-primary)] focus:bg-white focus:ring-4 focus:ring-green-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] transition hover:text-[var(--color-heading)]"
                    >
                      {showPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl btn btn-primary px-5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing In..." : "Sign In"}

                  {!loading && (
                    <FiArrowRight
                      className="transition-transform group-hover:translate-x-1"
                      size={17}
                    />
                  )}
                </button>
              </form>

              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--color-border-light)]" />

                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-light-text)]">
                  Secure access
                </span>

                <div className="h-px flex-1 bg-[var(--color-border-light)]" />
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-muted)]">
                <FiCheckCircle
                  className="text-[var(--color-success)]"
                  size={15}
                />
                Your account information stays protected.
              </div>

              <p className="mt-7 text-center text-sm text-[var(--color-body)]">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold  hover:text-[var(--color-primary-dark)]"
                >
                  Create one
                </Link>
              </p>
            </div>
          </section>
        </div>

        <p className="mt-6 text-center text-[11px] text-[var(--color-light-text)]">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </main>
    </div>
  );
}

export default Login;
