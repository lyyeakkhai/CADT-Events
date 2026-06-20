import React, { useState } from 'react';
import About from '../src/Features/Users/pages/About.tsx';
import AdminLogin from './Features/auth/pages/AdminLogin.tsx';
import ExternalLogin from './Features/auth/pages/ExternalLogin.tsx';
import Login from '../src/Features/auth/pages/Login.tsx'
import Register from '../src/Features/auth/pages/Register.tsx';
import RoleSelection from '../src/Features/auth/pages/RoleSelection.tsx';
import Navbar from './Components/Navbar.tsx';
import Footer from './Components/Footer.tsx';
import DiscoveryFeed from '../src/Features/Users/pages/DiscoveryFeed.tsx';
import EventDetails from './Features/Users/pages/EventDetail.tsx';
import SeatSelection from './Features/Users/pages/SeatSelection.tsx';
import BookingConfirmed from './Features/Users/pages/BookingConfirmed.tsx';
import type { AcademicEvent } from './Features/Users/data/eventData';
import './index.css';
import MyBooking from './Features/Users/pages/MyBooking.tsx';

interface BookingInfo {
  event: AcademicEvent;
  seat: string;
  bookingId: string;
}

function App() {
  // Balanced single-page multi-tier state machine router paths
  const [currentRole, setCurrentRole] = useState<'guest' | 'participant_form' | 'participant_login' | 'institute_login' | 'admin_login' | 'student' | 'admin'>('guest');
  const [activeTab, setActiveTab] = useState<'Discover' | 'My Booking' | 'Calendar' | 'About'>('Discover');
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [seatSelectionEvent, setSeatSelectionEvent] = useState<AcademicEvent | null>(null);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);

  const handleLogout = () => {
    setCurrentRole('guest');
    setActiveTab('Discover');
    setSelectedEvent(null);
    setSeatSelectionEvent(null);
    bookingStatusReset();
  };

  const bookingStatusReset = () => {
    setBookingInfo(null);
  };

  const handleNavTabChange = (tab: 'Discover' | 'My Booking' | 'Calendar' | 'About') => {
    setActiveTab(tab);
    setSelectedEvent(null);
    setSeatSelectionEvent(null);
    setBookingInfo(null);
  };

  // =======================================================================
  // MULTI-ROLE SECURITY PATHWAY INTERCEPTORS
  // =======================================================================
  
  // State 1: Primary Gateway Selection Menu Card Matrix
  if (currentRole === 'guest') {
    return (
      <RoleSelection 
        onSelectRole={(role) => {
          if (role === 'admin') {
            setCurrentRole('admin_login'); // Routes strictly to Admin credential terminal card
          } else {
            setCurrentRole('participant_form'); // Participant selection routes directly onto split registration
          }
        }} 
      />
    );
  }

  // State 2: Split-panel Master Onboarding Register Card (With Institute login hooks)
  if (currentRole === 'participant_form') {
    return (
      <Register
        onBackClick={() => setCurrentRole('guest')}
        onInstituteLoginClick={() => setCurrentRole('institute_login')}
        onLoginClick={() => setCurrentRole('participant_login')}
        onExternalSubmitComplete={() => {
          alert("Attendee account verified successfully! Opening workspace discovery feed.");
          setCurrentRole('student');
          setActiveTab('Discover');
        }}
      />
    );
  }

  // State 3: External Visitor General Attendee Sign-in Panel Gateway
  if (currentRole === 'participant_login') {
    return (
      <ExternalLogin 
        onBackClick={() => setCurrentRole('participant_form')}
        onSignUpClick={() => setCurrentRole('participant_form')}
        onLoginSuccess={() => {
          setCurrentRole('student');
          setActiveTab('Discover');
        }}
      />
    );
  }

  // State 4: Institutional Sign-In Access Portal for internal students/staff
  if (currentRole === 'institute_login') {
    return (
      <Login 
        onBackClick={() => setCurrentRole('participant_form')}
        onLoginSuccess={() => {
          setCurrentRole('student');
          setActiveTab('Discover');
        }}
        onOAuthClick={() => {
          setCurrentRole('student');
          setActiveTab('Discover');
        }}
      />
    );
  }

  // State 5: Secured Organizer Administrative Terminal Entry Gate
  if (currentRole === 'admin_login') {
    return (
      <AdminLogin 
        onBackClick={() => setCurrentRole('guest')}
        onAdminLoginSuccess={() => {
          setCurrentRole('admin');
        }}
      />
    );
  }

  // State 6: Stanadalone Ticket Generation Output Canvas (Bypasses core layout wrappers)
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

  // =======================================================================
  // MAIN CORE RUNTIME SHELL APPLICATION (Renders once Authenticated)
  // =======================================================================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 animate-fade-in">

      {/* Global Interactive Dark Blue Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavTabChange}
        onProfileClick={handleLogout}
      />
      
      {/* Dynamic Session Environment Indicator Stripe */}
      <div className="w-full bg-[#0f172a] text-white px-4 sm:px-8 py-1.5 text-[11px] font-bold flex justify-between items-center border-b border-slate-800 shadow-inner select-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Workspace: <span className="text-amber-400 uppercase tracking-wider">{currentRole === 'admin' ? 'Admin Control Node' : 'CADT Student Session'}</span></span>
        </div>
        <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[10px]">
          Exit Session ↩
        </button>
      </div>

      {/* Central View Switcher Content Frame Viewport */}
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
          /* ✅ RESOLVED: This is now reachable and loads beautifully without rendering glitches! */
          <About onExploreEventsClick={() => setActiveTab('Discover')} />
        ) : (
          /* Calendar & Sandbox Mock Viewport Tracks */
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex-grow flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-white border border-slate-200/80 shadow-xs rounded-xl flex items-center justify-center text-xl mb-3 select-none">
              🛠️
            </div>
            <h2 className="text-lg font-black text-slate-900 mb-1">{activeTab} Section Sandbox</h2>
            <p className="text-xs font-semibold text-slate-400 max-w-xs mx-auto leading-relaxed">
              The layout mapping pipeline for this component tab is active and executing correctly.
            </p>
          </main>
        )}
      </div>

      {/* Persistent global layout footer signature */}
      <Footer onLinkClick={() => { setSelectedEvent(null); setSeatSelectionEvent(null); }} />

    </div>
  );
}

export default App;