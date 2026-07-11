import React, { useState } from 'react';
import { UserButton } from '@clerk/clerk-react';
import Logo from '../../assets/images/CADT10-LOGO-anniversary-03.png';
import { useUrlSearch } from '../../hooks/useUrlSearch';

interface NavbarProps {
  activeTab: 'Discover' | 'My Booking' | 'Calendar' | 'About' | 'Notifications' | 'Favorites';
  setActiveTab: (tab: 'Discover' | 'My Booking' | 'Calendar' | 'About' | 'Notifications' | 'Favorites') => void;
  onProfileClick?: () => void; // Kept for compatibility but we'll use Clerk UserButton
}

export default function Navbar({
  activeTab,
  setActiveTab,
}: NavbarProps) {
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useUrlSearch('q');
  
  const navItems = ['Discover', 'My Booking', 'Calendar', 'About'] as const;

  const handleTabSelect = (item: 'Discover' | 'My Booking' | 'Calendar' | 'About') => {
    setActiveTab(item);
    setIsMobileMenuOpen(false); 
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="w-full px-6 sm:px-10 lg:px-16 h-20 flex items-center">
        
        {/* =======================================================================
            SECTION 1: BRAND LOGO (Left Column)
           ======================================================================= */}
        <div className="flex-1 flex items-center justify-start">
          <div 
            onClick={() => handleTabSelect('Discover')}
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
          >
            {/* Logo image clean display */}
            <div className="h-10 sm:h-12 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shrink-0">
              <img src={Logo} alt="CADT Logo" className="h-full w-auto object-contain" />
            </div>

            <span className="hidden sm:block text-[17px] font-black text-[#112a46] tracking-tight group-hover:text-blue-600 transition-colors duration-150 uppercase">
              CADT EVENT
            </span>
          </div>
        </div>

        {/* =======================================================================
            SECTION 2: CENTER NAVIGATION
           ======================================================================= */}
        <div className="hidden md:flex flex-initial items-center justify-center h-full">
          <nav className="flex items-center gap-8 lg:gap-10 h-full">
            {navItems.map((item) => {
              const isActive = activeTab === item;
              return (
                <button
                  key={item}
                  onClick={() => handleTabSelect(item)}
                  className={`h-full relative transition-all duration-200 flex items-center justify-center cursor-pointer select-none uppercase tracking-wider text-[13px] ${
                    isActive 
                      ? 'text-[#112a46] font-bold' 
                      : 'text-gray-500 font-medium hover:text-[#112a46]'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </nav>
        </div>

        {/* =======================================================================
            SECTION 3: ACTIONS & AVATAR
           ======================================================================= */}
        <div className="flex-1 flex items-center justify-end gap-3 sm:gap-5">
          
          {/* Search Bar / Icon */}
          {activeTab !== 'Discover' ? (
            <div className="hidden md:flex items-center relative group">
              <svg className="absolute left-3 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveTab('Discover');
                }}
                placeholder="Search events..." 
                className="bg-gray-50 border border-gray-200 text-[13px] rounded-full pl-9 pr-4 py-1.5 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all w-48 lg:w-64"
              />
            </div>
          ) : (
            <button
              onClick={() => {}}
              className="hidden md:flex text-blue-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors cursor-pointer"
              aria-label="Search"
            >
              <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          )}

          {/* Notifications Icon Trigger */}
          <button 
            onClick={() => setActiveTab('Notifications')}
            className={`text-gray-400 p-2 rounded-full transition-colors relative cursor-pointer ${
              activeTab === 'Notifications' ? 'text-[#112a46] bg-gray-100' : 'hover:text-[#112a46] hover:bg-gray-100'
            }`}
            aria-label="System Notifications"
          >
            <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Favorites Icon */}
          <button 
            onClick={() => setActiveTab('Favorites')}
            className={`p-2 rounded-full transition-colors relative cursor-pointer ${
              activeTab === 'Favorites' ? 'text-red-500 bg-gray-100' : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
            }`}
            aria-label="Favorites"
          >
            <svg className="w-[22px] h-[22px]" fill={activeTab === 'Favorites' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Profile Avatar via Clerk UserButton */}
          <div className="flex items-center justify-center hover:scale-105 transition-transform duration-150 pl-1">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: 'w-9 h-9 border border-gray-200 shadow-sm rounded-full bg-gray-100' } }} />
          </div>

          {/* Mobile Hamburg Drawer Option Selector Menu Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-500 hover:text-[#112a46] p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer ml-1"
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
        <div className="md:hidden bg-white border-b border-gray-200 absolute top-20 left-0 right-0 shadow-lg z-40 animate-fade-in">
          <nav className="flex flex-col p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item;
              return (
                <button
                  key={item}
                  onClick={() => handleTabSelect(item)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer uppercase tracking-wide ${
                    isActive 
                      ? 'bg-gray-50 text-[#112a46]' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-[#112a46]'
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