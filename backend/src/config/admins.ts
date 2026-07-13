/**
 * Admin allowlist from env.
 * ADMIN_EMAILS=teacher@cadt.edu.kh,yeakkhai.ly@student.cadt.edu.kh
 *
 * Comma-separated, case-insensitive. Used by Clerk webhook + requireRole fallback.
 */
const DEFAULT_ADMIN_EMAILS = [
  "yeakkhai.ly@student.cadt.edu.kh",
  "admin123@stuff.cadt.edu.kh",
];

export function getAdminEmails(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (fromEnv.length > 0) return fromEnv;
  return DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase());
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}
