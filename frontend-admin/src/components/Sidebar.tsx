import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Plus,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Users,
  X,
} from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import type { ViewType } from '../App';
// Same CADT anniversary logo as student frontend navbar
import Logo from '../assets/CADT10-LOGO-anniversary-03.png';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient';

interface SidebarProps {
  currentView: ViewType;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  mobileOpen?: boolean;
  isMobile?: boolean;
  onNavigate?: () => void;
}

const navItems = [
  { id: 'dashboard' as ViewType, label: 'Management', icon: LayoutDashboard },
  { id: 'users' as ViewType, label: 'Users', icon: Users },
  { id: 'calendar' as ViewType, label: 'Calendar', icon: Calendar },
  { id: 'create' as ViewType, label: 'Create Event', icon: Plus },
  { id: 'export' as ViewType, label: 'Export', icon: Download },
];

export default function Sidebar({
  currentView,
  isCollapsed,
  setIsCollapsed,
  mobileOpen = false,
  isMobile = false,
  onNavigate,
}: SidebarProps) {
  const [notifCount, setNotifCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get('/notifications/admin');
        const list: { timestamp?: string }[] = res.data?.data || [];
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const recent = list.filter((n) => {
          const t = n.timestamp ? new Date(n.timestamp).getTime() : 0;
          return t >= dayAgo;
        }).length;
        if (!cancelled) setNotifCount(Math.min(recent, 9));
      } catch {
        if (!cancelled) setNotifCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentView]);

  const go = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const showLabels = isMobile || !isCollapsed;
  const width = isMobile ? 280 : isCollapsed ? 64 : 240;

  return (
    <aside
      className={`sidebar-root ${isMobile ? 'sidebar-mobile' : ''} ${
        isMobile && mobileOpen ? 'sidebar-mobile-open' : ''
      } ${isMobile && !mobileOpen ? 'sidebar-mobile-closed' : ''}`}
      style={{ width }}
      aria-hidden={isMobile && !mobileOpen}
    >
      {/* Brand — same CADT logo treatment as student portal */}
      <div
        className={`sidebar-brand ${showLabels ? 'sidebar-brand-expanded' : 'sidebar-brand-collapsed'}`}
        onClick={() => go('/')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            go('/');
          }
        }}
        aria-label="CADT Events admin home"
      >
        <span className="sidebar-logo">
          <img src={Logo} alt="CADT Events" className="sidebar-logo-img" />
        </span>
        {showLabels && (
          <span className="sidebar-brand-text">
            CADT Events
            <span className="sidebar-brand-sub">Admin</span>
          </span>
        )}
        {isMobile && (
          <button
            type="button"
            className="sidebar-mobile-close"
            aria-label="Close menu"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate?.();
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id === 'dashboard' ? '/' : '/' + item.id)}
              className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
              title={!showLabels ? item.label : undefined}
            >
              <Icon size={19} className="sidebar-item-icon" />
              {showLabels && <span className="sidebar-item-label">{item.label}</span>}
              {isActive && showLabels && <span className="sidebar-active-dot" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div className="sidebar-bottom">
        <button
          type="button"
          className={`sidebar-item ${currentView === 'notifications' ? 'sidebar-item-active' : ''}`}
          title={!showLabels ? 'Activity' : undefined}
          onClick={() => go('/notifications')}
        >
          <Bell size={19} className="sidebar-item-icon" />
          {showLabels && <span className="sidebar-item-label">Activity</span>}
          {notifCount > 0 && <span className="sidebar-badge">{notifCount}</span>}
          {currentView === 'notifications' && showLabels && (
            <span className="sidebar-active-dot" />
          )}
        </button>

        <button
          type="button"
          className={`sidebar-item ${currentView === 'settings' ? 'sidebar-item-active' : ''}`}
          title={!showLabels ? 'Settings' : undefined}
          onClick={() => go('/settings')}
        >
          <Settings size={19} className="sidebar-item-icon" />
          {showLabels && <span className="sidebar-item-label">Settings</span>}
          {currentView === 'settings' && showLabels && <span className="sidebar-active-dot" />}
        </button>

        <div className="sidebar-divider" />

        <div className={`sidebar-user ${!showLabels ? 'justify-center' : ''}`}>
          <UserButton afterSignOutUrl="/" />
          {showLabels && <span className="sidebar-user-label">Account</span>}
        </div>

        {!isMobile && (
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>
    </aside>
  );
}
