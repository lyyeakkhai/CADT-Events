import type { ViewType } from '../App';
import { ChevronRight, ChevronLeft, DownloadCloud, Plus, Calendar as CalIcon, Clock } from 'lucide-react';

export default function CalendarView({ onNavigate }: { onNavigate: (v: ViewType) => void }) {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  return (
    <div className="w-full px-6 py-6 fade-in">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-2">
            <span>Dashboard</span>
            <ChevronRight size={14} />
            <span className="text-primary font-medium">Calendar</span>
          </nav>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Event Calendar</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-primary hover:bg-surface-container-low transition-all shadow-sm">
            <DownloadCloud size={18} />
            Export
          </button>
          <button 
             onClick={() => onNavigate('create')}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <Plus size={18} />
            Create Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          <div className="glass-card p-3 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-surface-container rounded-full text-primary transition-all"><ChevronLeft size={20}/></button>
                <h2 className="text-xl font-bold text-primary min-w-[160px] text-center">October 2024</h2>
                <button className="p-2 hover:bg-surface-container rounded-full text-primary transition-all"><ChevronRight size={20}/></button>
              </div>
              <button className="px-4 py-1.5 border border-outline-variant rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-low transition-all">Today</button>
            </div>
            <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant/60">
              <button className="px-4 py-1.5 bg-primary text-white font-bold rounded-md shadow-sm text-sm">Month</button>
              <button className="px-4 py-1.5 text-on-surface-variant hover:text-primary transition-colors text-sm">Week</button>
              <button className="px-4 py-1.5 text-on-surface-variant hover:text-primary transition-colors text-sm">Day</button>
            </div>
          </div>

          <div className="glass-card rounded-xl overflow-hidden shadow-sm flex flex-col bg-surface-container-lowest border border-outline-variant/50">
            <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-container-low/50">
              {days.map((d, i) => (
                <div key={d} className={`py-3 text-center text-xs font-bold text-on-surface-variant tracking-wider ${i < 6 ? 'border-r border-outline-variant/50' : ''}`}>
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-5 h-[600px] lg:h-[700px] bg-white">
               {/* Just a highly simplified mockup of grid logic */}
               {Array.from({length: 35}).map((_, i) => {
                 const dayNum = i - 1; // start oct 1 at tue (idx 2)
                 const isCurrentMonth = dayNum > 0 && dayNum <= 31;
                 const cellBorder = `${(i+1)%7 !== 0 ? 'border-r' : ''} ${i < 28 ? 'border-b' : ''} border-outline-variant/30`;
                 
                 return (
                   <div key={i} className={`p-2 relative ${cellBorder} hover:bg-primary/[0.02] transition-colors ${!isCurrentMonth? 'bg-surface-container-low/30' : ''}`}>
                      <span className={`text-sm ${isCurrentMonth ? 'font-semibold text-on-surface' : 'text-outline'}`}>
                        {isCurrentMonth ? dayNum : (dayNum <= 0 ? 29 + i : dayNum - 31)}
                      </span>
                      {dayNum === 3 && (
                        <div className="mt-1 bg-secondary/10 text-secondary px-1.5 py-0.5 rounded text-[10px] font-bold border-l-2 border-secondary truncate">AI Ethics Seminar</div>
                      )}
                      {dayNum === 7 && (
                        <div className="mt-1 bg-badge-tech text-white px-1.5 py-0.5 rounded text-[10px] font-bold truncate">Web Dev Hub</div>
                      )}
                      {dayNum === 10 && (
                        <div className="mt-1 space-y-1">
                          <div className="bg-badge-business/10 text-badge-business px-1.5 py-0.5 rounded text-[10px] font-bold border-l-2 border-badge-business truncate">Startup Pitch</div>
                          <div className="bg-secondary/10 text-secondary px-1.5 py-0.5 rounded text-[10px] font-bold border-l-2 border-secondary truncate">Design Jam</div>
                        </div>
                      )}
                      {dayNum === 23 && (
                         <div className="mt-1 bg-badge-tech text-white px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm truncate">Annual Tech Expo</div>
                      )}
                   </div>
                 );
               })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <section className="glass-card p-5 rounded-xl border border-outline-variant/50">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/50">
              <CalIcon className="text-primary" size={20} />
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Upcoming Events</h3>
            </div>
            <div className="space-y-3">
              {[
                { d: '03', n: 'AI Ethics Seminar', loc: 'Hall A', t: '09:00 AM' },
                { d: '07', n: 'Web Dev Hub', loc: 'Lab 3', t: '02:00 PM' },
                { d: '10', n: 'Startup Pitch Day', loc: 'Innovation Hub', t: '10:30 AM' },
                { d: '23', n: 'Annual Tech Expo', loc: 'Campus', t: '08:00 AM' },
              ].map((ev, i) => (
                <div key={i} className="group flex gap-4 p-3 rounded-lg hover:bg-surface-container-low transition-all cursor-pointer border border-transparent hover:border-outline-variant/30 bg-surface-container-lowest">
                  <div className="text-center min-w-[56px] flex flex-col justify-center bg-surface-container rounded-lg py-2">
                    <span className="block text-[10px] font-bold text-on-surface-variant tracking-tighter uppercase">OCT</span>
                    <span className="block text-xl font-bold text-primary leading-none mt-1">{ev.d}</span>
                  </div>
                  <div className="overflow-hidden py-1">
                    <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate">{ev.n}</h4>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1 font-medium">
                      <Clock size={12} /> {ev.t} - {ev.loc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 bg-primary/5 text-primary border border-primary/20 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-all">View All Schedule</button>
          </section>

          <section className="glass-card p-5 rounded-xl border border-outline-variant/50">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/50">
               <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Categories</h3>
            </div>
            <div className="space-y-2">
              {[
                {l: 'Technology', c: 'text-badge-tech', bg:'bg-badge-tech/10', count: 12 },
                {l: 'Innovation', c: 'text-badge-innovation', bg:'bg-badge-innovation/10', count: '08' },
                {l: 'Business', c: 'text-badge-business', bg:'bg-badge-business/10', count: '05' },
                {l: 'Career', c: 'text-badge-career', bg:'bg-badge-career/10', count: '03', uncheck: true },
              ].map((cat, i) => (
                <label key={i} className="flex items-center gap-3 p-2 rounded hover:bg-surface-container-low cursor-pointer group">
                  <input type="checkbox" defaultChecked={!cat.uncheck} className={`w-4 h-4 rounded border-outline-variant ${cat.c} focus:ring-1 focus:ring-offset-0`} />
                  <span className="text-sm font-medium text-on-surface flex-grow group-hover:text-primary transition-colors">{cat.l}</span>
                  <span className={`text-[10px] ${cat.bg} ${cat.c} px-2 py-0.5 rounded-full font-bold`}>{cat.count}</span>
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
