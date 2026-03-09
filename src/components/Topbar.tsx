import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TopbarProps {
  onMenuClick: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
}

export const Topbar = ({ onMenuClick, searchQuery, onSearchChange, showSearch = false }: TopbarProps) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const displayName = user?.profile?.full_name || user?.email || 'there';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-white/10 bg-slate-950/75 px-4 backdrop-blur-xl sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 rounded-lg p-2.5 text-slate-300 transition hover:bg-white/5 hover:text-white lg:hidden"
        onClick={() => {
          onMenuClick();
          setIsMobileMenuOpen(!isMobileMenuOpen);
        }}
      >
        <span className="sr-only">Open sidebar</span>
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Menu className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="hidden min-w-0 flex-1 items-center lg:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Revenue Ops</p>
            <p className="truncate text-sm font-medium text-slate-100">
              Welcome back, {displayName}
            </p>
          </div>
        </div>
        {showSearch && onSearchChange && (
          <form className="relative flex flex-1" action="#" method="GET">
            <label htmlFor="search-field" className="sr-only">
              Search
            </label>
            <Search
              className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 pl-3 text-slate-500"
              aria-hidden="true"
            />
            <input
              id="search-field"
              className="block h-11 w-full rounded-xl border border-white/10 bg-white/5 py-0 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
              placeholder="Search..."
              type="search"
              name="search"
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </form>
        )}
      </div>

      <div className="flex items-center gap-x-4 lg:gap-x-6">
        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-white/10" aria-hidden="true" />
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="hidden lg:block">
            <span className="text-sm text-slate-300">
              {displayName}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/40 hover:bg-cyan-300/15"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
