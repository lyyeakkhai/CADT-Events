import { useState, useEffect } from 'react';
import { Search, ChevronDown, MoreHorizontal, AlertTriangle, BellOff, Loader2 } from 'lucide-react';
import apiClient from '../lib/apiClient';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  type: 'alert' | 'event' | 'system';
  severity?: 'critical' | 'warning' | 'info';
}

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch mock notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get('/notifications/admin');
        setNotifications(res.data.data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filteredNotifications = notifications
    .filter(n => activeTab === 'unread' ? !n.read : n.read)
    .filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.message.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 w-full min-h-screen text-slate-900 animate-fade-in font-sans">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-slate-900 mb-6 tracking-tight">Notifications</h1>
        
        {/* Tabs */}
        <div className="flex gap-6 border-b border-slate-200">
          <button 
            className={`pb-3 text-[14px] font-medium transition-colors relative ${
              activeTab === 'unread' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('unread')}
          >
            Unread
            {activeTab === 'unread' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></div>
            )}
          </button>
          <button 
            className={`pb-3 text-[14px] font-medium transition-colors relative ${
              activeTab === 'read' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('read')}
          >
            Read
            {activeTab === 'read' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input 
            type="text" 
            placeholder="Search for notification" 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-[8px] text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            Date and time <ChevronDown size={14} className="text-slate-500" />
          </button>
          <button 
            onClick={markAllAsRead}
            className="px-3 py-2 bg-white border border-slate-200 rounded-[8px] text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-500 text-sm">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <h3 className="text-base font-medium text-red-600 mb-1">{error}</h3>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <BellOff size={24} className="text-slate-300" />
            </div>
            <h3 className="text-base font-medium text-slate-900 mb-1">No {activeTab} notifications</h3>
            <p className="text-sm text-slate-500">You're all caught up!</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredNotifications.map((notif) => (
              <li 
                key={notif.id}
                className="flex items-center gap-4 py-4 px-2 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                onClick={() => !notif.read && markAsRead(notif.id)}
              >
                {/* Unread indicator */}
                <div className="w-3 flex-shrink-0 flex justify-center">
                  {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className={`text-[14px] mb-0.5 truncate ${!notif.read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                    {notif.title}
                  </h4>
                  <p className="text-[13px] text-slate-500 truncate">
                    {notif.message}
                  </p>
                </div>

                {/* Meta details */}
                <div className="flex items-center flex-shrink-0">
                  {notif.severity === 'critical' ? (
                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-700 w-40">
                      <AlertTriangle size={14} className="text-slate-900" />
                      Critical Blocker
                    </div>
                  ) : (
                    <div className="w-40"></div>
                  )}
                  
                  <div className="text-[13px] text-slate-500 w-28">
                    {notif.timestamp}
                  </div>
                  
                  <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 ml-2">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
