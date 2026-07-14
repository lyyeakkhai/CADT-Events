import React, { useState, useEffect } from 'react';
import { Wrench } from 'lucide-react';
import { useUser, SignIn } from '@clerk/clerk-react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './index.css';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Logo from './assets/images/CADT10-LOGO-anniversary-03.png';

import DiscoveryFeed from './features/events/pages/DiscoveryFeed';
import EventDetails from './features/events/pages/EventDetail';
import SeatSelection from './features/events/pages/SeatSelection';
import BookingConfirmed from './features/events/pages/BookingConfirmed';
import MyBooking from './features/events/pages/MyBooking';

import CalendarView from './features/calendar/CalendarView';
import NotificationView from './features/notifications/NotificationView';
import FavoritesView from './features/favorites/FavoritesView';
import SearchEventsView from './features/events/pages/SearchEventsView';

import ProtectedRoute from './components/ProtectedRoute';
import TelegramConnectPrompt from './components/TelegramConnectPrompt';

import type { AcademicEvent } from './features/events/data/eventData';
import { getEvent, type ApiEvent } from './services/api';
import { toAcademicEvent } from './lib/eventMapper';
import { getAdminPortalUrl, isAdminAccount } from './lib/adminRole';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'Discover' | 'Search' | 'My Booking' | 'Calendar' | 'Notifications' | 'Favorites';

interface BookingInfo {
  event: AcademicEvent;
  seat: string;
  bookingId: string;
}

// ─── Loading screen ───────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
        <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Loading…</p>
      </div>
    </div>
  );
}

// ─── Auth View ────────────────────────────────────────────────────────────────

