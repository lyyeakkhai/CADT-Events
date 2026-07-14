/**
 * Admin gate for the admin UI — keep in sync with student `adminRole.ts` and backend ADMIN_EMAILS.
 *
 * Someone is admin if:
 * 1) Clerk publicMetadata.role is ADMIN | SUPER_ADMIN (any casing), OR
 * 2) Any of their Clerk emails is in the allowlist
 *
 * Allowlist = VITE_ADMIN_EMAILS (comma-separated) UNION built-in demo defaults
 * (so a partial/wrong VITE_ADMIN_EMAILS list does not lock out known admins).
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

/** Collect every email Clerk exposes for this user. */
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

export function isAdminUser(opts: {
  role?: string | null;
  email?: string | null;
  emails?: string[] | null;
  user?: {
    primaryEmailAddress?: { emailAddress?: string | null } | null;
    emailAddresses?: Array<{ emailAddress?: string | null }> | null;
    publicMetadata?: Record<string, unknown> | null;
  } | null;
}): boolean {
  // Role from opts or from user.publicMetadata
  const roleRaw =
    opts.role ??
    (opts.user?.publicMetadata?.role as string | undefined) ??
    (opts.user?.publicMetadata as { role?: string } | undefined)?.role;
  if (isAdminRoleValue(roleRaw)) return true;

  const allow = getAdminEmails();
  const emails = new Set<string>();
  if (opts.email) emails.add(opts.email.trim().toLowerCase());
  for (const e of opts.emails || []) emails.add(e.trim().toLowerCase());
  for (const e of collectUserEmails(opts.user)) emails.add(e);

  for (const e of emails) {
    if (allow.includes(e)) return true;
  }
  return false;
}
