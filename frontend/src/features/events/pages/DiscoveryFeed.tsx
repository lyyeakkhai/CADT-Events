import React, { useMemo, useEffect, useState, useRef } from 'react';
import { Calendar, Loader2, ArrowRight } from 'lucide-react';
import EventCard from '../../../components/EventCard';
import type { AcademicEvent } from '../../../features/events/data/eventData';
import { getEvents } from '../../../services/api';
import { toAcademicEvent } from '../../../lib/eventMapper';

interface DiscoveryFeedProps {
  onSelectEvent?: (event: AcademicEvent) => void;
  onViewCalendarClick?: () => void;
  onExploreAllClick?: () => void;
}

export default function DiscoveryFeed({ onSelectEvent, onViewCalendarClick, onExploreAllClick }: DiscoveryFeedProps) {
  const [apiEvents, setApiEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const eventsSectionRef = useRef<HTMLElement>(null);
  const scrollToEvents = () => {
    eventsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch from backend
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getEvents()
      .then((res) => {
        if (!cancelled) {
          const mapped = (res.data || []).map(toAcademicEvent);
          setApiEvents(mapped);
          if (mapped.length === 0) {
            setError('No published events yet.');
          }
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError('Unable to load live events from backend.');
          setApiEvents([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const allEvents = apiEvents;

  const featuredEvents = useMemo(() => {
    return allEvents.filter(event => event.isFeatured === true);
  }, [allEvents]);

  const upcomingEvents = useMemo(() => {
    return allEvents.filter(event => event.isFeatured !== true);
  }, [allEvents]);

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
          HERO SESSION (Static Design per User Request)
         ======================================================================= */}
      <section className="relative w-full h-[450px] md:h-[550px] lg:h-[650px] overflow-hidden bg-[#0b2c6a] flex items-center border-b border-[#0b2c6a]/80">
        <div className="absolute inset-0 z-0">
          <img 
            src="/innovation.png" 
            alt="CADT Innovation Building" 
            className="w-full h-full object-cover object-center"
          />
          {/* Deep blue gradient on the left half matching CADT primary brand color */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b2c6a] via-[#0b2c6a]/85 to-transparent w-full md:w-4/5 lg:w-2/3" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-16 text-left">
          <h1 className="text-4xl sm:text-5xl md:text-[64px] font-bold text-white tracking-tight leading-[1.12] mb-10">
            Cambodia Academy of<br />
            Digital Technology,<br />
            CADT
          </h1>
          
          <button 
            onClick={scrollToEvents}
            className="px-10 py-4 bg-gradient-to-r from-[#00a651] to-[#008f45] hover:from-[#008f45] hover:to-[#007a3b] text-white text-[15px] font-bold uppercase tracking-[0.05em] rounded-none shadow-lg transition-all cursor-pointer"
          >
            VIEW EVENT
          </button>
        </div>
      </section>

      {/* =======================================================================
          EVENTS SECTION
         ======================================================================= */}
      <main ref={eventsSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-grow">
        {error && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800 text-center">
            {error}
          </div>
        )}

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <div className="mb-20 animate-fade-in-up">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Featured Events</h2>
                <p className="text-slate-500 mt-2 max-w-2xl">Discover the most anticipated academic events handpicked for the CADT community.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="transition-all duration-300 hover:-translate-y-2">
                  <EventCard 
                    event={event} 
                    onSelect={(ev) => onSelectEvent && onSelectEvent(ev)} 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming/All Events */}
        <div className="mb-16">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Discover More</h2>
            <p className="text-slate-500 mt-2 max-w-2xl">Browse all academic seminars, workshops, and gatherings.</p>
          </div>
          
          {upcomingEvents.length === 0 ? (
            <div className="w-full text-center py-16 bg-white rounded-2xl border border-slate-200 px-6 max-w-xl mx-auto">
               <p className="text-slate-500">More events coming soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
              {upcomingEvents.slice(0, 6).map((event) => (
                <div key={event.id} className="transition-all duration-300 hover:-translate-y-2">
                  <EventCard 
                    event={event} 
                    onSelect={(ev) => onSelectEvent && onSelectEvent(ev)} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center mt-8 pb-10">
          <button
            onClick={onExploreAllClick}
            className="group px-8 py-4 bg-[#0b2c6a] hover:bg-[#082050] text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-3 overflow-hidden relative"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore All Events
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
          </button>
        </div>
      </main>

    </div>
  );
}