/**
 * Admin detection for the student app.
 * Keep in sync with frontend-admin/src/lib/adminAccess.ts and backend ADMIN_EMAILS.
 *
 * Production (Option 1): student + admin share one origin (`/admin`).
 * One Clerk session — hard navigate to `/admin` keeps the cookie.
 * Local: dual ports — optional VITE_ADMIN_URL (default http://localhost:3000).
 */

const DEFAULT_ADMIN_EMAILS = [
  'yeakkhai.ly@student.cadt.edu.kh',
  'admin123@stuff.cadt.edu.kh',
];

function parseEmailList(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes('@'));
}

/** Merge env allowlist with safe defaults (env never fully replaces defaults). */
export function getAdminEmails(): string[] {
  const fromEnv = parseEmailList(import.meta.env.VITE_ADMIN_EMAILS as string | undefined);
  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase()), ...fromEnv]));
}

export function isAdminRoleValue(role: unknown): boolean {
  if (role == null) return false;
  // Handle accidental nested { role: "ADMIN" }
  let r: unknown = role;
  if (typeof role === 'object' && role !== null && 'role' in (role as object)) {
    r = (role as { role: unknown }).role;
  }
  const s = String(r).trim().toUpperCase().replace(/[\s-]+/g, '_');
  return s === 'ADMIN' || s === 'SUPER_ADMIN' || s === 'SUPERADMIN' || s === 'ADMINISTRATOR';
}

export function collectUserEmails(user: {
  primaryEmailAddress?: { emailAddress?: string | null } | null;
  emailAddresses?: Array<{ emailAddress?: string | null }> | null;
} | null | undefined): string[] {
  if (!user) return [];
  const set = new Set<string>();
  const primary = user.primaryEmailAddress?.emailAddress;
  if (primary) set.add(primary.trim().toLowerCase());
  for (const e of user.emailAddresses || []) {
    if (e?.emailAddress) set.add(e.emailAddress.trim().toLowerCase());
  }
  return Array.from(set);
}

export type AdminUserLike = {
  primaryEmailAddress?: { emailAddress?: string | null } | null;
  emailAddresses?: Array<{ emailAddress?: string | null }> | null;
  publicMetadata?: Record<string, unknown> | null;
  unsafeMetadata?: Record<string, unknown> | null;
} | null;

/**
 * True if role is admin OR any linked email is on the allowlist.
 * Checks all Clerk emails + common metadata keys.
 */
export function isAdminAccount(opts: {
  role?: string | null;
  email?: string | null;
  emails?: string[] | null;
  user?: AdminUserLike;
}): boolean {
  const meta = opts.user?.publicMetadata || {};
  const unsafe = opts.user?.unsafeMetadata || {};

  const roleCandidates = [
    opts.role,
    meta.role,
    meta.Role,
    meta.userRole,
    meta.admin_role,
    unsafe.role,
  ];
  if (roleCandidates.some(isAdminRoleValue)) return true;

  if (meta.isAdmin === true || meta.admin === true || unsafe.isAdmin === true) return true;

  const allow = getAdminEmails();
  const emails = new Set<string>();
  if (opts.email) emails.add(String(opts.email).trim().toLowerCase());
  for (const e of opts.emails || []) emails.add(String(e).trim().toLowerCase());
  for (const e of collectUserEmails(opts.user)) emails.add(e);

  for (const e of emails) {
    if (allow.includes(e)) return true;
  }
  return false;
}

/** Alias for parity with frontend-admin adminAccess.isAdminUser */
export const isAdminUser = isAdminAccount;

/**
 * Where to send admins after login on the student app.
 * - Production unified deploy: same-origin `/admin` (shared Clerk cookie).
 * - Local dual-port: VITE_ADMIN_URL or http://localhost:3000.
 */
export function getAdminPortalUrl(): string {
  if (import.meta.env.DEV) {
    const raw = (import.meta.env.VITE_ADMIN_URL as string | undefined)?.trim();
    if (raw) return raw.replace(/\/$/, '');
    return 'http://localhost:3000';
  }
  // Same-origin admin SPA (Option 1). Ignore legacy cross-domain VITE_ADMIN_URL.
  const raw = (import.meta.env.VITE_ADMIN_URL as string | undefined)?.trim();
  if (raw) {
    const url = raw.replace(/\/$/, '');
    // Relative path override (e.g. /admin)
    if (url.startsWith('/')) return url;
    // Same-host absolute still ok
    try {
      if (typeof window !== 'undefined') {
        const u = new URL(url, window.location.origin);
        if (u.origin === window.location.origin) {
          return `${u.pathname}${u.search}${u.hash}` || '/admin';
        }
      }
    } catch {
      /* fall through */
    }
  }
  return '/admin';
}
