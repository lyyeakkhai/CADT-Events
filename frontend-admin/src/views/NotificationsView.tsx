import { useState, useEffect } from 'react';
import { Bell, BellOff, Check, Clock, CalendarDays, AlertTriangle } from 'lucide-react';
import type { ViewType } from '../App';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  type: 'alert' | 'event' | 'system';
}

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch mock notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const dummyData: Notification[] = [
          { id: '1', title: 'New Event Registration', message: 'John Doe registered for Tech Expo.', read: false, timestamp: '10 min ago', type: 'event' },
          { id: '2', title: 'System Update', message: 'Maintenance scheduled for tonight at 2 AM.', read: false, timestamp: '1 hour ago', type: 'system' },
          { id: '3', title: 'Event Reminder', message: 'AI Ethics Seminar starts in 3 hours.', read: true, timestamp: '3 hours ago', type: 'alert' },
          { id: '4', title: 'New Feedback', message: '5 new reviews received for "Cloud Computing 101".', read: true, timestamp: '1 day ago', type: 'event' },
        ];
        
        setNotifications(dummyData);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const hasUnread = notifications.some(n => !n.read);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'event': return <CalendarDays size={18} className="text-blue-400" />;
      case 'alert': return <AlertTriangle size={18} className="text-amber-400" />;
      case 'system': return <Bell size={18} className="text-emerald-400" />;
      default: return <Bell size={18} className="text-slate-400" />;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-slate-400">Stay updated on your system and events.</p>
        </div>
        
        {hasUnread && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors border border-slate-700 font-medium"
          >
            <Check size={16} /> Mark all as read
          </button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-slate-400">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <BellOff size={32} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No notifications</h3>
            <p className="text-slate-400">You're all caught up! Check back later.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-800">
            {notifications.map(notif => (
              <li 
                key={notif.id} 
                onClick={() => markAsRead(notif.id)}
                className={`p-5 transition-colors cursor-pointer group flex gap-4 ${
                  notif.read ? 'bg-slate-900 hover:bg-slate-800/50' : 'bg-blue-900/10 hover:bg-blue-900/20'
                }`}
              >
                <div className={`mt-1 p-2 rounded-xl flex-shrink-0 border ${
                  notif.read ? 'bg-slate-800 border-slate-700' : 'bg-blue-900/40 border-blue-700/50'
                }`}>
                  {getIcon(notif.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-base ${notif.read ? 'font-medium text-slate-300' : 'font-bold text-white'}`}>
                      {notif.title}
                    </h4>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded-md">
                      <Clock size={12} /> {notif.timestamp}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${notif.read ? 'text-slate-400' : 'text-slate-300'}`}>
                    {notif.message}
                  </p>
                </div>
                
                {!notif.read && (
                  <div className="flex items-center justify-center pl-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
