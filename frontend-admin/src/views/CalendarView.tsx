import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, ChevronLeft, DownloadCloud, Plus, Calendar as CalIcon, Clock, Loader2 } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import apiClient from '../lib/apiClient';
import './Calendar.css';

type ApiEvent = {
  id: string;
  title: string;
  startTimestamp: string;
  endTimestamp: string;
  location?: string | null;
  eventType?: string | null;
  status?: string;
};

type CalEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  extendedProps: { location: string; category: string; status?: string };
};

export default function CalendarView() {
  const _nav = useNavigate();
  const onNavigate = (v: string) => _nav(v === 'dashboard' ? '/' : '/' + v);
  const calendarRef = useRef<FullCalendar>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [apiEvents, setApiEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/events/all');
        if (!cancelled) setApiEvents(res.data.data || []);
      } catch (e) {
        console.error('Failed to load calendar events', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const events: CalEvent[] = useMemo(
    () =>
      apiEvents.map((e) => ({
        id: e.id,
        title: e.title,
        start: e.startTimestamp,
        end: e.endTimestamp,
        extendedProps: {
          location: e.location || 'TBA',
          category: (e.eventType || 'event').toLowerCase(),
          status: e.status,
        },
      })),
    [apiEvents]
  );

  const upcoming = useMemo(() => {
    const now = Date.now();
    return [...apiEvents]
      .filter((e) => new Date(e.startTimestamp).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.startTimestamp).getTime() - new Date(b.startTimestamp).getTime()
      )
      .slice(0, 6);
  }, [apiEvents]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of apiEvents) {
      const key = (e.eventType || 'other').toLowerCase();
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [apiEvents]);

  const handlePrev = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.prev();
    if (calendarApi) setCurrentDate(calendarApi.getDate());
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.next();
    if (calendarApi) setCurrentDate(calendarApi.getDate());
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.today();
    if (calendarApi) setCurrentDate(calendarApi.getDate());
  };

  const changeView = (viewName: string) => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.changeView(viewName);
    setCurrentView(viewName);
  };

  return (
    <div className="w-full px-3 sm:px-6 py-4 sm:py-6 fade-in">
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
          <button
            onClick={() => onNavigate('export')}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-primary hover:bg-surface-container-low transition-all shadow-sm"
          >
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
                <button onClick={handlePrev} className="p-2 hover:bg-surface-container rounded-full text-primary transition-all">
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-primary min-w-[160px] text-center">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <button onClick={handleNext} className="p-2 hover:bg-surface-container rounded-full text-primary transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>
              <button
                onClick={handleToday}
                className="px-4 py-1.5 border border-outline-variant rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-low transition-all"
              >
                Today
              </button>
            </div>
            <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant/60">
              <button
                onClick={() => changeView('dayGridMonth')}
                className={`px-4 py-1.5 rounded-md text-sm transition-colors ${currentView === 'dayGridMonth' ? 'bg-primary text-white font-bold shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
              >
                Month
              </button>
              <button
                onClick={() => changeView('timeGridWeek')}
                className={`px-4 py-1.5 rounded-md text-sm transition-colors ${currentView === 'timeGridWeek' ? 'bg-primary text-white font-bold shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
              >
                Week
              </button>
              <button
                onClick={() => changeView('timeGridDay')}
                className={`px-4 py-1.5 rounded-md text-sm transition-colors ${currentView === 'timeGridDay' ? 'bg-primary text-white font-bold shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
              >
                Day
              </button>
            </div>
          </div>

          <div className="glass-card p-4 rounded-xl shadow-sm flex flex-col bg-surface-container-lowest border border-outline-variant/50 relative">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-xl">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            )}
            <div className="custom-calendar-wrapper">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={false}
                events={events}
                height={700}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                eventClick={(info) => {
                  onNavigate('events/' + info.event.id);
                }}
                dateClick={() => {
                  onNavigate('create');
                }}
              />
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
              {loading ? (
                <p className="text-sm text-on-surface-variant py-4 text-center">Loading…</p>
              ) : upcoming.length === 0 ? (
                <p className="text-sm text-on-surface-variant py-4 text-center">No upcoming events</p>
              ) : (
                upcoming.map((ev) => {
                  const start = new Date(ev.startTimestamp);
                  return (
                    <div
                      key={ev.id}
                      onClick={() => onNavigate('events/' + ev.id)}
                      className="group flex gap-4 p-3 rounded-lg hover:bg-surface-container-low transition-all cursor-pointer border border-transparent hover:border-outline-variant/30 bg-surface-container-lowest"
                    >
                      <div className="text-center min-w-[56px] flex flex-col justify-center bg-surface-container rounded-lg py-2">
                        <span className="block text-[10px] font-bold text-on-surface-variant tracking-tighter uppercase">
                          {format(start, 'MMM')}
                        </span>
                        <span className="block text-xl font-bold text-primary leading-none mt-1">
                          {format(start, 'dd')}
                        </span>
                      </div>
                      <div className="overflow-hidden py-1">
                        <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate">
                          {ev.title}
                        </h4>
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1 font-medium">
                          <Clock size={12} /> {format(start, 'h:mm a')} — {ev.location || 'TBA'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full mt-4 py-2 bg-primary/5 text-primary border border-primary/20 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-all"
            >
              View All Events
            </button>
          </section>

          <section className="glass-card p-5 rounded-xl border border-outline-variant/50">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/50">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Event types</h3>
            </div>
            <div className="space-y-2">
              {categoryCounts.length === 0 && !loading ? (
                <p className="text-sm text-on-surface-variant">No categories yet</p>
              ) : (
                categoryCounts.map(([label, count]) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 p-2 rounded hover:bg-surface-container-low"
                  >
                    <span className="text-sm font-medium text-on-surface flex-grow capitalize">
                      {label}
                    </span>
                    <span className="text-[10px] bg-surface-container text-primary px-2 py-0.5 rounded-full font-bold">
                      {String(count).padStart(2, '0')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
