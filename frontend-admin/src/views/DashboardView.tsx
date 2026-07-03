import type { ViewType } from '../App';
import { DownloadCloud, Plus, Filter, Users, Calendar, PieChart, Activity, MoreVertical, Edit2, Bell } from 'lucide-react';

export default function DashboardView({ onNavigate, searchQuery = '' }: { onNavigate: (v: ViewType) => void, searchQuery?: string }) {
  const allEvents = [
    { title: "Tech Innovators Summit", id: "EV-9901", loc: "HQ Room 402", date: "Oct 24, 2024", type: "WORKSHOP", cap: "45/50", pct: 90, status: "ACTIVE", stCol: "text-secondary bg-secondary-container/30", dot: "bg-secondary" },
    { title: "CADT Career Fair", id: "EV-9884", loc: "Main Hall", date: "Nov 02, 2024", type: "SEMINAR", cap: "120/500", pct: 24, status: "UPCOMING", stCol: "text-primary bg-primary/10", dot: "bg-primary" },
    { title: "Introduction to Blockchain", id: "EV-9712", loc: "Virtual Session", date: "Oct 12, 2024", type: "TECH TALK", cap: "30/30", pct: 100, status: "COMPLETED", stCol: "text-on-surface-variant bg-surface-container-highest/50", dot: "bg-outline-variant", full: true },
    { title: "Hackathon 2024 Prep", id: "EV-9555", loc: "Innovation Lab", date: "Nov 15, 2024", type: "COMPETITION", cap: "88/200", pct: 44, status: "UPCOMING", stCol: "text-primary bg-primary/10", dot: "bg-primary" },
  ];

  const filteredEvents = allEvents.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 w-full fade-in">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-2">
            <span>Admin</span>
            <span>/</span>
            <span className="text-primary font-medium">Event Management</span>
          </nav>
          <h1 className="text-3xl font-bold text-primary tracking-tight">System Dashboard</h1>
          <p className="text-on-surface-variant mt-1">Oversee educational system activities and scheduled events.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => onNavigate('export')}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-primary hover:bg-surface-container-low transition-all shadow-sm"
          >
            <DownloadCloud size={18} />
            Export Data
          </button>
          <button 
            onClick={() => onNavigate('create')}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <Plus size={18} />
            Add New Event
          </button>
        </div>
      </header>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: Calendar, iconBg: "bg-primary/10", iconColor: "text-primary", label: "Total Events", value: "124", sub: "+12%", subColor: "text-secondary" },
          { icon: Users, iconBg: "bg-secondary/10", iconColor: "text-secondary", label: "Total Registrations", value: "8,432", sub: "+2.4k", subColor: "text-secondary" },
          { icon: PieChart, iconBg: "bg-tertiary/10", iconColor: "text-tertiary", label: "System Cap", value: "76%", sub: "System Cap", subColor: "text-on-surface-variant", isProgress: true },
          { icon: Activity, iconBg: "bg-surface-container-highest", iconColor: "text-on-surface-variant", label: "New User Signups", value: "243", sub: "Active Now", subColor: "text-secondary" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon className={stat.iconColor} size={20} />
              </div>
              <span className={`text-xs font-bold ${stat.subColor}`}>{stat.sub}</span>
            </div>
            <div className="text-3xl font-bold text-on-surface mb-1">{stat.value}</div>
            {stat.isProgress ? (
              <div className="mt-3 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '76%' }}></div>
              </div>
            ) : (
              <div className="text-sm text-on-surface-variant">{stat.label}</div>
            )}
          </div>
        ))}
      </section>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar Filter */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="glass-card p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/50">
              <Filter className="text-primary" size={18} />
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Advanced Filters</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-2">Event Category</label>
                <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                  <option>All Categories</option>
                  <option>Workshop</option>
                  <option>Seminar</option>
                  <option>Tech Talk</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-3">Event Status</label>
                <div className="space-y-3">
                  {['Active Sessions', 'Upcoming Events', 'Archived/Completed'].map((opt, i) => (
                    <label key={i} className="flex items-center gap-3 text-sm cursor-pointer group">
                      <input type="checkbox" defaultChecked={i < 2} className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20" />
                      <span className="group-hover:text-primary transition-colors">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button className="w-full py-2 bg-primary/5 text-primary border border-primary/20 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-all">
                Apply Changes
              </button>
            </div>
          </div>
          
          <div className="rounded-xl overflow-hidden glass-card h-40 relative flex flex-col items-center justify-center text-center p-6 bg-primary/5 border border-primary/10">
            <Bell className="text-primary/40 mb-3" size={32} />
            <span className="text-sm font-bold text-on-surface-variant uppercase tracking-tighter">System Announcement Slot</span>
          </div>
        </aside>

        {/* Events Table */}
        <section className="lg:col-span-9">
          <div className="glass-card rounded-xl overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-outline-variant/50 flex justify-between items-center bg-surface-container-lowest/50">
              <h2 className="text-xl font-bold text-primary">Events Inventory</h2>
              <button className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg">
                <MoreVertical size={20} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50 border-b border-outline-variant/50">
                    <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Event Details</th>
                    <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Date</th>
                    <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Type</th>
                    <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Capacity</th>
                    <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Current Status</th>
                    <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((row, i) => (
                      <tr key={i} className="hover:bg-primary/[0.02] transition-colors bg-surface-container-lowest">
                        <td className="p-4">
                          <div className="font-bold text-on-surface">{row.title}</div>
                          <div className="text-[11px] text-on-surface-variant mt-0.5">ID: #{row.id} • {row.loc}</div>
                        </td>
                        <td className="p-4 text-sm text-on-surface">{row.date}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-surface-container-low text-primary border border-primary/10 rounded-full text-[10px] font-bold uppercase tracking-wider">{row.type}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 w-24">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-bold">{row.cap}</span>
                              <span className={`font-semibold ${row.full ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}>{row.full ? 'FULL' : `${row.pct}%`}</span>
                            </div>
                            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${row.full ? 'bg-secondary' : 'bg-primary'}`} style={{ width: `${row.pct}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.stCol}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${row.dot}`}></span>
                            {row.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                            <Edit2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-on-surface-variant text-sm font-medium">
                        No events found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="p-4 bg-surface-container-lowest flex items-center justify-between border-t border-outline-variant/30 mt-auto">
              <span className="text-xs text-on-surface-variant">Displaying 1-10 of 124 global events</span>
              <div className="flex gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant">&lt;</button>
                <button className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg text-sm font-bold shadow-sm">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant text-sm border border-outline-variant/50">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant text-sm border border-outline-variant/50">3</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant">&gt;</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
