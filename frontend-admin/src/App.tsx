/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardView from './views/DashboardView';
import ExportView from './views/ExportView';
import CalendarView from './views/CalendarView';
import CreateEventView from './views/CreateEventView';
import ProtectedRoute from './components/ProtectedRoute';
import SettingsView from './views/SettingsView';
import NotificationsView from './views/NotificationsView';

export type ViewType = 'dashboard' | 'export' | 'calendar' | 'create' | 'settings' | 'notifications';

const SIDEBAR_W = 240;
const SIDEBAR_W_COLLAPSED = 64;

function AdminApp() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarWidth = isCollapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;

  return (
    <div className="admin-shell">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="admin-content" style={{ marginLeft: sidebarWidth }}>
        <TopBar
          currentView={currentView}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setCurrentView={setCurrentView}
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
          {currentView === 'dashboard' && <DashboardView onNavigate={setCurrentView} searchQuery={searchQuery} />}
          {currentView === 'export' && <ExportView onNavigate={setCurrentView} />}
          {currentView === 'calendar' && <CalendarView onNavigate={setCurrentView} />}
          {currentView === 'create' && <CreateEventView onNavigate={setCurrentView} />}
          {currentView === 'settings' && <SettingsView onNavigate={setCurrentView} />}
          {currentView === 'notifications' && <NotificationsView />}

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
