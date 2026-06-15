import React, { useState } from 'react';
import User_Profile from '../asset/Profile free icons designed by Freepik.jpg';
import Logo from '../asset/CADT Event Logo (1).png';

interface NavbarProps {
  activeTab: 'Discover' | 'My Booking' | 'Calendar' | 'About' | 'Favorites' | 'Profile';
  setActiveTab: (tab: 'Discover' | 'My Booking' | 'Calendar' | 'About' | 'Favorites' | 'Profile') => void;
  onNotificationClick?: () => void;
  onFavoritesClick?: () => void;
  onProfileClick?: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onNotificationClick,
  onFavoritesClick,
  onProfileClick
}: NavbarProps) {
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navItems = ['Discover', 'My Booking', 'Calendar', 'About'] as const;

  const handleTabSelect = (item: 'Discover' | 'My Booking' | 'Calendar' | 'About') => {
    setActiveTab(item);
    setIsMobileMenuOpen(false); 
  };

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-slate-900/95 shadow-md">
      <div className="w-full px-4 sm:px-8 lg:px-12 h-16 flex items-center">
        
        {/* =======================================================================
            SECTION 1: BRAND LOGO (Left Column - Snapped strictly left)
           ======================================================================= */}
        <div className="flex-1 flex items-center justify-start">
          <div 
            onClick={() => handleTabSelect('Discover')}
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
          >
            {/* White card badge pops the image out elegantly from the dark background */}
            <div className="w-8 h-8 flex items-center justify-center bg-white p-1 rounded-xl border border-slate-700/50 shadow-md transition-all duration-200 group-hover:scale-110 group-hover:rotate-2 overflow-hidden shrink-0">
              <img src={Logo} alt="CADT Event Logo" className="w-full h-full object-contain" />
            </div>

            <span className="text-[15px] font-black text-white tracking-tight group-hover:text-amber-400 transition-colors duration-150">
              CADT Event
            </span>
          </div>
        </div>

        {/* =======================================================================
            SECTION 2: CENTER NAVIGATION (Middle Column - Balanced dead center)
           ======================================================================= */}
        <div className="hidden md:flex flex-initial items-center justify-center h-full">
          <nav className="flex items-center gap-8 h-full text-[14px] font-medium text-slate-400">
            {navItems.map((item) => {
              const isActive = activeTab === item;
              return (
                <button
                  key={item}
                  onClick={() => handleTabSelect(item)}
                  className={`h-full px-1 relative transition-all duration-200 flex items-center justify-center tracking-normal cursor-pointer select-none ${
                    isActive ? 'text-white font-bold' : 'hover:text-white text-slate-400 font-medium'
                  }`}
                >
                  {item}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white rounded-t-full animate-fade-in" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* =======================================================================
            SECTION 3: ACTIONS & AVATAR (Right Column - Snapped strictly right)
           ======================================================================= */}
        <div className="flex-1 flex items-center justify-end gap-3 sm:gap-5">
          
          {/* Notifications Icon Trigger */}
          <button 
            onClick={onNotificationClick}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors relative cursor-pointer"
            aria-label="System Notifications"
          >
            <svg className="w-[21px] h-[21px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-slate-900" />
          </button>

          {/* Saved Favorites Trigger */}
          <button 
            onClick={onFavoritesClick}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="My Saved Favorites"
          >
            <svg className="w-[21px] h-[21px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>

          {/* Profile Avatar Frame Trigger */}
          <button 
            onClick={onProfileClick}

            className="flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/20 rounded-full transition-shadow cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 shadow-inner bg-slate-800 hover:scale-105 transition-transform duration-150">
              <img src={User_Profile} alt="User Profile" className="w-full h-full object-cover" />
            </div>
          </button>

          {/* Mobile Hamburg Drawer Option Selector Menu Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Options Menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Dropdown Panel Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 absolute top-16 left-0 right-0 shadow-xl z-40 animate-fade-in">
          <nav className="flex flex-col p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item;
              return (
                <button
                  key={item}
                  onClick={() => handleTabSelect(item)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-white text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}