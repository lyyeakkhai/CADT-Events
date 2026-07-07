import React, { useState, useMemo } from 'react';
import type { AcademicEvent } from '../../../features/events/data/eventData';
import hidetoheal from '../../../assets/images/hidetoheal.jpg';
import { useEventsApi } from '../../../services/api';
import { Loader2 } from 'lucide-react';

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

const ZONE_A_OCCUPIED: string[] = [
  'A3','A4','A9','A10','A11',
  'B1','B9','B10',
  'C5','C6',
  'D3','D4','D9',
  'E1','E9','E10','E11',
  'F3','F4',
  'G8',
];

const ZONE_B_OCCUPIED: string[] = [
  'H1','H2','H7','H8','H9',
  'J1','J2','J7',
  'K1','K2','K5','K6',
  'L5','L6','L9','L10','L11',
  'M1','M2','M7','M8','M9',
  'N1','N2',
  'O1','O2','O8',
  'P5','P6',
  'Q9','Q10','Q11',
];

const ZONE_C_OCCUPIED: string[] = [
  'R4','R5','R11',
  'S1','S2',
  'T1','T2','T5','T6',
  'U4','U5','U11',
  'V1','V2',
  'W1','W2','W5',
];

function generateZone(
  rows: string[],
  cols: number,
  occupiedList: string[]
): Seat[] {
  const seats: Seat[] = [];
  const occupiedSet = new Set(occupiedList);
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

const ZONE_A_ROWS = ['A','B','C','D','E','F','G'];
const ZONE_B_ROWS = ['H','I','J','K','L','M','N','O','P','Q'];
const ZONE_C_ROWS = ['R','S','T','U','V','W'];
const COLS = 11;

export default function SeatSelection({ event, onBackClick, onRegisterClick }: SeatSelectionProps) {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const { bookEvent } = useEventsApi();
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!selectedSeat) return;
    setSubmitting(true);
    try {
      let bookingId = 'MOCK-ID';
      if (event._apiId) {
        const booking = await bookEvent(event._apiId);
        bookingId = booking.bookingReferenceId;
      }
      onRegisterClick(event, selectedSeat, bookingId);
    } catch (err: any) {
      alert(err.message || 'Failed to book event');
    } finally {
      setSubmitting(false);
    }
  };

  const zoneASeats = useMemo(() => generateZone(ZONE_A_ROWS, COLS, ZONE_A_OCCUPIED), []);
  const zoneBSeats = useMemo(() => generateZone(ZONE_B_ROWS, COLS, ZONE_B_OCCUPIED), []);
  const zoneCSeats = useMemo(() => generateZone(ZONE_C_ROWS, COLS, ZONE_C_OCCUPIED), []);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied') return;
    setSelectedSeat(prev => prev === seat.id ? null : seat.id);
  };

  const getSeatStyle = (seat: Seat): string => {
    const base = 'w-8 h-8 rounded-md border-2 transition-all duration-100 cursor-pointer flex items-center justify-center text-[9px] font-bold ';
    if (seat.status === 'occupied') {
      return base + 'bg-slate-700 border-slate-600 cursor-not-allowed text-slate-500';
    }
    if (selectedSeat === seat.id) {
      return base + 'bg-amber-400 border-amber-500 text-slate-900 shadow-md scale-105';
    }
    return base + 'bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-300';
  };

  const renderZone = (seats: Seat[], rows: string[]) => {
    return rows.map(row => {
      const rowSeats = seats.filter(s => s.row === row);
      return (
        <div key={row} className="flex items-center gap-1 mb-1">
          {rowSeats.map(seat => (
            <button
              key={seat.id}
              onClick={() => handleSeatClick(seat)}
              className={getSeatStyle(seat)}
              title={seat.status === 'occupied' ? 'Occupied' : `Seat ${seat.id}`}
              disabled={seat.status === 'occupied'}
            />
          ))}
        </div>
      );
    });
  };

  const speakerImage = event.image || hidetoheal;
  const speakerName = event.speaker || 'Ms. Sotheary Yim';

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
          <span className="text-slate-700 font-bold">Select Seats</span>
        </div>
      </div>

      {/* Step Progress Indicator */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-0 max-w-lg">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-black shadow">
                1
              </div>
              <span className="text-[11px] font-bold text-slate-900 mt-1.5 whitespace-nowrap">1. Seat Selection</span>
            </div>
            <div className="flex-1 h-[2px] bg-slate-200 mx-3 mb-5" />
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full border-2 border-slate-300 bg-white text-slate-400 flex items-center justify-center text-sm font-black">
                2
              </div>
              <span className="text-[11px] font-bold text-slate-400 mt-1.5 whitespace-nowrap">2. Registration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* LEFT: Seat Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

            <div className="mb-5">
              <h2 className="text-sm font-black text-slate-900">Grand Auditorium, Building C</h2>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Click on an available seat to reserve it for the summit.
              </p>
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

            {/* Stage */}
            <div className="flex justify-center mb-8">
              <div className="w-full max-w-md h-10 rounded-xl bg-slate-200/80 border border-slate-300/60 flex items-center justify-center">
                <span className="text-[11px] font-black text-slate-400 tracking-[0.2em] uppercase">Stage / Podium</span>
              </div>
            </div>

            {/* ZONE A */}
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-0.5 h-4 bg-slate-900 rounded-full" />
                <span className="text-[11px] font-black text-slate-700 tracking-wider uppercase">Zone A – Premium Front</span>
              </div>
              <div className="overflow-x-auto pb-1">
                {renderZone(zoneASeats, ZONE_A_ROWS)}
              </div>
            </div>

            {/* ZONE B */}
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-0.5 h-4 bg-slate-900 rounded-full" />
                <span className="text-[11px] font-black text-slate-700 tracking-wider uppercase">Zone B – Main Floor</span>
              </div>
              <div className="overflow-x-auto pb-1">
                {renderZone(zoneBSeats, ZONE_B_ROWS)}
              </div>
            </div>

            {/* ZONE C */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-0.5 h-4 bg-slate-900 rounded-full" />
                <span className="text-[11px] font-black text-slate-700 tracking-wider uppercase">Zone C – Rear</span>
              </div>
              <div className="overflow-x-auto pb-1">
                {renderZone(zoneCSeats, ZONE_C_ROWS)}
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-24">

          {/* Speaker + Event Card */}
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
                <p className="text-[10px] font-semibold text-slate-500">the founder of Sneha</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <h3 className="text-sm font-black text-slate-900 leading-snug">{event.title}</h3>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs font-medium text-slate-500">
                  <svg className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>Date: Wednesday, June 3rd, 2026</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs font-medium text-slate-500">
                  <svg className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>Time: 8:30 a.m. – 11:00 a.m.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs font-medium text-slate-500">
                  <svg className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>Grand Auditorium, Building C</span>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Selected Seat</span>
                <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${selectedSeat ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-400'}`}>
                  {selectedSeat || 'None'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Price</span>
                <span className="text-sm font-black text-slate-900">Complimentary</span>
              </div>

              <button
                onClick={handleRegister}
                disabled={!selectedSeat || submitting}
                className={`w-full py-3 rounded-xl text-sm font-extrabold tracking-wide flex items-center justify-center gap-2 transition-all duration-150 ${
                  selectedSeat && !submitting
                    ? 'bg-slate-900 hover:bg-blue-900 text-white shadow-sm hover:shadow active:scale-[0.98] cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Register for Free'}
                {selectedSeat && !submitting && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                )}
              </button>

              <p className="text-center text-[10px] font-medium text-slate-400">
                Seats are held for 10 minutes once selected.
              </p>
            </div>
          </div>

          {/* Assistance Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
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