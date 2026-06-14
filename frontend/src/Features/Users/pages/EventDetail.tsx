import React from 'react';
import type { AcademicEvent } from '../data/eventData.tsx';
import IDRI from '../../../asset/innovationcenter.png';
interface EventDetailsProps {
  event: AcademicEvent;
  onBackClick: () => void;
  onRegisterClick: (event: AcademicEvent) => void;
}

export default function EventDetails({ event, onBackClick, onRegisterClick }: EventDetailsProps) {
  
  // Explicitly matching the speaker data arrays visible in your design spec sheet
  const figmaSpeakers = [
    {
      name: event.speaker,
      role: `FOUNDER OF ${event.badge === 'Seminar' ? 'SNEHA' : 'CADT LABS'}`,
      bio: `Expert in specialized institutional training workflows and domain systems optimization.`,
      image: event.image
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
              {event.title.includes("Seminar") ? "Innovation Summit 2026" : event.title}
            </h1>
            
            {/* Meta tags indicators strip */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5">
                <span>📅</span>
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>📍</span>
                <span>{event.venue}, CADT Campus</span>
              </div>
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
              Are you constantly burying yourself in schoolwork but feeling like you're running on empty? [cite: 181] 
              It's time to step out of the shadows of burnout and step into a space of recovery[cite: 181]. 
              The CADT Career Center is glad to invite you to a transformative session dedicated to your holistic well-being[cite: 181]. 
              Too often, we hide our stress, isolate ourselves behind glowing screens, and push through exhaustion until we crash[cite: 181]. 
              This session is your direct opportunity to heal, reset, and successfully reclaim your internal balance[cite: 181]. 🙏
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
              {figmaSpeakers.map((speaker, index) => (
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
                  ● 62 Seats Left
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">Early Bird Price</span>
                <span className="text-sm font-extrabold text-slate-900">$15.00</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">Students</span>
                <span className="text-xs font-black text-blue-600">FREE</span>
              </div>
            </div>

            {/* Sticky Action Triggers */}
            <div className="space-y-2 pt-1">
              <button 
                onClick={() => onRegisterClick(event)}
                className="w-full bg-slate-950 hover:bg-blue-900 text-white font-extrabold text-xs py-3 rounded-xl shadow-sm hover:shadow transition-all duration-150 cursor-pointer active:scale-[0.98]"
              >
                REGISTER NOW
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