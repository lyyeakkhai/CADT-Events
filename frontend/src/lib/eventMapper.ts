import type { ApiEvent } from '../services/api';
import type { AcademicEvent } from '../features/events/data/eventData';

// Shared mapper: ApiEvent (live backend) -> UI AcademicEvent shape
// Computes seatsLeft from backend availableSeats / capacity when present.
// Keeps _apiId for booking calls. Carries status + timestamps for past/completed UI.
export function toAcademicEvent(e: ApiEvent): AcademicEvent & { _apiId: string } {
  const seatsLeft =
    e.availableSeats != null
      ? e.availableSeats
      : (e.capacity != null
          ? Math.max(0, e.capacity - (e._count?.bookings || 0))
          : undefined);

  const start = new Date(e.startTimestamp);
  const end = e.endTimestamp ? new Date(e.endTimestamp) : null;
  const isPast = end ? end < new Date() : start < new Date();

  return {
    id: e.id as any,
    title: e.title,
    speaker: e.speakers?.[0]?.speaker?.name ?? 'CADT',
    date: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    venue: e.venue?.name ?? 'TBA',
    dept: 'All',
    type: (e.eventType as AcademicEvent['type']) ?? 'Seminar',
    badge: e.eventType ?? 'Event',
    image: e.coverImageUrl ?? '',
    description: e.description,
    isFeatured: e.isFeatured,
    seatsLeft,
    _apiId: e.id,
    status: e.status,
    endTimestamp: e.endTimestamp,
    endDate: end
      ? end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : undefined,
    isPast,
  } as AcademicEvent & { _apiId: string };
}

// Optional reverse if needed later
export function fromAcademicEventForApi(event: AcademicEvent & { _apiId?: string }) {
  return {
    id: event._apiId || (event.id as any),
  };
}
