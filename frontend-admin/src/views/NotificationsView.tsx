import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertTriangle, BellOff, Activity, ChevronRight } from 'lucide-react';
import apiClient from '../lib/apiClient';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  type: 'alert' | 'event' | 'system';
  severity?: 'critical' | 'warning' | 'info';
  eventId?: string;
  href?: string;
}

function formatWhen(ts: string) {
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return ts;
  }
}

export default function NotificationsView() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get('/notifications/admin');
        setNotifications(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch activity feed', err);
        setError('Failed to load activity');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const filtered = useMemo(
    () =>
      notifications.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.message.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [notifications, searchQuery]
  );

  const openItem = (item: Notification) => {
    const path =
      item.href ||
      (item.eventId ? `/events/${item.eventId}` : null) ||
      // Fallback: ids are reg-<uuid> / evt-<uuid>
      (item.id.startsWith('evt-') ? `/events/${item.id.slice(4)}` : null) ||
      (item.id.startsWith('reg-') && item.eventId ? `/events/${item.eventId}` : null);

    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="p-4 sm:p-8 w-full min-h-screen text-slate-900 animate-fade-in font-sans">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={22} className="text-indigo-600" />
          <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight">Activity</h1>
        </div>
        <p className="text-sm text-slate-500 max-w-xl">
          Recent registrations and events created across the platform. Click an item to open the
          related event.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search activity…"
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {loading ? '…' : `${filtered.length} item${filtered.length === 1 ? '' : 's'}`}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4" />
            <p className="text-slate-500 text-sm">Loading activity…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <h3 className="text-base font-medium text-red-600 mb-1">{error}</h3>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <BellOff size={24} className="text-slate-300" />
            </div>
            <h3 className="text-base font-medium text-slate-900 mb-1">No recent activity</h3>
            <p className="text-sm text-slate-500">
              New bookings and published events will show up here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((item) => {
              const clickable = !!(item.href || item.eventId || item.id.startsWith('evt-'));
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => openItem(item)}
                    disabled={!clickable}
                    className={`w-full flex items-center gap-4 py-4 px-4 text-left transition-colors ${
                      clickable
                        ? 'hover:bg-indigo-50/60 cursor-pointer focus:outline-none focus-visible:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-200'
                        : 'cursor-default opacity-80'
                    }`}
                    aria-label={
                      clickable
                        ? `${item.title}. Open related event.`
                        : item.title
                    }
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        item.type === 'event' ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-[14px] mb-0.5 truncate font-semibold text-slate-900">
                        {item.title}
                      </h4>
                      <p className="text-[13px] text-slate-500 truncate">{item.message}</p>
                    </div>
                    <div className="text-[13px] text-slate-500 flex-shrink-0 w-32 text-right hidden sm:block">
                      {formatWhen(item.timestamp)}
                    </div>
                    {clickable && (
                      <ChevronRight
                        size={18}
                        className="text-slate-300 flex-shrink-0"
                        aria-hidden
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
