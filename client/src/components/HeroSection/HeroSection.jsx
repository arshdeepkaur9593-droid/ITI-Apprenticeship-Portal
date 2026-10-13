import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiMapPin, FiBriefcase, FiCheck } from "react-icons/fi";
import heroImage from "../../assets/images/hero-iti-DsS9yoK1.webp";
function HeroSection() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="relative overflow-hidden hero-bg pt-24 pb-8 md:pt-28 md:pb-10">
      <div
        className="
          pointer-events-none
          absolute
          -top-32
          -right-32
          h-80
          w-80
          rounded-full
          bg-[var(--color-secondary)]
          opacity-[0.08]
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          top-64
          -left-40
          h-96
          w-96
          rounded-full
          bg-[var(--color-primary-light)]
          opacity-[0.08]
          blur-3xl
        "
      />

      <div className="container-main relative z-10 -translate-y-5">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <div
            className="
              mb-4
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[var(--color-border)]
              bg-[var(--color-surface)]
              px-4
              py-1.5
              text-sm
              font-semibold
              
              shadow-[var(--shadow-sm)]
            "
          >
            <span
              className="
                h-2
                w-2
                rounded-full
                bg-[var(--color-primary-light)]
              "
            />
            ITI • Apprenticeships • Trade Jobs
          </div>

          <h1
            className="
              mx-auto
              max-w-4xl
              text-center
              text-[clamp(2.6rem,5.5vw,5rem)]
              font-extrabold
              uppercase
              leading-[0.94]
              tracking-[-0.05em]
              text-[var(--color-primary-dark)]
              hero-heading-glow
            "
          >
            <span className="block">Skilled Hands</span>

            <span
              className="
                block
                text-[var(--color-secondary)]
                hero-heading-orange-glow
              "
            >
              Better Opportunities
            </span>
          </h1>

          <p
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-base
              leading-7
              text-[var(--color-body)]
              md:text-sm
            "
          >
            Discover apprenticeships and trade jobs that match what you know and
            what you can do
          </p>
        </div>

        <div className="relative mx-auto mt-9 max-w-6xl md:mt-10">
          <div
            className="
              absolute
              -right-2
              -top-2
              z-0
              h-16
              w-16
              rounded-tr-[var(--radius-2xl)]
              border-r-4
              border-t-4
              border-[var(--color-secondary)]
              md:-right-5
              md:-top-5
              md:h-24
              md:w-24
            "
          />

          <div
            className="
              absolute
              -bottom-3
              -left-3
              z-0
              h-16
              w-16
              rounded-bl-[var(--radius-2xl)]
              border-b-4
              border-l-4
              border-[var(--color-primary-light)]
              md:-bottom-5
              md:-left-5
              md:h-24
              md:w-24
            "
          />

          <div
            className="
              relative
              z-10
              mx-auto
              w-full
              max-w-5xl
              overflow-hidden
              rounded-[var(--radius-2xl)]
              border
              border-[var(--color-border)]
              bg-[var(--color-surface)]
              shadow-[var(--shadow-lg)]
            "
          >
            <img
              src={heroImage}
              alt="ITI students working in a vocational workshop"
              className="
                h-[250px]
                w-full
                object-cover
                md:h-[310px]
                lg:h-[350px]
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-t
                from-[rgba(20,83,45,0.30)]
                via-transparent
                to-transparent
              "
            />
          </div>

          <div
            className="
              relative
              z-20
              mx-4
              -mt-8
              rounded-[var(--radius-xl)]
              border
              border-[var(--color-border)]
              bg-[var(--color-surface)]
              p-2.5
              shadow-[var(--shadow-lg)]
              md:mx-10
              md:-mt-10
              md:p-3
            "
          >
            <div className="grid gap-2.5 md:grid-cols-[1fr_1fr_auto]">
              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-[var(--radius-md)]
                  border
                  border-[var(--color-border)]
                  bg-[var(--color-surface-soft)]
                  px-4
                  py-2.5
                "
              >
                <FiSearch className="shrink-0 " size={19} />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="Search trade or job"
                  className="
                    w-full
                    bg-transparent
                    text-sm
                    text-[var(--color-heading)]
                    outline-none
                    placeholder:text-[var(--color-light-text)]
                  "
                />
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-[var(--radius-md)]
                  border
                  border-[var(--color-border)]
                  bg-[var(--color-surface-soft)]
                  px-4
                  py-2.5
                "
              >
                <FiMapPin
                  className="shrink-0 text-[var(--color-secondary)]"
                  size={19}
                />

                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="City or location"
                  className="
                    w-full
                    bg-transparent
                    text-sm
                    text-[var(--color-heading)]
                    outline-none
                    placeholder:text-[var(--color-light-text)]
                  "
                />
              </div>

              <button
                type="button"
                onClick={handleSearch}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-[var(--radius-md)]
                  btn btn-primary text-white
                  px-6
                  py-2.5
                  font-semibold
                  
                  shadow-[var(--shadow-sm)]
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-[var(--color-primary-dark)]
                  hover:shadow-[var(--shadow-md)]
                  active:translate-y-0
                "
              >
                <FiBriefcase size={18} />
                Find Opportunities
              </button>
            </div>
          </div>
        </div>

        <div
          className="
            mx-auto
            mt-6
            flex
            max-w-4xl
            flex-wrap
            items-center
            justify-center
            gap-x-7
            gap-y-2
            rounded-full
            border
            border-[var(--color-border)]
            bg-[var(--color-surface)]
            px-5
            py-2.5
            text-xs
            font-medium
            text-[var(--color-muted)]
            shadow-[var(--shadow-sm)]
            md:mt-7
            md:gap-x-9
            md:px-7
            md:py-3
            md:text-sm
          "
        >
          <span className="inline-flex items-center gap-1.5">
            <FiCheck size={15} className="text-[var(--color-primary-light)]" />
            Verified Opportunities
          </span>

          <span className="inline-flex items-center gap-1.5">
            <FiCheck size={15} className="text-[var(--color-primary-light)]" />
            Trade-Focused
          </span>

          <span className="inline-flex items-center gap-1.5">
            <FiCheck size={15} className="text-[var(--color-primary-light)]" />
            Apprenticeship Ready
          </span>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
