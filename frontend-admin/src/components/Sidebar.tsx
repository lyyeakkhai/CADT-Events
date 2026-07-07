import { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Plus,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import type { ViewType } from '../App';
import Logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  currentView: ViewType;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

const navItems = [
  { id: 'dashboard' as ViewType, label: 'Management', icon: LayoutDashboard },
  { id: 'calendar' as ViewType, label: 'Calendar', icon: Calendar },
  { id: 'create' as ViewType, label: 'Create Event', icon: Plus },
  { id: 'export' as ViewType, label: 'Export', icon: Download },
];


export default function Sidebar({ currentView, isCollapsed, setIsCollapsed }: SidebarProps) {
  const [notifCount] = useState(3);
  const navigate = useNavigate();

  return (
    <aside
      className="sidebar-root"
      style={{ width: isCollapsed ? 64 : 240 }}
    >
      {/* Brand */}
      <div className="sidebar-brand" onClick={() => navigate('/')}>
        <span className="sidebar-logo">
          <img src={Logo} alt="CADT Event Logo" className="w-full h-full object-contain" />
        </span>
        {!isCollapsed && (
          <span className="sidebar-brand-text">CADT Event</span>
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
              onClick={() => navigate(item.id === 'dashboard' ? '/' : '/' + item.id)}
              className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={19} className="sidebar-item-icon" />
              {!isCollapsed && <span className="sidebar-item-label">{item.label}</span>}
              {isActive && !isCollapsed && <span className="sidebar-active-dot" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div className="sidebar-bottom">
        {/* Notification bell */}
        <button
          className={`sidebar-item ${currentView === 'notifications' ? 'sidebar-item-active' : ''}`}
          title={isCollapsed ? 'Notifications' : undefined}
          onClick={() => navigate('/notifications')}
        >
          <Bell size={19} className="sidebar-item-icon" />
          {!isCollapsed && <span className="sidebar-item-label">Notifications</span>}
          {notifCount > 0 && <span className="sidebar-badge">{notifCount}</span>}
          {currentView === 'notifications' && !isCollapsed && <span className="sidebar-active-dot" />}
        </button>

        {/* Settings */}
        <button
          className={`sidebar-item ${currentView === 'settings' ? 'sidebar-item-active' : ''}`}
          title={isCollapsed ? 'Settings' : undefined}
          onClick={() => navigate('/settings')}
        >
          <Settings size={19} className="sidebar-item-icon" />
          {!isCollapsed && <span className="sidebar-item-label">Settings</span>}
          {currentView === 'settings' && !isCollapsed && <span className="sidebar-active-dot" />}
        </button>


        <div className="sidebar-divider" />

        {/* User */}
        <div className={`sidebar-user ${isCollapsed ? 'justify-center' : ''}`}>
          <UserButton afterSignOutUrl="http://localhost:5173" />
          {!isCollapsed && <span className="sidebar-user-label">Account</span>}
        </div>

        {/* Collapse toggle */}
        <button
          className="sidebar-collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
