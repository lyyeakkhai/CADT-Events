import { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch mock notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const dummyData: Notification[] = [
          { id: '1', title: 'New Event Registration', message: 'John Doe registered for Tech Expo.', read: false, timestamp: '10 min ago' },
          { id: '2', title: 'System Update', message: 'Maintenance scheduled for tonight at 2 AM.', read: false, timestamp: '1 hour ago' },
          { id: '3', title: 'Event Reminder', message: 'AI Ethics Seminar starts in 3 hours.', read: true, timestamp: '3 hours ago' },
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

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen((prev) => !prev)}
        className="topbar-icon-btn relative"
      >
        <Bell size={18} />
        {hasUnread && <span className="topbar-notif-dot" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[120%] mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800/50">
            <h3 className="font-bold text-white">Notifications</h3>
            {hasUnread && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <BellOff size={32} className="text-slate-500 mb-3" />
                <p className="text-slate-400 font-medium">No notifications</p>
                <p className="text-xs text-slate-500 mt-1">You're all caught up!</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-700/50">
                {notifications.map(notif => (
                  <li 
                    key={notif.id} 
                    className={`p-4 hover:bg-slate-800 transition-colors cursor-pointer ${notif.read ? 'opacity-70' : 'bg-blue-900/10'}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${notif.read ? 'bg-transparent' : 'bg-blue-500'}`}></div>
                      <div>
                        <h4 className={`text-sm ${notif.read ? 'font-medium text-slate-300' : 'font-bold text-white'}`}>{notif.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                        <span className="text-[10px] text-slate-500 mt-2 block font-medium uppercase tracking-wider">{notif.timestamp}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
