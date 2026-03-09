import React from "react";

const metrics = [
  { label: "Higher team productivity", value: "43%" },
  { label: "Faster deal cycle time", value: "31%" },
  { label: "Forecast accuracy uplift", value: "27%" },
  { label: "Pipeline growth in 90 days", value: "2.4x" },
];

export const BenefitsSection: React.FC = () => {
  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-950/40 to-cyan-900/20 p-8 backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-cyan-200">
            Why teams switch to Axion CRM
          </p>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            Drive predictable growth with better visibility and execution
          </h3>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Replace scattered tools with one CRM that aligns marketing, sales,
            and operations. Axion CRM helps teams make faster decisions and act
            on the right opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur"
            >
              <p className="text-3xl font-semibold text-cyan-200">
                {metric.value}
              </p>
              <p className="mt-2 text-sm text-slate-300">{metric.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
