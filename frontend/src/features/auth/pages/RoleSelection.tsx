import React from 'react';
import Logo from '../../../assets/images/CADT10-LOGO-anniversary-03.png'
interface RoleSelectionProps {
  onSelectRole: (role: 'student' | 'admin') => void;
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  return (
    <div className="min-h-screen w-full bg-[#f0f4f9] bg-gradient-to-tr from-[#e2ecf8] via-[#f0f4f9] to-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans antialiased">
      
      {/* Central Interactive Panel Wrapper Box */}
      <div className="w-full max-w-4xl bg-white/60 backdrop-blur-md rounded-3xl border border-blue/80 shadow-xl p-6 sm:p-10 md:p-14 flex flex-col items-center text-center animate-fade-in">
        
        {/* Logo */}
        <div>
          <img src={Logo} className="h-14 w-auto rounded-xl shadow-md mb-6" />
        </div>

        {/* Framing Header Typography Matrix */}
        <h1 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight mb-3 select-none">
          Welcome to CADT Events
        </h1>
        <p className="text-sm font-semibold text-slate-500 max-w-md leading-relaxed mb-12 select-none">
          Your gateway to academic excellence and professional networking. Please select your active institutional role to proceed into the portal[cite: 442].
        </p>

        {/* Split Role Dual-Column Dashboard Selector Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl items-stretch">
          
          {/* =======================================================================
              OPTION CARD 1: THE PARTICIPANT FLOW (Now clickable on the entire block!)
             ======================================================================= */}
          <div 
            onClick={() => onSelectRole('student')}
            className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-xs hover:shadow-lg hover:border-blue-400 group transition-all duration-300 cursor-pointer active:scale-[0.99] select-none"
          >
            <div className="flex flex-col items-center">
              {/* Top Dynamic Icon Module Wrapper */}
              <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-[#0f172a] mb-2 transition-colors group-hover:text-blue-900">
                Participant
              </h3>
              <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-[240px]">
                Join the community. Browse events, register for seminars, workshops, and high-level tech summits across the campus.
              </p>
            </div>
            
            {/* Nav Action Row Link (Visual Guide Indicator) */}
            <span className="mt-8 flex items-center gap-1.5 text-xs font-black text-blue-900 group-hover:text-blue-700 transition-colors">
              Get Started <span className="text-sm transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </span>
          </div>

          {/* =======================================================================
              OPTION CARD 2: THE ADMINISTRATOR FLOW (Now clickable on the entire block!)
             ======================================================================= */}
          <div 
            onClick={() => onSelectRole('admin')}
            className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-xs hover:shadow-lg hover:border-blue-400 group transition-all duration-300 cursor-pointer active:scale-[0.99] select-none"
          >
            <div className="flex flex-col items-center">
              {/* Top Dynamic Icon Module Wrapper */}
              <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-[#0f172a] mb-2 transition-colors group-hover:text-blue-900">
                Administrator
              </h3>
              <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-[240px]">
                 Manage the ecosystem. Create events, track registrations, generate analytical insights logs, and configure system-wide parameters.
              </p>
            </div>
            
            {/* Nav Action Row Link (Visual Guide Indicator) */}
            <span className="mt-8 flex items-center gap-1.5 text-xs font-black text-blue-900 group-hover:text-blue-700 transition-colors">
              Console login <span className="text-sm transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </span>
          </div>
        </div>

        {/* Footer Trust Footnotes Sub-tray Block */}
        <div className="mt-14 space-y-3 select-none">
          <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase">
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