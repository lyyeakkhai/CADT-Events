import { useState } from 'react';
import type { ViewType } from '../App';
import { ChevronRight, UploadCloud, Users, CheckCircle2, Circle, Send, Loader2, AlertCircle } from 'lucide-react';
import apiClient from '../lib/apiClient';

interface EventForm {
  title: string;
  description: string;
  eventType: string;
  startTimestamp: string;
  endTimestamp: string;
  location: string;
  coverImageUrl: string;
  creditValue: number;
  isFeatured: boolean;
  status: 'DRAFT' | 'PUBLISHED';
}

const INITIAL: EventForm = {
  title: '',
  description: '',
  eventType: 'Seminar',
  startTimestamp: '',
  endTimestamp: '',
  location: '',
  coverImageUrl: '',
  creditValue: 0,
  isFeatured: false,
  status: 'DRAFT',
};

export default function CreateEventView({ onNavigate }: { onNavigate: (v: ViewType) => void }) {
  const [form, setForm] = useState<EventForm>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (key: keyof EventForm, val: string | number | boolean) =>
    setForm(prev => ({ ...prev, [key]: val }));

  // Checklist
  const hasTitle = form.title.trim().length >= 3;
  const hasDescription = form.description.trim().length >= 10;
  const hasStart = !!form.startTimestamp;
  const hasLocation = !!form.location.trim();
  const allReady = hasTitle && hasDescription && hasStart && hasLocation;

  async function handleSubmit(status: 'DRAFT' | 'PUBLISHED') {
    setError(null);
    if (!allReady) {
      setError('Please fill in all required fields (title, description, start date, location).');
      return;
    }

    // Build end timestamp (default: start + 2 hours if not set)
    const start = new Date(form.startTimestamp);
    const end = form.endTimestamp ? new Date(form.endTimestamp) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

    try {
      setSubmitting(true);
      await apiClient.post('/events', {
        title: form.title,
        description: form.description,
        eventType: form.eventType,
        startTimestamp: start.toISOString(),
        endTimestamp: end.toISOString(),
        location: form.location,
        coverImageUrl: form.coverImageUrl || undefined,
        creditValue: form.creditValue,
        isFeatured: form.isFeatured,
        status,
      });
      setSuccess(true);
      setForm(INITIAL);
      setTimeout(() => {
        setSuccess(false);
        onNavigate('dashboard');
      }, 1800);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to create event';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full px-6 py-6 fade-in">
      <header className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-2">
          <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors">Admin Dashboard</button>
          <ChevronRight size={14} />
          <span className="text-amber-400 font-bold">Create New Event</span>
        </nav>
        <h1 className="text-3xl font-bold text-white">Create New Event</h1>
        <p className="text-slate-400 mt-2">Draft a new academic event, workshop, or seminar for the CADT community.</p>
      </header>

      {/* Success toast */}
      {success && (
        <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl font-semibold text-sm">
          <CheckCircle2 size={18} />
          Event created successfully! Redirecting to dashboard...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form className="lg:col-span-8 space-y-8" onSubmit={e => e.preventDefault()}>

          {/* Basic Information */}
          <section className="glass-card rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-l-4 border-amber-400 pl-3">
              <h2 className="text-xl font-bold text-white">Basic Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  Event Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Next-Gen AI Workshop 2024"
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 p-3 rounded-lg text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Event Type</label>
                <select
                  value={form.eventType}
                  onChange={e => set('eventType', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg text-sm focus:border-amber-400 outline-none transition-all"
                >
                  <option>Seminar</option>
                  <option>Workshop</option>
                  <option>Conference</option>
                  <option>Exhibition</option>
                  <option>Networking</option>
                  <option>Hands-on</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  Start Date &amp; Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.startTimestamp}
                  onChange={e => set('startTimestamp', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg text-sm focus:border-amber-400 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">End Date &amp; Time</label>
                <input
                  type="datetime-local"
                  value={form.endTimestamp}
                  onChange={e => set('endTimestamp', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg text-sm focus:border-amber-400 outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Event Details */}
          <section className="glass-card rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-l-4 border-amber-400 pl-3">
              <h2 className="text-xl font-bold text-white">Event Details</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  Event Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Provide a detailed overview of the event's goals, schedule, and expected outcomes..."
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 p-3 rounded-lg text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all resize-y"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Venue / Location <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => set('location', e.target.value)}
                    placeholder="e.g. Main Auditorium, Innovation Hub, Online"
                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 p-3 rounded-lg text-sm focus:border-amber-400 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Event Media */}
          <section className="glass-card rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-l-4 border-amber-400 pl-3">
              <h2 className="text-xl font-bold text-white">Event Media</h2>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">Cover Image URL</label>
              <input
                type="url"
                value={form.coverImageUrl}
                onChange={e => set('coverImageUrl', e.target.value)}
                placeholder="https://... (paste image URL or leave blank)"
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 p-3 rounded-lg text-sm focus:border-amber-400 outline-none transition-all"
              />
            </div>
            {!form.coverImageUrl && (
              <div className="mt-4 border-2 border-dashed border-slate-700 rounded-xl p-8 text-center bg-slate-800/40 hover:border-amber-400/50 transition-all cursor-pointer group">
                <UploadCloud className="text-slate-600 mb-2 mx-auto group-hover:text-amber-400 transition-colors" size={36} />
                <p className="text-sm text-slate-500 font-medium">Or drag &amp; drop cover image here</p>
                <p className="text-xs text-slate-600 mt-1">Recommended: 1920×1080px (Max 5MB)</p>
              </div>
            )}
            {form.coverImageUrl && (
              <div className="mt-4 rounded-xl overflow-hidden border border-slate-700 h-40">
                <img src={form.coverImageUrl} alt="preview" className="w-full h-full object-cover" onError={(e: any) => { e.target.style.display = 'none'; }} />
              </div>
            )}
          </section>

          {/* Settings */}
          <section className="glass-card rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-l-4 border-amber-400 pl-3">
              <h2 className="text-xl font-bold text-white">Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Credit Value (on attendance)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={form.creditValue}
                    onChange={e => set('creditValue', Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg text-sm focus:border-amber-400 outline-none transition-all"
                  />
                  <Users className="absolute right-3 top-3 text-slate-500" size={18} />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-7">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={e => set('isFeatured', e.target.checked)}
                    className="w-4 h-4 accent-amber-400 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-300">Feature on homepage</span>
                </label>
              </div>
            </div>
          </section>

          {/* Submit buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 pb-12">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit('DRAFT')}
              className="flex-1 px-8 py-4 border-2 border-slate-600 text-slate-300 font-bold rounded-xl hover:border-amber-400 hover:text-amber-400 transition-all text-center disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Save as Draft'}
            </button>
            <button
              type="button"
              disabled={submitting || !allReady}
              onClick={() => handleSubmit('PUBLISHED')}
              className="flex-[2] px-8 py-4 bg-amber-400 text-slate-900 font-black rounded-xl shadow-lg hover:bg-amber-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Publish Event</>}
            </button>
          </div>
        </form>

        {/* Sidebar: Preview + Checklist */}
        <aside className="lg:col-span-4 space-y-8 sticky top-24">

          {/* Live preview card */}
          <div className="glass-card rounded-xl overflow-hidden border border-slate-700 shadow-sm">
            <div className="h-44 relative bg-slate-800">
              {form.coverImageUrl ? (
                <img src={form.coverImageUrl} alt="Preview" className="w-full h-full object-cover opacity-80" onError={(e: any) => { e.target.style.display = 'none'; }} />
              ) : (
                <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-30" alt="Preview placeholder" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent flex items-end p-5">
                <span className="bg-amber-400 text-slate-900 text-[10px] px-3 py-1 rounded-full font-black shadow-sm tracking-widest uppercase">Live Preview</span>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <h3 className="text-lg font-bold text-white leading-tight">
                {form.title || 'Your Event Title Here'}
              </h3>
              <div className="space-y-1.5 bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {form.startTimestamp ? new Date(form.startTimestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not Scheduled Yet'}
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  {form.location || 'No Venue Selected'}
                </div>
              </div>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed border-t border-slate-700 pt-3">
                {form.description || 'Description will appear here as you type...'}
              </p>
            </div>
          </div>

          {/* Checklist */}
          <div className="glass-card rounded-xl p-6 border border-slate-700 shadow-sm">
            <h4 className="font-bold text-white mb-4 text-sm">Publication Checklist</h4>
            <ul className="space-y-3">
              {[
                { label: 'Event Title (min 3 chars)', done: hasTitle },
                { label: 'Description (min 10 chars)', done: hasDescription },
                { label: 'Start Date & Time', done: hasStart },
                { label: 'Venue / Location', done: hasLocation },
                { label: 'Cover Image (optional)', done: !!form.coverImageUrl },
              ].map(({ label, done }) => (
                <li key={label} className={`flex items-center gap-3 text-sm font-medium ${done ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {done ? <CheckCircle2 size={18} className="text-emerald-400 shrink-0" /> : <Circle size={18} className="text-slate-600 shrink-0" />}
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-5">
            <h4 className="font-bold text-amber-400 mb-2 text-sm">💡 Pro-Tip</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Events with high-resolution cover images and detailed descriptions see a 40% higher registration rate from CADT students.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
