import React from 'react';
import hidetoheal from '../../../assets/images/hidetoheal.jpg';
import type { AcademicEvent } from '../data/eventData';

interface BookingConfirmedProps {
  event: AcademicEvent;
  seat: string;
  bookingId: string;
  onGoToMyBooking: () => void;
  onBackClick: () => void;
}

export default function BookingConfirmed({
  event,
  seat,
  bookingId,
  onGoToMyBooking,
  onBackClick,
}: BookingConfirmedProps) {
  const speakerImage = event.image || hidetoheal;
  const speakerName = event.speaker || 'Ms. Sotheary Yim';

  return (
    <div className="w-full min-h-screen bg-[#f0f4ff] font-sans antialiased flex flex-col">

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">

        {/* Success icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-md mb-6">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-black text-slate-900 mb-2 text-center">Booking Confirmed!</h1>
        <p className="text-sm font-medium text-slate-500 text-center mb-8 max-w-xs leading-relaxed">
          A confirmation email with your digital ticket has been sent to your institutional address.
        </p>

        {/* Ticket Card */}
        <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-100">

          {/* Speaker Banner */}
          <div className="relative h-48 bg-gradient-to-br from-orange-300 via-amber-200 to-orange-100 overflow-hidden">
            <img
              src={speakerImage}
              alt={speakerName}
              className="absolute bottom-0 right-0 h-full w-auto object-cover object-top"
              style={{ maxWidth: '60%' }}
            />
            {/* Speaker name overlay */}
            <div className="absolute top-4 left-4">
              <p className="text-lg font-black text-amber-600 leading-tight">{speakerName}</p>
              <p className="text-xs font-semibold text-slate-600">the founder of Sneha</p>
            </div>
            {/* Participant pass + event title at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent px-4 pt-8 pb-4">
              <span className="inline-block bg-amber-400 text-slate-900 text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-lg mb-2">
                Participant Pass
              </span>
              <p className="text-white text-sm font-black leading-snug">
                {event.badge || 'Event'} · {event.title}
              </p>
            </div>
          </div>

          {/* Event Details (dynamic from real booking) */}
          <div className="px-6 py-5 grid grid-cols-2 gap-4 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase mb-1">Date</p>
              <p className="text-xs font-bold text-slate-900 leading-relaxed">{event.date}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase mb-1">Time</p>
              <p className="text-xs font-bold text-slate-900">{event.time}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase mb-1">Venue</p>
              <p className="text-xs font-bold text-slate-900">{event.venue}</p>
            </div>
          </div>

          {/* Tear line */}
          <div className="relative flex items-center">
            <div className="absolute -left-3.5 w-7 h-7 rounded-full bg-[#f0f4ff]" />
            <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-4" />
            <div className="absolute -right-3.5 w-7 h-7 rounded-full bg-[#f0f4ff]" />
          </div>

          {/* Booking ID + QR */}
          <div className="px-6 py-5 flex items-center justify-between">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase mb-1">Booking ID</p>
                <p className="text-sm font-black text-slate-900">{bookingId}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase mb-1">Seat Number</p>
                <p className="text-sm font-black text-slate-900">Zone A | {seat}</p>
              </div>
            </div>

            {/* QR Code SVG */}
            <div className="w-24 h-24 rounded-xl border-2 border-slate-100 bg-white flex items-center justify-center p-2">
              <svg viewBox="0 0 70 70" className="w-full h-full">
                {/* Top-left finder pattern */}
                <rect x="2" y="2" width="20" height="20" rx="2" fill="#0f172a"/>
                <rect x="5" y="5" width="14" height="14" rx="1" fill="white"/>
                <rect x="8" y="8" width="8" height="8" rx="1" fill="#0f172a"/>
                {/* Top-right finder pattern */}
                <rect x="48" y="2" width="20" height="20" rx="2" fill="#0f172a"/>
                <rect x="51" y="5" width="14" height="14" rx="1" fill="white"/>
                <rect x="54" y="8" width="8" height="8" rx="1" fill="#0f172a"/>
                {/* Bottom-left finder pattern */}
                <rect x="2" y="48" width="20" height="20" rx="2" fill="#0f172a"/>
                <rect x="5" y="51" width="14" height="14" rx="1" fill="white"/>
                <rect x="8" y="54" width="8" height="8" rx="1" fill="#0f172a"/>
                {/* Data dots */}
                {[
                  [26,2],[30,2],[34,2],[38,2],[42,2],
                  [26,6],[34,6],[42,6],
                  [26,10],[30,10],[38,10],
                  [26,14],[34,14],[38,14],[42,14],
                  [26,18],[30,18],[34,18],
                  [2,26],[6,26],[14,26],[18,26],[22,26],[26,26],[30,26],[38,26],[46,26],[54,26],[58,26],[62,26],[66,26],
                  [2,30],[10,30],[18,30],[26,30],[34,30],[42,30],[50,30],[58,30],[66,30],
                  [2,34],[6,34],[14,34],[22,34],[30,34],[38,34],[46,34],[54,34],[62,34],
                  [2,38],[10,38],[18,38],[26,38],[34,38],[42,38],[50,38],[58,38],[66,38],
                  [2,42],[6,42],[10,42],[18,42],[26,42],[34,42],[42,42],[50,42],[54,42],[62,42],[66,42],
                  [26,48],[30,48],[38,48],[46,48],[54,48],[62,48],
                  [26,52],[34,52],[42,52],[50,52],[58,52],[66,52],
                  [26,56],[30,56],[38,56],[46,56],[54,56],
                  [26,60],[34,60],[42,60],[50,60],[58,60],[66,60],
                  [26,64],[30,64],[38,64],[46,64],[62,64],[66,64],
                ].map(([x, y], i) => (
                  <rect key={i} x={x} y={y} width="3" height="3" fill="#0f172a" />
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 w-full max-w-md">
          <button className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 text-white font-extrabold text-sm px-4 py-3.5 rounded-xl transition-colors cursor-pointer shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Ticket
          </button>
          <button
            onClick={onGoToMyBooking}
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-400 text-slate-700 font-extrabold text-sm px-4 py-3.5 rounded-xl transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
            </svg>
            Go to My Bookings
          </button>
        </div>

        {/* Help */}
        <p className="text-xs text-slate-400 mt-5">
          Need help?{' '}
          <button className="text-slate-700 underline font-semibold hover:text-slate-900 cursor-pointer">
            Contact Support
          </button>
        </p>

      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-white px-6 py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <h3 className="text-sm font-black mb-2">CADT Event</h3>
            <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-[200px]">
              The official hub for institutional events, fostering academic growth and industry networking.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-3">Quick Links</h4>
            <ul className="space-y-2">
              {['Upcoming Events', 'My Bookings', 'Favorites', 'Support Center'].map(link => (
                <li key={link}>
                  <button className="text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-3">Connect With Us</h4>
            <div className="flex gap-2 mb-4">
              <button className="w-10 h-10 rounded-xl border border-slate-700 hover:border-slate-500 flex items-center justify-center transition-colors cursor-pointer">
                <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
                </svg>
              </button>
              <button className="w-10 h-10 rounded-xl border border-slate-700 hover:border-slate-500 flex items-center justify-center transition-colors cursor-pointer">
                <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">© 2024 CADT Event Central. All rights reserved.</p>
          </div>

        </div>
      </footer>

    </div>
  );
}