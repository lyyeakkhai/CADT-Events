import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import './index.css';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import RoleSelection from './features/auth/pages/RoleSelection';
import Register from './features/auth/pages/Register';
import ExternalLogin from './features/auth/pages/ExternalLogin';
import Login from './features/auth/pages/Login';
import AdminLogin from './features/auth/pages/AdminLogin';

import DiscoveryFeed from './features/events/pages/DiscoveryFeed';
import EventDetails from './features/events/pages/EventDetail';
import SeatSelection from './features/events/pages/SeatSelection';
import BookingConfirmed from './features/events/pages/BookingConfirmed';
import MyBooking from './features/events/pages/MyBooking';
import About from './features/events/pages/About';

import type { AcademicEvent } from './features/events/data/eventData';

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthView =
  | 'role_selection'
  | 'participant_form'
  | 'participant_login'
  | 'institute_login'
  | 'admin_login';

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

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const { isLoaded, isSignedIn, user } = useUser();

  // Auth-flow navigation (only shown when NOT signed in)
  const [authView, setAuthView] = useState<AuthView>('role_selection');

  // Main app state (shown when signed in)
  const [activeTab, setActiveTab] = useState<Tab>('Discover');
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [seatSelectionEvent, setSeatSelectionEvent] = useState<AcademicEvent | null>(null);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);

  // When user signs in, reset to discover
  useEffect(() => {
    if (isSignedIn) {
      setActiveTab('Discover');
      setAuthView('role_selection');
    }
  }, [isSignedIn]);

  // Derive admin role from Clerk publicMetadata
  // Set `publicMetadata.role = "admin"` in your Clerk dashboard for admin users
  const isAdmin = (user?.publicMetadata?.role as string) === 'admin';

  // ── Wait for Clerk to initialise ──────────────────────────────────────────
  if (!isLoaded) return <LoadingScreen />;

  // ── Auth views (user not signed in) ───────────────────────────────────────
  if (!isSignedIn) {
    if (authView === 'role_selection') {
      return (
        <RoleSelection
          onSelectRole={(role) => {
            if (role === 'admin') setAuthView('admin_login');
            else setAuthView('participant_form');
          }}
        />
      );
    }

    if (authView === 'participant_form') {
      return (
        <Register
          onBackClick={() => setAuthView('role_selection')}
          onInstituteLoginClick={() => setAuthView('institute_login')}
          onLoginClick={() => setAuthView('participant_login')}
          onExternalSubmitComplete={() => {
            // Clerk sign-up is handled inside Register — after completion
            // useUser().isSignedIn becomes true and this view auto-exits
          }}
        />
      );
    }

    if (authView === 'participant_login') {
      return (
        <ExternalLogin
          onBackClick={() => setAuthView('participant_form')}
          onSignUpClick={() => setAuthView('participant_form')}
          onLoginSuccess={() => {
            // Clerk sign-in is handled inside ExternalLogin — auto-exits on success
          }}
        />
      );
    }

    if (authView === 'institute_login') {
      return (
        <Login
          onBackClick={() => setAuthView('participant_form')}
          onLoginSuccess={() => {
            // Clerk sign-in handled inside Login — auto-exits on success
          }}
          onOAuthClick={() => {
            // OAuth redirect handled inside Login — auto-exits on success
          }}
        />
      );
    }

    if (authView === 'admin_login') {
      return (
        <AdminLogin
          onBackClick={() => setAuthView('role_selection')}
          onAdminLoginSuccess={() => {
            // Clerk sign-in handled inside AdminLogin — auto-exits on success
          }}
        />
      );
    }
  }

  // ── Helpers for main app ──────────────────────────────────────────────────

  const handleNavTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSelectedEvent(null);
    setSeatSelectionEvent(null);
    setBookingInfo(null);
  };

  // ── Booking confirmed: standalone page ────────────────────────────────────
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

  // ── Main authenticated shell ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 animate-fade-in">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavTabChange}
        onProfileClick={() => {
          // Sign-out is handled by the UserButton inside Navbar (see Navbar.tsx)
        }}
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

export default App;