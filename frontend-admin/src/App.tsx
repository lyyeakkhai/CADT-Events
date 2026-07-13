/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardView from './views/DashboardView';
import ExportView from './views/ExportView';
import CalendarView from './views/CalendarView';
import CreateEventView from './views/CreateEventView';
import ProtectedRoute from './components/ProtectedRoute';
import SettingsView from './views/SettingsView';
import NotificationsView from './views/NotificationsView';
import EventDetailView from './views/EventDetailView';
import UsersView from './views/UsersView';

export type ViewType =
  | 'dashboard'
  | 'export'
  | 'calendar'
  | 'create'
  | 'settings'
  | 'notifications'
  | 'users'
  | 'events';

const SIDEBAR_W = 240;
const SIDEBAR_W_COLLAPSED = 64;
const MOBILE_BP = 1024; // lg

function useIsMobile(breakpoint = MOBILE_BP) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);

  return isMobile;
}

function AdminApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  const path = location.pathname.split('/')[1] || '';
  const validPaths = ['export', 'calendar', 'create', 'settings', 'notifications', 'events', 'users'];
  const currentView: ViewType = (validPaths.includes(path) ? path : 'dashboard') as ViewType;

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    if (isMobile && mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, mobileNavOpen]);

  const sidebarWidth = isMobile ? 0 : isCollapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;

  return (
    <div className={`admin-shell ${isMobile ? 'admin-shell-mobile' : ''}`}>
      {/* Mobile backdrop */}
      {isMobile && mobileNavOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <Sidebar
        currentView={currentView}
        isCollapsed={isMobile ? false : isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileNavOpen}
        isMobile={isMobile}
        onNavigate={() => setMobileNavOpen(false)}
      />

      <div
        className="admin-content"
        style={{
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.22s cubic-bezier(.4,0,.2,1)',
        }}
      >
        <TopBar
          currentView={currentView}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sidebarWidth={sidebarWidth}
          isMobile={isMobile}
          onMenuClick={() => setMobileNavOpen((o) => !o)}
        />

        {/* Session ribbon — hide text on very small screens */}
        <div
          className="session-ribbon"
          style={{
            position: 'fixed',
            top: 56,
            left: sidebarWidth,
            right: 0,
            zIndex: 39,
            transition: 'left 0.22s cubic-bezier(.4,0,.2,1)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">
              Active Workspace:{' '}
              <span style={{ color: '#fbbf24' }} className="uppercase tracking-wider">
                Admin
              </span>
            </span>
          </div>
        </div>

        <main className="admin-main" style={{ paddingTop: 80 }}>
          <Routes>
            <Route path="/" element={<DashboardView searchQuery={searchQuery} />} />
            <Route path="/export" element={<ExportView />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/create" element={<CreateEventView />} />
            <Route path="/events/:id" element={<EventDetailView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/notifications" element={<NotificationsView />} />
            <Route path="/users" element={<UsersView />} />
            <Route path="*" element={<DashboardView searchQuery={searchQuery} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <AdminApp />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
