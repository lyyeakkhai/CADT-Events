import React, { useState, useMemo } from 'react';
// Import professional vectors from the package
import { Search, Calendar, RotateCcw, X, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import EventCard from '../../../components/EventCard';
import { FIGMA_EVENTS_DATA } from '../data/eventData';
import type { AcademicEvent } from '../data/eventData';
import { useUrlSearch } from '../../../hooks/useUrlSearch';

interface DiscoveryFeedProps {
  onSelectEvent?: (event: AcademicEvent) => void;
  onViewCalendarClick?: () => void;
}

export default function DiscoveryFeed({ onSelectEvent, onViewCalendarClick }: DiscoveryFeedProps) {
  const [searchQuery, setSearchQuery] = useUrlSearch('q');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('This Month');
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const featuredEvents = useMemo(() => {
  return FIGMA_EVENTS_DATA.filter(event => event.isFeatured === true); // ✅ Match lowercase 'isFeatured'
}, []);

  const filteredEvents = useMemo(() => {
    return FIGMA_EVENTS_DATA.filter(event => {
      const matchesDept = selectedDept === 'All' || event.dept === selectedDept || event.dept === 'All';
      const cleanQuery = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        event.title.toLowerCase().includes(cleanQuery) ||
        event.speaker.toLowerCase().includes(cleanQuery) ||
        (event.description && event.description.toLowerCase().includes(cleanQuery));

      return matchesDept && matchesSearch;
    });
  }, [selectedDept, searchQuery]);

  const nextSlide = () => {
    if (featuredEvents.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
  };

  const prevSlide = () => {
    if (featuredEvents.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length);
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedDept('All');
    setSelectedTimeframe('This Month');
  };

  return (
    <div className="w-full flex flex-col bg-slate-50">
      
      {/* =======================================================================
          HERO CAROUSEL SLIDER BLOCK (Vector Layout Update)
         ======================================================================= */}
      {featuredEvents.length > 0 && (
        <section className="relative w-full h-[340px] md:h-[400px] overflow-hidden bg-slate-950 flex items-center group border-b border-slate-800">
          <div className="absolute inset-0 z-0 transition-all duration-500">
            <img 
              src={featuredEvents[currentSlide].image} 
              alt={featuredEvents[currentSlide].title} 
              className="w-full h-full object-cover opacity-25 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 text-left space-y-3.5">
            <div className="flex items-center gap-2 select-none">
              <span className="bg-amber-400 text-slate-900 text-[10px] tracking-widest font-black uppercase px-2.5 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                <span className="w-3 h-3 text-slate-800 " /> SPECIAL EVENT
              </span>
              <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] tracking-wider font-extrabold uppercase px-2.5 py-0.5 rounded-md">
                {featuredEvents[currentSlide].badge}
              </span>
            </div>

            <h1 
              onClick={() => onSelectEvent && onSelectEvent(featuredEvents[currentSlide])}
              className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-3 max-w-3xl cursor-pointer hover:text-amber-400 transition-colors duration-150"
            >
              {featuredEvents[currentSlide].title}
            </h1>
            
            <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-xl leading-relaxed mb-5 line-clamp-2">
              {featuredEvents[currentSlide].description}
            </p>
            
            <div className="flex flex-wrap items-center text-slate-400 text-[11px] font-bold gap-x-4 gap-y-1 mb-6 select-none">
              <span>👤 Host: <span className="text-slate-200">{featuredEvents[currentSlide].speaker}</span></span>
              <span>🏢 Venue: <span className="text-slate-200">{featuredEvents[currentSlide].venue}</span></span>
              <span>📅 Date: <span className="text-slate-200">{featuredEvents[currentSlide].date}</span></span>
            </div>
            
            <button 
              onClick={() => onSelectEvent && onSelectEvent(featuredEvents[currentSlide])}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-black rounded-lg shadow-md transition-all cursor-pointer"
            >
              Register Now →
            </button>
          </div>

          {/* Symmetrical Vector Left/Right Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 z-20 bg-slate-900/60 hover:bg-white hover:text-slate-950 text-white w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer select-none shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 z-20 bg-slate-900/60 hover:bg-white hover:text-slate-950 text-white w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer select-none shadow-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Pagination Indicators */}
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2 select-none">
            {featuredEvents.map((_, index) => (
              <span 
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === index ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </section>
      )}

      {/* =======================================================================
          SORTING CONTROL DECK SECTION (Vector Inputs Update)
         ======================================================================= */}
      <section className="w-full border-b border-slate-200/80 bg-white py-3.5 shadow-xs sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-3 max-w-3xl">
            
            {/* Contextual Input Field Wrapper with Vector Search Lens */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
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
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all cursor-pointer min-w-[150px]"
            >
              <option value="All">Department: All</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Telecommunication & Networking">Telecommunication & Networking</option>
              <option value="Digital Business">Digital Business</option>
            </select>

            {/* Timeframe Filter */}
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all cursor-pointer min-w-[130px]"
            >
              <option value="This Month">Date: This Month</option>
              <option value="Next Month">Date: Next Month</option>
            </select>
          </div>

          {/* Results Analytics Metadata */}
          <div className="flex items-center justify-between lg:justify-end gap-4 text-xs font-bold text-slate-400 select-none border-t lg:border-t-0 pt-2 lg:pt-0 shrink-0">
            <span className="flex items-center gap-1 text-slate-500">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" /> {filteredEvents.length} Events Found
            </span>
            <button 
              onClick={handleClearAll}
              className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer font-extrabold flex items-center gap-0.5"
            >
              <RotateCcw className="w-3 h-3" /> Clear All
            </button>
            <button
              onClick={onViewCalendarClick}
              className="ml-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Calendar View
            </button>
          </div>
        </div>
      </section>

      {/* =======================================================================
          MAIN RENDER GRID LAYER
         ======================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
        {filteredEvents.length === 0 ? (
          /* High-Fidelity UX Error Empty State View (Vector Update) */
          <div className="w-full text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 px-4 flex flex-col items-center justify-center animate-fade-in max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-extrabold text-slate-800 mb-1">No match criteria found</p>
            <p className="text-xs font-medium text-slate-400 max-w-xs leading-relaxed">
              We couldn't find anything matching your exact query string. Check your parameters or clear the query to start fresh!
            </p>
            <button
              onClick={handleClearAll}
              className="mt-4 px-4 py-2 bg-slate-950 hover:bg-blue-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset All Filters
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
            <button className="px-6 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer">
              Load More Events
            </button>
          </div>
        )}
      </main>

    </div>
  );
}