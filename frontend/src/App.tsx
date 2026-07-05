import React, { useState, useEffect } from 'react';
import { useUser, SignIn } from '@clerk/clerk-react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Logo from './assets/images/CADT Event Logo (1).png';

import DiscoveryFeed from './features/events/pages/DiscoveryFeed';
import EventDetails from './features/events/pages/EventDetail';
import SeatSelection from './features/events/pages/SeatSelection';
import BookingConfirmed from './features/events/pages/BookingConfirmed';
import MyBooking from './features/events/pages/MyBooking';
import About from './features/events/pages/About';

import ProtectedRoute from './components/ProtectedRoute';

import type { AcademicEvent } from './features/events/data/eventData';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'Discover' | 'My Booking' | 'Calendar' | 'About';

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
                  colorInputBorder: '#e2e8f0',
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

// ─── Authenticated Main Shell ─────────────────────────────────────────────────

function AuthenticatedApp() {
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState<Tab>('Discover');
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [seatSelectionEvent, setSeatSelectionEvent] = useState<AcademicEvent | null>(null);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);

  useEffect(() => {
    if (user) {
      const role = user.publicMetadata?.role as string;
      const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
      
      if (isAdmin) {
        window.location.href = 'http://localhost:3000';
        return;
      }
      setActiveTab('Discover');
    }
  }, [user]);

  const isAdmin = (user?.publicMetadata?.role as string) === 'admin';

  const handleNavTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSelectedEvent(null);
    setSeatSelectionEvent(null);
    setBookingInfo(null);
  };

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

      {/* Session ribbon */}
      <div className="w-full bg-[#0f172a] text-white px-4 sm:px-8 py-1.5 text-[11px] font-bold flex justify-between items-center border-b border-slate-800 shadow-inner select-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            Active Workspace:{' '}
            <span className="text-amber-400 uppercase tracking-wider">
              {isAdmin ? 'Admin Control Node' : 'CADT Student Session'}
            </span>
          </span>
        </div>
        <span className="text-slate-500 text-[10px]">
          {user?.primaryEmailAddress?.emailAddress}
        </span>
      </div>

      {/* Page content */}
      <div className="flex-grow w-full flex flex-col">
        {activeTab === 'Discover' ? (
          seatSelectionEvent ? (
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
              onRegisterClick={(event) => setSeatSelectionEvent(event)}
            />
          ) : (
            <DiscoveryFeed
              onSelectEvent={(event) => setSelectedEvent(event)}
              onViewCalendarClick={() => setActiveTab('Calendar')}
            />
          )
        ) : activeTab === 'My Booking' ? (
          <MyBooking />
        ) : activeTab === 'About' ? (
          <About onExploreEventsClick={() => setActiveTab('Discover')} />
        ) : (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex-grow flex flex-col items-center justify-center">
            <span className="text-3xl block mb-2">🛠️</span>
            <h2 className="text-xl font-black text-slate-900 mb-1">{activeTab} View</h2>
            <p className="text-xs font-semibold text-slate-400 max-w-xs mx-auto leading-relaxed">
              This section is under construction.
            </p>
          </main>
        )}
      </div>

      <Footer onLinkClick={() => { setSelectedEvent(null); setSeatSelectionEvent(null); }} />
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
        element={
          <ProtectedRoute>
            <AuthenticatedApp />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;