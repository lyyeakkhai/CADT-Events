import React, { useState, useMemo } from 'react';
// Fixed casing mismatch path to point to your lowercase components folder
import EventCard from '../../../Components/EventCard.tsx';
import { FIGMA_EVENTS_DATA } from '../data/eventData.tsx';
import type { AcademicEvent } from '../data/eventData.tsx';

interface DiscoveryFeedProps {
  onSelectEvent?: (event: AcademicEvent) => void;
  onViewCalendarClick?: () => void;
}

export default function DiscoveryFeed({ onSelectEvent, onViewCalendarClick }: DiscoveryFeedProps) {
  // Operational state fields
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('This Month');

  // Dynamic pipeline matching search query and structural dropdown filters
  const filteredEvents = useMemo(() => {
    return FIGMA_EVENTS_DATA.filter(event => {
      // 1. Department Track Filtering Condition
      const matchesDept = selectedDept === 'All' || event.dept === selectedDept || event.dept === 'All';
      
      // 2. Real-Time Search Query Matching Condition (Checks Title, Speaker, and Description)
      const cleanQuery = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        event.title.toLowerCase().includes(cleanQuery) ||
        event.speaker.toLowerCase().includes(cleanQuery) ||
        (event.description && event.description.toLowerCase().includes(cleanQuery));

      return matchesDept && matchesSearch;
    });
  }, [selectedDept, searchQuery]);

  // Unified reset logic to clear all user search inputs
  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedDept('All');
    setSelectedTimeframe('This Month');
  };

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

      {/* Upgraded Sorting Control Deck Component with Interactive Search Field */}
      <section className="w-full border-b border-slate-200/80 bg-white py-4 shadow-xs sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Inner Controls Form Container */}
          <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-3 max-w-3xl">
            
            {/* Contextual Input Field Wrapper */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none text-xs">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event title, speaker, keywords..."
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 pl-9 pr-8 py-2 rounded-lg text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Department Dropdown Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all cursor-pointer min-w-[150px]"
            >
              <option value="All">Department: All</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Telecommunication & Networking">Telecommunication & Networking</option>
              <option value="Digital Business">Digital Business</option>
            </select>

            {/* Timeframe Dropdown Filter */}
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all cursor-pointer min-w-[130px]"
            >
              <option value="This Month">Date: This Month</option>
              <option value="Next Month">Date: Next Month</option>
            </select>
          </div>

          {/* Results Metadata Section */}
          <div className="flex items-center justify-between lg:justify-end gap-4 text-xs font-bold text-slate-400 select-none border-t sm:border-t-0 pt-2 sm:pt-0 shrink-0">
            <span>{filteredEvents.length} Events Found</span>
            <button 
              onClick={handleClearAll}
              className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              Clear All
            </button>
          </div>
        </div>
      </section>

      {/* Grid Layout context utilizing isolated EventCard items */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
        {filteredEvents.length === 0 ? (
          /* Human-Computer Interaction User Feedback State */
          <div className="w-full text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 px-4 flex flex-col items-center justify-center animate-fade-in">
            <span className="text-3xl block mb-2">🔎</span>
            <p className="text-sm font-extrabold text-slate-800 mb-1">No upcoming match criteria found</p>
            <p className="text-xs font-medium text-slate-400 max-w-xs leading-relaxed">
              We couldn't find anything matching your exact query string. Check your parameters or clear the query to start fresh!
            </p>
            <button
              onClick={handleClearAll}
              className="mt-4 px-4 py-2 bg-slate-950 hover:bg-blue-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onSelect={(ev) => onSelectEvent && onSelectEvent(ev)} 
              />
            ))}
          </div>
        )}

        {filteredEvents.length > 0 && (
          <div className="w-full flex justify-center items-center mt-12">
            <button className="px-6 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98]">
              Load More Events
            </button>
          </div>
        )}
      </main>

    </div>
  );
}