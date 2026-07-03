/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardView from './views/DashboardView';
import ExportView from './views/ExportView';
import CalendarView from './views/CalendarView';
import CreateEventView from './views/CreateEventView';

export type ViewType = 'dashboard' | 'export' | 'calendar' | 'create';

export default function App() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        window.location.href = 'http://localhost:5173'; // Redirect to user portal login
        return;
      }
      
      const email = user.primaryEmailAddress?.emailAddress?.toLowerCase() || '';
      const hasAdminRole = (user.publicMetadata?.role as string) === 'admin';
      
      // If signed in but not an admin, kick back to user portal
      if (!hasAdminRole && !email.includes('admin')) {
        window.location.href = 'http://localhost:5173'; 
      }
    }
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded || !isSignedIn) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-slate-500">Checking authorization...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans flex flex-col">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main className="flex-grow w-full pt-20">
        {currentView === 'dashboard' && <DashboardView onNavigate={setCurrentView} searchQuery={searchQuery} />}
        {currentView === 'export' && <ExportView onNavigate={setCurrentView} />}
        {currentView === 'calendar' && <CalendarView onNavigate={setCurrentView} />}
        {currentView === 'create' && <CreateEventView onNavigate={setCurrentView} />}
      </main>
      <Footer />
    </div>
  );
}
