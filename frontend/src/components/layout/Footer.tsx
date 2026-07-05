import React from 'react';


interface FooterProps {
  onLinkClick?: (route: string) => void;
}

export default function Footer({ onLinkClick }: FooterProps) {
  
  const handleLinkAction = (e: React.MouseEvent<HTMLAnchorElement>, route: string) => {
    e.preventDefault();
    if (onLinkClick) {
      onLinkClick(route);
    }
  };

  return (
    <footer className="w-full bg-[#0f172a] text-slate-400 py-12 mt-auto border-t border-slate-800 text-[13px] font-medium selection:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Column 1: Brand Identifier & Institutional Tagline */}
        <div className="space-y-3">
          <h3 className="text-white text-base font-black tracking-tight">
            CADT Event
          </h3>
          <p className="text-slate-400 leading-relaxed max-w-xs text-[13px]">
            The official hub for institutional events, fostering academic growth and industry networking.
          </p>
        </div>

        {/* Column 2: Quick Navigation Links Ecosystem */}
        <div className="space-y-3">
          <h4 className="text-white text-[14px] font-bold tracking-wide uppercase">
            Quick Links
          </h4>
          <ul className="space-y-2.5">
            <li>
              <a 
                href="#upcoming" 
                onClick={(e) => handleLinkAction(e, 'upcoming')}
                className="hover:text-white transition-colors duration-150"
              >
                Upcoming Events
              </a>
            </li>
            <li>
              <a 
                href="#bookings" 
                onClick={(e) => handleLinkAction(e, 'bookings')}
                className="hover:text-white transition-colors duration-150"
              >
                My Bookings
              </a>
            </li>
            <li>
              <a 
                href="#favorites" 
                onClick={(e) => handleLinkAction(e, 'favorites')}
                className="hover:text-white transition-colors duration-150"
              >
                Favorites
              </a>
            </li>
            <li>
              <a 
                href="#support" 
                onClick={(e) => handleLinkAction(e, 'support')}
                className="hover:text-white transition-colors duration-150"
              >
                Support Center
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Platform Infrastructure Log & Connect Context */}
        <div className="space-y-4 md:text-left">
          <div>
            <h4 className="text-white text-[14px] font-bold tracking-wide uppercase mb-3">
              Connect With Us
            </h4>
            <div className="flex gap-4 text-slate-400">
              {/* Institutional Network Status Logs Indicator */}
              <div className="flex items-center gap-2 text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-900/50 px-3 py-1.5 rounded-xl shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] uppercase tracking-wider">Network Operational</span>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 pt-2 border-t border-slate-800/60">
            &copy; {new Date().getFullYear()} CADT Event Central. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}