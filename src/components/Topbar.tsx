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

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
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
        {showSearch && onSearchChange && (
          <form className="relative flex flex-1" action="#" method="GET">
            <label htmlFor="search-field" className="sr-only">
              Search
            </label>
            <Search
              className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 pl-3"
              aria-hidden="true"
            />
            <input
              id="search-field"
              className="block h-full w-full border-0 py-0 pl-10 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
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
        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="hidden lg:block">
            <span className="text-sm text-gray-700">
              {user?.profile?.full_name || user?.email}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
