import React from "react";
import { ChevronRight } from "lucide-react";

type LandingHeaderProps = {
  onGetDemo: () => void;
  onGetStarted: () => void;
};

const navLinks = ["Features", "Pricing", "Resources"];

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onGetDemo,
  onGetStarted,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button
          onClick={onGetStarted}
          className="group inline-flex items-center gap-3 text-left"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-base font-bold text-slate-950 shadow-lg shadow-cyan-500/30">
            A
          </span>
          <span className="text-sm font-semibold tracking-wide text-white">
            Axion CRM
          </span>
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onGetDemo}
            className="hidden rounded-xl border border-cyan-300/30 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-200/60 hover:text-white sm:inline-flex"
          >
            Get a demo
          </button>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:from-cyan-300 hover:to-blue-400"
          >
            Get started free
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
