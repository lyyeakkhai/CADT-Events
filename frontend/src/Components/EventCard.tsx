import React from 'react';
import type { AcademicEvent } from '../Features/Users/data/eventData.tsx';

interface EventCardProps {
  event: AcademicEvent;
  onSelect: (event: AcademicEvent) => void;
}

export default function EventCard({ event, onSelect }: EventCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300/80 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Card Header Image Frame */}
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover" 
          />
          {/* Badge Flag */}
          <span className="absolute top-3 left-3 bg-slate-950 text-white text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider uppercase shadow-sm">
            {event.badge}
          </span>
        </div>

        {/* Content Specifications */}
        <div className="p-5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 uppercase tracking-wide mb-1.5">
            <span>📅 {event.date}</span>
            <span>&bull;</span>
            <span>{event.time}</span>
          </div>
          
          <h3 className="text-base font-extrabold text-slate-900 leading-snug tracking-tight mb-2 line-clamp-2 hover:text-blue-900 cursor-pointer">
            {event.title}
          </h3>
          
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {event.description}
          </p>
          
          <p className="text-[11px] font-semibold text-slate-400">
            Host Speaker: <span className="text-slate-600">{event.speaker}</span>
          </p>
        </div>
      </div>

      {/* Action Tray */}
      <div className="px-5 pb-5 pt-0 border-t border-slate-100/60 flex items-center justify-between gap-3 mt-2">
        <span className="text-[11px] font-bold text-slate-400 truncate max-w-[130px]">
          📍 {event.venue}
        </span>
        <button
          onClick={() => onSelect(event)}
          className="px-4 py-2 bg-slate-950 hover:bg-blue-900 text-white text-xs font-extrabold rounded-lg shadow-sm transition-all active:scale-[0.97]"
        >
          View Detail
        </button>
      </div>
    </div>
  );
}