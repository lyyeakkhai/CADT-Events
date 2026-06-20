import React, { useState } from 'react';
import type { AcademicEvent } from '../data/eventData';
import hidetoheal from '../../../asset/hidetoheal.jpg';

interface RegistrationProps {
  event: AcademicEvent;
  seat: string;
  onBackClick: () => void;
  onConfirm: (event: AcademicEvent, seat: string, bookingId: string) => void;
}

export default function Registration({ event, seat, onBackClick, onConfirm }: RegistrationProps) {
  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [email, setEmail]           = useState('');
  const [phone, setPhone]           = useState('');
  const [agreed, setAgreed]         = useState(false);
  const [accessibility, setAccessibility] = useState('');
  const [errors, setErrors]         = useState<Record<string, string>>({});

  const speakerImage = event.image || hidetoheal;

  // derive zone label from seat id
  const seatRowChar = seat.charAt(0);
  const zoneLabel =
    ['A','B','C','D','E','F','G'].includes(seatRowChar) ? 'Zone A' :
    ['H','I','J','K','L','M','N','O','P','Q'].includes(seatRowChar) ? 'Zone B' : 'Zone C';
  const rowNum = seatRowChar.charCodeAt(0) - 64; // A=1, B=2 …
  const seatDisplay = `${zoneLabel}, Row ${rowNum}, Seat ${seat.slice(1)}`;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'Required';
    if (!lastName.trim())  e.lastName  = 'Required';
    if (!email.trim() || !email.includes('@')) e.email = 'Valid email required';
    if (!phone.trim()) e.phone = 'Required';
    if (!agreed) e.agreed = 'You must agree to the Event Policy';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    const bookingId = `BK-${Date.now().toString(36).toUpperCase()}`;
    onConfirm(event, seat, bookingId);
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen font-sans antialiased">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200/60 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs font-semibold text-slate-400">
          <button onClick={onBackClick} className="hover:text-blue-900 transition-colors cursor-pointer">
            Events
          </button>
          <span>/</span>
          <button onClick={onBackClick} className="hover:text-blue-900 transition-colors cursor-pointer truncate max-w-[180px]">
            {event.title}
          </button>
          <span>/</span>
          <button onClick={onBackClick} className="hover:text-blue-900 transition-colors cursor-pointer">
            Select Seats
          </button>
          <span>/</span>
          <span className="text-slate-700 font-bold">Registration</span>
        </div>
      </div>

      {/* Step Progress */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-0 max-w-lg">
            {/* Step 1 — done */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-black shadow">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-slate-400 mt-1.5 whitespace-nowrap">1. Seat Selection</span>
            </div>
            <div className="flex-1 h-[2px] bg-slate-900 mx-3 mb-5" />
            {/* Step 2 — active */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-black shadow">
                2
              </div>
              <span className="text-[11px] font-bold text-slate-900 mt-1.5 whitespace-nowrap">2. Registration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* LEFT: Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">

            <h2 className="text-base font-black text-slate-900 mb-1">Personal Information</h2>
            <p className="text-xs font-medium text-slate-400 mb-6 leading-relaxed">
              Please provide your details exactly as they appear on your institutional ID to ensure a seamless check-in experience.
            </p>

            {/* Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium text-slate-900 placeholder-slate-300 outline-none transition-all
                    ${errors.firstName ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-slate-900 bg-white'}`}
                />
                {errors.firstName && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium text-slate-900 placeholder-slate-300 outline-none transition-all
                    ${errors.lastName ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-slate-900 bg-white'}`}
                />
                {errors.lastName && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Institutional Email</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@cadt.edu"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-medium text-slate-900 placeholder-slate-300 outline-none transition-all
                    ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-slate-900 bg-white'}`}
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+855 XX XXX XXX"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-medium text-slate-900 placeholder-slate-300 outline-none transition-all
                    ${errors.phone ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-slate-900 bg-white'}`}
                />
              </div>
              {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.phone}</p>}
            </div>

            {/* Agreement */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div
                  onClick={() => setAgreed(a => !a)}
                  className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer
                    ${agreed ? 'bg-slate-900 border-slate-900' : errors.agreed ? 'border-red-400' : 'border-slate-300 group-hover:border-slate-500'}`}
                >
                  {agreed && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-xs font-medium text-slate-600 leading-relaxed">
                  I agree to the <span className="font-black text-slate-900 underline underline-offset-2 cursor-pointer">Event Policy</span> and understand that registration is non-transferable without prior institutional approval.
                </span>
              </label>
              {errors.agreed && <p className="text-[10px] text-red-500 font-bold mt-1 ml-7">{errors.agreed}</p>}
            </div>

            <div className="border-t border-slate-100 mb-6" />

            {/* Accessibility */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Accessibility Requirements</label>
              <textarea
                value={accessibility}
                onChange={e => setAccessibility(e.target.value)}
                placeholder="Please specify any special requirements (e.g., seating, interpretation)"
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 text-sm font-medium text-slate-900 placeholder-slate-300 outline-none transition-all resize-none bg-white"
              />
            </div>

          </div>
        </div>

        {/* RIGHT: Summary sidebar */}
        <div className="space-y-4 lg:sticky lg:top-24">

          {/* Event summary card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Speaker hero */}
            <div className="relative h-44 bg-gradient-to-br from-orange-300 via-amber-200 to-orange-100 overflow-hidden">
              <img
                src={speakerImage}
                alt={event.speaker}
                className="h-full w-auto object-cover object-top absolute bottom-0 right-0"
                style={{ maxWidth: '65%' }}
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm">
                <p className="text-sm font-black text-amber-600 leading-tight">{event.speaker}</p>
                <p className="text-[10px] font-semibold text-slate-500">the founder of Sneha</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <h3 className="text-sm font-black text-slate-900 leading-snug">{event.title}</h3>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs font-medium text-slate-500">
                  <svg className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>Date: {event.date}</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs font-medium text-slate-500">
                  <svg className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>Time: {event.time}</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs font-medium text-slate-500">
                  <svg className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{event.venue}</span>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Selected Seat</span>
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                  {seatDisplay}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Ticket Type</span>
                <span className="text-xs font-black text-slate-900">Standard Student Access</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Amount</span>
                <span className="text-sm font-black text-slate-900">$0.00 <span className="text-slate-400 font-medium">(Complimentary)</span></span>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl text-sm font-extrabold tracking-widest uppercase bg-slate-900 hover:bg-blue-900 text-white shadow-sm hover:shadow active:scale-[0.98] transition-all duration-150 cursor-pointer"
              >
                Confirm Booking
              </button>

              <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
                <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                  Your registration code will be sent to your email immediately after confirmation.
                </p>
              </div>
            </div>
          </div>

          {/* Cancellation policy */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">Cancellation Policy</h4>
            <ul className="space-y-2">
              {[
                'Cancellations must be made 48 hours prior to the event.',
                'No-shows may affect eligibility for future premium events.',
                'Substitution of attendees is permitted via the portal.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs font-medium text-slate-500 leading-relaxed">
                  <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </main>
    </div>
  );
}