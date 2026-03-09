import React from "react";

type FinalCtaSectionProps = {
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
};

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({
  onPrimaryClick,
  onSecondaryClick,
}) => {
  return (
    <section className="px-6 pb-20 pt-10">
      <div className="mx-auto max-w-7xl rounded-3xl border border-cyan-300/20 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-slate-900 p-8 text-center shadow-2xl shadow-cyan-950/30 sm:p-12">
        <h3 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Built to help you close more, faster
        </h3>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
          Join teams using Axion CRM to centralize customer data, improve
          productivity, and unlock consistent growth.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onPrimaryClick}
            className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:from-cyan-300 hover:to-blue-400"
          >
            Get started free
          </button>
          <button
            onClick={onSecondaryClick}
            className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10"
          >
            Get a demo
          </button>
        </div>
      </div>
    </section>
  );
};
