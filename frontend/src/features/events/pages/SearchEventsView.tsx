import React, { useState, useMemo, useEffect } from 'react';
import { Search, RotateCcw, X, Loader2, Filter } from 'lucide-react';
import EventCard from '../../../components/EventCard';
import type { AcademicEvent } from '../../../features/events/data/eventData';
import { getEvents } from '../../../services/api';
import { useUrlSearch } from '../../../hooks/useUrlSearch';
import { toAcademicEvent } from '../../../lib/eventMapper';

interface SearchEventsViewProps {
  onSelectEvent?: (event: AcademicEvent) => void;
}

const DEPARTMENTS = [
  'All',
  'Computer Science',
  'Software Engineering',
  'Telecommunication & Networking',
  'Digital Business'
];

export default function SearchEventsView({ onSelectEvent }: SearchEventsViewProps) {
  const [searchQuery, setSearchQuery] = useUrlSearch('q');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('This Month');
  const [apiEvents, setApiEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            setError('No events found.');
          }
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError('Unable to load events.');
          setApiEvents([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const allEvents = apiEvents;

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

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedDept('All');
    setSelectedTimeframe('This Month');
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="mb-8 border-b border-slate-200 pb-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Search Events</h2>
          <p className="text-slate-500 mt-2">Find specific academic events, workshops & seminars</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Left Sidebar Filters */}
          <aside className="w-full md:w-64 lg:w-72 shrink-0 md:sticky md:top-24">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col gap-6">
              {/* Search Box */}
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Keywords..."
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 pl-10 pr-8 py-2.5 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0b2c6a] focus:border-[#0b2c6a] transition-all"
                    autoFocus
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
              </div>

              {/* Department Filter */}
              <div>
                <label className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Department
                </label>
                <div className="flex flex-col gap-2">
                  {DEPARTMENTS.map((dept) => {
                    const isActive = selectedDept === dept;
                    return (
                      <button
                        key={dept}
                        onClick={() => setSelectedDept(dept)}
                        className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          isActive 
                            ? 'bg-[#0b2c6a] text-white border-[#0b2c6a] shadow-sm' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-white'
                        }`}
                      >
                        {dept === 'All' ? 'All Departments' : dept.replace('Telecommunication & Networking', 'Telecom')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timeframe Filter */}
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Timeframe</label>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-medium px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0b2c6a] focus:border-[#0b2c6a] transition-all cursor-pointer"
                >
                  <option value="This Month">This month</option>
                  <option value="Next Month">Next month</option>
                  <option value="Past Events">Past Events</option>
                </select>
              </div>

              {/* Clear Button */}
              <button 
                onClick={handleClearAll}
                className="mt-2 text-slate-500 hover:text-[#0b2c6a] transition-colors cursor-pointer font-semibold flex items-center justify-center gap-2 text-sm bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 py-2.5 rounded-xl"
              >
                <RotateCcw className="w-4 h-4" /> Clear all filters
              </button>
            </div>
          </aside>

          {/* Main Content (Event Grid) */}
          <main className="flex-1 w-full">
            {loading ? (
              <div className="w-full flex flex-col items-center justify-center py-20 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#0b2c6a]" />
                <p>Loading events...</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                    {error}
                  </div>
                )}
                
                <div className="mb-6 text-sm font-bold text-slate-500 uppercase tracking-wider pl-1">
                  {filteredEvents.length} Result{filteredEvents.length !== 1 && 's'}
                </div>

                {filteredEvents.length === 0 ? (
                  <div className="w-full text-center py-20 bg-white rounded-3xl border border-slate-200 px-6 flex flex-col items-center justify-center animate-fade-in shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-lg font-bold text-slate-800 mb-2">No events match your search</p>
                    <p className="text-slate-500 max-w-sm leading-relaxed mb-6">
                      Try adjusting your keywords or clearing some filters to see more events.
                    </p>
                    <button
                      onClick={handleClearAll}
                      className="px-6 py-2.5 bg-[#0b2c6a] hover:bg-[#082050] text-white font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                    >
                      <RotateCcw className="w-4 h-4" /> Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {filteredEvents.map((event) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        onSelect={(ev) => onSelectEvent && onSelectEvent(ev)} 
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
          
        </div>
      </div>
    </div>
  );
}
