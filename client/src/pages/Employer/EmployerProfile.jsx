import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiBriefcase,
  FiMapPin,
  FiPhone,
  FiMail,
  FiGlobe,
  FiEdit3,
  FiSave,
  FiUser,
} from "react-icons/fi";

import { API_BASE_URL } from "../services/api.js";
const API_URL = API_BASE_URL;

const emptyProfile = {
  companyName: "",
  contactPerson: "",
  industry: "",
  city: "",
  state: "",
  phone: "",
  email: "",
  website: "",
  description: "",
};

const EmployerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("accessToken");

        if (!token) {
          throw new Error("Please login to view your employer profile.");
        }

        const response = await fetch(`${API_URL}/employers/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load employer profile.");
        }

        if (active) {
          const employer = data.employer;
          setProfile({
            companyName: employer.companyName || "",
            contactPerson: employer.contactPerson || "",
            industry: employer.industry || "",
            city: employer.city || "",
            state: employer.state || "",
            phone: employer.phone || "",
            email: employer.user?.email || "",
            website: employer.website || "",
            description: employer.description || "",
          });
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Failed to load employer profile.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (e) => {
    setProfile((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Please login again to save your employer profile.");
      }

      const updates = {
        companyName: profile.companyName.trim(),
        contactPerson: profile.contactPerson.trim(),
        industry: profile.industry.trim(),
        city: profile.city.trim(),
        state: profile.state.trim(),
        phone: profile.phone.trim(),
        website: profile.website.trim(),
        description: profile.description.trim(),
      };
      const response = await fetch(`${API_URL}/employers/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save employer profile.");
      }

      setProfile((previous) => ({ ...previous, ...updates }));
      setIsEditing(false);
    } catch (saveError) {
      setError(saveError.message || "Failed to save employer profile.");
    } finally {
      setSaving(false);
    }
  };

  const location = [profile.city, profile.state].filter(Boolean).join(", ");
  const initials = profile.companyName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="border-b border-[var(--color-border)] bg-white">
        <div className="container-main flex items-center justify-between py-5">
          <div>
            <Link
              to="/employer/dashboard"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:"
            >
              <FiArrowLeft />
              Back to Dashboard
            </Link>

            <h1 className="text-2xl font-bold text-[var(--color-text)] md:text-3xl">
              Employer Profile
            </h1>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Manage your workshop or company information.
            </p>
          </div>

          <button
            type="button"
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            disabled={loading || saving}
            className="inline-flex items-center gap-2 rounded-xl btn btn-primary text-white px-5 py-3 text-sm font-semibold ! transition hover:bg-[var(--color-primary-dark)]"
          >
            {isEditing ? <FiSave /> : <FiEdit3 />}
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>
      </div>

      <main className="container-main py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
        {loading && (
          <p className="mb-6 text-sm text-[var(--color-text-muted)]">
            Loading employer profile...
          </p>
        )}
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.5fr]">
          <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl btn btn-primary text-white text-4xl font-bold ! shadow-lg">
                {initials || "EP"}
              </div>

              <h2 className="mt-5 text-xl font-bold text-[var(--color-text)]">
                {profile.companyName || "Company name"}
              </h2>

              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {profile.industry || "Industry not provided"}
              </p>

              <div className="mt-6 w-full space-y-4 border-t border-[var(--color-border)] pt-6 text-left">
                <div className="flex items-start gap-3">
                  <FiMapPin className="mt-1 " />
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Location
                    </p>
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      {location || "Location not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiUser className="mt-1 " />
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Contact Person
                    </p>
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      {profile.contactPerson || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiMail className="mt-1 " />
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Email
                    </p>
                    <p className="break-all text-sm font-medium text-[var(--color-text)]">
                      {profile.email || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiPhone className="mt-1 " />
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Phone
                    </p>
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      {profile.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiGlobe className="mt-1 " />
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Website
                    </p>
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      {profile.website || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm md:p-8">
            <div className="mb-7">
              <h2 className="text-xl font-bold text-[var(--color-text)]">
                Company Information
              </h2>

              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Keep your employer profile updated for better candidate trust.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                  Company / Workshop Name
                </label>

                <div className="relative">
                  <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />

                  <input
                    type="text"
                    name="companyName"
                    value={profile.companyName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3 pl-11 pr-4 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                  Industry
                </label>

                <input
                  type="text"
                  name="industry"
                  value={profile.industry}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                  Location
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="city"
                    value={profile.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="City"
                    aria-label="City"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-70"
                  />
                  <input
                    type="text"
                    name="state"
                    value={profile.state}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="State"
                    aria-label="State"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  disabled
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                  Website
                </label>

                <input
                  type="text"
                  name="website"
                  value={profile.website}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                  Contact Person
                </label>

                <input
                  type="text"
                  name="contactPerson"
                  value={profile.contactPerson}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                  About Company
                </label>

                <textarea
                  name="description"
                  value={profile.description}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="6"
                  className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm leading-6 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
            </div>

            {isEditing && (
              <div className="mt-7 flex justify-end gap-3 border-t border-[var(--color-border)] pt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-xl btn btn-primary text-white px-5 py-3 text-sm font-semibold ! transition hover:bg-[var(--color-primary-dark)]"
                >
                  <FiSave />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default EmployerProfile;
