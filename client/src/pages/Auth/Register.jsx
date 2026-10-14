import { API_BASE_URL } from "../services/api.js";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import {
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiPhone,
  FiTool,
  FiUser,
  FiZap,
} from "react-icons/fi";

const inputBase =
  "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] text-sm text-[var(--color-heading)] outline-none transition focus:border-[var(--color-primary)] focus:bg-white focus:ring-4 focus:ring-green-100";

function Register() {
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    trade: "",
    institute: "",
    companyName: "",
    industry: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  };

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);

    setFormData((prev) => ({
      ...prev,
      trade: "",
      institute: "",
      companyName: "",
      industry: "",
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (role === "student") {
      if (!formData.trade) {
        setError("Please select your ITI trade.");
        return;
      }

      if (!formData.institute.trim()) {
        setError("Please enter your ITI institute name.");
        return;
      }
    }

    if (role === "employer") {
      if (!formData.companyName.trim()) {
        setError("Please enter your company or workshop name.");
        return;
      }

      if (!formData.industry.trim()) {
        setError("Please enter your industry.");
        return;
      }
    }

    if (!formData.password) {
      setError("Please create a password.");
      return;
    }

    if (formData.password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.terms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role,
          ...(role === "employer"
            ? {
                companyName: formData.companyName.trim(),
                industry: formData.industry.trim(),
              }
            : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      navigate("/login", { state: { registrationComplete: true } });
    } catch (error) {
      setError(error.message || "Unable to create account. Please try again.");
    } finally {
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
              className="text-sm font-medium text-[var(--color-body)] transition hover:"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8 lg:py-16">
        <div className="grid overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-lg)] lg:grid-cols-[1.05fr_0.95fr]">
          {/* LEFT PANEL */}
          <section className="relative overflow-hidden bg-[var(--color-heading)] p-7 sm:p-10 lg:p-12">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--color-primary)] opacity-30 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[var(--color-secondary)] opacity-20 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] !text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-secondary)]" />
                  Start Your Journey
                </span>

                <h1 className="mt-8 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight !text-white sm:text-5xl">
                  Turn your
                  <span className="block text-[var(--color-secondary-light)]">
                    skills into opportunities.
                  </span>
                </h1>

                <p className="mt-5 max-w-lg text-sm leading-7 !text-white/65 sm:text-base">
                  Create your profile, showcase your trade skills and discover
                  opportunities built for the vocational workforce.
                </p>
              </div>

              <div className="mt-12">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] !text-white/70">
                  Built for skilled careers
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-secondary-dark)] !text-white">
                      <FiUser size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold !text-white">
                        Create your skill profile
                      </p>

                      <p className="mt-1 text-xs !text-white/50">
                        Showcase your trade, training and experience
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] !text-white">
                      <FiZap size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold !text-white">
                        Discover relevant opportunities
                      </p>

                      <p className="mt-1 text-xs !text-white/50">
                        Find apprenticeships and jobs matching your trade
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 !text-white">
                      <FiBriefcase size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold !text-white">
                        Build your career
                      </p>

                      <p className="mt-1 text-xs !text-white/50">
                        Connect with employers looking for skilled talent
                      </p>
                    </div>
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

          {/* RIGHT PANEL */}
          <section className="p-7 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-md">
              <div className="mb-7">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-secondary)]">
                  Join the platform
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-heading)]">
                  Create your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
                  Choose your path and get started with ITIConnect.
                </p>
              </div>

              <div className="mb-7 grid grid-cols-2 rounded-xl bg-[var(--color-surface-soft)] p-1">
                <button
                  type="button"
                  onClick={() => handleRoleChange("student")}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${
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
                  onClick={() => handleRoleChange("employer")}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-heading)]">
                    Full name
                  </label>

                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={`${inputBase} h-11 pl-11 pr-4`}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[var(--color-heading)]">
                      Email
                    </label>

                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />

                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={`${inputBase} h-11 pl-11 pr-3`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[var(--color-heading)]">
                      Phone
                    </label>

                    <div className="relative">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />

                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Your phone number"
                        className={`${inputBase} h-11 pl-11 pr-3`}
                      />
                    </div>
                  </div>
                </div>

                {role === "student" ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[var(--color-heading)]">
                        ITI Trade
                      </label>

                      <select
                        name="trade"
                        value={formData.trade}
                        onChange={handleChange}
                        className={`${inputBase} h-11 px-3 text-[var(--color-body)]`}
                      >
                        <option value="">Select trade</option>
                        <option>Electrician</option>
                        <option>Fitter</option>
                        <option>Welder</option>
                        <option>Mechanic</option>
                        <option>COPA</option>
                        <option>Electronics Mechanic</option>
                        <option>Plumber</option>
                        <option>Motor Vehicle Mechanic</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[var(--color-heading)]">
                        ITI Institute
                      </label>

                      <input
                        type="text"
                        name="institute"
                        value={formData.institute}
                        onChange={handleChange}
                        placeholder="Institute name"
                        className={`${inputBase} h-11 px-3`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[var(--color-heading)]">
                        Company / Workshop
                      </label>

                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Business name"
                        className={`${inputBase} h-11 px-3`}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[var(--color-heading)]">
                        Industry
                      </label>

                      <input
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        placeholder="e.g. Manufacturing"
                        className={`${inputBase} h-11 px-3`}
                      />
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[var(--color-heading)]">
                      Password
                    </label>

                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />

                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create password"
                        className={`${inputBase} h-11 pl-11 pr-11`}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] transition hover:text-[var(--color-heading)]"
                      >
                        {showPassword ? (
                          <FiEyeOff size={17} />
                        ) : (
                          <FiEye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[var(--color-heading)]">
                      Confirm password
                    </label>

                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />

                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repeat password"
                        className={`${inputBase} h-11 pl-11 pr-11`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] transition hover:text-[var(--color-heading)]"
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff size={17} />
                        ) : (
                          <FiEye size={17} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-3 pt-1">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
                  />

                  <span className="text-xs leading-5 text-[var(--color-body)]">
                    I agree to the Terms of Service and Privacy Policy.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary group h-12 w-full rounded-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating Account..." : "Create Account"}

                  {!loading && (
                    <FiArrowRight
                      className="transition-transform group-hover:translate-x-1"
                      size={17}
                    />
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--color-muted)]">
                <FiCheckCircle
                  className="text-[var(--color-success)]"
                  size={15}
                />
                Free to join. Built for real career opportunities.
              </div>

              <p className="mt-6 text-center text-sm text-[var(--color-body)]">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold  hover:text-[var(--color-primary-dark)]"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Register;