function LoginView() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <LoadingScreen />;
  
  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans">
      {/* Left Side - CADT Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between bg-[#0b2c6a] overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-600 rounded-full blur-[130px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-400 rounded-full blur-[130px]" />
        </div>
        
        <div className="relative z-10 p-12 xl:p-16 flex-grow flex flex-col justify-center">
          <div className="mb-10 bg-white p-4 rounded-2xl w-fit shadow-2xl">
            <img src={Logo} alt="CADT Logo" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight mb-6">
            CADT Events <br />
            <span className="text-blue-200 font-light">Management Portal</span>
          </h1>
          <p className="text-blue-100/90 text-lg max-w-md leading-relaxed font-medium">
            A centralized platform for CADT students and staff to discover, book, and manage academic events, workshops, and seminars.
          </p>
        </div>
        
        <div className="relative z-10 p-12 xl:p-16 border-t border-white/10">
          <p className="text-blue-200/60 text-sm font-medium">
            &copy; {new Date().getFullYear()} Cambodia Academy of Digital Technology
          </p>
        </div>
      </div>

      {/* Right Side - Login Panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative animate-fade-in">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8 flex flex-col items-center">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mb-4">
            <img src={Logo} alt="CADT Logo" className="h-12 w-auto object-contain" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">CADT Events</h2>
        </div>

        <div className="w-full max-w-[420px] flex flex-col items-center">
          <div className="w-full text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-sm font-medium text-slate-500">
              Please sign in with your institutional Gmail account
            </p>
          </div>

          <div className="w-full shadow-2xl shadow-slate-200/50 rounded-[1.5rem] overflow-hidden ring-1 ring-slate-200/50 bg-white">
            <SignIn 
              routing="hash" 
              appearance={{
                layout: {
                  socialButtonsPlacement: "top",
                  socialButtonsVariant: "blockButton",
                },
                variables: {
                  colorPrimary: '#0b2c6a',
                  colorText: '#0f172a',
                  colorTextSecondary: '#64748b',
                  colorBackground: '#ffffff',
                  colorInputBackground: '#f8fafc',
                  colorInputText: '#0f172a',
                  borderRadius: '0.75rem',
                },
                elements: {
                  card: "shadow-none border-0 w-full p-8 sm:p-10",
                  header: "hidden",
                  footer: "hidden",
                  formButtonPrimary: "bg-[#0b2c6a] hover:bg-[#082050] transition-colors shadow-md h-11 text-[15px]",
                  socialButtonsBlockButton: "border-slate-200 hover:bg-slate-50 transition-colors h-11 shadow-sm",
                  socialButtonsBlockButtonText: "font-semibold text-slate-700 text-[14px]",
                  dividerRow: "my-6",
                  formFieldInput: "h-11 text-[15px]",
                  formFieldLabel: "text-[13px] font-semibold text-slate-700",
                }
              }} 
            />
          </div>
          
          <p className="mt-8 text-xs font-medium text-slate-400 text-center max-w-xs leading-relaxed">
            By signing in, you agree to the CADT Events Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Shell ─────────────────────────────────────────────────

function MainApp() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('Discover');
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [seatSelectionEvent, setSeatSelectionEvent] = useState<AcademicEvent | null>(null);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);

  // Telegram prompt state — show once after register/auth unless dismissed
  const [showTelegramPrompt, setShowTelegramPrompt] = useState(false);

  const isAdmin = isAdminAccount({
    role: user?.publicMetadata?.role as string | undefined,
    email: user?.primaryEmailAddress?.emailAddress,
    emails: user?.emailAddresses?.map((e) => e.emailAddress).filter(Boolean) as string[],
    user: user ?? null,
  });
  const adminPortalUrl = getAdminPortalUrl();

  // Admins never stay on the student UI: hard-redirect immediately (no banner, no prompt).
  // Clerk sessions are per-domain — they will sign in again on the admin origin.
  useEffect(() => {
    if (!user || !isAdmin || !adminPortalUrl) return;
    window.location.replace(adminPortalUrl);
  }, [user, isAdmin, adminPortalUrl]);

  useEffect(() => {
    if (!user || isAdmin) return;
    setActiveTab('Discover');
    try {
      const dismissed = localStorage.getItem('telegramPromptDismissed');
      if (!dismissed) {
        const t = setTimeout(() => setShowTelegramPrompt(true), 1400);
        return () => clearTimeout(t);
      }
    } catch {}
  }, [user, isAdmin]);

  useEffect(() => {
    const handleOpenPrompt = () => setShowTelegramPrompt(true);
    document.addEventListener('open-telegram-prompt', handleOpenPrompt);
    return () => document.removeEventListener('open-telegram-prompt', handleOpenPrompt);
  }, []);

  const handleNavTabChange = (tab: Tab) => {
    const protectedTabs = ['My Booking', 'Notifications', 'Favorites'];
    if (protectedTabs.includes(tab) && !isSignedIn) {
      navigate('/login');
      return;
    }
    setActiveTab(tab);
    setSelectedEvent(null);
    setSeatSelectionEvent(null);
    setBookingInfo(null);
  };

  // When selecting an event card/detail, try to fetch the full live version (for seats etc)
  const selectEvent = async (ev: AcademicEvent) => {
    const apiId = (ev as any)._apiId || (ev as any).id;
    if (apiId) {
      try {
        const res = await getEvent(String(apiId));
        if (res?.data) {
          const enriched = toAcademicEvent(res.data as ApiEvent);
          setSelectedEvent(enriched);
          return;
        }
      } catch {}
    }
    setSelectedEvent(ev);
  };

  // Do not paint student Discover/home for admins — redirect only.
  if (isAdmin && adminPortalUrl) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">
            Redirecting to admin portal…
          </p>
        </div>
      </div>
    );
  }

  if (isAdmin && !adminPortalUrl) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-lg font-bold text-slate-900">Admin portal URL not configured</h1>
          <p className="text-sm text-slate-600">
            Set <code className="bg-slate-100 px-1 rounded">VITE_ADMIN_URL</code> on the student
            Vercel project to your admin origin (e.g.{' '}
            <code className="bg-slate-100 px-1 rounded text-xs">
              https://cadt-events-ytaz.vercel.app
            </code>
            ), then redeploy.
          </p>
        </div>
      </div>
    );
  }

  if (bookingInfo) {
    return (
      <BookingConfirmed
        event={bookingInfo.event}
        seat={bookingInfo.seat}
        bookingId={bookingInfo.bookingId}
        onBackClick={() => setBookingInfo(null)}
        onGoToMyBooking={() => {
          setBookingInfo(null);
          setActiveTab('My Booking');
          setSeatSelectionEvent(null);
          setSelectedEvent(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 animate-fade-in">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavTabChange}
        onProfileClick={() => {}}
      />

      {/* Page content */}
      <div className="flex-grow w-full flex flex-col">
        {seatSelectionEvent ? (
          <SeatSelection
            event={seatSelectionEvent}
            onBackClick={() => setSeatSelectionEvent(null)}
            onRegisterClick={(event, seat, bookingId) => {
              setBookingInfo({ event, seat, bookingId });
              setSeatSelectionEvent(null);
              setSelectedEvent(null);
            }}
          />
        ) : selectedEvent ? (
          <EventDetails
            event={selectedEvent}
            onBackClick={() => setSelectedEvent(null)}
            onRegisterClick={(event) => {
              if (!isSignedIn) {
                navigate('/login');
                return;
              }
              setSeatSelectionEvent(event);
            }}
          />
        ) : activeTab === 'Discover' ? (
          <DiscoveryFeed
            onSelectEvent={selectEvent}
            onViewCalendarClick={() => setActiveTab('Calendar')}
            onExploreAllClick={() => setActiveTab('Search')}
          />
        ) : activeTab === 'Search' ? (
          <SearchEventsView 
            onSelectEvent={selectEvent}
          />
        ) : activeTab === 'My Booking' ? (
          <MyBooking />
        ) : activeTab === 'Calendar' ? (
          <CalendarView 
            onSelectEvent={selectEvent}
            onGoHome={() => setActiveTab('Discover')}
          />
        ) : activeTab === 'Notifications' ? (
          <NotificationView onSelectEvent={selectEvent} />
        ) : activeTab === 'Favorites' ? (
          <FavoritesView 
            onSelectEvent={selectEvent}
            onExploreEventsClick={() => setActiveTab('Discover')}
          />
        ) : (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex-grow flex flex-col items-center justify-center">
            <Wrench className="w-8 h-8 text-slate-400 mb-3" />
            <h2 className="text-xl font-black text-slate-900 mb-1">{activeTab} View</h2>
            <p className="text-xs font-semibold text-slate-400 max-w-xs mx-auto leading-relaxed">
              This section is under construction.
            </p>
          </main>
        )}
      </div>

      <Footer onLinkClick={() => { setSelectedEvent(null); setSeatSelectionEvent(null); }} />

      {/* Telegram prompt shown after login / register */}
      <TelegramConnectPrompt
        open={showTelegramPrompt}
        onClose={() => {
          setShowTelegramPrompt(false);
          try { localStorage.setItem('telegramPromptDismissed', '1'); } catch {}
        }}
        onConnected={() => {
          // Optionally refresh some UI state or show toast in future
        }}
      />
    </div>
  );
}

// ─── App Component ────────────────────────────────────────────────────────────

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route
        path="*"
        element={<MainApp />}
      />
    </Routes>
  );
}

export default App;