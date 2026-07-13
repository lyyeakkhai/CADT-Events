import { Search, Bell, Menu } from 'lucide-react';
import type { ViewType } from '../App';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  currentView: ViewType;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sidebarWidth: number;
  isMobile?: boolean;
  onMenuClick?: () => void;
}

const viewTitles: Record<ViewType, string> = {
  dashboard: 'Management',
  calendar: 'Calendar',
  create: 'Create Event',
  export: 'Data Export',
  settings: 'Settings',
  notifications: 'Activity',
  users: 'User Management',
  events: 'Event Details',
};

const viewBreadcrumb: Record<ViewType, string[]> = {
  dashboard: ['Dashboard', 'Overview'],
  calendar: ['Dashboard', 'Calendar'],
  create: ['Events', 'Create'],
  export: ['Data', 'Export'],
  settings: ['Dashboard', 'Settings'],
  notifications: ['Dashboard', 'Activity'],
  users: ['Dashboard', 'Users'],
  events: ['Dashboard', 'Events', 'Detail'],
};

export default function TopBar({
  currentView,
  searchQuery,
  setSearchQuery,
  sidebarWidth,
  isMobile = false,
  onMenuClick,
}: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header
      className="topbar-root"
      style={{ left: sidebarWidth, transition: 'left 0.22s cubic-bezier(.4,0,.2,1)' }}
    >
      <div className="topbar-left">
        {isMobile && (
          <button
            type="button"
            className="topbar-menu-btn"
            aria-label="Open navigation menu"
            onClick={onMenuClick}
          >
            <Menu size={22} />
          </button>
        )}

        <div className="topbar-title-block">
          <nav className="topbar-breadcrumb hidden sm:flex">
            {viewBreadcrumb[currentView].map((crumb, i, arr) => (
              <span key={i} className="flex items-center gap-1.5">
                <span
                  className={
                    i === arr.length - 1
                      ? 'topbar-breadcrumb-active'
                      : 'topbar-breadcrumb-item'
                  }
                >
                  {crumb}
                </span>
                {i < arr.length - 1 && <span className="topbar-breadcrumb-sep">/</span>}
              </span>
            ))}
          </nav>
          <h1 className="topbar-title">{viewTitles[currentView]}</h1>
        </div>
      </div>

      <div className="topbar-actions">
        <div className="topbar-search">
          <Search className="topbar-search-icon" size={15} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentView !== 'dashboard') navigate('/');
            }}
            className="topbar-search-input"
          />
        </div>

        <button
          type="button"
          className="topbar-icon-btn relative"
          onClick={() => navigate('/notifications')}
          aria-label="Activity"
        >
          <Bell size={18} />
          <span className="topbar-notif-dot" />
        </button>
      </div>
    </header>
  );
}
