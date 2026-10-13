import { API_BASE_URL } from "../services/api.js";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiMail } from "react-icons/fi";

const API_URL = `${API_BASE_URL}/auth/forgot-password`;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to request password reset");
      }
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.message || "Unable to request password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-white p-7 shadow-[var(--shadow-lg)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-secondary)]">
          Account recovery
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-heading)]">
          Forgot password?
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-body)]">
          Enter your account email. If an account exists, reset instructions
          will be sent to it.
        </p>

        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <label className="block text-sm font-semibold text-[var(--color-heading)]">
            Email address
            <span className="relative mt-2 block">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] pl-11 pr-4 text-sm outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-4 focus:ring-green-100"
                placeholder="you@example.com"
              />
            </span>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl btn btn-primary px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset instructions"}
          </button>
        </form>

        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-dark)]"
        >
          <FiArrowLeft />
          Back to sign in
        </Link>
      </section>
    </main>
  );
}

export default ForgotPassword;
