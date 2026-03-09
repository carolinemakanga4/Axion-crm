import { useState, ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from './Toast';

interface MainLayoutProps {
  children: ReactNode;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const MainLayout = ({
  children,
  showSearch = false,
  searchQuery,
  onSearchChange,
}: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_32%),radial-gradient(circle_at_80%_8%,rgba(59,130,246,0.18),transparent_34%),linear-gradient(to_bottom,#020617,#020617)]" />
      <Sidebar />
      <div className="relative flex w-0 flex-1 flex-col overflow-hidden md:pl-72">
        <Topbar
          onMenuClick={() => setSidebarOpen((open) => !open)}
          showSearch={showSearch}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6 sm:py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
      </div>
      <ToastContainer />

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0">
            <Sidebar mobile onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
