/**
 * Admin allowlist from env.
 * ADMIN_EMAILS=teacher@cadt.edu.kh,yeakkhai.ly@student.cadt.edu.kh
 *
 * Comma-separated, case-insensitive. Used by Clerk webhook + requireRole fallback.
 * Env list is MERGED with defaults (partial env never drops built-in demo admins).
 */
const DEFAULT_ADMIN_EMAILS = [
  "yeakkhai.ly@student.cadt.edu.kh",
  "admin123@stuff.cadt.edu.kh",
];

export function getAdminEmails(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS || "")
    .split(/[,;\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes("@"));

  return Array.from(
    new Set([...DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase()), ...fromEnv]),
  );
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

/** True if any of the given emails is on the allowlist. */
export function isAnyAdminEmail(emails: Array<string | null | undefined>): boolean {
  return emails.some((e) => isAdminEmail(e));
}
