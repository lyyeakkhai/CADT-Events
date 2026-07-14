/**
 * Admin detection for the student app — keep in sync with frontend-admin adminAccess.ts
 */

const DEFAULT_ADMIN_EMAILS = [
  'yeakkhai.ly@student.cadt.edu.kh',
  'admin123@stuff.cadt.edu.kh',
];

function parseEmailList(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminEmails(): string[] {
  const fromEnv = parseEmailList(import.meta.env.VITE_ADMIN_EMAILS as string | undefined);
  const merged = new Set<string>([...DEFAULT_ADMIN_EMAILS, ...fromEnv]);
  return Array.from(merged);
}

export function isAdminRoleValue(role: unknown): boolean {
  if (role == null) return false;
  const r = String(role).trim().toUpperCase();
  return r === 'ADMIN' || r === 'SUPER_ADMIN' || r === 'ADMINISTRATOR';
}

export function isAdminAccount(opts: {
  role?: string | null;
  email?: string | null;
  emails?: string[] | null;
}): boolean {
  if (isAdminRoleValue(opts.role)) return true;
  const allow = getAdminEmails();
  const candidates = [
    opts.email,
    ...(opts.emails || []),
  ]
    .filter(Boolean)
    .map((e) => String(e).trim().toLowerCase());
  return candidates.some((e) => allow.includes(e));
}

export function getAdminPortalUrl(): string | null {
  const raw = (import.meta.env.VITE_ADMIN_URL as string | undefined)?.trim();
  if (!raw) return null;
  const url = raw.replace(/\/$/, '');
  if (/localhost|127\.0\.0\.1/i.test(url)) return null;
  return url;
}
