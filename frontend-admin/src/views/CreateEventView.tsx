import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { ViewType } from '../App';
import { ChevronRight, UploadCloud, Users, CheckCircle2, Circle, Send, Loader2, AlertCircle, Calendar as CalendarIcon, MapPin, Image as ImageIcon, Settings2, Info } from 'lucide-react';
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

export default function CreateEventView() {
  const _nav = useNavigate();
  const onNavigate = (v: string) => _nav(v === 'dashboard' ? '/' : '/' + v);
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
    <div className="w-full px-6 py-6 fade-in max-w-7xl mx-auto">
      <header className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-3 font-medium">
          <button onClick={() => onNavigate('dashboard')} className="hover:text-amber-500 transition-colors">Admin Dashboard</button>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-amber-500 font-bold">Create New Event</span>
        </nav>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create New Event</h1>
        <p className="text-slate-500 mt-2 text-base">Draft a new academic event, workshop, or seminar for the CADT community.</p>
      </header>

      {/* Success toast */}
      {success && (
        <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-semibold text-sm shadow-sm animate-fade-in">
          <CheckCircle2 size={20} className="text-emerald-500" />
          Event created successfully! Redirecting to dashboard...
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium shadow-sm animate-fade-in">
          <AlertCircle size={20} className="text-red-500 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <form className="xl:col-span-8 space-y-6" onSubmit={e => e.preventDefault()}>

          {/* Basic Information */}
          <section className="glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-amber-100 text-amber-600 rounded-lg">
                <Info size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
                <p className="text-sm text-slate-500">The core details of your event.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Next-Gen AI Workshop 2024"
                  className="w-full input-glow p-3 text-sm transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Event Type</label>
                <select
                  value={form.eventType}
                  onChange={e => set('eventType', e.target.value)}
                  className="w-full input-glow p-3 text-sm transition-all appearance-none cursor-pointer"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
                >
                  <option>Seminar</option>
                  <option>Workshop</option>
                  <option>Conference</option>
                  <option>Exhibition</option>
                  <option>Networking</option>
                  <option>Hands-on</option>
                </select>
              </div>
            </div>
          </section>

          {/* Schedule & Location */}
          <section className="glass-card p-6 md:p-8">
             <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
                <CalendarIcon size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Schedule &amp; Location</h2>
                <p className="text-sm text-slate-500">When and where is it happening?</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Start Date &amp; Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.startTimestamp}
                  onChange={e => set('startTimestamp', e.target.value)}
                  className="w-full input-glow p-3 text-sm transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">End Date &amp; Time</label>
                <input
                  type="datetime-local"
                  value={form.endTimestamp}
                  onChange={e => set('endTimestamp', e.target.value)}
                  className="w-full input-glow p-3 text-sm transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Venue / Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => set('location', e.target.value)}
                    placeholder="e.g. Main Auditorium, Innovation Hub, Online"
                    className="w-full input-glow p-3 pl-10 text-sm transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Event Details */}
          <section className="glass-card p-6 md:p-8">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">Event Description <span className="text-red-500">*</span></h2>
              <p className="text-sm text-slate-500 mt-1">Provide a detailed overview of the event's goals, schedule, and expected outcomes.</p>
            </div>
            <textarea
              rows={6}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Write your event description here..."
              className="w-full input-glow p-4 text-sm transition-all resize-y leading-relaxed"
            />
          </section>

          {/* Event Media */}
          <section className="glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-lg">
                <ImageIcon size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Event Media</h2>
                <p className="text-sm text-slate-500">Upload a cover image to make your event stand out.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Cover Image URL</label>
                <input
                  type="url"
                  value={form.coverImageUrl}
                  onChange={e => set('coverImageUrl', e.target.value)}
                  placeholder="https://... (paste image URL)"
                  className="w-full input-glow p-3 text-sm transition-all"
                />
              </div>
              
              {!form.coverImageUrl && (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center bg-slate-50 hover:bg-slate-100 hover:border-amber-400 transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloud className="text-slate-400 group-hover:text-amber-500 transition-colors" size={24} />
                  </div>
                  <p className="text-sm text-slate-700 font-semibold mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500">SVG, PNG, JPG or GIF (max. 5MB)</p>
                  <p className="text-xs text-slate-400 mt-2">Currently supports URL input above</p>
                </div>
              )}

              {form.coverImageUrl && (
                <div className="relative mt-4 rounded-xl overflow-hidden border border-slate-200 h-64 bg-slate-100 group">
                  <img src={form.coverImageUrl} alt="preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e: any) => { e.target.style.display = 'none'; }} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => set('coverImageUrl', '')} className="px-4 py-2 bg-white text-slate-900 text-sm font-bold rounded-lg shadow-lg hover:bg-slate-100 transition-colors">
                      Remove Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Settings */}
          <section className="glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-purple-100 text-purple-600 rounded-lg">
                <Settings2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Advanced Settings</h2>
                <p className="text-sm text-slate-500">Configure credits and visibility.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Credit Value (on attendance)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={form.creditValue}
                    onChange={e => set('creditValue', Number(e.target.value))}
                    className="w-full input-glow p-3 pr-10 text-sm transition-all"
                  />
                  <Users className="absolute right-3 top-3 text-slate-400" size={18} />
                </div>
              </div>
              
              <div className="pt-2 md:pt-6">
                <label className="flex items-center gap-3 cursor-pointer group p-3 border border-slate-200 rounded-xl hover:border-amber-400 hover:bg-amber-50/50 transition-colors">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={e => set('isFeatured', e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Feature on homepage</div>
                    <div className="text-xs text-slate-500">Highlight this event in the hero section</div>
                  </div>
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
              className="flex-1 px-6 py-3.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all text-center disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Save as Draft'}
            </button>
            <button
              type="button"
              disabled={submitting || !allReady}
              onClick={() => handleSubmit('PUBLISHED')}
              className="flex-[2] px-6 py-3.5 bg-amber-500 text-white font-bold rounded-xl shadow-md hover:bg-amber-600 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Publish Event</>}
            </button>
          </div>
        </form>

        {/* Sidebar: Preview + Checklist */}
        <aside className="xl:col-span-4 space-y-6 sticky top-24">
          
          {/* Publication Checklist */}
          <div className="glass-card p-6">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
               Checklist
            </h4>
            <ul className="space-y-4">
              {[
                { label: 'Event Title (min 3 chars)', done: hasTitle },
                { label: 'Description (min 10 chars)', done: hasDescription },
                { label: 'Start Date & Time', done: hasStart },
                { label: 'Venue / Location', done: hasLocation },
                { label: 'Cover Image (optional)', done: !!form.coverImageUrl, isOptional: true },
              ].map(({ label, done, isOptional }) => (
                <li key={label} className={`flex items-start gap-3 text-sm ${done ? 'text-slate-900' : 'text-slate-500'}`}>
                  {done ? (
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <Circle size={18} className="text-slate-300 shrink-0 mt-0.5" />
                  )}
                  <span className={done ? 'font-medium' : ''}>
                    {label} {isOptional && !done && <span className="text-xs text-slate-400 font-normal ml-1">(Optional)</span>}
                  </span>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 pt-5 border-t border-slate-100">
               <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4">
                  <h4 className="font-bold text-amber-800 mb-1.5 text-sm flex items-center gap-1.5">
                    <span className="text-lg">💡</span> Pro-Tip
                  </h4>
                  <p className="text-amber-700/80 text-xs leading-relaxed font-medium">
                    Events with high-resolution cover images and detailed descriptions see a <strong className="text-amber-800">40% higher</strong> registration rate.
                  </p>
                </div>
            </div>
          </div>

          {/* Live preview card */}
          <div className="glass-card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Preview</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="h-40 relative bg-slate-100">
              {form.coverImageUrl ? (
                <img src={form.coverImageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e: any) => { e.target.style.display = 'none'; }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                   <ImageIcon size={32} className="text-slate-300" />
                </div>
              )}
              {form.eventType && (
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                  {form.eventType}
                </div>
              )}
            </div>
            <div className="p-5 space-y-4">
              <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                {form.title || 'Your Event Title Here'}
              </h3>
              
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 text-sm">
                  <CalendarIcon size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-slate-600 font-medium leading-tight">
                     {form.startTimestamp ? new Date(form.startTimestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not Scheduled Yet'}
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-sm">
                  <MapPin size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-slate-600 font-medium leading-tight">
                     {form.location || 'No Venue Selected'}
                  </span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                  {form.description || 'Description will appear here as you type...'}
                </p>
              </div>
            </div>
          </div>
          
        </aside>
      </div>
    </div>
  );
}
