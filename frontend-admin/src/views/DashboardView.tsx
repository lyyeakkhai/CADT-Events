import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { ViewType } from '../App';
import { DownloadCloud, Plus, Filter, Users, Calendar, PieChart, Activity, MoreVertical, Edit2, Bell, Loader2 } from 'lucide-react';
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
  capacity: number; // if not present, we will default to something
}

export default function DashboardView({ searchQuery = '' }: { searchQuery?: string }) {
  const _nav = useNavigate();
  const onNavigate = (v: string) => _nav(v === 'dashboard' ? '/' : '/' + v);
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/events/all');
      setEvents(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchEvents();
    return () => { active = false; };
  }, []);

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (e.eventType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBookings = events.reduce((sum, e) => sum + (e._count?.bookings || 0), 0);

  return (
    <div className="w-full px-6 py-6 fade-in">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <span>Admin</span>
            <span>/</span>
            <span className="text-amber-600 font-semibold">Event Management</span>
          </nav>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Dashboard</h1>
          <p className="text-slate-500 mt-1">Oversee educational system activities and scheduled events.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => onNavigate('export')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <DownloadCloud size={18} />
            Export Data
          </button>
          <button 
            onClick={() => onNavigate('create')}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-md"
          >
            <Plus size={18} />
            Add New Event
          </button>
          <button 
            onClick={fetchEvents}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
            title="Refresh events list"
          >
            Refresh
          </button>
        </div>
      </header>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: Calendar, iconBg: "bg-amber-50", iconColor: "text-amber-600", label: "Total Events", value: loading ? '-' : events.length, sub: "All time", subColor: "text-slate-500" },
          { icon: Users, iconBg: "bg-blue-50", iconColor: "text-blue-600", label: "Total Registrations", value: loading ? '-' : totalBookings, sub: "Confirmed", subColor: "text-emerald-600" },
          { icon: PieChart, iconBg: "bg-violet-50", iconColor: "text-violet-600", label: "System Cap", value: "76%", sub: "System Cap", subColor: "text-slate-500", isProgress: true },
          { icon: Activity, iconBg: "bg-slate-100", iconColor: "text-slate-600", label: "New User Signups", value: "243", sub: "Active Now", subColor: "text-emerald-600" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon className={stat.iconColor} size={20} />
              </div>
              <span className={`text-xs font-bold ${stat.subColor}`}>{stat.sub}</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
            {stat.isProgress ? (
              <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '76%' }}></div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">{stat.label}</div>
            )}
          </div>
        ))}
      </section>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar Filter */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="glass-card p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Filter className="text-slate-700" size={18} />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Advanced Filters</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-2">Event Category</label>
                <select className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 outline-none text-slate-900">
                  <option>All Categories</option>
                  <option>Workshop</option>
                  <option>Seminar</option>
                  <option>Tech Talk</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-3">Event Status</label>
                <div className="space-y-3">
                  {['Active Sessions', 'Upcoming Events', 'Archived/Completed'].map((opt, i) => (
                    <label key={i} className="flex items-center gap-3 text-sm cursor-pointer group">
                      <input type="checkbox" defaultChecked={i < 2} className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-amber-400/30 accent-amber-400" />
                      <span className="text-slate-700 group-hover:text-slate-900 transition-colors">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button className="w-full py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                Apply Changes
              </button>
            </div>
          </div>
          
          <div className="rounded-xl overflow-hidden glass-card h-40 relative flex flex-col items-center justify-center text-center p-6 bg-slate-50 border border-slate-200">
            <Bell className="text-slate-300 mb-3" size={32} />
            <span className="text-sm font-bold text-slate-400 uppercase tracking-tighter">System Announcement Slot</span>
          </div>
        </aside>

        {/* Events Table */}
        <section className="lg:col-span-9">
          <div className="glass-card rounded-xl overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Events Inventory</h2>
              <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
                <MoreVertical size={20} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Event Details</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Capacity</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Status</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Loading events...
                      </td>
                    </tr>
                  ) : filteredEvents.length > 0 ? (
                    filteredEvents.map((row, i) => {
                      const cap = row.capacity || 100; // Fake capacity if null
                      const pct = Math.round((row._count.bookings / cap) * 100);
                      const full = pct >= 100;
                      return (
                      <tr key={i} className="hover:bg-slate-50/70 transition-colors bg-white">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{row.title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">ID: #{row.id?.slice(0, 8)} • {row.location || (row.venue?.name) || 'TBA'}</div>
                        </td>
                        <td className="p-4 text-sm text-slate-700">{new Date(row.startTimestamp).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-[10px] font-bold uppercase tracking-wider">{row.eventType || 'Event'}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 w-24">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-bold text-slate-700">{row._count.bookings}/{cap}</span>
                              <span className={`font-semibold ${full ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>{full ? 'FULL' : `${pct}%`}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${full ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.status === 'PUBLISHED' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-slate-600 bg-slate-100 border border-slate-200'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${row.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            {row.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                            <Edit2 size={16} />
                          </button>
                        </td>
                      </tr>
                    )})
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 text-sm font-medium">
                        No events found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="p-4 bg-white flex items-center justify-between border-t border-slate-100 mt-auto">
              <span className="text-xs text-slate-400">Displaying 1-10 of 124 global events</span>
              <div className="flex gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">&lt;</button>
                <button className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-lg text-sm font-bold">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 text-sm border border-slate-200">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 text-sm border border-slate-200">3</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">&gt;</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
