import React, { useState } from 'react';
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
<<<<<<< HEAD
import './index.css';
import MyBooking from './Features/Users/pages/MyBooking.tsx';

interface BookingInfo {
  event: AcademicEvent;
  seat: string;
  bookingId: string;
}

function App() {
  const [currentRole, setCurrentRole] = useState<'guest' | 'participant_form' | 'student' | 'admin'>('guest');
  const [activeTab, setActiveTab] = useState<'Discover' | 'My Booking' | 'Calendar' | 'About'>('Discover');
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [seatSelectionEvent, setSeatSelectionEvent] = useState<AcademicEvent | null>(null);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
=======
import './index.css';    
 
function App() {
  // Balanced single-page layout multi-tier state machine router
  const [currentRole, setCurrentRole] = useState<'guest' | 'participant_form' | 'participant_login' | 'institute_login' | 'admin_login' | 'student' | 'admin'>('guest');
  const [activeTab, setActiveTab] = useState<'Discover' | 'My Booking' | 'Calendar' | 'About'>('Discover');
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);

  const handleCheckoutTransition = (event: AcademicEvent) => {
    alert(`Transitioning to auditorium seat configuration matrices for: "${event.title}"`);
  };
>>>>>>> 43a61a1039172d9e5adda850ac9e71efa38dc928

  const handleLogout = () => {
    setCurrentRole('guest');
    setActiveTab('Discover');
    setSelectedEvent(null);
    setSeatSelectionEvent(null);
    setBookingInfo(null);
  };

  const handleNavTabChange = (tab: 'Discover' | 'My Booking' | 'Calendar' | 'About') => {
    setActiveTab(tab);
    setSelectedEvent(null);
    setSeatSelectionEvent(null);
    setBookingInfo(null);
  };

<<<<<<< HEAD
=======
  // =======================================================================
  // MULTI-ROLE CONTEXT AUTHENTICATION INTERCEPTOR ROUTER
  // =======================================================================
  
  // View 1: Main Gateway Option Card Selector (Participant vs Administrator)
>>>>>>> 43a61a1039172d9e5adda850ac9e71efa38dc928
  if (currentRole === 'guest') {
    return (
      <RoleSelection 
        onSelectRole={(role) => {
          if (role === 'admin') {
            setCurrentRole('admin_login'); // Admin card choice safely routes to AdminLogin page
          } else {
            setCurrentRole('participant_form'); // Participant card routes to master split form hub
          }
        }} 
      />
    );
  }

<<<<<<< HEAD
=======
  // View 2: Split-panel Master Onboarding Form Hub (Handles External Register + Student Perks Sidebar)
>>>>>>> 43a61a1039172d9e5adda850ac9e71efa38dc928
  if (currentRole === 'participant_form') {
    return (
      <Register
        onBackClick={() => setCurrentRole('guest')}
<<<<<<< HEAD
        onInstituteLoginClick={() => setCurrentRole('participant_form')}
=======
        onInstituteLoginClick={() => setCurrentRole('institute_login')}
        onLoginClick={() => setCurrentRole('participant_login')}
>>>>>>> 43a61a1039172d9e5adda850ac9e71efa38dc928
        onExternalSubmitComplete={() => {
          alert("Attendee account verified successfully! Proceeding onto the student discovery feed layout.");
          setCurrentRole('student');
          setActiveTab('Discover');
        }}
      />
    );
  }

<<<<<<< HEAD
  // ── Booking Confirmed: full standalone page (no navbar/footer overlay) ──
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
=======
  // View 3: External Visitor/Attendee Profile Login Gate
  if (currentRole === 'participant_login') {
    return (
      <ExternalLogin 
        onBackClick={() => setCurrentRole('participant_form')}
        onSignUpClick={() => setCurrentRole('participant_form')}
        onLoginSuccess={() => {
          setCurrentRole('student');
          setActiveTab('Discover');
>>>>>>> 43a61a1039172d9e5adda850ac9e71efa38dc928
        }}
      />
    );
  }

<<<<<<< HEAD
=======
  // View 4: Institutional Access Portal Login (For Internal Students & Staff)
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

  // View 5: NEW - Secured Administrative Terminal Access Portal
  if (currentRole === 'admin_login') {
    return (
      <AdminLogin 
        onBackClick={() => setCurrentRole('guest')} // Returns organizer cleanly to the main choice entry
        onAdminLoginSuccess={() => {
          alert("Admin identity token approved. Synchronizing ecosystem metrics inventory logs...");
          setCurrentRole('admin');
        }}
      />
    );
  }

  // =======================================================================
  // MAIN CORE APPLICATION RUNTIME SHELL (Renders once Authenticated)
  // =======================================================================
>>>>>>> 43a61a1039172d9e5adda850ac9e71efa38dc928
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 animate-fade-in">

      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavTabChange}
        onProfileClick={handleLogout}
      />
<<<<<<< HEAD

=======
      
      {/* Dynamic Security Environment Indicator Ribbon Stripe */}
>>>>>>> 43a61a1039172d9e5adda850ac9e71efa38dc928
      <div className="w-full bg-[#0f172a] text-white px-4 sm:px-8 py-1.5 text-[11px] font-bold flex justify-between items-center border-b border-slate-800 shadow-inner select-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Workspace: <span className="text-amber-400 uppercase tracking-wider">{currentRole === 'admin' ? 'Admin Control Node' : 'CADT Student Session'}</span></span>
        </div>
        <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[10px]">
          Exit Console ↩
        </button>
      </div>
<<<<<<< HEAD

      <div className="flex-grow w-full flex flex-col">
        {activeTab === 'Discover' ? (
          seatSelectionEvent ? (
            <SeatSelection
              event={seatSelectionEvent}
              onBackClick={() => setSeatSelectionEvent(null)}
              onRegisterClick={(event, seat, bookingId) => {
                // Navigate to standalone BookingConfirmed page
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
=======
      
      {/* Central Layout Panel Page Content Viewport */}
      <div className="flex-grow w-full flex flex-col">
        {currentRole === 'admin' ? (
          /* MANAGERS DASHBOARD: Real-Time KPIs and Inventory list tables logs */
          <AdminDashboard 
            onLogoutClick={handleLogout}
            onCreateEventClick={() => alert("Launching Multi-Section Creation Modal Panel Wizard...")}
          />
>>>>>>> 43a61a1039172d9e5adda850ac9e71efa38dc928
        ) : (
          /* CONSUMERS PLATFORM: central interactive discovery tracks */
          activeTab === 'Discover' ? (
            selectedEvent ? (
              <EventDetails 
                event={selectedEvent}
                onBackClick={() => setSelectedEvent(null)}
                onRegisterClick={handleCheckoutTransition}
              />
            ) : (
              <DiscoveryFeed 
                onSelectEvent={(event) => setSelectedEvent(event)}
                onViewCalendarClick={() => setActiveTab('Calendar')}
              />
            )
          ) : (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex-grow">
              <h2 className="text-2xl font-black text-slate-900 mb-2">{activeTab} Section</h2>
              <p className="text-sm font-medium text-slate-500">Prototype usability evaluation container sandbox.</p>
            </main>
          )
        )}
      </div>

      <Footer onLinkClick={() => { setSelectedEvent(null); setSeatSelectionEvent(null); }} />

    </div>
  );
}

export default App;