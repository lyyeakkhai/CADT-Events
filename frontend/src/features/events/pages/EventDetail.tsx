import React, { useEffect, useState } from 'react';
import type { AcademicEvent } from '../data/eventData';
import { getEvent, type ApiEvent } from '../../../services/api';
import { toAcademicEvent } from '../../../lib/eventMapper';
import { getEventStatusLabel, isEventPast } from '../../../lib/utils';
import IDRI from '../../../assets/images/innovationcenter.png';

interface EventDetailsProps {
  event: AcademicEvent & { _apiId?: string };
  onBackClick: () => void;
  onRegisterClick: (event: AcademicEvent) => void;
}

export default function EventDetails({ event, onBackClick, onRegisterClick }: EventDetailsProps) {
  const [fullEvent, setFullEvent] = useState<AcademicEvent & { _apiId?: string }>(event);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch freshest data (incl. availableSeats) when we have an api id
  useEffect(() => {
    const apiId = (event as any)._apiId || (event as any).id;
    if (!apiId) return;
    let cancelled = false;
    setLoadingDetail(true);
    getEvent(String(apiId))
      .then((res) => {
        if (!cancelled && res?.data) {
          const mapped = toAcademicEvent(res.data as ApiEvent);
          setFullEvent(mapped);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingDetail(false); });
    return () => { cancelled = true; };
  }, [event]);

  const displayEvent = fullEvent;
  const seatsLeft = (displayEvent as any).seatsLeft ?? (displayEvent as any).availableSeats;
  const past = displayEvent.isPast ?? isEventPast(displayEvent);
  const statusLabel = getEventStatusLabel(displayEvent);

  // Dynamic speaker block from available data (graceful)
  const speakers = [
    {
      name: displayEvent.speaker,
      role: `CADT — ${displayEvent.badge || 'Event'}`,
      bio: displayEvent.description?.slice(0, 140) || 'Details to be announced.',
      image: displayEvent.image || event.image
    },
  ];

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen font-sans antialiased selection:bg-blue-100">
      
      {/* Contextual Hierarchy Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200/60 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs font-semibold text-slate-400">
          <button onClick={onBackClick} className="hover:text-blue-900 transition-colors cursor-pointer">
            Events
          </button>
          <span>/</span>
          <span className="text-slate-700 truncate max-w-[250px]">{event.title}</span>
        </div>
      </div>

      {/* =======================================================================
          SECTION 1: HERO DISPLAY BANNER (Mirrors your precise header container)
         ======================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden bg-slate-900 shadow-sm border border-slate-200/60 flex flex-col md:flex-row justify-between items-stretch">
          
          {/* Decorative Split Background Layers */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
          <img 
            src={event.image} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity"
          />

          {/* Left Text Block Information Funnel */}
          <div className="relative z-10 flex-1 p-6 sm:p-10 flex flex-col justify-center items-start text-white">
            <span className="bg-amber-400 text-slate-950 text-[10px] tracking-widest uppercase font-black px-2.5 py-1 rounded-md mb-4 shadow-xs select-none">
              INNOVATION & TECHNOLOGY
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-4 max-w-xl">
              {displayEvent.title}
            </h1>
            
            {/* Meta tags indicators strip (dynamic) */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5">
                <span>📅</span>
                <span>{displayEvent.date} · {displayEvent.time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>📍</span>
                <span>{displayEvent.venue}</span>
              </div>
              {seatsLeft != null && (
                <div className="flex items-center gap-1.5">
                  <span>🎟️</span>
                  <span>{seatsLeft} seats left</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Presentation Speaker Layer Feature Accent */}
          <div className="relative z-10 hidden md:flex w-[320px] lg:w-[400px] shrink-0 items-end justify-center overflow-hidden bg-gradient-to-t from-slate-950/80 to-transparent">
            <img 
              src={event.image} 
              alt={event.speaker} 
              className="h-[95%] w-auto object-contain object-bottom transition-transform duration-300 hover:scale-102"
            />
          </div>

        </div>
      </section>

      {past && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold rounded-xl px-4 py-2 flex items-center gap-2">
            <span>📅</span>
            <span>This event has ended — status: {statusLabel}</span>
          </div>
        </div>
      )}

      {/* Two-Column Primary Main Layout Content Area Matrix */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT TWO COLUMNS: Info Metrics and Details Panels */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* About The Event Text Context Block */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-4">
              About The Event
            </h2>
            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">
              {displayEvent.description || 'Join us for this CADT academic event. More details to follow.'}
            </p>

            {/* Quick Informational Grid Perks Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex gap-3 items-start">
                <span className="text-lg p-1.5 bg-blue-50 text-blue-900 rounded-lg">🎓</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-0.5">Academic Focus</h4>
                  <p className="text-[11px] font-medium text-slate-400 leading-normal">Deep dives into core research papers and digital pedagogical innovations.</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex gap-3 items-start">
                <span className="text-lg p-1.5 bg-indigo-50 text-indigo-900 rounded-lg">🤝</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-0.5">Networking Opportunities</h4>
                  <p className="text-[11px] font-medium text-slate-400 leading-normal">Connect directly with over 500 tech professionals and verified academic mentors.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Distinguished Speakers Grid Container */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Distinguished Speakers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {speakers.map((speaker, index) => (
                <div key={index} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs flex flex-col">
                  <div className="h-40 bg-slate-100 w-full overflow-hidden">
                    <img src={speaker.image} alt={speaker.name} className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-tight mb-0.5">{speaker.name}</h3>
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider mb-2">{speaker.role}</p>
                      <p className="text-[11px] font-medium text-slate-400 leading-relaxed line-clamp-3">{speaker.bio}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Event Agenda Timeline Track */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Event Agenda
            </h2>
            <div className="relative border-l-2 border-slate-100 pl-6 ml-2 space-y-8">
              
              {/* Milestone Slot 1 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-4 border-white shadow-xs" />
                <div className="text-[11px] font-bold text-amber-600 mb-1">09:00 AM — 10:30 AM</div>
                <h4 className="text-sm font-extrabold text-slate-900 mb-1">Opening Keynote: The Future of Governance</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                  Exploring how artificial intelligence models can streamline complex institutional logistics operations while strictly maintaining administrative transparency.
                </p>
                <div className="text-[10px] font-semibold text-slate-400 mt-2">👤 Presenter: {event.speaker}</div>
              </div>

              {/* Milestone Slot 2 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-xs" />
                <div className="text-[11px] font-bold text-amber-600 mb-1">11:00 AM — 12:30 PM</div>
                <h4 className="text-sm font-extrabold text-slate-900 mb-1">Panel Discussion: Ethical AI in Academia</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                  A curated panel of senior technical instructors discussing the direct impact of Large Language Models on traditional grading weights and peer-reviewed research integrity.
                </p>
                <div className="text-[10px] font-semibold text-slate-400 mt-2">👤 Presenter: Department Coordinators Panel</div>
              </div>

            </div>
          </section>

          {/* Venue Interactive Location Card Component Block */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Venue Location
            </h2>
            <div className="relative h-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60">
              <img 
                src={IDRI}
                alt="CADT Innovation Center Building Architecture" 
                className="w-full h-full object-cover brightness-95"
              />
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-slate-200/80 p-3 rounded-xl shadow-md max-w-xs flex gap-2.5 items-center">
                <span className="text-xl p-1 bg-slate-100 rounded-lg">🏢</span>
                <div>
                  <h4 className="text-xs font-black text-slate-900">CADT Innovation Center</h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Building H, Level 4, Academic Way</p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Action Checkout Conversion Ticket Sidebar Card */}
        <div className="space-y-6 lg:sticky lg:top-24">
          
          {/* Reservation Card Widget Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight mb-1">Reserve your seat</h3>
              <p className="text-[11px] font-medium text-slate-400 leading-normal">
                Join the academic conversation. Limited seating modules available for non-institutional guests[cite: 301].
              </p>
            </div>

            <div className="border-t border-b border-slate-100 py-3.5 space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">Availability</span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ● {seatsLeft != null ? `${seatsLeft} Seats Left` : 'Open'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">Students</span>
                <span className="text-xs font-black text-blue-600">FREE (CADT community)</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">Credits</span>
                <span className="text-xs font-black text-amber-600">+{ (displayEvent as any).creditValue || 1 } upon attendance</span>
              </div>
            </div>

            {/* Sticky Action Triggers */}
            <div className="space-y-2 pt-1">
              <button 
                onClick={() => onRegisterClick(displayEvent)}
                disabled={past || (seatsLeft != null && seatsLeft <= 0)}
                className="w-full bg-[#0b2c6a] hover:bg-[#082050] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-xl shadow-sm transition-all duration-150 cursor-pointer active:scale-[0.985]"
              >
                {past ? 'EVENT COMPLETED' : (seatsLeft != null && seatsLeft <= 0 ? 'EVENT FULL' : 'REGISTER NOW')}
              </button>
              <button className="w-full bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer">
                SAVE FOR LATER
              </button>
            </div>

            {/* Social Proof Context Widget Segment */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-400">
              <div className="flex -space-x-2 overflow-hidden">
                <img className="inline-block h-5 w-5 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80" alt="" />
                <img className="inline-block h-5 w-5 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80" alt="" />
                <img className="inline-block h-5 w-5 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80" alt="" />
              </div>
              <span>+186 yappers already attending</span>
            </div>
          </div>

          {/* Additional Asset Download Resource Center Widget Area */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h4 className="text-xs font-black text-slate-900 mb-3 uppercase tracking-wider">Resource Center</h4>
            <ul className="space-y-2.5 text-xs font-bold text-slate-500">
              <li className="flex items-center gap-2 hover:text-blue-900 cursor-pointer transition-colors">
                <span>📄</span> <span className="underline">Summit_Handbook.pdf</span>
              </li>
              <li className="flex items-center gap-2 hover:text-blue-900 cursor-pointer transition-colors">
                <span>🎥</span> <span className="underline">Live Stream Access Link</span>
              </li>
              <li className="flex items-center gap-2 hover:text-blue-900 cursor-pointer transition-colors">
                <span>📊</span> <span className="underline">Speaker Presentations Folder</span>
              </li>
            </ul>
          </div>

        </div>

      </main>
    </div>
  );
}