import React from 'react';

interface RoleSelectionProps {
  onSelectRole: (role: 'student' | 'admin') => void;
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  return (
    <div className="min-h-screen w-full bg-[#f0f4f9] bg-gradient-to-tr from-[#e2ecf8] via-[#f0f4f9] to-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans antialiased">
      
      {/* Central Interactive Panel Wrapper Box */}
      <div className="w-full max-w-4xl bg-white/60 backdrop-blur-md rounded-3xl border border-white/80 shadow-xl p-6 sm:p-10 md:p-14 flex flex-col items-center text-center animate-fade-in">
        
        {/* Academic Center Top Icon Emblem Asset */}
        <div className="w-14 h-14 bg-[#0f172a] text-white rounded-xl flex items-center justify-center shadow-md mb-6 transition-transform duration-300 hover:rotate-3">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>

        {/* Framing Header Typography Matrix */}
        <h1 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight mb-3">
          Welcome to CADT Events
        </h1>
        <p className="text-sm font-semibold text-slate-500 max-w-md leading-relaxed mb-12">
          Your gateway to academic excellence and professional networking. Please select your active institutional role to proceed into the portal.
        </p>

        {/* Split Role Dual-Column Dashboard Selector Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl items-stretch">
          
          {/* =======================================================================
              OPTION CARD 1: THE PARTICIPANT FLOW (Students, Guest Speakers)
             ======================================================================= */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-xs hover:shadow-lg hover:border-blue-200 group transition-all duration-300">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-[#0f172a] mb-2">Participant</h3>
              <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-[240px]">
                Join the community. Browse events, register for seminars, workshops, and high-level tech summits across the campus.
              </p>
            </div>
            
            <button 
              onClick={() => onSelectRole('student')}
              className="mt-8 flex items-center gap-1.5 text-xs font-black text-blue-900 group-hover:text-blue-700 transition-colors cursor-pointer"
            >
              Get Started <span className="text-sm transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </button>
          </div>

          {/* =======================================================================
              OPTION CARD 2: THE ADMINISTRATOR FLOW (Organizers, Back-office Staff)
             ======================================================================= */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-xs hover:shadow-lg hover:border-slate-400 group transition-all duration-300">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-[#0f172a] mb-2">Administrator</h3>
              <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-[240px]">
                Manage the ecosystem. Create events, track registrations, generate analytical insights logs, and configure system-wide parameters.
              </p>
            </div>
            
            <button 
              onClick={() => onSelectRole('admin')}
              className="mt-8 flex items-center gap-1.5 text-xs font-black text-slate-900 group-hover:text-slate-700 transition-colors cursor-pointer"
            >
              Console Login <span className="text-sm transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </button>
          </div>

        </div>

        {/* Footer Trust Footnotes Sub-tray Block */}
        <div className="mt-14 space-y-3 select-none">
          <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
            Trusted By Institutional Partners
          </p>
          <div className="flex items-center justify-center gap-6 opacity-30 grayscale saturate-0 text-xs font-black text-slate-600">
            <span>CADT INNOVATION</span>
            <span>IDRI RESEARCH</span>
            <span>MINISTRY OF MPTC</span>
          </div>
        </div>

      </div>
    </div>
  );
}