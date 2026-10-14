import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiBriefcase,
  FiCheck,
  FiChevronDown,
  FiFileText,
  FiMapPin,
  FiPlus,
  FiSave,
  FiTrash2,
  FiUpload,
  FiUser,
  FiAward,
  FiBookOpen,
  FiAlertCircle,
  FiLoader,
  FiX,
} from "react-icons/fi";
import { API_BASE_URL } from "../services/api.js";

const API_URL = API_BASE_URL;

const emptyFormData = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  trade: "",
  institute: "",
  qualification: "",
  completionYear: "",
  experience: "Fresher",
  preferredLocation: "",
  about: "",
};

const emptyCertification = {
  name: "",
  issuer: "",
  year: "",
};

const experienceToNumber = {
  Fresher: 0,
  "0-1 years": 1,
  "1-2 years": 2,
  "2-3 years": 3,
  "3+ years": 4,
};

const numberToExperience = (experience) => {
  const value = Number(experience);

  if (value <= 0) return "Fresher";
  if (value === 1) return "0-1 years";
  if (value === 2) return "1-2 years";
  if (value === 3) return "2-3 years";

  return "3+ years";
};

function StudentProfile() {
  const [formData, setFormData] = useState(emptyFormData);
  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [showCertificateForm, setShowCertificateForm] = useState(false);
  const [newCertification, setNewCertification] = useState(emptyCertification);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [resumeMessage, setResumeMessage] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [hasResume, setHasResume] = useState(false);
  const [resumeName, setResumeName] = useState("");

  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken");

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login again to access your profile.");
        return;
      }

      const response = await fetch(`${API_URL}/students/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load student profile.");
      }

      const student = data.student;

      setFormData({
        fullName: student?.user?.name || "",
        email: student?.user?.email || "",
        phone: student?.phone || "",
        city: student?.city || "",
        state: student?.state || "",
        trade: student?.trade || "",
        institute: student?.institute || "",
        qualification: student?.qualification || "",
        completionYear: student?.completionYear || "",
        experience: numberToExperience(student?.experience ?? 0),
        preferredLocation: student?.preferredLocation || "",
        about: student?.about || "",
      });

      setSkills(Array.isArray(student?.skills) ? student.skills : []);

      setCertifications(
        Array.isArray(student?.certifications)
          ? student.certifications.map((certification, index) => ({
              id:
                certification._id || certification.id || `saved-cert-${index}`,
              name: certification.name || "",
              issuer: certification.issuer || "",
              year: String(certification.year || ""),
            }))
          : [],
      );

      setHasResume(Boolean(student?.resumeStorageKey || student?.resume));
      setResumeName(student?.resume || "");
    } catch (err) {
      setError(err.message || "Something went wrong while loading profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSaved(false);
    setError("");
  };

  const addSkill = () => {
    const skill = newSkill.trim();

    if (!skill) {
      setError("Please enter a skill.");
      return;
    }

    if (
      skills.some(
        (existingSkill) => existingSkill.toLowerCase() === skill.toLowerCase(),
      )
    ) {
      setNewSkill("");
      setError("This skill has already been added.");
      return;
    }

    setSkills((previous) => [...previous, skill]);
    setNewSkill("");
    setSaved(false);
    setError("");
  };

  const removeSkill = (skillToRemove) => {
    setSkills((previous) =>
      previous.filter((skill) => skill !== skillToRemove),
    );
    setSaved(false);
  };

  const handleCertificationChange = (event) => {
    const { name, value } = event.target;

    setNewCertification((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSaved(false);
  };

  const addCertification = (event) => {
    event.preventDefault();

    const name = newCertification.name.trim();
    const issuer = newCertification.issuer.trim();
    const year = newCertification.year;

    if (!name || !issuer || !year) {
      setError("Please fill in all certificate fields.");
      return;
    }

    const duplicate = certifications.some(
      (certification) =>
        certification.name.toLowerCase() === name.toLowerCase() &&
        certification.issuer.toLowerCase() === issuer.toLowerCase() &&
        certification.year === year,
    );

    if (duplicate) {
      setError("This certificate has already been added.");
      return;
    }

    setCertifications((previous) => [
      ...previous,
      {
        id: `new-cert-${Date.now()}-${previous.length}`,
        name,
        issuer,
        year,
      },
    ]);

    setNewCertification(emptyCertification);
    setShowCertificateForm(false);
    setSaved(false);
    setError("");
  };

  const removeCertification = (id) => {
    setCertifications((previous) =>
      previous.filter((certification) => certification.id !== id),
    );

    setSaved(false);
    setError("");
  };

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;
    event.target.value = "";

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Resume file size must be 5 MB or less.");
      setSelectedResume(null);
      event.target.value = "";
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx"].includes(extension)) {
      setError("Please select a PDF or DOCX resume.");
      setSelectedResume(null);
      return;
    }

    setSelectedResume(file);
    setError("");
    setResumeMessage("");
    setSaved(false);
  };

  const uploadResume = async () => {
    if (!selectedResume) return;

    const token = getToken();
    if (!token) {
      setError("Please login again to upload your resume.");
      return;
    }

    try {
      setUploadingResume(true);
      setError("");
      setResumeMessage("");

      const body = new FormData();
      body.append("resume", selectedResume);
      const response = await fetch(`${API_URL}/students/resume`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Resume upload failed.");
      }

      setResumeName(data.resume.fileName);
      setHasResume(true);
      setSelectedResume(null);
      setResumeMessage("Resume uploaded successfully.");
    } catch (err) {
      setError(err.message || "Resume upload failed. Please try again.");
    } finally {
      setUploadingResume(false);
    }
  };

  const downloadResume = async () => {
    const token = getToken();
    if (!token) {
      setError("Please login again to download your resume.");
      return;
    }

    try {
      setError("");
      const response = await fetch(`${API_URL}/students/resume`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Resume download failed.");
      }

      const fileUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = resumeName || "resume";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileUrl);
    } catch (err) {
      setError(err.message || "Resume download failed.");
    }
  };

  const calculateProfileCompletion = () => {
    const fields = [
      formData.phone,
      formData.city,
      formData.state,
      formData.trade,
      formData.institute,
      formData.qualification,
      formData.completionYear,
      formData.preferredLocation,
      skills.length > 0,
      certifications.length > 0,
      formData.about,
      hasResume,
    ];

    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setSaved(false);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login again to save your profile.");
        return;
      }

      const payload = {
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
        trade: formData.trade,
        institute: formData.institute,
        qualification: formData.qualification,
        completionYear: formData.completionYear,
        experience: experienceToNumber[formData.experience] ?? 0,
        preferredLocation: formData.preferredLocation,
        skills,
        certifications: certifications.map((certification) => ({
          name: certification.name,
          issuer: certification.issuer,
          year: certification.year,
        })),
        about: formData.about,
      };

      const response = await fetch(`${API_URL}/students/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save student profile.");
      }

      const student = data.student;

      setFormData((previous) => ({
        ...previous,
        fullName: student?.user?.name || previous.fullName,
        email: student?.user?.email || previous.email,
        phone: student?.phone ?? previous.phone,
        city: student?.city ?? previous.city,
        state: student?.state ?? previous.state,
        trade: student?.trade ?? previous.trade,
        institute: student?.institute ?? previous.institute,
        qualification: student?.qualification ?? previous.qualification,
        completionYear: student?.completionYear ?? previous.completionYear,
        experience: numberToExperience(
          student?.experience ?? experienceToNumber[previous.experience] ?? 0,
        ),
        preferredLocation:
          student?.preferredLocation ?? previous.preferredLocation,
        about: student?.about ?? previous.about,
      }));

      if (Array.isArray(student?.skills)) {
        setSkills(student.skills);
      }

      if (Array.isArray(student?.certifications)) {
        setCertifications(
          student.certifications.map((certification, index) => ({
            id: certification._id || certification.id || `saved-cert-${index}`,
            name: certification.name || "",
            issuer: certification.issuer || "",
            year: String(certification.year || ""),
          })),
        );
      }

      setSaved(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      setError(err.message || "Something went wrong while saving profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <div className="flex flex-col items-center gap-3">
          <FiLoader size={28} className="animate-spin" />
          <p className="text-sm font-medium text-[var(--color-muted)]">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border-light)] bg-white">
        <div className="mx-auto flex max-w-[var(--container-width)] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Link
              to="/student/dashboard"
              className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
            >
              <FiArrowLeft size={15} />
              Back to Dashboard
            </Link>

            <h1 className="text-2xl font-bold text-[var(--color-heading)]">
              My Profile
            </h1>

            <p className="mt-1 text-sm text-[var(--color-body)]">
              Keep your profile updated to improve your job opportunities.
            </p>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-xs font-medium text-[var(--color-muted)]">
                Profile completion
              </p>
              <p className="text-lg font-bold">{profileCompletion}%</p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-[var(--color-surface-green)] btn btn-primary text-sm font-bold text-white">
              {formData.fullName
                ? formData.fullName
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "AK"}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[var(--container-width)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {saved && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            <FiCheck size={18} />
            Your profile changes have been saved successfully.
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <FiAlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
              <div className="border-b border-green-100 bg-[var(--color-surface-green)] px-5 pb-6 pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-700 to-green-900 text-xl font-bold text-white shadow-sm ring-4 ring-white">
                    {formData.fullName
                      ? formData.fullName
                          .split(" ")
                          .map((name) => name[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "AK"}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold text-[var(--color-heading)]">
                      {formData.fullName || "Student"}
                    </p>
                    <span className="mt-1 inline-flex rounded-full border border-green-100 bg-white px-2.5 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
                      ITI Candidate
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--color-primary-dark)]">
                      Profile strength
                    </span>
                    <span className="text-sm font-bold text-[var(--color-primary-dark)]">
                      {profileCompletion}%
                    </span>
                  </div>
                  <div
                    className="h-2.5 overflow-hidden rounded-full bg-green-100"
                    role="progressbar"
                    aria-label="Profile strength"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={profileCompletion}
                    aria-valuetext={`${profileCompletion}%`}
                  >
                    <div
                      className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-soft)] p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-green)] text-[var(--color-primary)]">
                      <FiBriefcase size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-muted)]">Trade</p>
                      <p className="mt-0.5 text-sm font-semibold text-[var(--color-heading)]">
                        {formData.trade || "Not added"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-soft)] p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-orange)] text-[var(--color-secondary-dark)]">
                      <FiMapPin size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-muted)]">
                        Location
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-[var(--color-heading)]">
                        {formData.city || "City"}
                        {formData.state ? `, ${formData.state}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-soft)] p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-green)] text-[var(--color-primary)]">
                      <FiBookOpen size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-muted)]">
                        Qualification
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-[var(--color-heading)]">
                        {formData.qualification || "Not added"}
                        {formData.completionYear
                          ? ` · ${formData.completionYear}`
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-orange-100 bg-[var(--color-surface-orange)] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--color-secondary-dark)] shadow-sm">
                      <FiFileText size={17} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-secondary-dark)]">
                        Profile tip
                      </p>
                      <p className="mt-1.5 text-sm leading-5 text-[var(--color-body)]">
                        Add a professional resume to make your profile stronger
                        for employers.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-primary-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                    onClick={() =>
                      document
                        .getElementById("resume-section")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    <FiUpload size={15} />
                    Add Resume
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]">
              <p className="text-xs font-semibold uppercase tracking-[0.12em]">
                Profile Checklist
              </p>

              <div className="mt-4 space-y-3">
                {[
                  {
                    label: "Personal details",
                    complete:
                      formData.phone &&
                      formData.city &&
                      formData.state &&
                      formData.preferredLocation,
                  },
                  {
                    label: "ITI education",
                    complete:
                      formData.trade &&
                      formData.institute &&
                      formData.qualification &&
                      formData.completionYear,
                  },
                  { label: "Skills", complete: skills.length > 0 },
                  {
                    label: "Certifications",
                    complete: certifications.length > 0,
                  },
                  {
                    label: "Resume",
                    complete: hasResume || selectedResume,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-[var(--color-body)]">
                      {item.label}
                    </span>
                    {item.complete ? (
                      <FiCheck
                        size={16}
                        className="text-[var(--color-success)]"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-[var(--color-secondary)]">
                        Pending
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
              <div className="border-b border-[var(--color-border-light)] px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface-green)]">
                    <FiUser size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--color-heading)]">
                      Personal Information
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                      Your basic contact and location details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    readOnly
                    className="form-input cursor-not-allowed bg-gray-50"
                    placeholder="Your name"
                  />
                  <p className="mt-1 text-[11px] text-[var(--color-muted)]">
                    Name comes from your account.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    readOnly
                    className="form-input cursor-not-allowed bg-gray-50"
                    placeholder="Your email"
                  />
                  <p className="mt-1 text-[11px] text-[var(--color-muted)]">
                    Email comes from your account.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                  >
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your city"
                  />
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                  >
                    State
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your state"
                  />
                </div>

                <div>
                  <label
                    htmlFor="preferredLocation"
                    className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                  >
                    Preferred Job Location
                  </label>
                  <input
                    id="preferredLocation"
                    name="preferredLocation"
                    type="text"
                    value={formData.preferredLocation}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Chandigarh, Delhi, Pune"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
              <div className="border-b border-[var(--color-border-light)] px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface-orange)] text-[var(--color-secondary)]">
                    <FiBookOpen size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--color-heading)]">
                      ITI Education & Trade
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                      Tell employers about your vocational qualification.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <div className="relative">
                  <label
                    htmlFor="trade"
                    className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                  >
                    ITI Trade
                  </label>
                  <select
                    id="trade"
                    name="trade"
                    value={formData.trade}
                    onChange={handleChange}
                    className="form-input appearance-none pr-10"
                  >
                    <option value="">Select trade</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Fitter">Fitter</option>
                    <option value="Welder">Welder</option>
                    <option value="Mechanic">Mechanic</option>
                    <option value="COPA">COPA</option>
                    <option value="Electronics Mechanic">
                      Electronics Mechanic
                    </option>
                    <option value="Plumber">Plumber</option>
                    <option value="Motor Vehicle Mechanic">
                      Motor Vehicle Mechanic
                    </option>
                  </select>
                  <FiChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-[39px] text-[var(--color-muted)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="institute"
                    className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                  >
                    ITI Institute
                  </label>
                  <input
                    id="institute"
                    name="institute"
                    type="text"
                    value={formData.institute}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your ITI institute"
                  />
                </div>

                <div className="relative">
                  <label
                    htmlFor="qualification"
                    className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                  >
                    Qualification
                  </label>
                  <select
                    id="qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="form-input appearance-none pr-10"
                  >
                    <option value="">Select qualification</option>
                    <option value="ITI">ITI</option>
                    <option value="Diploma">Diploma</option>
                    <option value="ITI + Diploma">ITI + Diploma</option>
                  </select>
                  <FiChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-[39px] text-[var(--color-muted)]"
                  />
                </div>

                <div className="relative">
                  <label
                    htmlFor="completionYear"
                    className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                  >
                    Completion Year
                  </label>
                  <select
                    id="completionYear"
                    name="completionYear"
                    value={formData.completionYear}
                    onChange={handleChange}
                    className="form-input appearance-none pr-10"
                  >
                    <option value="">Select year</option>
                    {Array.from({ length: 6 }, (_, index) => 2026 - index).map(
                      (year) => (
                        <option key={year} value={String(year)}>
                          {year}
                        </option>
                      ),
                    )}
                  </select>
                  <FiChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-[39px] text-[var(--color-muted)]"
                  />
                </div>

                <div className="relative sm:col-span-2">
                  <label
                    htmlFor="experience"
                    className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                  >
                    Experience Level
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="form-input appearance-none pr-10"
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="0-1 years">0–1 years</option>
                    <option value="1-2 years">1–2 years</option>
                    <option value="2-3 years">2–3 years</option>
                    <option value="3+ years">3+ years</option>
                  </select>
                  <FiChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-[39px] text-[var(--color-muted)]"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
              <div className="border-b border-[var(--color-border-light)] px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface-green)]">
                    <FiAward size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--color-heading)]">
                      Skills & Expertise
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                      Add practical skills relevant to your trade.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-[var(--color-surface-green)] px-3 py-2 text-xs font-semibold"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="rounded-full transition hover:text-red-600"
                        aria-label={`Remove ${skill}`}
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                {skills.length === 0 && (
                  <p className="text-sm text-[var(--color-muted)]">
                    No skills added yet.
                  </p>
                )}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(event) => setNewSkill(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addSkill();
                      }
                    }}
                    className="form-input flex-1"
                    placeholder="Add a skill, e.g. Motor Repair"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="inline-flex items-center justify-center gap-2 rounded-xl btn btn-primary px-5 py-3 text-sm font-semibold text-white"
                  >
                    <FiPlus size={16} />
                    Add Skill
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
              <div className="border-b border-[var(--color-border-light)] px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface-orange)] text-[var(--color-secondary)]">
                      <FiAward size={18} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[var(--color-heading)]">
                        Certifications
                      </h2>
                      <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                        Highlight your certificates and training.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowCertificateForm((previous) => !previous);
                      setError("");
                    }}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-heading)] transition hover:bg-[var(--color-surface-soft)]"
                  >
                    {showCertificateForm ? (
                      <FiX size={14} />
                    ) : (
                      <FiPlus size={14} />
                    )}
                    {showCertificateForm ? "Cancel" : "Add Certificate"}
                  </button>
                </div>
              </div>

              {showCertificateForm && (
                <form
                  onSubmit={addCertification}
                  className="grid gap-4 border-b border-[var(--color-border-light)] p-5 sm:grid-cols-2 sm:p-6"
                >
                  <div>
                    <label
                      htmlFor="certificateName"
                      className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                    >
                      Certificate Name
                    </label>
                    <input
                      id="certificateName"
                      name="name"
                      type="text"
                      value={newCertification.name}
                      onChange={handleCertificationChange}
                      className="form-input"
                      placeholder="e.g. Electrician Training"
                      maxLength={150}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="certificateIssuer"
                      className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                    >
                      Issuing Organization
                    </label>
                    <input
                      id="certificateIssuer"
                      name="issuer"
                      type="text"
                      value={newCertification.issuer}
                      onChange={handleCertificationChange}
                      className="form-input"
                      placeholder="e.g. ITI Institute"
                      maxLength={150}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="certificateYear"
                      className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                    >
                      Issue Year
                    </label>
                    <select
                      id="certificateYear"
                      name="year"
                      value={newCertification.year}
                      onChange={handleCertificationChange}
                      className="form-input"
                      required
                    >
                      <option value="">Select year</option>
                      {Array.from(
                        { length: 30 },
                        (_, index) => 2026 - index,
                      ).map((year) => (
                        <option key={year} value={String(year)}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl btn btn-primary px-5 py-3 text-sm font-semibold text-white"
                    >
                      <FiPlus size={16} />
                      Add Certificate
                    </button>
                  </div>
                </form>
              )}

              <div className="divide-y divide-[var(--color-border-light)]">
                {certifications.map((certification) => (
                  <div
                    key={certification.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-soft)]">
                        <FiFileText size={17} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--color-heading)]">
                          {certification.name}
                        </h3>
                        <p className="mt-1 text-xs text-[var(--color-body)]">
                          {certification.issuer}
                        </p>
                        <span className="mt-2 inline-flex rounded-full bg-[var(--color-surface-green)] px-2.5 py-1 text-[10px] font-semibold">
                          Issued {certification.year}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeCertification(certification.id)}
                      className="flex w-fit items-center gap-2 text-xs font-semibold text-[var(--color-muted)] transition hover:text-red-600"
                    >
                      <FiTrash2 size={14} />
                      Remove
                    </button>
                  </div>
                ))}

                {certifications.length === 0 && (
                  <div className="p-6 text-center">
                    <p className="text-sm text-[var(--color-muted)]">
                      No certifications added yet.
                    </p>
                    <p className="mt-2 text-xs text-[var(--color-muted)]">
                      Add your training certificates to highlight your skills.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
              <div className="border-b border-[var(--color-border-light)] px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface-orange)] text-[var(--color-secondary)]">
                    <FiUser size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--color-heading)]">
                      About You
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                      Give employers a quick introduction about yourself.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <label
                  htmlFor="about"
                  className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                >
                  Career Summary
                </label>
                <textarea
                  id="about"
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  rows={5}
                  maxLength={2000}
                  className="form-input resize-none"
                  placeholder="Write a short professional introduction..."
                />
                <p className="mt-2 text-xs text-[var(--color-muted)]">
                  Keep it professional and focus on your trade, practical skills
                  and career goals.
                </p>
              </div>
            </section>

            <section
              id="resume-section"
              className="rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]"
            >
              <div className="border-b border-[var(--color-border-light)] px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface-green)]">
                    <FiFileText size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--color-heading)]">
                      Resume
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                      Upload a recent resume for employers to review.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface-soft)] p-7 text-center transition hover:border-[var(--color-primary)]">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                    <FiUpload size={20} />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-[var(--color-heading)]">
                    Upload your resume
                  </h3>
                  <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[var(--color-muted)]">
                    PDF or DOCX format, maximum file size 5 MB.
                  </p>

                  <label
                    htmlFor="resume"
                    className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl btn btn-primary px-5 py-3 text-sm font-semibold text-white"
                  >
                    <FiUpload size={15} />
                    Choose Resume
                  </label>

                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleResumeChange}
                    className="hidden"
                  />

                  {selectedResume && (
                    <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                      <p className="text-xs font-semibold text-green-700">
                        Ready to upload
                      </p>
                      <p className="mt-1 break-all text-xs text-green-600">
                        {selectedResume.name}
                      </p>
                      <button
                        type="button"
                        onClick={uploadResume}
                        disabled={uploadingResume}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl btn btn-primary px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {uploadingResume ? (
                          <>
                            <FiLoader size={14} className="animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FiUpload size={14} />
                            Upload Resume
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {resumeMessage && (
                    <p className="mt-3 text-xs font-semibold text-green-700">
                      {resumeMessage}
                    </p>
                  )}

                  {!selectedResume && hasResume && (
                    <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                      <p className="text-xs font-semibold text-green-700">
                        {resumeName || "Resume already added to your profile."}
                      </p>
                      <button
                        type="button"
                        onClick={downloadResume}
                        className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-green-700 underline"
                      >
                        <FiFileText size={14} />
                        Download saved resume
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <div className="sticky bottom-4 z-10 rounded-2xl border border-[var(--color-border)] bg-white/95 p-4 shadow-[var(--shadow-lg)] backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-heading)]">
                    Ready to update your profile?
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    Your profile helps employers understand your skills.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-secondary-dark)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <FiLoader size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default StudentProfile;
