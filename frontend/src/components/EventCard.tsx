import React from 'react';
import { MapPin } from 'lucide-react';
import type { AcademicEvent } from '../features/events/data/eventData';
import { getEventStatusLabel, isEventPast } from '../lib/utils';

interface EventCardProps {
  event: AcademicEvent;
  onSelect: (event: AcademicEvent) => void;
}

export default function EventCard({ event, onSelect }: EventCardProps) {
  const past = event.isPast ?? isEventPast(event);
  const statusLabel = getEventStatusLabel(event);
  const isCompleted = past || statusLabel === 'Completed';

  return (
    <div 
      onClick={() => onSelect(event)}
      className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all duration-200 flex flex-col justify-between group cursor-pointer ${isCompleted ? 'border-slate-200 opacity-90' : 'border-slate-200 hover:shadow-md hover:border-slate-300'}`}
    >
      <div>
        {/* Card Image — cleaner treatment */}
        <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
          <img 
            src={event.image} 
            alt={event.title} 
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02] ${isCompleted ? 'grayscale-[0.35]' : ''}`} 
          />
          <span className="absolute top-3 left-3 bg-white/95 text-[#0b2c6a] text-[10px] font-semibold tracking-[0.5px] px-2.5 py-0.5 rounded border border-white/60 shadow-sm">
            {event.badge}
          </span>
          <span className={`absolute top-3 right-3 text-white text-[10px] font-black tracking-wider px-2.5 py-0.5 rounded shadow-sm ${
            statusLabel === 'Upcoming' ? 'bg-emerald-500/90' :
            statusLabel === 'Ongoing' ? 'bg-rose-500/90 animate-pulse' :
            statusLabel === 'Cancelled' ? 'bg-red-800/90' :
            'bg-slate-700/90'
          }`}>
            {statusLabel}
          </span>
        </div>

        {/* Content — improved hierarchy + breathing room (per DESIGN.md) */}
        <div className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-700 mb-2">
            <span>{event.date}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-600">{event.time}</span>
          </div>
          
          <h3 className="text-[17px] font-extrabold text-slate-900 leading-snug tracking-[-0.01em] mb-2.5 line-clamp-2 group-hover:text-[#0b2c6a] cursor-pointer transition-colors">
            {event.title}
          </h3>
          
          <p className="text-[14px] text-slate-600 line-clamp-2 mb-3.5 leading-relaxed">
            {event.description}
          </p>
          
          <p className="text-sm text-slate-500">
            <span className="text-slate-400">Host</span> {event.speaker}
          </p>
        </div>
      </div>

      {/* Action Tray */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-slate-500 truncate max-w-[110px] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {event.venue}
          </span>
          {event.seatsLeft !== undefined && !isCompleted && (
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] border border-emerald-100">
              {event.seatsLeft} left
            </span>
          )}
          {isCompleted && (
            <span className="font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] border border-slate-200">
              Done
            </span>
          )}
        </div>
        <button
          onClick={() => onSelect(event)}
          className={`px-4 py-1.5 text-white text-xs font-bold rounded-lg transition-all active:scale-[0.985] ${isCompleted ? 'bg-slate-500 hover:bg-slate-600' : 'bg-[#0b2c6a] hover:bg-[#082050]'}`}
        >
          {isCompleted ? 'View Details' : 'View Details'}
        </button>
      </div>
    </div>
  );
}
