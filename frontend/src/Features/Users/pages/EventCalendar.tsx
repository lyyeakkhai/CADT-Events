import React, { useState } from 'react';
import { FIGMA_EVENTS_DATA, type AcademicEvent } from '../data/eventData';

// ── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const DAYS_OF_WEEK = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

type ViewMode = 'Month' | 'Week' | 'Day';

type Category = 'Technology' | 'Innovation' | 'Business' | 'Career';

const CATEGORY_COLORS: Record<Category, string> = {
  Technology: 'bg-slate-800 text-white',
  Innovation: 'bg-amber-500 text-white',
  Business:   'bg-blue-600 text-white',
  Career:     'bg-emerald-600 text-white',
};

const CATEGORY_COUNTS: Record<Category, number> = {
  Technology: 12,
  Innovation:  8,
  Business:    5,
  Career:      3,
};

/** Map each event to a calendar category for coloring */
function categoryForEvent(event: AcademicEvent): Category {
  if (event.type === 'Conference' || event.type === 'Seminar') return 'Technology';
  if (event.type === 'Workshop' || event.type === 'Hands-on') return 'Innovation';
  if (event.type === 'Networking') return 'Business';
  return 'Career';
}

/** Parse "Oct 24, 2024" → Date */
function parseEventDate(dateStr: string): Date {
  return new Date(dateStr);
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// ── Upcoming Events (sidebar) — sorted by date ───────────────────────────────
const UPCOMING = [...FIGMA_EVENTS_DATA]
  .sort((a, b) => parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime())
  .slice(0, 4);

// ── Component ─────────────────────────────────────────────────────────────────
interface EventCalendarProps {
  onSelectEvent?: (event: AcademicEvent) => void;
}

export default function EventCalendar({ onSelectEvent }: EventCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewMode, setViewMode]   = useState<ViewMode>('Month');
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(
    new Set(['Technology', 'Innovation', 'Business'])
  );

  // ── navigation ──────────────────────────────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };
  const goToday = () => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); };

  const toggleCategory = (cat: Category) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  // ── build calendar grid ──────────────────────────────────────────────────────
  const daysInMonth  = getDaysInMonth(viewYear, viewMonth);
  const firstWeekDay = getFirstDayOfMonth(viewYear, viewMonth);
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1);

  // 6 rows × 7 cols
  const totalCells = 42;
  const cells: { day: number; isCurrentMonth: boolean }[] = [];

  for (let i = 0; i < firstWeekDay; i++) {
    cells.push({ day: prevMonthDays - firstWeekDay + 1 + i, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true });
  }
  let nextDay = 1;
  while (cells.length < totalCells) {
    cells.push({ day: nextDay++, isCurrentMonth: false });
  }

  // ── events by day ────────────────────────────────────────────────────────────
  const eventsForCell = (day: number, isCurrentMonth: boolean): AcademicEvent[] => {
    if (!isCurrentMonth) return [];
    return FIGMA_EVENTS_DATA.filter(ev => {
      const d = parseEventDate(ev.date);
      const cat = categoryForEvent(ev);
      return (
        d.getFullYear() === viewYear &&
        d.getMonth()    === viewMonth &&
        d.getDate()     === day &&
        activeCategories.has(cat)
      );
    });
  };

  const isToday = (day: number, isCurrentMonth: boolean) =>
    isCurrentMonth &&
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear  === today.getFullYear();

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <main className="flex-grow w-full bg-slate-50">
      {/* Breadcrumb */}
      <div className="w-full px-4 sm:px-8 lg:px-12 pt-5 pb-1">
        <p className="text-xs font-semibold text-slate-400 tracking-wide">
          Dashboard &rsaquo; <span className="text-slate-700">Calendar</span>
        </p>
        <h1 className="text-3xl font-black text-slate-900 mt-1 mb-6">Event Calendar</h1>
      </div>

      {/* Main layout */}
      <div className="w-full px-4 sm:px-8 lg:px-12 pb-12 flex flex-col lg:flex-row gap-6">

        {/* ── LEFT: Calendar panel ─────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

            {/* Calendar header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              {/* Month/year nav */}
              <div className="flex items-center gap-3">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800 cursor-pointer"
                  aria-label="Previous month"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-base font-black text-slate-900 min-w-[140px] text-center">
                  {MONTHS[viewMonth]} {viewYear}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800 cursor-pointer"
                  aria-label="Next month"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={goToday}
                  className="ml-1 px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                >
                  Today
                </button>
              </div>

              {/* View mode tabs */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
                {(['Month','Week','Day'] as ViewMode[]).map(v => (
                  <button
                    key={v}
                    onClick={() => setViewMode(v)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      viewMode === v
                        ? 'bg-white shadow text-slate-900'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Days-of-week header */}
            <div className="grid grid-cols-7 border-b border-slate-100">
              {DAYS_OF_WEEK.map(d => (
                <div key={d} className="py-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {cells.map((cell, i) => {
                const cellEvents = eventsForCell(cell.day, cell.isCurrentMonth);
                const todayCell  = isToday(cell.day, cell.isCurrentMonth);
                const isLast = i >= totalCells - 7;

                return (
                  <div
                    key={i}
                    className={`min-h-[90px] p-1.5 border-b border-r border-slate-100 flex flex-col
                      ${!cell.isCurrentMonth ? 'bg-slate-50/60' : 'bg-white'}
                      ${isLast ? 'border-b-0' : ''}
                      ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}
                    `}
                  >
                    {/* Day number */}
                    <span className={`text-[11px] font-black mb-1 self-start leading-none px-1.5 py-0.5 rounded-full
                      ${todayCell
                        ? 'bg-slate-900 text-white'
                        : cell.isCurrentMonth
                          ? 'text-slate-700'
                          : 'text-slate-300'
                      }`}
                    >
                      {cell.day}
                    </span>

                    {/* Event chips */}
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      {cellEvents.slice(0, 2).map(ev => {
                        const cat = categoryForEvent(ev);
                        const colorClass = CATEGORY_COLORS[cat];
                        return (
                          <button
                            key={ev.id}
                            onClick={() => onSelectEvent?.(ev)}
                            className={`w-full text-left px-1.5 py-0.5 rounded text-[9px] font-bold truncate cursor-pointer transition-opacity hover:opacity-80 ${colorClass}`}
                            title={ev.title}
                          >
                            {ev.title}
                          </button>
                        );
                      })}
                      {cellEvents.length > 2 && (
                        <span className="text-[9px] font-bold text-slate-400 px-1">
                          +{cellEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Sidebar ───────────────────────────────────────────── */}
        <div className="w-full lg:w-72 flex flex-col gap-5 shrink-0">

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-black text-slate-900 mb-4">Upcoming Events</h3>
            <div className="flex flex-col gap-3">
              {UPCOMING.map(ev => {
                const d = parseEventDate(ev.date);
                const mon = MONTHS[d.getMonth()].slice(0, 3).toUpperCase();
                const day = d.getDate().toString().padStart(2, '0');
                const cat = categoryForEvent(ev);
                const accent =
                  cat === 'Technology' ? 'border-slate-800' :
                  cat === 'Innovation' ? 'border-amber-500' :
                  cat === 'Business'   ? 'border-blue-600'  : 'border-emerald-600';

                return (
                  <button
                    key={ev.id}
                    onClick={() => onSelectEvent?.(ev)}
                    className={`flex items-start gap-3 text-left w-full group cursor-pointer`}
                  >
                    {/* Date badge */}
                    <div className={`flex flex-col items-center justify-center w-12 shrink-0 border-l-4 ${accent} pl-2 py-0.5`}>
                      <span className="text-[9px] font-black text-slate-400 uppercase leading-none">{mon}</span>
                      <span className="text-lg font-black text-slate-900 leading-tight">{day}</span>
                    </div>
                    {/* Info */}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-600 transition-colors leading-snug">
                        {ev.title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        🕐 {ev.time} · {ev.venue}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <button className="mt-4 w-full py-2.5 text-xs font-black text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
              View All Schedule
            </button>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-black text-slate-900 mb-4">Categories</h3>
            <div className="flex flex-col gap-3">
              {(Object.keys(CATEGORY_COUNTS) as Category[]).map(cat => {
                const isChecked = activeCategories.has(cat);
                const checkColor =
                  cat === 'Technology' ? 'bg-slate-800 border-slate-800' :
                  cat === 'Innovation' ? 'bg-amber-500 border-amber-500' :
                  cat === 'Business'   ? 'bg-blue-600 border-blue-600'   : 'border-slate-300 bg-white';

                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className="flex items-center justify-between w-full cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Checkbox */}
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                        isChecked ? checkColor : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                        {cat}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400">
                      {CATEGORY_COUNTS[cat].toString().padStart(2, '0')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tip card */}
          <div className="bg-slate-900 rounded-2xl p-5 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
            <div className="absolute -bottom-8 -right-4 w-32 h-32 rounded-full bg-white/5" />
            <div className="relative z-10">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "Drag and drop events to reschedule them quickly across the monthly grid."
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}