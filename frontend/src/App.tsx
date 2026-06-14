import React, { useState } from 'react';
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
  const [currentRole, setCurrentRole] = useState<'guest' | 'participant_form' | 'student' | 'admin'>('guest');
  const [activeTab, setActiveTab] = useState<'Discover' | 'My Booking' | 'Calendar' | 'About'>('Discover');
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [seatSelectionEvent, setSeatSelectionEvent] = useState<AcademicEvent | null>(null);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);

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

  if (currentRole === 'guest') {
    return <RoleSelection onSelectRole={(role) => role === 'student' ? setCurrentRole('participant_form') : setCurrentRole('admin')} />;
  }

  if (currentRole === 'participant_form') {
    return (
      <Register
        onBackClick={() => setCurrentRole('guest')}
        onInstituteLoginClick={() => setCurrentRole('participant_form')}
        onExternalSubmitComplete={() => {
          alert("Account verified successfully! Logging you into the participant discovery feed.");
          setCurrentRole('participant_form');
        }}
      />
    );
  }

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
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 animate-fade-in">

      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavTabChange}
        onProfileClick={handleLogout}
      />

      <div className="w-full bg-[#0f172a] text-white px-4 sm:px-8 py-1.5 text-[11px] font-bold flex justify-between items-center border-b border-slate-800 shadow-inner select-none">
        <span>Logged in session: <span className="text-amber-400 uppercase tracking-wider">External Attendee Feed</span></span>
        <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[10px]">
          Exit Portal ↩
        </button>
      </div>

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
        ) : (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex-grow">
            <h2 className="text-2xl font-black text-slate-900 mb-2">{activeTab} Section</h2>
            <p className="text-sm font-medium text-slate-500">Prototype usability testing frame container sandbox.</p>
          </main>
        )}
      </div>

      <Footer onLinkClick={() => { setSelectedEvent(null); setSeatSelectionEvent(null); }} />

    </div>
  );
}

export default App;