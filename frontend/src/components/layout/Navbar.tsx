import React, { useState, useEffect } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/images/CADT10-LOGO-anniversary-03.png';
import { useUrlSearch } from '../../hooks/useUrlSearch';

interface NavbarProps {
  activeTab: 'Discover' | 'Search' | 'My Booking' | 'Calendar' | 'Notifications' | 'Favorites';
  setActiveTab: (tab: 'Discover' | 'Search' | 'My Booking' | 'Calendar' | 'Notifications' | 'Favorites') => void;
  onProfileClick?: () => void; // Kept for compatibility but we'll use Clerk UserButton
}

export default function Navbar({
  activeTab,
  setActiveTab,
}: NavbarProps) {
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useUrlSearch('q');
  
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  
  const navItems = ['Discover', 'Search', 'My Booking', 'Calendar'] as const;

  // Sync internal state with props if parent changes it
  useEffect(() => {
    // We do not overwrite search query from external activeTab changes,
    // we just let them switch tabs.
  }, [activeTab]);

  const handleTabSelect = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="w-full px-6 sm:px-10 lg:px-16 h-20 flex items-center gap-4 lg:gap-8">
        
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
          </div>
        </div>

        {/* =======================================================================
            SECTION 2: CENTER NAVIGATION
           ======================================================================= */}
        <div className="hidden md:flex flex-initial items-center justify-center h-full">
          <nav className="flex items-center gap-8 lg:gap-10 h-full">
            {navItems.map((item) => {
              const isActive = activeTab === item;
              const displayText = item === 'Search' ? 'Explore' : item;
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
                  {displayText}
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
          <div className="hidden md:flex items-center relative group">
            <div className="relative flex items-center h-[36px] overflow-hidden bg-transparent rounded-full group-hover:bg-gray-50 group-hover:border group-hover:border-gray-200 transition-all duration-300 w-9 group-hover:w-48 lg:group-hover:w-64 group-focus-within:w-48 lg:group-focus-within:w-64 group-focus-within:border-blue-500 group-focus-within:bg-white group-focus-within:border">
              <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-9 h-full shrink-0 text-gray-400 group-hover:text-blue-500 group-focus-within:text-blue-500 z-10 pointer-events-none">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setActiveTab('Search');
                  }
                }}
                placeholder="Search events..." 
                className="absolute inset-0 bg-transparent text-[13px] rounded-full pl-9 pr-4 text-gray-700 placeholder-gray-400 focus:outline-none w-full opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto"
              />
            </div>
          </div>

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

          {/* Telegram Connect Button (if signed in) */}
          {isSignedIn && (
            <button
              onClick={() => document.dispatchEvent(new CustomEvent('open-telegram-prompt'))}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#0b2c6a] bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors border border-blue-200 shadow-sm"
              title="Connect Telegram"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.888-.662 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Telegram
            </button>
          )}

          {/* Profile Avatar via Clerk UserButton */}
          {isSignedIn ? (
            <div className="flex items-center justify-center hover:scale-105 transition-transform duration-150 pl-1">
              <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: 'w-9 h-9 border border-gray-200 shadow-sm rounded-full bg-gray-100' } }} />
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')} 
              className="text-sm font-semibold text-white bg-[#0b2c6a] px-5 py-2 rounded-full hover:bg-[#082050] transition-colors shadow-sm ml-2"
            >
              Log In
            </button>
          )}

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
              const displayText = item === 'Search' ? 'Explore' : item;
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
                  {displayText}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}