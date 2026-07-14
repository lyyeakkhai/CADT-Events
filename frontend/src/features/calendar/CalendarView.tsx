import { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Calendar as CalIcon, Clock, Loader2 } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { getEvents, type ApiEvent, useEventsApi } from '../../services/api';
import type { AcademicEvent } from '../events/data/eventData';
import './Calendar.css';
import { toAcademicEvent } from '../../lib/eventMapper';

interface CalendarViewProps {
  onSelectEvent?: (event: AcademicEvent) => void;
  onGoHome?: () => void;
}

export default function CalendarView({ onSelectEvent, onGoHome }: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('dayGridMonth');
  
  const [apiEvents, setApiEvents] = useState<ApiEvent[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { getMyBookings } = useEventsApi();

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      try {
        setLoading(true);
        const [eventsRes, bookings] = await Promise.all([
          getEvents(),
          getMyBookings().catch(() => [] as any[]), // non-fatal if not logged or no bookings
        ]);
        if (!cancelled) {
          if (eventsRes.success) setApiEvents(eventsRes.data);
          setMyBookings(bookings || []);
        }
      } catch (error) {
        console.error('Failed to fetch events/bookings for calendar:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAll();
    return () => { cancelled = true; };
  }, []);

  const registeredEventIds = new Set(myBookings.map((b: any) => b.event?.id || b.eventId));

  const calendarEvents = apiEvents.map((event) => {
    const isRegistered = registeredEventIds.has(event.id);
    const end = event.endTimestamp ? new Date(event.endTimestamp) : null;
    const isPast = end ? end < new Date() : new Date(event.startTimestamp) < new Date();
    const title = isPast ? `${event.title} (Done)` : (isRegistered ? `${event.title} ★` : event.title);

    return {
      id: event.id,
      title,
      start: event.startTimestamp,
      end: event.endTimestamp,
      classNames: [
        isPast ? 'cal-past' : (isRegistered ? 'cal-registered' : 'cal-default'),
      ],
      extendedProps: { rawData: event, isRegistered, isPast },
    };
  });

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

  const handleEventClick = (eventId: string) => {
    if (onSelectEvent) {
      const found = apiEvents.find(e => e.id === eventId);
      if (found) {
        onSelectEvent(toAcademicEvent(found));
      }
    }
  };

  return (
    <div className="w-full px-6 py-6 fade-in pt-8 min-h-screen max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-2">
            <button onClick={onGoHome} className="hover:text-[#0b2c6a] transition-colors cursor-pointer text-slate-500 font-medium">Home</button>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-[#0b2c6a] font-bold">Calendar</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#0b2c6a]">
            Event Calendar
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl text-sm md:text-base font-medium">
            All events (past &amp; future). ★ = you are registered. Gray = completed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                <button onClick={handlePrev} className="p-2 hover:bg-slate-100 rounded-full text-[#0b2c6a] transition-all cursor-pointer"><ChevronLeft size={20}/></button>
                <h2 className="text-lg font-bold text-slate-800 min-w-[150px] text-center">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <button onClick={handleNext} className="p-2 hover:bg-slate-100 rounded-full text-[#0b2c6a] transition-all cursor-pointer"><ChevronRight size={20}/></button>
              </div>
              <button onClick={handleToday} className="px-4 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-all font-semibold cursor-pointer shadow-sm">Today</button>
            </div>
            <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200/60">
              <button 
                onClick={() => changeView('dayGridMonth')} 
                className={`px-4 py-1.5 rounded-md text-sm transition-all cursor-pointer ${currentView === 'dayGridMonth' ? 'bg-white text-[#0b2c6a] font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 font-medium'}`}>
                Month
              </button>
              <button 
                onClick={() => changeView('timeGridWeek')}
                className={`px-4 py-1.5 rounded-md text-sm transition-all cursor-pointer ${currentView === 'timeGridWeek' ? 'bg-white text-[#0b2c6a] font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 font-medium'}`}>
                Week
              </button>
              <button 
                onClick={() => changeView('timeGridDay')}
                className={`px-4 py-1.5 rounded-md text-sm transition-all cursor-pointer ${currentView === 'timeGridDay' ? 'bg-white text-[#0b2c6a] font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700 font-medium'}`}>
                Day
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 relative">
            {loading && (
              <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                <Loader2 className="w-8 h-8 text-[#0b2c6a] animate-spin" />
              </div>
            )}
            <div className="custom-calendar-wrapper">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={false}
                events={calendarEvents}
                height={700}
                selectable={false}
                dayMaxEvents={true}
                eventClick={(info) => handleEventClick(info.event.id)}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
              <CalIcon className="text-[#0b2c6a]" size={18} />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Upcoming Events</h3>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                 {[1,2,3].map(i => (
                   <div key={i} className="animate-pulse flex gap-4">
                     <div className="w-14 h-16 bg-slate-100 rounded-lg"></div>
                     <div className="flex-1 space-y-2 py-2">
                       <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                       <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                     </div>
                   </div>
                 ))}
              </div>
            ) : (
              <div className="space-y-4">
                {calendarEvents.slice(0, 5).map((ev, i) => {
                  const evDate = new Date(ev.start);
                  const isReg = (ev as any).extendedProps?.isRegistered;
                  const pastEv = (ev as any).extendedProps?.isPast;
                  return (
                  <div 
                    key={i} 
                    onClick={() => handleEventClick(ev.id)}
                    className="group flex gap-4 p-3 -mx-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <div className="text-center min-w-[56px] flex flex-col justify-center bg-slate-100 rounded-xl py-2 group-hover:bg-[#0b2c6a] transition-colors">
                      <span className="block text-[10px] font-bold text-slate-500 tracking-tighter uppercase group-hover:text-blue-200 transition-colors">{format(evDate, 'MMM')}</span>
                      <span className="block text-xl font-bold text-slate-800 leading-none mt-1 group-hover:text-white transition-colors">{format(evDate, 'dd')}</span>
                    </div>
                    <div className="overflow-hidden py-1 flex flex-col justify-center">
                      <h4 className="font-bold text-sm text-slate-800 group-hover:text-[#0b2c6a] transition-colors truncate flex items-center gap-1.5">
                        {ev.title}
                        {isReg && <span className="text-[9px] px-1.5 py-px bg-emerald-100 text-emerald-700 rounded font-black">REGISTERED</span>}
                        {pastEv && <span className="text-[9px] px-1.5 py-px bg-slate-200 text-slate-600 rounded font-black">DONE</span>}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                        <Clock size={12} /> {format(evDate, 'hh:mm a')}
                      </p>
                    </div>
                  </div>
                )})}
                {calendarEvents.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4 font-medium">No events found.</p>
                )}
              </div>
            )}
            <button 
              onClick={onGoHome}
              className="w-full mt-6 py-2.5 bg-[#0b2c6a]/5 text-[#0b2c6a] border border-[#0b2c6a]/20 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#0b2c6a] hover:text-white transition-all cursor-pointer shadow-sm">
                Browse All Events
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
