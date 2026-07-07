import React, { useState, useMemo, useEffect } from 'react';
import { Search, Calendar, RotateCcw, X, SlidersHorizontal, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import EventCard from '../../../components/EventCard';
import { FIGMA_EVENTS_DATA } from '../../../features/events/data/eventData';
import type { AcademicEvent } from '../../../features/events/data/eventData';
import { getEvents, type ApiEvent } from '../../../services/api';
import { useUrlSearch } from '../../../hooks/useUrlSearch';

// Convert backend ApiEvent to the local AcademicEvent shape the UI expects
function toAcademicEvent(e: ApiEvent): AcademicEvent {
  return {
    id: e.id as any,
    title: e.title,
    speaker: e.speakers?.[0]?.speaker?.name ?? 'CADT',
    date: new Date(e.startTimestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: new Date(e.startTimestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    venue: e.venue?.name ?? 'TBA',
    dept: 'All',
    type: (e.eventType as AcademicEvent['type']) ?? 'Seminar',
    badge: e.eventType ?? 'Event',
    image: e.coverImageUrl ?? '',
    description: e.description,
    isFeatured: e.isFeatured,
    seatsLeft: 25, // demo default; backend integration can enhance
    // Keep original id for API calls
    _apiId: e.id,
  } as AcademicEvent & { _apiId: string };
}

interface DiscoveryFeedProps {
  onSelectEvent?: (event: AcademicEvent) => void;
  onViewCalendarClick?: () => void;
}

export default function DiscoveryFeed({ onSelectEvent, onViewCalendarClick }: DiscoveryFeedProps) {
  const [searchQuery, setSearchQuery] = useUrlSearch('q');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('This Month');
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [apiEvents, setApiEvents] = useState<AcademicEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch from backend; fall back to mock data if it fails
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getEvents()
      .then((res) => {
        if (!cancelled) {
          setApiEvents(res.data.map(toAcademicEvent));
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError('Unable to load live events. Showing curated list.');
          setApiEvents(null); // fall back to FIGMA_EVENTS_DATA
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const allEvents = apiEvents ?? FIGMA_EVENTS_DATA;

  const featuredEvents = useMemo(() => {
    return allEvents.filter(event => event.isFeatured === true);
  }, [allEvents]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const matchesDept = selectedDept === 'All' || event.dept === selectedDept || event.dept === 'All';
      const cleanQuery = searchQuery.toLowerCase().trim();
      const matchesSearch =
        event.title.toLowerCase().includes(cleanQuery) ||
        event.speaker.toLowerCase().includes(cleanQuery) ||
        (event.description && event.description.toLowerCase().includes(cleanQuery));
      return matchesDept && matchesSearch;
    });
  }, [allEvents, selectedDept, searchQuery]);

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

  if (loading) {
    return (
      <div className="w-full flex flex-col bg-slate-50">
        <div className="w-full h-[340px] md:h-[400px] bg-[#0b2c6a] animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading events...
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 h-[320px] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-slate-50">
      
      {/* =======================================================================
          HERO CAROUSEL SLIDER BLOCK (Vector Layout Update)
         ======================================================================= */}
      {featuredEvents.length > 0 && (
        <section className="relative w-full h-[340px] md:h-[400px] overflow-hidden bg-[#0b2c6a] flex items-center group border-b border-[#0b2c6a]/80">
          {/* Stronger, legible hero treatment (better contrast, institutional navy base) */}
          <div className="absolute inset-0 z-0">
            <img 
              src={featuredEvents[currentSlide].image} 
              alt={featuredEvents[currentSlide].title} 
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b2c6a] via-[#0b2c6a]/90 to-[#0b2c6a]/70" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 text-left space-y-4">
            <div className="flex items-center gap-2 select-none">
              <span className="bg-amber-400 text-[#0b2c6a] text-[10px] tracking-[1px] font-bold uppercase px-3 py-0.5 rounded-md">
                FEATURED
              </span>
              <span className="text-white/70 text-[11px] tracking-wider font-medium border border-white/30 px-2.5 py-0.5 rounded">
                {featuredEvents[currentSlide].badge}
              </span>
            </div>

            <h1 
              onClick={() => onSelectEvent && onSelectEvent(featuredEvents[currentSlide])}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-[-0.015em] leading-[1.05] mb-2 max-w-4xl cursor-pointer hover:text-amber-300 transition-colors duration-150"
            >
              {featuredEvents[currentSlide].title}
            </h1>
            
            <p className="text-white/85 text-[15px] sm:text-base font-medium max-w-2xl leading-relaxed mb-4 line-clamp-2">
              {featuredEvents[currentSlide].description}
            </p>
            
            <div className="flex flex-wrap items-center text-white/70 text-sm font-medium gap-x-5 gap-y-1 mb-5 select-none">
              <span><span className="text-white/60">Host</span> {featuredEvents[currentSlide].speaker}</span>
              <span className="hidden sm:inline text-white/40">·</span>
              <span><span className="text-white/60">Venue</span> {featuredEvents[currentSlide].venue}</span>
              <span className="hidden sm:inline text-white/40">·</span>
              <span><span className="text-white/60">Date</span> {featuredEvents[currentSlide].date} · {featuredEvents[currentSlide].time}</span>
            </div>
            
            <button 
              onClick={() => onSelectEvent && onSelectEvent(featuredEvents[currentSlide])}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-[#0b2c6a] text-sm font-bold tracking-[0.3px] rounded-lg shadow transition-all active:scale-[0.985] cursor-pointer"
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
            
            {/* Search + Filters — refined sizes per design review */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, speaker or keywords..."
                className="w-full bg-white border border-slate-200 hover:border-slate-300 pl-10 pr-8 py-2 rounded-lg text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0b2c6a]/30 focus:border-[#0b2c6a]/40 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Department pills — premium visual filter per DESIGN.md */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {['All', 'Computer Science', 'Software Engineering', 'Telecommunication & Networking', 'Digital Business'].map((dept) => {
                const isActive = selectedDept === dept || (dept === 'All' && selectedDept === 'All');
                return (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    className={`px-3 py-1.5 min-h-[36px] rounded-full text-xs font-semibold transition-all border ${
                      isActive 
                        ? 'bg-[#0b2c6a] text-white border-[#0b2c6a]' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800'
                    }`}
                  >
                    {dept === 'All' ? 'All' : dept.replace('Telecommunication & Networking', 'Telecom')}
                  </button>
                );
              })}
            </div>

            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-sm font-medium px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0b2c6a]/30 transition-all cursor-pointer"
            >
              <option value="This Month">This month</option>
              <option value="Next Month">Next month</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 text-sm font-medium text-slate-500 select-none border-t lg:border-t-0 pt-2 lg:pt-0 shrink-0">
            <button 
              onClick={handleClearAll}
              className="text-[#0b2c6a] hover:text-[#082050] transition-colors cursor-pointer font-semibold flex items-center gap-1 text-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear
            </button>
            <button
              onClick={onViewCalendarClick}
              className="ml-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" /> Calendar
            </button>
          </div>
        </div>
      </section>

      {/* =======================================================================
          MAIN RENDER GRID LAYER
         ======================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
        {error && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
            {error} Showing curated highlights.
          </div>
        )}

        {/* Clear section header for IA per design review */}
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Upcoming at CADT</h2>
            <p className="text-sm text-slate-500 mt-0.5">Academic events, workshops &amp; seminars for our community</p>
          </div>
          <div className="hidden md:block text-sm font-medium text-slate-500">{filteredEvents.length} results</div>
        </div>

        {filteredEvents.length === 0 ? (
          /* Improved empty state — warm + actionable (per DESIGN.md) */
          <div className="w-full text-center py-16 bg-white rounded-2xl border border-slate-200 px-6 flex flex-col items-center justify-center animate-fade-in max-w-md mx-auto">
            <div className="w-11 h-11 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-800 mb-1">No events match your filters</p>
            <p className="text-sm text-slate-500 max-w-[26ch] leading-relaxed">
              Try adjusting your search or clearing filters to see more upcoming CADT academic events.
            </p>
            <button
              onClick={handleClearAll}
              className="mt-5 px-5 py-2 bg-[#0b2c6a] hover:bg-[#082050] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear filters
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

        {/* Load more removed — non-functional in current demo. Use Calendar tab or clear filters for exploration. */}
      </main>

    </div>
  );
}