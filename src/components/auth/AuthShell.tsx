import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ShieldCheck } from "lucide-react";

type AuthShellProps = {
  title: string;
  description: string;
  alternateText: string;
  alternateLinkLabel: string;
  alternateLinkTo: string;
  icon: ReactNode;
  children: ReactNode;
};

const highlights = [
  "Pipeline and customer records in one secure workspace",
  "Real-time reporting dashboards for every revenue team",
  "Role-based access and enterprise-grade data protection",
];

export const AuthShell = ({
  title,
  description,
  alternateText,
  alternateLinkLabel,
  alternateLinkTo,
  icon,
  children,
}: AuthShellProps) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_40%),radial-gradient(circle_at_75%_20%,rgba(59,130,246,0.2),transparent_34%),linear-gradient(to_bottom,#020617,#020617)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-500/15 blur-[120px]" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <section className="hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur lg:block">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-300 to-blue-500 text-base font-bold text-slate-950 shadow-lg shadow-cyan-500/25">
              A
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">
              Axion CRM
            </span>
          </Link>

          <h1 className="mt-8 text-4xl font-semibold leading-tight tracking-tight text-white">
            Accelerate your revenue operations with one intelligent CRM.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-300">
            Built for modern sales teams that need better visibility, better
            automation, and faster execution.
          </p>

          <div className="mt-8 rounded-2xl border border-cyan-300/20 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
              What you get
            </p>
            <ul className="mt-4 space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-cyan-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="w-full rounded-3xl border border-white/10 bg-slate-900/65 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl sm:p-8">
          <Link to="/" className="inline-flex items-center gap-3 lg:hidden">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-300 to-blue-500 text-sm font-bold text-slate-950">
              A
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">
              Axion CRM
            </span>
          </Link>

          <div className="mt-5 flex items-center justify-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-400/10 text-cyan-100">
              {icon}
            </span>
          </div>
          <h2 className="mt-5 text-center text-3xl font-semibold tracking-tight text-white">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-300">{description}</p>
          <p className="mt-2 text-center text-sm text-slate-400">
            {alternateText}{" "}
            <Link
              to={alternateLinkTo}
              className="font-medium text-cyan-200 transition hover:text-cyan-100"
            >
              {alternateLinkLabel}
            </Link>
          </p>
          <p className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-xs text-emerald-200">
            <ShieldCheck className="h-4 w-4" />
            Secure authentication powered by Supabase
          </p>

          <div className="mt-6">{children}</div>
        </section>
      </div>
    </div>
  );
};
