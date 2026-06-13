import React, { useState } from 'react';
import Register from '../src/Features/auth/pages/Register.tsx';
import RoleSelection from '../src/Features/auth/pages/RoleSelection.tsx';
import Navbar from './Components/Navbar.tsx'; 
import Footer from './Components/Footer.tsx';
import DiscoveryFeed from '../src/Features/Users/pages/DiscoveryFeed.tsx';
import EventDetails from './Features/Users/pages/EventDetail.tsx';
import type { AcademicEvent } from './Features/Users/data/eventData';
import './index.css'; 
function App() {
  // Application routing workflow states
  const [currentRole, setCurrentRole] = useState<'guest' | 'participant_form' | 'student' | 'admin'>('guest');
  const [activeTab, setActiveTab] = useState<'Discover' | 'My Booking' | 'Calendar' | 'About'>('Discover');
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);

  const handleCheckoutTransition = (event: AcademicEvent) => {
    alert(`Transitioning to auditorium seat configuration grid maps for: "${event.title}"`);
  };

  const handleLogout = () => {
    setCurrentRole('guest');
    setActiveTab('Discover');
    setSelectedEvent(null);
  };

  // =======================================================================
  // CONDITIONAL PATH ROUTER CHANNELS
  // =======================================================================
  
  // State 1: Primary Onboarding Role Filter Choice Screen
  if (currentRole === 'guest') {
    return <RoleSelection onSelectRole={(role) => role === 'student' ? setCurrentRole('participant_form') : setCurrentRole('admin')} />;
  }

  // State 2: High-Fidelity Split-Form Account Registration for Participant Flow 
  if (currentRole === 'participant_form') {
    return (
      <Register 
        onBackClick={() => setCurrentRole('guest')}
        onInstituteLoginClick={() => setCurrentRole('participant_form')} // Redirects straight to Student Feed
        onExternalSubmitComplete={() => {
          alert("Account verified successfully! Logging you into the participant discovery feed.");
          setCurrentRole('participant_form');
        }}
      />
    );
  }

  // State 3: Active Dashboard Shell Environment (Student or Organizer Admins) [cite: 13]
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 animate-fade-in">
      
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setSelectedEvent(null); }}
        onProfileClick={handleLogout}
      />
      
      {/* Dynamic Session Indicator Info Stripe */}
      <div className="w-full bg-[#0f172a] text-white px-4 sm:px-8 py-1.5 text-[11px] font-bold flex justify-between items-center border-b border-slate-800 shadow-inner select-none">
        <span>Logged in session: <span className="text-amber-400 uppercase tracking-wider">External Attendee Feed</span></span>
        <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[10px]">
          Exit Portal ↩
        </button>
      </div>
      
      <div className="flex-grow w-full flex flex-col">
        {activeTab === 'Discover' ? (
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
            <p className="text-sm font-medium text-slate-500">Prototype usability testing frame container sandbox.</p>
          </main>
        )}
      </div>

      <Footer onLinkClick={() => setSelectedEvent(null)} />

    </div>
  );
}

export default App;