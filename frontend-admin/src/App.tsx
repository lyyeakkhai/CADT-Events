/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardView from './views/DashboardView';
import ExportView from './views/ExportView';
import CalendarView from './views/CalendarView';
import CreateEventView from './views/CreateEventView';

export type ViewType = 'dashboard' | 'export' | 'calendar' | 'create';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

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
