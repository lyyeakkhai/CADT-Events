import { Search, Bell } from 'lucide-react';
import type { ViewType } from '../App';

interface TopBarProps {
  currentView: ViewType;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setCurrentView: (v: ViewType) => void;
  sidebarWidth: number;
}

const viewTitles: Record<ViewType, string> = {
  dashboard: 'Management',
  calendar: 'Calendar',
  create: 'Create Event',
  export: 'Data Export',
  settings: 'Settings',
};

const viewBreadcrumb: Record<ViewType, string[]> = {
  dashboard: ['Dashboard', 'Overview'],
  calendar: ['Dashboard', 'Calendar'],
  create: ['Events', 'Create'],
  export: ['Data', 'Export'],
  settings: ['Dashboard', 'Settings'],
};

export default function TopBar({ currentView, searchQuery, setSearchQuery, setCurrentView, sidebarWidth }: TopBarProps) {
  return (
    <header className="topbar-root" style={{ left: sidebarWidth, transition: 'left 0.22s cubic-bezier(.4,0,.2,1)' }}>
      {/* Breadcrumb + Title */}
      <div className="topbar-title-block">
        <nav className="topbar-breadcrumb">
          {viewBreadcrumb[currentView].map((crumb, i, arr) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className={i === arr.length - 1 ? 'topbar-breadcrumb-active' : 'topbar-breadcrumb-item'}>
                {crumb}
              </span>
              {i < arr.length - 1 && <span className="topbar-breadcrumb-sep">/</span>}
            </span>
          ))}
        </nav>
        <h1 className="topbar-title">{viewTitles[currentView]}</h1>
      </div>

      {/* Right controls */}
      <div className="topbar-actions">
        {/* Search */}
        <div className="topbar-search">
          <Search className="topbar-search-icon" size={15} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentView !== 'dashboard') setCurrentView('dashboard');
            }}
            className="topbar-search-input"
          />
        </div>

        {/* Notification bell */}
        <button className="topbar-icon-btn relative">
          <Bell size={18} />
          <span className="topbar-notif-dot" />
        </button>
      </div>
    </header>
  );
}
