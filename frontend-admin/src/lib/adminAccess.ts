/**
 * Admin detection — keep in sync with student `adminRole.ts` and backend ADMIN_EMAILS.
 *
 * Sessions are per-origin: student login does not authenticate this app.
 * Only signed-in admins stay; signed-in students are sent to the student site.
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
  // Handle string, or accidental { role: "ADMIN" }
  let r: unknown = role;
  if (typeof role === 'object' && role !== null && 'role' in (role as object)) {
    r = (role as { role: unknown }).role;
  }
  const s = String(r).trim().toUpperCase().replace(/[\s-]+/g, '_');
  return (
    s === 'ADMIN' ||
    s === 'SUPER_ADMIN' ||
    s === 'SUPERADMIN' ||
    s === 'ADMINISTRATOR'
  );
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
export function isAdminUser(opts: {
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

  // Explicit boolean flags some teams set in Clerk
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
