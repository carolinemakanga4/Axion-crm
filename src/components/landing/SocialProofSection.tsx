import React from "react";

const companies = [
  "Northstar Ventures",
  "Pulse Metrics",
  "Cloudline",
  "Vertex Labs",
  "ScaleBridge",
  "Finspire",
];

export const SocialProofSection: React.FC = () => {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-7xl rounded-2xl border border-white/10 bg-white/5 px-6 py-6 backdrop-blur">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-slate-400">
          Trusted by revenue teams worldwide
        </p>
        <div className="mt-5 grid grid-cols-2 gap-5 text-center sm:grid-cols-3 lg:grid-cols-6">
          {companies.map((company) => (
            <span
              key={company}
              className="text-sm font-medium text-slate-300 transition hover:text-cyan-100"
            >
              {company}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
