import React from "react";
import {
  Bot,
  FolderKanban,
  LineChart,
  ShieldCheck,
  TimerReset,
  UsersRound,
} from "lucide-react";

const featureCards = [
  {
    icon: UsersRound,
    title: "Smart Customer Profiles",
    description:
      "Track every conversation, touchpoint, and account detail in one unified workspace.",
  },
  {
    icon: LineChart,
    title: "Real-Time Pipeline Visibility",
    description:
      "See deal stages, win rates, and weighted forecasts with live reporting widgets.",
  },
  {
    icon: Bot,
    title: "Automated Follow-Ups",
    description:
      "Build no-code outreach sequences and reminders to keep opportunities moving.",
  },
  {
    icon: FolderKanban,
    title: "Project + Sales Alignment",
    description:
      "Convert closed deals into delivery workflows so handoffs stay smooth and fast.",
  },
  {
    icon: TimerReset,
    title: "Task Prioritization",
    description:
      "Surface highest-impact actions for each rep to improve focus and close velocity.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Default",
    description:
      "Role-based permissions and enterprise-grade safeguards protect your customer data.",
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.15em] text-cyan-200">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Everything your CRM needs to scale revenue with confidence
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {featureCards.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="group rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-slate-900"
            >
              <div className="inline-flex rounded-xl border border-cyan-300/30 bg-cyan-500/10 p-2.5 text-cyan-200 transition group-hover:border-cyan-200/50 group-hover:bg-cyan-400/20">
                <Icon size={18} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
