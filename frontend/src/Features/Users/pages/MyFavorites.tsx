import React, { useState, useMemo } from 'react';
import { FIGMA_EVENTS_DATA } from '../data/eventData.tsx';
import type { AcademicEvent } from '../data/eventData.tsx';

interface MyFavoritesProps {
  onSelectEvent?: (event: AcademicEvent) => void;
}

const GENRE_FILTERS = ['All Events', 'Tech & AI', 'Seminars', 'Career Fair', 'Innovation'] as const;
type GenreFilter = typeof GENRE_FILTERS[number];

const SORT_OPTIONS = ['Date (Newest)', 'Date (Oldest)', 'Title A-Z'] as const;
type SortOption = typeof SORT_OPTIONS[number];

function matchesGenre(event: AcademicEvent, genre: GenreFilter): boolean {
  if (genre === 'All Events') return true;
  if (genre === 'Seminars') return event.type === 'Seminar';
  if (genre === 'Career Fair') return event.type === 'Networking';
  if (genre === 'Tech & AI') return event.dept === 'Computer Science' || event.dept === 'Cybersecurity';
  if (genre === 'Innovation') return event.type === 'Exhibition' || event.type === 'Hands-on';
  return true;
}

const AVATAR_GROUPS = [
  [{ initials: 'JD', color: '#3b82f6' }, { initials: 'KL', color: '#10b981' }, '+12'],
  [{ initials: 'AM', color: '#f59e0b' }, { initials: 'RS', color: '#8b5cf6' }, '+8'],
  [{ initials: 'TN', color: '#ef4444' }, { initials: 'PC', color: '#06b6d4' }, '+5'],
  [{ initials: 'BW', color: '#f97316' }, { initials: 'MK', color: '#84cc16' }, '+20'],
  [{ initials: 'GL', color: '#ec4899' }, { initials: 'VH', color: '#14b8a6' }, '+3'],
  [{ initials: 'XY', color: '#6366f1' }, { initials: 'QR', color: '#a3e635' }, '+9'],
];

const FAVORITE_IDS = new Set([1, 2, 3, 4, 5, 6]);

export default function MyFavorites({ onSelectEvent }: MyFavoritesProps) {
  const [activeGenre, setActiveGenre] = useState<GenreFilter>('All Events');
  const [sortOption, setSortOption] = useState<SortOption>('Date (Newest)');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());

  const favoriteEvents = useMemo(() => {
    let events = FIGMA_EVENTS_DATA.filter(
      (e) => FAVORITE_IDS.has(e.id) && !removedIds.has(e.id) && matchesGenre(e, activeGenre)
    );
    if (sortOption === 'Date (Newest)') events = [...events].reverse();
    else if (sortOption === 'Title A-Z') events = [...events].sort((a, b) => a.title.localeCompare(b.title));
    return events;
  }, [activeGenre, sortOption, removedIds]);

  const handleUnfavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setRemovedIds((prev) => new Set([...prev, id]));
  };

  return (
    <main className="w-full bg-[#f8fafc] min-h-screen font-sans antialiased selection:bg-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">My Favorites</h1>
          <p className="text-sm text-slate-500 font-medium">Your curated collection of upcoming institutional excellence.</p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1 shrink-0">Filter by Genre:</span>
            {GENRE_FILTERS.map((genre) => (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-150 cursor-pointer select-none ${
                  activeGenre === genre
                    ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:text-slate-900'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          <div className="relative shrink-0">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-xl transition-colors cursor-pointer select-none shadow-xs"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M6 12h12M10 17h4" />
              </svg>
              Sort by: {sortOption}
              <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
              </svg>
            </button>
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setSortOption(opt); setShowSortMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                      sortOption === opt ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cards Grid */}
        {favoriteEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <span className="text-5xl mb-4">💔</span>
            <h2 className="text-lg font-black text-slate-800 mb-1">No favorites here</h2>
            <p className="text-sm text-slate-400 max-w-xs">
              {activeGenre === 'All Events'
                ? "You haven't saved any events yet."
                : `No favorites match the "${activeGenre}" filter.`}
            </p>
            {activeGenre !== 'All Events' && (
              <button
                onClick={() => setActiveGenre('All Events')}
                className="mt-5 px-5 py-2 bg-slate-950 text-white text-xs font-extrabold rounded-xl hover:bg-blue-900 transition-colors cursor-pointer"
              >
                Show All Favorites
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {favoriteEvents.map((event, idx) => (
              <FavoriteCard
                key={event.id}
                event={event}
                avatarGroup={AVATAR_GROUPS[idx % AVATAR_GROUPS.length]}
                onSelect={() => onSelectEvent?.(event)}
                onUnfavorite={(e) => handleUnfavorite(event.id, e)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

interface FavoriteCardProps {
  event: AcademicEvent;
  avatarGroup: (string | { initials: string; color: string })[];
  onSelect: () => void;
  onUnfavorite: (e: React.MouseEvent) => void;
}

function FavoriteCard({ event, avatarGroup, onSelect, onUnfavorite }: FavoriteCardProps) {
  const [heartActive, setHeartActive] = useState(true);

  const handleHeartClick = (e: React.MouseEvent) => {
    setHeartActive(false);
    setTimeout(() => onUnfavorite(e), 300);
  };

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300/80 flex flex-col justify-between cursor-pointer"
      style={{ transition: 'opacity 0.3s, transform 0.3s, box-shadow 0.2s', opacity: heartActive ? 1 : 0, transform: heartActive ? 'scale(1)' : 'scale(0.95)' }}
    >
      {/* Image */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden" onClick={onSelect}>
        <img src={event.image} alt={event.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        <span className="absolute top-3 left-3 bg-slate-950 text-white text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider uppercase shadow-sm">
          {event.badge}
        </span>
        <button
          onClick={handleHeartClick}
          className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow hover:scale-110 transition-transform cursor-pointer"
        >
          <svg className={`w-4 h-4 transition-colors ${heartActive ? 'text-red-500 fill-red-500' : 'text-slate-300 fill-slate-200'}`} viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1" onClick={onSelect}>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 uppercase tracking-wide mb-1.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <span>{event.date}</span>
          <span>&bull;</span>
          <span>{event.time}</span>
        </div>
        <h3 className="text-sm font-extrabold text-slate-900 leading-snug tracking-tight mb-1.5 line-clamp-2 hover:text-blue-900 transition-colors">
          {event.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">{event.description}</p>
      </div>

      {/* Tray */}
      <div className="px-4 pb-4 pt-0 flex items-center justify-between gap-2 mt-1">
        <div className="flex items-center">
          {avatarGroup.slice(0, 2).map((av, i) => {
            if (typeof av === 'string') return null;
            return (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white shrink-0" style={{ backgroundColor: av.color, marginLeft: i > 0 ? '-6px' : '0' }}>
                {av.initials}
              </div>
            );
          })}
          {typeof avatarGroup[2] === 'string' && (
            <div className="w-6 h-6 rounded-full border-2 border-white bg-amber-400 flex items-center justify-center text-[8px] font-black text-slate-900 shrink-0" style={{ marginLeft: '-6px' }}>
              {avatarGroup[2]}
            </div>
          )}
        </div>
        <button onClick={onSelect} className="px-4 py-2 bg-slate-950 hover:bg-blue-900 text-white text-xs font-extrabold rounded-lg shadow-sm transition-all active:scale-[0.97] cursor-pointer whitespace-nowrap">
          Register Now
        </button>
      </div>
    </div>
  );
}