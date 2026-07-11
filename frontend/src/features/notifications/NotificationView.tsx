import React, { useEffect, useState } from 'react';
import { useNotificationsApi, type ApiNotification } from '../../services/api';
import { Bell, Check, Loader2, CheckCircle2 } from 'lucide-react';

export default function NotificationView() {
  const { getMyNotifications, markAsRead } = useNotificationsApi();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getMyNotifications();
      setNotifications(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    for (const n of unread) {
      await handleMarkAsRead(n.id);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow w-full max-w-4xl mx-auto px-4 py-10 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#0b2c6a] animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0b2c6a] flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notifications
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Stay updated with your event activities and announcements.
          </p>
        </div>
        
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#0b2c6a] transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6">
          {error}
        </div>
      ) : null}

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No Notifications Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            You're all caught up! When there are important updates about your bookings or events, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-5 rounded-2xl border transition-all ${
                notification.isRead 
                  ? 'bg-white border-slate-200 text-slate-600' 
                  : 'bg-blue-50/50 border-[#0b2c6a]/20 shadow-sm text-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {!notification.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shadow-sm" />
                    )}
                    <h4 className={`text-[15px] font-bold ${!notification.isRead ? 'text-[#0b2c6a]' : 'text-slate-700'}`}>
                      {notification.title}
                    </h4>
                  </div>
                  <p className={`text-sm leading-relaxed mb-3 ${notification.isRead ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                    {notification.event && (
                      <>
                        <span>•</span>
                        <span className="text-amber-600">{notification.event.title}</span>
                      </>
                    )}
                  </div>
                </div>
                
                {!notification.isRead && (
                  <button 
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="shrink-0 p-2 text-slate-400 hover:text-[#0b2c6a] hover:bg-white rounded-full transition-colors tooltip-trigger"
                    title="Mark as read"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
