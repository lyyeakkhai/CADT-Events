/**
 * Admin detection for the student app — aligned with backend / admin portal.
 * Role ADMIN|SUPER_ADMIN in Clerk publicMetadata, or email in VITE_ADMIN_EMAILS.
 */
export function getAdminEmails(): string[] {
  const fromEnv = (import.meta.env.VITE_ADMIN_EMAILS as string | undefined)
    ?.split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  // Same demo defaults as frontend-admin (optional fallback)
  return ['yeakkhai.ly@student.cadt.edu.kh', 'admin123@stuff.cadt.edu.kh'];
}

export function isAdminAccount(opts: {
  role?: string | null;
  email?: string | null;
}): boolean {
  const r = String(opts.role || '').toUpperCase();
  if (r === 'ADMIN' || r === 'SUPER_ADMIN') return true;
  const email = (opts.email || '').trim().toLowerCase();
  return !!email && getAdminEmails().includes(email);
}

export function getAdminPortalUrl(): string | null {
  const raw = (import.meta.env.VITE_ADMIN_URL as string | undefined)?.trim();
  if (!raw) return null;
  const url = raw.replace(/\/$/, '');
  if (/localhost|127\.0\.0\.1/i.test(url)) return null;
  return url;
}
