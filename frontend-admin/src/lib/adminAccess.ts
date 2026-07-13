/**
 * Demo / production admin gate for the UI.
 * Match backend ADMIN_EMAILS via VITE_ADMIN_EMAILS (comma-separated).
 * Fallback list keeps the primary demo teacher working without extra env.
 */
const DEFAULTS = ["yeakkhai.ly@student.cadt.edu.kh", "admin123@stuff.cadt.edu.kh"];

export function getAdminEmails(): string[] {
  const fromEnv = (import.meta.env.VITE_ADMIN_EMAILS as string | undefined)
    ?.split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  return DEFAULTS;
}

export function isAdminUser(opts: {
  role?: string | null;
  email?: string | null;
}): boolean {
  const r = (opts.role || "").toUpperCase();
  if (r === "ADMIN" || r === "SUPER_ADMIN") return true;
  const email = (opts.email || "").trim().toLowerCase();
  return !!email && getAdminEmails().includes(email);
}
