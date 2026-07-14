import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { AcademicEvent } from '../../../features/events/data/eventData';
import hidetoheal from '../../../assets/images/hidetoheal.jpg';
import { useEventsApi, type ApiEventSeats } from '../../../services/api';
import { Loader2, RefreshCw } from 'lucide-react';

interface SeatSelectionProps {
  event: AcademicEvent;
  onBackClick: () => void;
  onRegisterClick: (event: AcademicEvent, seat: string, bookingId: string) => void;
}

type SeatStatus = 'available' | 'selected' | 'occupied';

interface Seat {
  id: string;
  status: SeatStatus;
  row: string;
  col: number;
}

/** Fixed auditorium layout (rows × cols). Occupancy is loaded live from the API. */
const ZONE_A_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const ZONE_B_ROWS = ['H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];
const ZONE_C_ROWS = ['R', 'S', 'T', 'U', 'V', 'W'];
const COLS = 11;

function generateZone(rows: string[], cols: number, occupiedSet: Set<string>): Seat[] {
  const seats: Seat[] = [];
  for (const row of rows) {
    for (let c = 1; c <= cols; c++) {
      const id = `${row}${c}`;
      seats.push({
        id,
        status: occupiedSet.has(id) ? 'occupied' : 'available',
        row,
        col: c,
      });
    }
  }
  return seats;
}

export default function SeatSelection({ event, onBackClick, onRegisterClick }: SeatSelectionProps) {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const { bookEvent, getEventSeats } = useEventsApi();
  const [submitting, setSubmitting] = useState(false);
  const [seatsLoading, setSeatsLoading] = useState(true);
  const [seatsError, setSeatsError] = useState<string | null>(null);
  const [seatMeta, setSeatMeta] = useState<ApiEventSeats | null>(null);
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);

  const apiId = (event as AcademicEvent & { _apiId?: string })._apiId;

  const seatsLeft =
    seatMeta?.availableSeats ??
    (event as AcademicEvent & { seatsLeft?: number; availableSeats?: number }).seatsLeft ??
    (event as AcademicEvent & { availableSeats?: number }).availableSeats;
  const isFull = seatsLeft != null && seatsLeft <= 0;
  const isPast =
    (event as AcademicEvent & { isPast?: boolean }).isPast === true ||
    new Date((event as AcademicEvent & { endTimestamp?: string }).endTimestamp || 0) < new Date();

  const loadSeats = useCallback(async () => {
    if (!apiId) {
      setSeatsLoading(false);
      setSeatsError('This event is not linked to the live booking system.');
      return;
    }
    setSeatsError(null);
    try {
      const data = await getEventSeats(apiId);
      const occupied = (data.occupiedSeats || []).map((s) => s.toUpperCase());
      setOccupiedSeats(occupied);
      setSeatMeta(data);
      // Clear selection if someone else just took it
      setSelectedSeat((prev) => (prev && occupied.includes(prev) ? null : prev));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load seats';
      setSeatsError(msg);
    } finally {
      setSeatsLoading(false);
    }
    // getEventSeats is recreated each render; intentionally omit to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiId]);

  useEffect(() => {
    let cancelled = false;
    setSeatsLoading(true);

    const run = async () => {
      if (!cancelled) await loadSeats();
    };
    run();

    // Refresh map periodically so two users don't pick the same seat
    const interval = setInterval(run, 12_000);
    const onFocus = () => {
      void run();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadSeats]);

  const occupiedSet = useMemo(
    () => new Set(occupiedSeats.map((s) => s.toUpperCase())),
    [occupiedSeats],
  );

  const zoneASeats = useMemo(
    () => generateZone(ZONE_A_ROWS, COLS, occupiedSet),
    [occupiedSet],
  );
  const zoneBSeats = useMemo(
    () => generateZone(ZONE_B_ROWS, COLS, occupiedSet),
    [occupiedSet],
  );
  const zoneCSeats = useMemo(
    () => generateZone(ZONE_C_ROWS, COLS, occupiedSet),
    [occupiedSet],
  );

  const handleRegister = async () => {
    if (!selectedSeat || isFull || isPast || !apiId) return;
    if (occupiedSet.has(selectedSeat)) {
      alert('That seat was just taken. Please pick another.');
      await loadSeats();
      return;
    }
    setSubmitting(true);
    try {
      // Always send seatLabel so occupancy is stored and shown to other users
      const booking = await bookEvent(apiId, selectedSeat);
      const bookingId = booking.bookingReferenceId;
      if (!bookingId || bookingId === 'MOCK-ID') {
        throw new Error('Booking failed — no ticket reference returned from server');
      }
      onRegisterClick(event, selectedSeat, bookingId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to book event';
      alert(msg);
      // Refresh map (seat may now be taken or capacity full)
      await loadSeats();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied' || isFull || isPast) return;
    setSelectedSeat((prev) => (prev === seat.id ? null : seat.id));
  };

  const getSeatStyle = (seat: Seat): string => {
    const base =
      'w-8 h-8 rounded-md border-2 transition-all duration-100 cursor-pointer flex items-center justify-center text-[9px] font-bold ';
    if (seat.status === 'occupied') {
      return base + 'bg-slate-700 border-slate-600 cursor-not-allowed text-slate-500';
    }
    if (selectedSeat === seat.id) {
      return base + 'bg-amber-400 border-amber-500 text-[#0b2c6a] shadow-md scale-105';
    }
    return base + 'bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-400';
  };

  const renderZone = (seats: Seat[], rows: string[]) => {
    return rows.map((row) => {
      const rowSeats = seats.filter((s) => s.row === row);
      return (
        <div key={row} className="flex items-center gap-1 mb-1">
          <span className="w-4 text-[9px] font-bold text-slate-400 shrink-0">{row}</span>
          {rowSeats.map((seat) => (
            <button
              key={seat.id}
              type="button"
              onClick={() => handleSeatClick(seat)}
              className={getSeatStyle(seat)}
              title={seat.status === 'occupied' ? `${seat.id} — Occupied` : `Seat ${seat.id}`}
              disabled={seat.status === 'occupied' || isFull || isPast}
              data-seat={seat.id}
              data-occupied={seat.status === 'occupied' ? 'true' : 'false'}
            />
          ))}
        </div>
      );
    });
  };

  const speakerImage = event.image || hidetoheal;
  const speakerName = event.speaker || 'CADT';
  const venueLabel =
    seatMeta?.venueName || event.venue || 'CADT Campus';

  return (
    <div className="w-full bg-slate-50 min-h-screen font-sans antialiased">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200/60 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs font-semibold text-slate-400">
          <button
            type="button"
            onClick={onBackClick}
            className="hover:text-blue-900 transition-colors cursor-pointer"
          >
            Events
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={onBackClick}
            className="hover:text-blue-900 transition-colors cursor-pointer truncate max-w-[180px]"
          >
            {event.title}
          </button>
          <span>/</span>
          <span className="text-slate-700 font-bold">Select Seats</span>
        </div>
      </div>

      {/* Step Progress Indicator */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-0 max-w-lg">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#0b2c6a] text-white flex items-center justify-center text-sm font-black shadow">
                1
              </div>
              <span className="text-[11px] font-bold text-[#0b2c6a] mt-1.5 whitespace-nowrap">
                1. Seat Selection
              </span>
            </div>
            <div className="flex-1 h-[2px] bg-slate-200 mx-3 mb-5" />
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full border-2 border-slate-300 bg-white text-slate-400 flex items-center justify-center text-sm font-black">
                2
              </div>
              <span className="text-[11px] font-bold text-slate-400 mt-1.5 whitespace-nowrap">
                2. Registration
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT: Seat Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-[#0b2c6a]">{venueLabel}</h2>
                <p className="text-xs font-medium text-slate-400 mt-0.5">
                  Live seat map — occupied seats come from real bookings.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSeatsLoading(true);
                  loadSeats();
                }}
                disabled={seatsLoading}
                className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-[#0b2c6a] px-2 py-1 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors disabled:opacity-50"
                title="Refresh seats"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${seatsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Live capacity strip */}
            <div className="flex flex-wrap items-center gap-3 mb-5 text-[11px] font-bold">
              {seatMeta?.capacity != null && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                  Capacity {seatMeta.capacity}
                </span>
              )}
              {seatsLeft != null && (
                <span
                  className={`px-2.5 py-1 rounded-lg ${
                    seatsLeft <= 0
                      ? 'bg-red-50 text-red-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {seatsLeft <= 0 ? 'Sold out' : `${seatsLeft} seats left`}
                </span>
              )}
              <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-500 border border-slate-100">
                {occupiedSeats.length} assigned seat{occupiedSeats.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 mb-7">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded bg-white border-2 border-slate-200" />
                <span className="text-[11px] font-bold text-slate-500 tracking-wider">AVAILABLE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded bg-amber-400 border-2 border-amber-500" />
                <span className="text-[11px] font-bold text-slate-500 tracking-wider">SELECTED</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded bg-slate-700 border-2 border-slate-600" />
                <span className="text-[11px] font-bold text-slate-500 tracking-wider">OCCUPIED</span>
              </div>
            </div>

            {seatsError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-xl">
                {seatsError}
              </div>
            )}

            {seatsLoading && !seatMeta ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-xs font-bold tracking-wider uppercase">Loading live seats…</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-8">
                  <div className="w-full max-w-md h-10 rounded-xl bg-slate-200/80 border border-slate-300/60 flex items-center justify-center">
                    <span className="text-[11px] font-black text-slate-400 tracking-[0.2em] uppercase">
                      Stage / Podium
                    </span>
                  </div>
                </div>

                <div className="mb-7">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-0.5 h-4 bg-[#0b2c6a] rounded-full" />
                    <span className="text-[11px] font-black text-slate-700 tracking-wider uppercase">
                      Zone A – Premium Front
                    </span>
                  </div>
                  <div className="overflow-x-auto pb-1">{renderZone(zoneASeats, ZONE_A_ROWS)}</div>
                </div>

                <div className="mb-7">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-0.5 h-4 bg-[#0b2c6a] rounded-full" />
                    <span className="text-[11px] font-black text-slate-700 tracking-wider uppercase">
                      Zone B – Main Floor
                    </span>
                  </div>
                  <div className="overflow-x-auto pb-1">{renderZone(zoneBSeats, ZONE_B_ROWS)}</div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-0.5 h-4 bg-[#0b2c6a] rounded-full" />
                    <span className="text-[11px] font-black text-slate-700 tracking-wider uppercase">
                      Zone C – Rear
                    </span>
                  </div>
                  <div className="overflow-x-auto pb-1">{renderZone(zoneCSeats, ZONE_C_ROWS)}</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="relative h-44 bg-gradient-to-br from-orange-300 via-amber-200 to-orange-100 overflow-hidden flex items-end justify-center">
              <img
                src={speakerImage}
                alt={speakerName}
                className="h-full w-auto object-cover object-top absolute bottom-0 right-0"
                style={{ maxWidth: '65%' }}
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm">
                <p className="text-sm font-black text-amber-600 leading-tight">{speakerName}</p>
                <p className="text-[10px] font-semibold text-slate-500">
                  {event.badge || 'Event'} @ CADT
                </p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <h3 className="text-sm font-black text-[#0b2c6a] leading-snug">{event.title}</h3>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs font-medium text-slate-500">
                  <span>Date: {event.date}</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs font-medium text-slate-500">
                  <span>Time: {event.time}</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs font-medium text-slate-500">
                  <span>{venueLabel}</span>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Selected Seat</span>
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                    selectedSeat
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {selectedSeat || 'None'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Price</span>
                <span className="text-sm font-black text-[#0b2c6a]">Complimentary</span>
              </div>

              <button
                type="button"
                onClick={handleRegister}
                disabled={!selectedSeat || submitting || isFull || isPast || !apiId || seatsLoading}
                className={`w-full py-3 rounded-xl text-sm font-extrabold tracking-wide flex items-center justify-center gap-2 transition-all duration-150 ${
                  selectedSeat && !submitting && !isFull && !isPast && apiId
                    ? 'bg-[#0b2c6a] hover:bg-[#082050] text-white shadow-sm hover:shadow active:scale-[0.98] cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : isPast ? (
                  'Event Completed'
                ) : isFull ? (
                  'Event Full'
                ) : (
                  'Register for Free'
                )}
                {selectedSeat && !submitting && !isFull && !isPast && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                )}
              </button>

              <p className="text-center text-[10px] font-medium text-slate-400">
                Your seat is reserved on the server when you confirm (not held locally).
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg
                className="w-3.5 h-3.5 text-blue-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 mb-0.5">Need assistance?</h4>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                Contact the CADT Registry Office for group bookings or special accommodations.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
