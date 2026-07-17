/**
 * Student portal URL for "leave admin" links and non-admin redirects.
 *
 * - Production unified deploy: same origin → `/` (shared Clerk cookie)
 * - Local dual-port: http://localhost:5173 (or VITE_USER_FRONTEND_URL)
 */

const fromEnv = (import.meta.env.VITE_USER_FRONTEND_URL as string | undefined)?.trim();

function resolveStudentUrl(): string {
  if (import.meta.env.DEV) {
    return (fromEnv || 'http://localhost:5173').replace(/\/$/, '');
  }
  // Production: prefer same-origin student home
  if (!fromEnv) return '/';
  const url = fromEnv.replace(/\/$/, '');
  if (url.startsWith('/')) return url || '/';
  // Relative override already handled; absolute only if not a second vercel.app host
  if (/^https?:\/\//i.test(url) && !/vercel\.app/i.test(url) && !/localhost|127\.0\.0\.1/i.test(url)) {
    return url;
  }
  return '/';
}

export const USER_FRONTEND_URL = resolveStudentUrl();

/** True when admin is built with base `/admin/`. */
export const isSameOriginDeploy =
  import.meta.env.BASE_URL === '/admin/' || String(import.meta.env.BASE_URL).startsWith('/admin');
