import React, { useState } from 'react';
import Navbar from './Components/Navbar.tsx'; 
import Footer from './Components/Footer.tsx';
import DiscoveryFeed from '../src/Features/Users/pages/DiscoveryFeed.tsx';
import './index.css'; 

function App() {
  // State tracking configuration mapping your active tabs loop
  const [activeTab, setActiveTab] = useState<'Discover' | 'My Booking' | 'Calendar' | 'About'>('Discover');

  // Callback action fired when a participant clicks 'Register Now' on a child card
  const handleEventRegistration = (event: AcademicEvent) => {
    console.log(`Navigating to seat matrix for Event ID: ${event.id}`);
    alert(`Opening Registration Seat Selection for: "${event.title}"`);
  };

  return (
    // Flexbox viewport constraints force the footer to stick cleanly to the bottom
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      
      {/* Universal Top Branding & Navigation Element */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Viewport Core Context Workspace Section */}
      <div className="flex-grow w-full flex flex-col">
        {activeTab === 'Discover' ? (
          <DiscoveryFeed 
            onSelectEvent={handleEventRegistration}
            onViewCalendarClick={() => setActiveTab('Calendar')}
          />
        ) : (
          // Sandbox placeholder view layouts for inactive navigation tracks
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex-grow">
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              {activeTab} Screen Sandbox
            </h2>
            <p className="text-sm font-medium text-slate-500">
              The layout configuration for this view is currently under development.
            </p>
          </main>
        )}
      </div>

      {/* Unified Corporate Footnotes Footer Layer */}
      <Footer onLinkClick={(route) => console.log(`Navigating to footnote: ${route}`)} />

    </div>
  );
}

export default App;