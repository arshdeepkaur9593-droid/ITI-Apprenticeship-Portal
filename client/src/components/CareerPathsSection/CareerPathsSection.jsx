import React from "react";
import { useNavigate } from "react-router-dom";
import { FiBriefcase, FiUsers } from "react-icons/fi";
import CareerPathCard from "./CareerPathCard";

const careerPaths = [
  {
    type: "For ITI Candidates",
    title: "Build Your Career With the Right Opportunity",
    description:
      "Create your profile, discover relevant apprenticeships and trade jobs, and connect with employers looking for your skills.",
    items: [
      "Build your skill profile",
      "Find relevant opportunities",
      "Apply with confidence",
      "Track your applications",
    ],
    icon: <FiUsers size={25} className="text-green-800" />,
    buttonText: "Explore Opportunities",
    featured: true,
    path: "/jobs",
  },
  {
    type: "For Employers",
    title: "Find Skilled ITI Talent Faster",
    description:
      "Connect with trained candidates, publish job and apprenticeship openings, and manage applications from one place.",
    items: [
      "Post jobs and apprenticeships",
      "Find skilled candidates",
      "Manage applications",
      "Build your talent pipeline",
    ],
    icon: <FiBriefcase size={25} className="text-green-700" />,
    buttonText: "Find Skilled Talent",
    featured: false,
    path: "/employer/jobs",
  },
];

function CareerPathsSection() {
  const navigate = useNavigate();

  return (
    <section className="bg-[var(--color-background)] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-[var(--color-primary-light)] bg-opacity-10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em]">
            Built for Both Sides
          </span>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[var(--color-heading)] sm:text-4xl md:text-5xl">
            One Platform. Two Career Paths
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--color-body)] sm:text-base">
            Whether you are building your career or hiring skilled trade talent,
            the platform gives you the tools to move forward.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {careerPaths.map((path) => (
            <CareerPathCard
              key={path.type}
              {...path}
              onClick={() => navigate(path.path)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CareerPathsSection;
