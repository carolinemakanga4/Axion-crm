import { Link, useLocation } from "react-router-dom";
import {
  FileText,
  FolderKanban,
  LayoutDashboard,
  Settings,
  StickyNote,
  Users,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/axion-logo.png";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Notes", href: "/notes", icon: StickyNote },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export const Sidebar = ({ mobile = false, onNavigate }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const displayName = user?.profile?.full_name || user?.email || "Axion User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={`${
        mobile ? "flex h-full w-72" : "hidden md:fixed md:inset-y-0 md:flex md:w-72"
      }`}
    >
      <div className="relative flex min-h-0 flex-1 flex-col border-r border-white/10 bg-slate-950/95 backdrop-blur-xl">
        <div className="pointer-events-none absolute left-8 top-4 h-28 w-28 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-14 left-10 h-24 w-24 rounded-full bg-blue-500/15 blur-2xl" />

        <div className="relative flex flex-1 flex-col overflow-y-auto px-4 pb-4 pt-5">
          <div className="flex items-center px-2">
            <div className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
              <img src={logo} alt="axion-logo" className="h-10 w-10 object-contain" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Axion</p>
                <p className="text-base font-semibold text-white">CRM Platform</p>
              </div>
            </div>
          </div>

          <div className="mt-6 px-2">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Workspace</p>
          </div>

          <nav className="mt-3 flex-1 space-y-1.5 px-2">
            {navigation.map((item) => {
              const isActive =
                location.pathname === item.href ||
                location.pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onNavigate}
                  className={`${
                    isActive
                      ? "border-cyan-300/35 bg-gradient-to-r from-cyan-400/20 to-blue-500/10 text-white shadow-lg shadow-cyan-950/30"
                      : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
                  } group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition`}
                >
                  <item.icon
                    className={`${
                      isActive
                        ? "text-cyan-200"
                        : "text-slate-500 group-hover:text-cyan-200"
                    } h-5 w-5 flex-shrink-0 transition`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="relative border-t border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/70 p-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-300 to-blue-500 text-xs font-semibold text-slate-950">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{displayName}</p>
              <p className="truncate text-xs capitalize text-slate-400">
                {user?.profile?.role || "user"}
              </p>
            </div>
            <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-cyan-200">
              Live
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
