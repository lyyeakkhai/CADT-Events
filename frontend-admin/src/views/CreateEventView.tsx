import type { ViewType } from '../App';
import { ChevronRight, UploadCloud, Users, CheckCircle2, Circle, Send } from 'lucide-react';

export default function CreateEventView({ onNavigate }: { onNavigate: (v: ViewType) => void }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-6 w-full fade-in">
      <header className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-2">
          <button onClick={() => onNavigate('dashboard')} className="hover:text-primary">Admin Dashboard</button>
          <ChevronRight size={14} />
          <span className="text-primary font-bold">Create New Event</span>
        </nav>
        <h1 className="text-3xl font-bold text-primary">Create New Event</h1>
        <p className="text-on-surface-variant mt-2">Draft a new academic event, workshop, or seminar for the CADT community.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form className="lg:col-span-8 space-y-8" onSubmit={(e) => e.preventDefault()}>
          
          <section className="glass-card border border-outline-variant/60 bg-surface-container-lowest rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-l-4 border-primary pl-3">
              <h2 className="text-xl font-bold text-primary">Basic Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Event Title</label>
                <input type="text" placeholder="e.g. Next-Gen AI Workshop 2024" className="w-full input-glow p-3 rounded-lg text-sm transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Category</label>
                <select className="w-full input-glow p-3 rounded-lg text-sm transition-all">
                  <option>Tech</option>
                  <option>Innovation</option>
                  <option>Business</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Date & Time</label>
                <input type="datetime-local" className="w-full input-glow p-3 rounded-lg text-sm transition-all" />
              </div>
            </div>
          </section>

          <section className="glass-card border border-outline-variant/60 bg-surface-container-lowest rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-l-4 border-primary pl-3">
              <h2 className="text-xl font-bold text-primary">Event Details</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Event Description</label>
                <textarea rows={5} placeholder="Provide a detailed overview of the event's goals, schedule, and expected outcomes..." className="w-full input-glow p-3 rounded-lg text-sm transition-all resize-y"></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-2">Lead Speaker / Organizer</label>
                  <input type="text" placeholder="Full Name" className="w-full input-glow p-3 rounded-lg text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-2">Venue / Location</label>
                  <select className="w-full input-glow p-3 rounded-lg text-sm transition-all">
                    <option>Main Auditorium (Hall A)</option>
                    <option>Innovation Hub</option>
                    <option>Virtual / Online</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card border border-outline-variant/60 bg-surface-container-lowest rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-l-4 border-primary pl-3">
              <h2 className="text-xl font-bold text-primary">Event Media</h2>
            </div>
            <div className="border-2 border-dashed border-outline-variant/70 rounded-xl p-10 text-center bg-surface-container hover:bg-surface-container-high hover:border-primary transition-all cursor-pointer group">
              <div className="flex flex-col items-center">
                <UploadCloud className="text-outline mb-3 group-hover:text-primary transition-colors" size={48} />
                <p className="text-lg font-bold text-on-surface">Drag & Drop Cover Image</p>
                <p className="text-on-surface-variant text-sm mt-1">Recommended size: 1920x1080px (Max 5MB)</p>
                <button type="button" className="mt-6 px-8 py-2 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary/5 transition-colors">Browse Files</button>
              </div>
            </div>
          </section>

          <section className="glass-card border border-outline-variant/60 bg-surface-container-lowest rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-l-4 border-primary pl-3">
              <h2 className="text-xl font-bold text-primary">Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Max Capacity</label>
                <div className="relative">
                  <input type="number" placeholder="0 for unlimited" className="w-full input-glow p-3 rounded-lg text-sm transition-all" />
                  <Users className="absolute right-3 top-3 text-outline" size={18} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Privacy State</label>
                <select className="w-full input-glow p-3 rounded-lg text-sm transition-all">
                  <option>Public (Visible to All)</option>
                  <option>Private</option>
                  <option>Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Tags</label>
                <input type="text" placeholder="AI, Cloud, Networking..." className="w-full input-glow p-3 rounded-lg text-sm transition-all" />
              </div>
            </div>
          </section>

          <section className="glass-card border border-outline-variant/60 bg-surface-container-lowest rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-l-4 border-primary pl-3">
              <h2 className="text-xl font-bold text-primary">Notifications & Reminders</h2>
            </div>
            <div className="space-y-6">
              <label className="flex items-center gap-3 cursor-pointer group w-max">
                <div className="relative flex items-center">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 accent-primary" />
                </div>
                <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">Enable Telegram Bot Reminders</span>
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-2">Reminder Schedule</label>
                  <select className="w-full input-glow p-3 rounded-lg text-sm transition-all">
                    <option>24 Hours Before</option>
                    <option>1 Hour Before</option>
                    <option>15 Minutes Before</option>
                    <option>Custom Schedule...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-2">Target Audience</label>
                  <select className="w-full input-glow p-3 rounded-lg text-sm transition-all">
                    <option>All Registered Attendees</option>
                    <option>Waitlisted Only</option>
                    <option>Staff & Organizers</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-2">Custom Message Template (Optional)</label>
                  <textarea rows={3} placeholder="Hi {{name}}, reminder that {{event_title}} is starting soon at {{venue}}!" className="w-full input-glow p-3 rounded-lg text-sm transition-all resize-y font-mono text-xs"></textarea>
                  <p className="text-[10px] text-on-surface-variant mt-2 font-medium uppercase tracking-wider">Available tags: {'{{name}}'}, {'{{event_title}}'}, {'{{time}}'}, {'{{venue}}'}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col sm:flex-row gap-6 pt-4 pb-12">
            <button type="button" className="flex-1 px-8 py-4 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-all text-center">
              Save as Draft
            </button>
            <button type="button" onClick={() => onNavigate('dashboard')} className="flex-[2] px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/95 transition-all flex items-center justify-center gap-2">
              <Send size={18} />
              Publish Event
            </button>
          </div>
        </form>

        <aside className="lg:col-span-4 space-y-8 sticky top-24">
          <div className="glass-card bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/50 shadow-sm">
            <div className="h-48 relative bg-primary-container/20">
              <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Preview" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex items-end p-5">
                <span className="bg-secondary text-white text-[10px] px-3 py-1 rounded-full font-bold shadow-sm tracking-widest uppercase">Live Preview</span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-primary leading-tight">Your Event Title Here</h3>
              <div className="space-y-2 bg-surface-container-low/50 p-3 rounded-lg border border-outline-variant/30">
                <div className="flex items-center gap-3 text-on-surface-variant text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-outline"></div>
                  Not Scheduled Yet
                </div>
                <div className="flex items-center gap-3 text-on-surface-variant text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-outline"></div>
                  No Venue Selected
                </div>
              </div>
              <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed border-t border-outline-variant/30 pt-4">
                Description will appear here as you type. Make it engaging to attract more attendees...
              </p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
            <h4 className="font-bold text-primary mb-2 text-sm flex items-center gap-2">
               Pro-Tip
            </h4>
            <p className="text-on-surface-variant text-xs leading-relaxed font-medium">
              Events with high-resolution cover images and detailed agendas see a 40% higher registration rate from CADT students.
            </p>
          </div>

          <div className="glass-card bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/50 shadow-sm">
            <h4 className="font-bold text-primary mb-4 text-sm">Publication Checklist</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-secondary font-bold">
                <CheckCircle2 size={18} className="text-secondary" /> Basic Info Complete
              </li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                <Circle size={18} className="text-outline" /> Cover Image Uploaded
              </li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                <Circle size={18} className="text-outline" /> Speaker Details Added
              </li>
              <li className="flex items-center gap-3 text-sm text-secondary font-bold">
                <CheckCircle2 size={18} className="text-secondary" /> Telegram Reminders Enabled
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
