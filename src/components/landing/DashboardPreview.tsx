import React from "react";
import { Activity, DollarSign, Users } from "lucide-react";

const stats = [
  {
    label: "Pipeline Revenue",
    value: "$94.2K",
    delta: "+18.4%",
    icon: DollarSign,
  },
  {
    label: "Active Clients",
    value: "1,284",
    delta: "+9.2%",
    icon: Users,
  },
  {
    label: "Conversion Rate",
    value: "38.6%",
    delta: "+5.1%",
    icon: Activity,
  },
];

export const DashboardPreview: React.FC = () => {
  return (
    <div className="relative isolate rounded-3xl border border-cyan-300/20 bg-slate-900/70 p-5 shadow-2xl shadow-cyan-900/30 backdrop-blur-xl sm:p-6">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Team Performance
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              Q1 Sales Dashboard
            </p>
          </div>
          <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
            Live
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map(({ label, value, delta, icon: Icon }) => (
            <article
              key={label}
              className="rounded-2xl border border-white/10 bg-slate-950/70 p-3"
            >
              <div className="mb-2 inline-flex rounded-lg border border-cyan-300/30 bg-cyan-400/10 p-1.5 text-cyan-200">
                <Icon size={15} />
              </div>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-1 text-lg font-semibold text-white">{value}</p>
              <p className="text-xs font-medium text-emerald-300">{delta}</p>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-[1.3fr_1fr] gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <p className="text-xs text-slate-400">Monthly Deals</p>
            <div className="mt-3 flex h-24 items-end gap-2">
              {[24, 40, 32, 58, 63, 52, 74].map((height, index) => (
                <div
                  key={index}
                  className="w-full rounded-md bg-gradient-to-t from-blue-500/40 to-cyan-300/90"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <p className="text-xs text-slate-400">Goal Completion</p>
            <div className="mt-4 space-y-2">
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-cyan-300 to-blue-500" />
              </div>
              <p className="text-2xl font-semibold text-white">82%</p>
              <p className="text-xs text-slate-400">Quota progress this month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
