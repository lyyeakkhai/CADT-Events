import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import drone from '../../../assets/images/drone.jpg';
import { useEventsApi, type ApiBooking } from '../../../services/api';
import { useUser } from '@clerk/clerk-react';

export default function MyBooking() {
  const { getMyBookings, cancelBooking } = useEventsApi();
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getMyBookings()
      .then(res => {
        if (active) setBookings(res);
      })
      .catch(console.error)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(id);
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
    } catch (err: any) {
      alert(err.message || 'Failed to cancel');
    }
  };

  const now = new Date();
  const isUpcoming = (b: ApiBooking) => new Date(b.event.endTimestamp || b.event.startTimestamp) >= now;

  const upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED' && isUpcoming(b));
  const pastBookings = bookings.filter(b => !isUpcoming(b) || b.status !== 'CONFIRMED');

  const attendedBookings = bookings.filter(b => b.checkedInAt != null);
  const eventsAttended = attendedBookings.length;
  const creditsEarned = attendedBookings.reduce((sum, b) => sum + (b.event.creditValue || 0), 0);

  if (loading) {
    return (
      <div className="w-full bg-[#f8fafc] min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <main className="w-full bg-[#f8fafc] min-h-screen font-sans antialiased selection:bg-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* =======================================================================
            LEFT COLUMN: NEXT EVENT + PAST BOOKINGS
           ======================================================================= */}
        <div className="space-y-6">

          {/* Next Event Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Next Event</h2>
            <span className="bg-amber-400 text-slate-950 text-[11px] font-black tracking-wider uppercase px-3 py-1.5 rounded-lg shadow-xs select-none">
              Confirmed
            </span>
          </div>

          {/* Next Event Card */}
          {upcomingBookings[0] ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="flex flex-col md:flex-row">

              {/* Hero Image */}
              <div className="relative w-full md:w-[420px] h-[260px] md:h-auto shrink-0 bg-slate-900">
                <img
                  src={upcomingBookings[0].event.coverImageUrl || drone}
                  alt={upcomingBookings[0].event.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity"
                  onError={(e: any) => { e.target.src = drone; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                <div className="relative z-10 h-full flex flex-col justify-end p-6">
                  <span className="text-[11px] font-black tracking-widest uppercase text-white/80 mb-1">
                    Confirmed
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {upcomingBookings[0].event.title}
                  </h3>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 p-6 flex flex-col gap-5">

                <div className="grid grid-cols-2 gap-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-0.5">Date</p>
                      <p className="text-sm font-extrabold text-slate-900">
                        {new Date(upcomingBookings[0].event.startTimestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-0.5">Time</p>
                      <p className="text-sm font-extrabold text-slate-900">
                        {new Date(upcomingBookings[0].event.startTimestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-0.5">Venue</p>
                      <p className="text-sm font-extrabold text-slate-900 line-clamp-1">{upcomingBookings[0].event.venue?.name || 'TBA'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5h-9v9h9v-9Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h18M3 16.5h18M7.5 3v18M16.5 3v18" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-0.5">Booking ID</p>
                      <p className="text-sm font-extrabold text-slate-900">{upcomingBookings[0].bookingReferenceId}</p>
                    </div>
                  </div>
                </div>

                {/* Reminder Note */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5">
                  <p className="text-sm italic text-slate-500 leading-relaxed">
                    "Please remember to bring your digital QR code and institutional ID for fast-track entry."
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 mt-auto">
                  <button className="inline-flex items-center gap-2 bg-slate-950 hover:bg-blue-900 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-sm hover:shadow transition-all duration-150 cursor-pointer active:scale-[0.98]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    Modify Booking
                  </button>
                  <button onClick={() => handleCancel(upcomingBookings[0].id)} className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 font-extrabold text-xs px-5 py-3 rounded-xl transition-colors cursor-pointer">
                    Cancel
                  </button>
                </div>

              </div>
            </div>
          </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
              No upcoming confirmed events.
            </div>
          )}

          {/* Past Bookings */}
          <div className="flex items-center justify-between pt-2">
            <h2 className="text-lg font-black text-slate-900">Past Bookings</h2>
            <button className="text-xs font-extrabold text-blue-900 hover:underline cursor-pointer">
              View All
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs divide-y divide-slate-100 overflow-hidden">
            {pastBookings.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-500">No past or cancelled bookings found.</div>
            )}
            {pastBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-900">
                  <img src={booking.event.coverImageUrl || drone} alt={booking.event.title} className="w-full h-full object-cover opacity-80" onError={(e:any) => e.target.src = drone} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-slate-900 truncate">{booking.event.title}</p>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    {new Date(booking.event.startTimestamp).toLocaleDateString()} &bull; {booking.event.venue?.name || 'TBA'}
                  </p>
                </div>

                <span className="bg-slate-100 text-slate-600 text-[11px] font-extrabold px-3 py-1.5 rounded-lg whitespace-nowrap">
                  {booking.status}
                </span>

                <button className="text-slate-400 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer" aria-label="Download Receipt">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5 7.5 12M12 3v13.5" />
                  </svg>
                </button>

                <button className="text-slate-400 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer" aria-label="View Details">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* =======================================================================
            RIGHT COLUMN: ACTIVITY SUMMARY + QUICK LINKS
           ======================================================================= */}
        <aside className="space-y-6">

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-3">
            <h3 className="text-sm font-black text-slate-900 mb-1">Your Activity</h3>

            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 13.5 1.5 1.5 3-3.5" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Events Attended</p>
                <p className="text-lg font-black text-slate-900">{eventsAttended}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3M3.75 18h16.5a1.5 1.5 0 0 0 1.5-1.5V7.5a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 7.5v9a1.5 1.5 0 0 0 1.5 1.5Z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Credits Earned</p>
                <p className="text-lg font-black text-slate-900">{creditsEarned.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Reviews Left</p>
                <p className="text-lg font-black text-slate-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
            <h3 className="text-sm font-black text-slate-900 mb-3">Quick Links</h3>
            <ul className="space-y-1 text-sm font-bold text-slate-600">
              {[
                { label: 'Request Transcript', icon: 'external' },
                { label: 'Certification Wallet', icon: 'external' },
                { label: 'Billing History', icon: 'external' },
                { label: 'Download All Receipts', icon: 'download' },
              ].map((link) => (
                <li key={link.label}>
                  <button className="w-full flex items-center justify-between py-2.5 hover:text-blue-900 transition-colors cursor-pointer">
                    <span>{link.label}</span>
                    {link.icon === 'external' ? (
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5 7.5 12M12 3v13.5" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            {useUser().user?.publicMetadata?.telegram_chat_id ? (
              <div className="mt-3 w-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg py-2 flex items-center justify-center gap-2 cursor-default">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                Telegram Connected
              </div>
            ) : (
              <button
                onClick={() => { localStorage.removeItem('telegramPromptDismissed'); window.location.reload(); }}
                className="mt-3 w-full text-xs font-bold text-[#0b2c6a] border border-[#0b2c6a]/30 rounded-lg py-2 hover:bg-[#0b2c6a]/5 transition-colors cursor-pointer"
              >
                Connect Telegram for notifications →
              </button>
            )}
          </div>

        </aside>

      </div>
    </main>
  );
}