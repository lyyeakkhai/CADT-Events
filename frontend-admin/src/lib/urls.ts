/**
 * Student-facing app origin (non-admin redirect target).
 * Production builds must set VITE_USER_FRONTEND_URL on Vercel.
 * Dev falls back to local Vite; prod falls back to known student host (never localhost).
 */
const fromEnv = (import.meta.env.VITE_USER_FRONTEND_URL as string | undefined)?.trim();

export const USER_FRONTEND_URL = (
  fromEnv ||
  (import.meta.env.DEV ? 'http://localhost:5173' : 'https://cadt-events.vercel.app')
).replace(/\/$/, '');
