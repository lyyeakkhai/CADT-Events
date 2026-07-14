// Central API client for the user frontend.
// Reads VITE_API_URL from env. Production builds must set it on Vercel.
// All requests to auth-protected routes pass the Clerk JWT automatically.
import { useAuth } from '@clerk/clerk-react';

function resolveApiBase(): string {
  const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (raw) return raw.replace(/\/$/, '');
  if (import.meta.env.DEV) return 'http://localhost:4000/api';
  return 'https://cadt-events.onrender.com/api';
}

const API_BASE = resolveApiBase();

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
  capacity?: number | null;
  availableSeats?: number | null;
  venue: { name: string; address: string | null } | null;
  // Note: speakers/categories not yet modeled on Event; converters fall back gracefully
  categories?: { category: { name: string; color: string | null } }[];
  speakers?: { speaker: { name: string; titleRole: string | null; profileImageUrl: string | null } }[];
  _count: { bookings: number };
}

export interface ApiBooking {
  id: string;
  bookingReferenceId: string;
  status: string;
  qrCodeToken: string;
  seatLabel?: string | null;
  checkedInAt?: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
    startTimestamp: string;
    endTimestamp: string;
    coverImageUrl: string | null;
    eventType: string | null;
    status: string;
    creditValue?: number;
    venue: { name: string; address: string | null } | null;
  };
}

export interface ApiEventSeats {
  occupiedSeats: string[];
  totalBookings: number;
  capacity: number | null;
  availableSeats: number | null;
  venueName: string | null;
}

export interface TelegramConnectData {
  botUsername: string;
  deepLink: string | null;
  instructions?: string;
  message?: string;
}

// ── Helper: bare fetch (public routes) ───────────────────────────────────────
async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  const json = await res.json();
  if (!res.ok) {
    const msg = json?.error || json?.message || `API error ${res.status}`;
    throw new Error(msg);
  }
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
  if (!res.ok) {
    const msg = json?.error || json?.message || `API error ${res.status}`;
    throw new Error(msg);
  }
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

  async function bookEvent(eventId: string, seatLabel?: string): Promise<ApiBooking> {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    const body: { eventId: string; seatLabel?: string } = { eventId };
    if (seatLabel) body.seatLabel = seatLabel;
    const res = await authFetch<{ success: boolean; data: ApiBooking }>(
      '/bookings',
      token,
      { method: 'POST', body: JSON.stringify(body) }
    );
    return res.data;
  }

  /** Live occupied seats + capacity for the seat map (not static mock data). */
  async function getEventSeats(eventId: string): Promise<ApiEventSeats> {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    const res = await authFetch<{ success: boolean; data: ApiEventSeats }>(
      `/events/${eventId}/seats`,
      token,
      { cache: 'no-store' },
    );
    return res.data;
  }

  async function getMyBookings(): Promise<ApiBooking[]> {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    const res = await authFetch<{ success: boolean; data: ApiBooking[] }>('/bookings/me', token, { cache: 'no-store' });
    return res.data;
  }

  async function cancelBooking(bookingId: string): Promise<void> {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    await authFetch(`/bookings/${bookingId}`, token, { method: 'DELETE' });
  }

  return { bookEvent, getEventSeats, getMyBookings, cancelBooking };
}

// ── Telegram (authenticated) ────────────────────────────────────────────────
export function useTelegramApi() {
  const { getToken } = useAuth();

  async function getConnectLink(): Promise<TelegramConnectData> {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    const res = await authFetch<{ success: boolean; data: TelegramConnectData }>('/telegram/connect', token);
    return res.data;
  }

  return { getConnectLink };
}

// ── Notifications (authenticated) ───────────────────────────────────────────
export interface ApiNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  event: { id: string; title: string } | null;
}

export function useNotificationsApi() {
  const { getToken } = useAuth();

  async function getMyNotifications(): Promise<ApiNotification[]> {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    const res = await authFetch<{ success: boolean; data: ApiNotification[] }>('/notifications/me', token);
    return res.data;
  }

  async function markAsRead(notificationId: string): Promise<void> {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    await authFetch(`/notifications/${notificationId}/read`, token, { method: 'PATCH' });
  }

  return { getMyNotifications, markAsRead };
}

// ── Favorites (authenticated) ───────────────────────────────────────────────
export interface ApiFavorite {
  favoriteId: string;
  userId: string;
  eventId: string;
  createdAt: string;
  event: ApiEvent;
}

export function useFavoritesApi() {
  const { getToken } = useAuth();

  async function getMyFavorites(): Promise<ApiFavorite[]> {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    const res = await authFetch<{ success: boolean; data: ApiFavorite[] }>('/favorites/me', token);
    return res.data;
  }

  async function toggleFavorite(eventId: string): Promise<{ action: 'added' | 'removed' }> {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    const res = await authFetch<{ success: boolean; data: { action: 'added' | 'removed' } }>(
      '/favorites/toggle',
      token,
      { method: 'POST', body: JSON.stringify({ eventId }) }
    );
    return res.data;
  }

  return { getMyFavorites, toggleFavorite };
}
