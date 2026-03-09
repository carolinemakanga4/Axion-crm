import React from "react";
import { PlayCircle } from "lucide-react";
import { DashboardPreview } from "./DashboardPreview";

type HeroSectionProps = {
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  onPrimaryClick,
  onSecondaryClick,
}) => {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-14 sm:pb-28 sm:pt-20">
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />
      <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-blue-600/20 blur-[130px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-100">
            Revenue Intelligence Platform
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Boost Sales With Our
            <span className="block bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">
              Cutting-Edge CRM Solution
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Centralize your pipeline, automate follow-ups, and forecast revenue
            with a CRM built for modern, fast-moving teams.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onPrimaryClick}
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:from-cyan-300 hover:to-blue-400"
            >
              Get started free
            </button>
            <button
              onClick={onSecondaryClick}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10"
            >
              <PlayCircle size={17} />
              Book a live demo
            </button>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            No credit card required. Setup in minutes.
          </p>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
};
