import React, { useState } from 'react';
import User_Profile from '../asset/Profile free icons designed by Freepik.jpg';
import Logo from '../asset/CADT Event Logo (1).png';
interface NavbarProps {
  activeTab: 'Discover' | 'My Booking' | 'Calendar' | 'About';
  setActiveTab: (tab: 'Discover' | 'My Booking' | 'Calendar' | 'About') => void;
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
  
  // State tracking logic for the mobile drawer menu overlay
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navItems = ['Discover', 'My Booking', 'Calendar', 'About'] as const;

  const handleTabSelect = (item: 'Discover' | 'My Booking' | 'Calendar' | 'About') => {
    setActiveTab(item);
    setIsMobileMenuOpen(false); // Close mobile drawer immediately upon selection
  };

  return (
    <header className="w-full bg-[#f8fafc] border-b border-slate-200/80 sticky top-0 z-50 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side: Brand Logo & Web Desktop Navigation */}
        <div className="flex items-center gap-12">
          {/* Logo Brand Signature - Tapping it brings users back to main Discover feed */}
          <div 
            onClick={() => handleTabSelect('Discover')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            {/* Project Brand Logo Icon */}
            <div className="w-7 h-7 flex items-center justify-center bg-blue-900 text-white text-xs font-black  transition-transform duration-200 group-hover:scale-105 shadow-sm">
              {/* PRO-TIP: Swap this text placeholder for your actual asset path later on!
                Example: <img src="/logo.svg" alt="CADT Logo" className="w-full h-full object-contain" />
              */}
              <img src={Logo} alt="Logo" className="w-full h-full object-contain"  />
            </div>

            {/* Brand Text Heading */}
            <span className="text-[15px] font-black text-blue-900 ">
              CADT Event
            </span>
          </div>

          {/* Desktop Navigation Links (Hidden on small mobile screens via md:flex) */}
          <nav className="hidden md:flex items-center gap-8 h-16 text-[14px] font-medium text-slate-500">
            {navItems.map((item) => {
              const isActive = activeTab === item;
              return (
                <button
                  key={item}
                  onClick={() => handleTabSelect(item)}
                  className={`h-full px-1 relative transition-colors duration-200 flex items-center justify-center tracking-normal ${
                    isActive ? 'text-slate-900 font-bold' : 'hover:text-slate-900 font-medium'
                  }`}
                >
                  {item}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-950 rounded-t-full animate-fade-in" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Action Badges & Hamburger Toggle Option */}
        <div className="flex items-center gap-3 sm:gap-5">
          
          {/* Notifications */}
          <button 
            onClick={onNotificationClick}
            className="text-slate-700 hover:text-slate-950 p-1.5 rounded-lg hover:bg-slate-100 transition-colors relative"
            aria-label="System Notifications"
          >
            <svg className="w-[21px] h-[21px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
          </button>

          {/* Saved Favorites */}
          <button 
            onClick={onFavoritesClick}
            className="text-slate-700 hover:text-slate-950 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="My Saved Favorites"
          >
            <svg className="w-[21px] h-[21px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>

          {/* Profile Button Icon */}
          <button 
            onClick={onProfileClick}
            className="flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-slate-950/20 rounded-full transition-shadow"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
              <img
                src={User_Profile}
                alt="User_Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </button>

          {/* Mobile Hamburger Trigger Toggle (Visible on Mobile only via md:hidden) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-slate-700 hover:text-slate-950 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Options Menu"
          >
            {isMobileMenuOpen ? (
              // X close symbol asset
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Three bar hamburger menu icon asset
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Dropdown Panel (Only flashes active if toggle state flag matches true) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 absolute top-16 left-0 right-0 shadow-lg z-40 animate-fade-in">
          <nav className="flex flex-col p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item;
              return (
                <button
                  key={item}
                  onClick={() => handleTabSelect(item)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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