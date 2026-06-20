import React, { useState } from 'react';
import About from './Features/Users/pages/About.tsx';
import AdminLogin from './Features/auth/pages/AdminLogin.tsx';
import ExternalLogin from './Features/auth/pages/ExternalLogin.tsx';
import Login from './Features/auth/pages/Login.tsx';
import Register from './Features/auth/pages/Register.tsx';
import RoleSelection from './Features/auth/pages/RoleSelection.tsx';
import Navbar from './Components/Navbar.tsx';
import Footer from './Components/Footer.tsx';
import DiscoveryFeed from './Features/Users/pages/DiscoveryFeed.tsx';
import EventDetails from './Features/Users/pages/EventDetail.tsx';
import SeatSelection from './Features/Users/pages/SeatSelection.tsx';
import Registration from './Features/Users/pages/Registration.tsx'; // ← ADD THIS
import BookingConfirmed from './Features/Users/pages/BookingConfirmed.tsx';
import MyBooking from './Features/Users/pages/MyBooking.tsx';
import MyFavorites from './Features/Users/pages/MyFavorites.tsx';
import ProfileSettings from './Features/Users/pages/ProfileSettings.tsx';
import EventCalendar from './Features/Users/pages/EventCalendar.tsx';
import type { AcademicEvent } from './Features/Users/data/eventData';
import './index.css';

interface BookingInfo {
  event: AcademicEvent;
  seat: string;
  bookingId: string;
}

// ← ADD RegistrationInfo interface
interface RegistrationInfo {
  event: AcademicEvent;
  seat: string;
}

type ActiveTab = 'Discover' | 'My Booking' | 'Calendar' | 'About' | 'Favorites' | 'Profile';
type Role = 'guest' | 'participant_form' | 'participant_login' | 'institute_login' | 'admin_login' | 'student' | 'admin';

function App() {
  const [currentRole, setCurrentRole] = useState<Role>('guest');
  const [activeTab, setActiveTab] = useState<ActiveTab>('Discover');
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [seatSelectionEvent, setSeatSelectionEvent] = useState<AcademicEvent | null>(null);
  const [registrationInfo, setRegistrationInfo] = useState<RegistrationInfo | null>(null); // ← ADD
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);

  const handleLogout = () => {
    setCurrentRole('guest');
    setActiveTab('Discover');
    setSelectedEvent(null);
    setSeatSelectionEvent(null);
    setRegistrationInfo(null); // ← ADD
    setBookingInfo(null);
  };

  const handleNavTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSelectedEvent(null);
    setSeatSelectionEvent(null);
    setRegistrationInfo(null); // ← ADD
    setBookingInfo(null);
  };

  // ── View 1: Role Selection Gateway ──
  if (currentRole === 'guest') {
    return (
      <RoleSelection
        onSelectRole={(role) => {
          if (role === 'admin') {
            setCurrentRole('admin_login');
          } else {
            setCurrentRole('participant_form');
          }
        }}
      />
    );
  }

  // ── View 2: Register / Onboarding Form ──
  if (currentRole === 'participant_form') {
    return (
      <Register
        onBackClick={() => setCurrentRole('guest')}
        onInstituteLoginClick={() => setCurrentRole('institute_login')}
        onLoginClick={() => setCurrentRole('participant_login')}
        onExternalSubmitComplete={() => {
          alert('Attendee account verified successfully! Proceeding onto the student discovery feed layout.');
          setCurrentRole('student');
          setActiveTab('Discover');
        }}
      />
    );
  }

  // ── View 3: External Login ──
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

  // ── View 4: Institute Login ──
  if (currentRole === 'institute_login') {
    return (
      <Login
        onBackClick={() => setCurrentRole('participant_form')}
        onLoginSuccess={() => {
          setCurrentRole('student');
          setActiveTab('Discover');
        }}
        onOAuthClick={(provider) => {
          alert(`SSO handshake approved via institutional ${provider.toUpperCase()} portal.`);
          setCurrentRole('student');
          setActiveTab('Discover');
        }}
      />
    );
  }

  // ── View 5: Admin Login ──
  if (currentRole === 'admin_login') {
    return (
      <AdminLogin
        onBackClick={() => setCurrentRole('guest')}
        onAdminLoginSuccess={() => {
          alert('Admin identity token approved. Synchronizing ecosystem metrics inventory logs...');
          setCurrentRole('admin');
        }}
      />
    );
  }

  // ── Booking Confirmed: standalone page (no navbar/footer) ──
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
          setRegistrationInfo(null); // ← ADD
          setSelectedEvent(null);
        }}
      />
    );
  }

  // ── Main App Shell ──
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 animate-fade-in">

      {/* Global Interactive Dark Blue Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavTabChange}
        onFavoritesClick={() => handleNavTabChange('Favorites')}
        onProfileClick={() => handleNavTabChange('Profile')}
      />

      {/* Session Ribbon */}
      <div className="w-full bg-[#0f172a] text-white px-4 sm:px-8 py-1.5 text-[11px] font-bold flex justify-between items-center border-b border-slate-800 shadow-inner select-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            Active Workspace:{' '}
            <span className="text-amber-400 uppercase tracking-wider">
              {currentRole === 'admin' ? 'Admin Control Node' : 'CADT Student Session'}
            </span>
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[10px]"
        >
          Exit Console ↩
        </button>
      </div>

      {/* Page Content */}
      <div className="flex-grow w-full flex flex-col">
        {activeTab === 'Discover' ? (
          // ── UPDATED: insert Registration step between SeatSelection and BookingConfirmed ──
          registrationInfo ? (
            <Registration
              event={registrationInfo.event}
              seat={registrationInfo.seat}
              onBackClick={() => setRegistrationInfo(null)}
              onConfirm={(event, seat, bookingId) => {
                setRegistrationInfo(null);
                setBookingInfo({ event, seat, bookingId });
              }}
            />
          ) : seatSelectionEvent ? (
            <SeatSelection
              event={seatSelectionEvent}
              onBackClick={() => setSeatSelectionEvent(null)}
              onRegisterClick={(event, seat) => {          // ← now goes to Registration, not BookingConfirmed
                setRegistrationInfo({ event, seat });
                setSeatSelectionEvent(null);
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
              onViewCalendarClick={() => handleNavTabChange('Calendar')}
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