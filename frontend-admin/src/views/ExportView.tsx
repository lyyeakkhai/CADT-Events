import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar as CalIcon, Loader2, Users } from 'lucide-react';
import apiClient from '../lib/apiClient';

interface DashboardEvent {
  id: string;
  title: string;
  eventType: string | null;
  startTimestamp: string;
  endTimestamp: string;
  location: string | null;
  status: string;
  _count: { bookings: number };
}

export default function ExportView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<DashboardEvent[]>([]);

  useEffect(() => {
    let active = true;
    const fetchEvents = async () => {
      try {
        const res = await apiClient.get('/events/all');
        if (active) setEvents(res.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchEvents();
    return () => { active = false; };
  }, []);

  return (
    <div className="w-full px-6 py-6 fade-in max-w-7xl mx-auto">
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-3 font-medium">
          <button onClick={() => navigate('/')} className="hover:text-amber-500 transition-colors">Admin Dashboard</button>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-amber-500 font-bold">Export Data</span>
        </nav>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Export Attendee Data</h1>
        <p className="text-slate-500 mt-2 text-base">Select an event below to view its attendees and export the data to CSV, XLSX, or PDF.</p>
      </div>

      <div className="glass-card rounded-xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Select Event</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Event Details</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Attendees</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading events...
                  </td>
                </tr>
              ) : events.length > 0 ? (
                events.map((row, i) => (
                  <tr key={i} onClick={() => navigate(`/events/${row.id}`)} className="hover:bg-slate-50/70 transition-colors bg-white cursor-pointer group">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{row.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">ID: #{row.id.slice(0, 8)} • {row.location || 'TBA'}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <CalIcon size={14} className="text-slate-400" />
                        {new Date(row.startTimestamp).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.status === 'PUBLISHED' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-slate-600 bg-slate-100 border border-slate-200'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1.5 font-bold text-slate-700">
                        <Users size={16} className="text-slate-400" />
                        {row._count?.bookings || 0}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 text-sm font-medium">
                    No events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
