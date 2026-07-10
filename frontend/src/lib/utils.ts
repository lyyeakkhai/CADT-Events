import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date helpers for dynamic event status
export function isEventPast(event: { endTimestamp?: string; date?: string } | null | undefined): boolean {
  if (!event) return false;
  const ts = (event as any).endTimestamp;
  if (ts) {
    return new Date(ts) < new Date();
  }
  // Fallback using formatted date string (less reliable)
  if (event.date) {
    // crude: treat as end-of-day local
    const d = new Date(event.date);
    d.setHours(23, 59, 59, 999);
    return d < new Date();
  }
  return false;
}

export function getEventStatusLabel(event: any): string {
  if (!event) return '';
  if (event.status === 'COMPLETED' || event.status === 'completed') return 'Completed';
  if (isEventPast(event)) return 'Completed';
  if (event.status === 'ONGOING' || event.status === 'ongoing') return 'Ongoing';
  if (event.status === 'CANCELLED' || event.status === 'cancelled') return 'Cancelled';
  return 'Upcoming';
}
