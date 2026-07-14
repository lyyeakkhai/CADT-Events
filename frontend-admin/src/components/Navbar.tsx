import { School, Search, Bell, Settings } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import type { ViewType } from '../App';
import { USER_FRONTEND_URL } from '../lib/urls';

interface NavbarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Navbar({ currentView, setCurrentView, searchQuery, setSearchQuery }: NavbarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Management' },
    { id: 'export', label: 'Export' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'create', label: 'Create Event' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 glass-nav shadow-sm h-16 flex items-center">
      <div className="flex justify-between items-center px-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <School size={20} />
            </span>
            <span className="text-xl font-bold tracking-tight text-primary">CADT Event Central</span>
          </div>
          
          <nav className="hidden md:flex gap-6 ml-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as ViewType)}
                className={`text-sm font-medium transition-colors border-b-2 pb-1 ${
                  currentView === item.id 
                    ? 'text-primary border-primary font-bold' 
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentView !== 'dashboard') {
                  setCurrentView('dashboard');
                }
              }}
              className="pl-9 pr-4 py-1.5 bg-surface-container-low border border-outline-variant rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm w-64 transition-all"
            />
          </div>
          <button className="relative p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-all">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border border-white"></span>
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-all">
            <Settings size={20} />
          </button>
          <UserButton afterSignOutUrl={USER_FRONTEND_URL} />
        </div>
      </div>
    </header>
  );
}
