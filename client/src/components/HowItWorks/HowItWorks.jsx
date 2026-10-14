import React from "react";
import { FiUserPlus, FiSearch, FiSend, FiBriefcase } from "react-icons/fi";

const steps = [
  {
    number: "01",
    icon: <FiUserPlus size={22} />,
    title: "Build Your Profile",
    description:
      "Tell us about your ITI trade, skills, qualification and preferred location.",
  },
  {
    number: "02",
    icon: <FiSearch size={22} />,
    title: "Discover Opportunities",
    description:
      "Explore apprenticeships and trade jobs that match your practical skills.",
  },
  {
    number: "03",
    icon: <FiSend size={22} />,
    title: "Apply With Confidence",
    description:
      "Review the opportunity, check the requirements and send your application.",
  },
  {
    number: "04",
    icon: <FiBriefcase size={22} />,
    title: "Start Your Career",
    description:
      "Connect with employers and take your next step into the skilled workforce.",
  },
];

function HowItWorks() {
  return (
    <section className="bg-[var(--color-surface)] py-16 md:py-20">
      <div className="container-main">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span
            className="
      inline-flex
      items-center
      rounded-full
      border
      border-[var(--color-border)]
      bg-[var(--color-surface-soft)]
      px-4
      py-1.5
      text-xs
      font-bold
      uppercase
      tracking-wider
      text-[var(--color-secondary)]
    "
          >
            How It Works
          </span>

          <h2
            className="
      mx-auto
      mt-4
      max-w-2xl
      text-center
      text-3xl
      font-extrabold
      leading-tight
      tracking-tight
      text-[var(--color-heading)]
      md:text-5xl
    "
          >
            Your Skills Can Take You
            <span className=""> Further.</span>
          </h2>

          <p
            className="
      mx-auto
      mt-4
      max-w-2xl
      text-center
      text-sm
      leading-6
      text-[var(--color-body)]
      md:text-base
    "
          >
            From creating your profile to connecting with the right employer,
            follow a simple path towards your next career opportunity.
          </p>
        </div>

        <div className="relative mt-14 md:mt-16">
          <div
            className="
              pointer-events-none
              absolute
              bottom-0
              left-6
              top-0
              w-px
              bg-[var(--color-border)]
              md:left-1/2
              md:-translate-x-1/2
            "
          />

          <div className="space-y-10 md:space-y-0">
            {steps.map((step, index) => {
              const isEven = index % 2 === 1;

              return (
                <div
                  key={step.number}
                  className="
                    relative
                    md:min-h-[180px]
                  "
                >
                  <div
                    className={`
                      relative
                      flex
                      items-start
                      gap-6
                      md:grid
                      md:grid-cols-2
                      md:gap-0
                      ${isEven ? "" : ""}
                    `}
                  >
                    <div
                      className={`
                        hidden
                        md:block
                        ${
                          isEven
                            ? "md:col-start-2 md:pl-20"
                            : "md:col-start-1 md:pr-20 md:text-right"
                        }
                      `}
                    >
                      <div
                        className={`
                          inline-flex
                          items-center
                          gap-3
                          ${isEven ? "flex-row" : "flex-row-reverse"}
                        `}
                      >
                        <span
                          className="
                            text-5xl
                            font-black
                            tracking-tighter
                            
                            opacity-10
                          "
                        >
                          {step.number}
                        </span>

                        <div
                          className="
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-[var(--color-primary)] text-white
                            
                            shadow-[var(--shadow-sm)]
                          "
                        >
                          {step.icon}
                        </div>
                      </div>

                      <h3
                        className="
                          mt-4
                          text-xl
                          font-bold
                          text-[var(--color-heading)]
                        "
                      >
                        {step.title}
                      </h3>

                      <p
                        className="
                          mt-2
                          max-w-md
                          text-sm
                          leading-6
                          text-[var(--color-body)]
                          md:ml-auto
                        "
                      >
                        {step.description}
                      </p>
                    </div>

                    <div className="relative flex shrink-0 md:absolute md:left-1/2 md:top-0 md:-translate-x-1/2">
                      <div
                        className="
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-full
                          border-4
                          border-[var(--color-surface)]
                          bg-[var(--color-secondary-dark)]
                          text-xs
                          font-extrabold
                          text-white
                          
                          shadow-[var(--shadow-md)]
                        "
                      >
                        {step.number}
                      </div>
                    </div>

                    <div className="min-w-0 pt-1 md:hidden">
                      <div
                        className="
                          flex
                          h-11
                          w-20
                          items-center
                          justify-center
                          rounded-xl
                          bg-[var(--color-primary)] text-white
                          
                        "
                      >
                        {step.icon}
                      </div>

                      <h3
                        className="
                          mt-3
                          text-lg
                          font-bold
                          text-[var(--color-heading)]
                        "
                      >
                        {step.title}
                      </h3>

                      <p
                        className="
                          mt-2
                          text-sm
                          leading-6
                          text-[var(--color-body)]
                        "
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="
            mt-8
            border-t
            border-[var(--color-border)]
            pt-6
            text-center
            md:mt-4
          "
        >
          <p
            className="
              text-sm
              font-medium
              text-[var(--color-muted)]
            "
          >
            Practical skills Real opportunities. A clearer path forward.
          </p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
