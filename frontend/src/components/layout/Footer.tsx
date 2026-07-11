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
    <footer className="w-full bg-[#0b2c6a] text-blue-100/70 py-10 mt-auto border-t border-white/10 text-sm font-medium selection:bg-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Column 1: Brand */}
        <div className="space-y-2">

          <p className="text-slate-400 leading-relaxed max-w-[26ch] text-[13px]">
            Official platform for academic events at Cambodia Academy of Digital Technology.
          </p>
        </div>

        {/* Column 2: Navigation */}
        <div>
          <div className="text-white text-sm font-semibold mb-3">Explore</div>
          <ul className="space-y-1.5 text-[13px]">
            <li><a href="#" onClick={(e) => handleLinkAction(e, 'discover')} className="hover:text-white transition-colors">Discover Events</a></li>
            <li><a href="#" onClick={(e) => handleLinkAction(e, 'bookings')} className="hover:text-white transition-colors">My Bookings</a></li>
            <li><a href="#" onClick={(e) => handleLinkAction(e, 'about')} className="hover:text-white transition-colors">About CADT Events</a></li>
          </ul>
        </div>

        {/* Column 3: Simple contact */}
        <div className="text-[13px] space-y-1">
          <div className="text-white font-semibold">Cambodia Academy of Digital Technology</div>
          <div>Phnom Penh, Cambodia</div>
          <div className="pt-2 text-slate-500 text-xs">© {new Date().getFullYear()} CADT. All rights reserved.</div>
        </div>

      </div>
    </footer>
  );
}