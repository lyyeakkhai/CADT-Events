/** Student-facing app origin (login / post-sign-out). Override on deploy. */
export const USER_FRONTEND_URL = (
  (import.meta.env.VITE_USER_FRONTEND_URL as string | undefined) ||
  'http://localhost:5173'
).replace(/\/$/, '');
