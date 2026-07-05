// Central API client for the user frontend.
// Reads VITE_API_URL from env (defaults to localhost:5000).
// All requests to auth-protected routes pass the Clerk JWT automatically.
import { useAuth } from '@clerk/clerk-react';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

// ── Types ────────────────────────────────────────────────────────────────────
export interface ApiEvent {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string | null;
  startTimestamp: string;
  endTimestamp: string;
  eventType: string | null;
  isFeatured: boolean;
  creditValue: number;
  status: string;
  venue: { name: string; address: string | null } | null;
  categories: { category: { name: string; color: string | null } }[];
  speakers: { speaker: { name: string; titleRole: string | null; profileImageUrl: string | null } }[];
  _count: { bookings: number };
}

export interface ApiBooking {
  id: string;
  bookingReferenceId: string;
  status: string;
  qrCodeToken: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    startTimestamp: string;
    endTimestamp: string;
    coverImageUrl: string | null;
    eventType: string | null;
    status: string;
    venue: { name: string; address: string | null } | null;
  };
}

// ── Helper: bare fetch (public routes) ───────────────────────────────────────
async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? `API error ${res.status}`);
  return json as T;
}

// ── Helper: authenticated fetch (pass Clerk JWT) ─────────────────────────────
async function authFetch<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? `API error ${res.status}`);
  return json as T;
}

// ── Public API ───────────────────────────────────────────────────────────────
export function getEvents(params?: { search?: string; featured?: boolean }) {
  const q = new URLSearchParams();
  if (params?.search) q.set('search', params.search);
  if (params?.featured) q.set('featured', 'true');
  const qs = q.toString();
  return publicFetch<{ success: boolean; data: ApiEvent[] }>(`/events${qs ? `?${qs}` : ''}`);
}

export function getEvent(id: string) {
  return publicFetch<{ success: boolean; data: ApiEvent }>(`/events/${id}`);
}

// ── Auth hooks (use inside React components) ──────────────────────────────────
export function useEventsApi() {
  const { getToken } = useAuth();

  async function bookEvent(eventId: string): Promise<ApiBooking> {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    const res = await authFetch<{ success: boolean; data: ApiBooking }>(
      '/bookings',
      token,
      { method: 'POST', body: JSON.stringify({ eventId }) }
    );
    return res.data;
  }

  async function getMyBookings(): Promise<ApiBooking[]> {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    const res = await authFetch<{ success: boolean; data: ApiBooking[] }>('/bookings/me', token);
    return res.data;
  }

  async function cancelBooking(bookingId: string): Promise<void> {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    await authFetch(`/bookings/${bookingId}`, token, { method: 'DELETE' });
  }

  return { bookEvent, getMyBookings, cancelBooking };
}
