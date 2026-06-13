import React, { useState, useMemo } from 'react';
import EventCard from '../../../Components/EventCard.tsx';
import { FIGMA_EVENTS_DATA } from '../data/eventData.tsx';
import type { AcademicEvent } from '../data/eventData.tsx';

interface DiscoveryFeedProps {
  onSelectEvent?: (event: AcademicEvent) => void;
  onViewCalendarClick?: () => void;
}

export default function DiscoveryFeed({ onSelectEvent, onViewCalendarClick }: DiscoveryFeedProps) {
  // Operational state fields
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('This Month');

  // Dynamic pipeline matching structural filters
  const filteredEvents = useMemo(() => {
    return FIGMA_EVENTS_DATA.filter(event => {
      const matchesDept = selectedDept === 'All' || event.dept === selectedDept || event.dept === 'All';
      return matchesDept;
    });
  }, [selectedDept]);

  return (
    <div className="w-full flex flex-col bg-slate-50">
      
      {/* Visual Hero Grid Component */}
      <section className="relative w-full h-[360px] md:h-[420px] overflow-hidden bg-slate-900 group">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80" 
            alt="CADT Innovation Center Building" 
            className="w-full h-full object-cover opacity-35 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-start">
          <span className="bg-amber-400 text-slate-900 text-[10px] tracking-widest uppercase font-black px-2.5 py-1 rounded-md mb-4 shadow-sm">
            Academic Excellence
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-3 max-w-2xl">
            Discover Tech Excellence
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-xl leading-relaxed mb-6">
            Join the forefront of innovation at CADT. From international tech symposiums to hands-on workshops, explore the events shaping the future of digital technology.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setSelectedDept('All')}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold rounded-lg shadow-md transition-all active:scale-[0.98]"
            >
              Browse All Events
            </button>
            <button 
              onClick={onViewCalendarClick}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-lg border border-white/20 shadow-md transition-all active:scale-[0.98]"
            >
              View Calendar
            </button>
          </div>
        </div>
      </section>

      {/* Sorting Control Deck Component */}
      <section className="w-full border-b border-slate-200/80 bg-white py-4 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
              <span>⚡ Filters</span>
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all cursor-pointer"
            >
              <option value="All">Department: All</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Digital Media">Digital Media</option>
            </select>

            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all cursor-pointer"
            >
              <option value="This Month">Date: This Month</option>
              <option value="Next Month">Date: Next Month</option>
            </select>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-bold text-slate-400">
            <span>{filteredEvents.length} Events Found</span>
            <button 
              onClick={() => { setSelectedDept('All'); setSelectedTimeframe('This Month'); }}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </section>

      {/* Grid Layout context utilizing isolated EventCard items */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
        {filteredEvents.length === 0 ? (
          <div className="w-full text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-sm font-semibold text-slate-400">No upcoming milestones match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onSelect={(ev) => onSelectEvent && onSelectEvent(ev)} 
              />
            ))}
          </div>
        )}

        <div className="w-full flex justify-center items-center mt-12">
          <button className="px-6 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98]">
            Load More Events
          </button>
        </div>
      </main>

    </div>
  );
}