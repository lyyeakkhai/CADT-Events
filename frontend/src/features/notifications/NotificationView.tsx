import React, { useEffect, useState } from 'react';
import { useNotificationsApi, type ApiNotification } from '../../services/api';
import { Bell, Check, Loader2, CheckCircle2, Send, ChevronRight } from 'lucide-react';
import TelegramConnectPrompt from '../../components/TelegramConnectPrompt';
import { getEvent, type ApiEvent } from '../../services/api';
import { toAcademicEvent } from '../../lib/eventMapper';
import type { AcademicEvent } from '../events/data/eventData';

interface NotificationViewProps {
  /** Opens event detail when a notification is linked to an event. */
  onSelectEvent?: (event: AcademicEvent) => void;
}

export default function NotificationView({ onSelectEvent }: NotificationViewProps) {
  const { getMyNotifications, markAsRead } = useNotificationsApi();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTelegramPrompt, setShowTelegramPrompt] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);

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
    const unread = notifications.filter((n) => !n.isRead);
    for (const n of unread) {
      await handleMarkAsRead(n.id);
    }
  };

  const openNotification = async (notification: ApiNotification) => {
    if (!notification.isRead) {
      void handleMarkAsRead(notification.id);
    }

    if (!notification.event?.id || !onSelectEvent) return;

    try {
      setOpeningId(notification.id);
      const res = await getEvent(notification.event.id);
      if (res?.data) {
        onSelectEvent(toAcademicEvent(res.data as ApiEvent));
      }
    } catch (err) {
      console.error('Failed to open event from notification', err);
    } finally {
      setOpeningId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow w-full max-w-7xl mx-auto px-4 py-10 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#0b2c6a] animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
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

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#0b2c6a] transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#0b2c6a]">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Never miss an update</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Receive instant booking confirmations and reminders on Telegram.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowTelegramPrompt(true)}
          className="text-xs font-bold text-white bg-[#0b2c6a] px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors shadow-sm whitespace-nowrap"
        >
          Connect Telegram
        </button>
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
            You're all caught up! When there are important updates about your bookings or events,
            they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const clickable = !!(notification.event?.id && onSelectEvent);
            return (
              <div
                key={notification.id}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                onClick={() => {
                  if (clickable) void openNotification(notification);
                }}
                onKeyDown={(e) => {
                  if (!clickable) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    void openNotification(notification);
                  }
                }}
                className={`p-5 rounded-2xl border transition-all text-left ${
                  notification.isRead
                    ? 'bg-white border-slate-200 text-slate-600'
                    : 'bg-blue-50/50 border-[#0b2c6a]/20 shadow-sm text-slate-800'
                } ${
                  clickable
                    ? 'cursor-pointer hover:border-[#0b2c6a]/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b2c6a]/40'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shadow-sm" />
                      )}
                      <h4
                        className={`text-[15px] font-bold ${
                          !notification.isRead ? 'text-[#0b2c6a]' : 'text-slate-700'
                        }`}
                      >
                        {notification.title}
                      </h4>
                      {openingId === notification.id && (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      )}
                    </div>
                    <p
                      className={`text-sm leading-relaxed mb-3 ${
                        notification.isRead ? 'text-slate-500' : 'text-slate-600 font-medium'
                      }`}
                    >
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-medium text-slate-400 flex-wrap">
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      {notification.event && (
                        <>
                          <span>•</span>
                          <span
                            className={
                              clickable
                                ? 'text-amber-700 font-semibold underline-offset-2 hover:underline'
                                : 'text-amber-600'
                            }
                          >
                            {notification.event.title}
                          </span>
                          {clickable && (
                            <span className="inline-flex items-center gap-0.5 text-[#0b2c6a] font-semibold">
                              View event
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {!notification.isRead && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleMarkAsRead(notification.id);
                      }}
                      className="shrink-0 p-2 text-slate-400 hover:text-[#0b2c6a] hover:bg-white rounded-full transition-colors"
                      title="Mark as read"
                      aria-label="Mark as read"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TelegramConnectPrompt
        open={showTelegramPrompt}
        onClose={() => setShowTelegramPrompt(false)}
      />
    </div>
  );
}
