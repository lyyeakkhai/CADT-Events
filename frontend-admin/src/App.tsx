/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
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

export type ViewType = 'dashboard' | 'export' | 'calendar' | 'create' | 'settings' | 'notifications' | 'users';

const SIDEBAR_W = 240;
const SIDEBAR_W_COLLAPSED = 64;

function AdminApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const path = location.pathname.split('/')[1] || '';
  const validPaths = ['export', 'calendar', 'create', 'settings', 'notifications', 'events', 'users'];
  const currentView: ViewType = (validPaths.includes(path) ? path : 'dashboard') as ViewType;

  const sidebarWidth = isCollapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;

  return (
    <div className="admin-shell">
      <Sidebar
        currentView={currentView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="admin-content" style={{ marginLeft: sidebarWidth }}>
        <TopBar
          currentView={currentView}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sidebarWidth={sidebarWidth}
        />

        {/* Session ribbon — matches user frontend */}
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
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Active Workspace:{' '}
              <span style={{ color: '#fbbf24' }} className="uppercase tracking-wider">Admin Control Node</span>
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
