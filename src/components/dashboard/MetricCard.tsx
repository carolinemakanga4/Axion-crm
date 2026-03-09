import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  accent: string;
}

export const MetricCard = ({ label, value, detail, icon: Icon, accent }: MetricCardProps) => {
  return (
    <article className="group rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/40 backdrop-blur transition hover:-translate-y-1 hover:border-cyan-300/30">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          <p className="mt-2 text-xs text-slate-400">{detail}</p>
        </div>
        <span className={`inline-flex rounded-xl border border-white/15 p-2.5 ${accent}`}>
          <Icon className="h-5 w-5 text-white" />
        </span>
      </div>
    </article>
  );
};
