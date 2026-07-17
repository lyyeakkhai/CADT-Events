import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { USER_FRONTEND_URL } from '../lib/urls';
import { collectUserEmails, getAdminEmails, isAdminUser } from '../lib/adminAccess';
import LoginView from '../views/LoginView';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Gate for the admin app (admin domain only).
 *
 * - Not signed in → on-domain LoginView (never bounce to student /login — that loops).
 * - Signed in + admin → children (dashboard).
 * - Signed in + student → explain, then redirect to student site.
 *
 * Waits for Clerk metadata (and one reload) before treating the user as non-admin.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [gateReady, setGateReady] = useState(false);
  const [debugNote, setDebugNote] = useState<string>('');
  const reloadedRef = useRef(false);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return isAdminUser({
      role: user.publicMetadata?.role as string | undefined,
      email: user.primaryEmailAddress?.emailAddress,
      emails: collectUserEmails(user),
      user,
    });
  }, [user]);

  // Same-origin `/` in production unified deploy; localhost in dual-port dev.
  const studentHome = USER_FRONTEND_URL || '/';

  // Settle Clerk metadata before redirecting "non-admins"
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      reloadedRef.current = false;
      setGateReady(true);
      setDebugNote('');
      return;
    }

    if (isAdmin) {
      setGateReady(true);
      setDebugNote('');
      return;
    }

    let cancelled = false;
    setGateReady(false);

    (async () => {
      // Reload once per sign-in so stale publicMetadata does not false-negative admin.
      if (!reloadedRef.current && user) {
        reloadedRef.current = true;
        setDebugNote('Refreshing Clerk profile…');
        try {
          await user.reload();
        } catch {
          /* ignore — still decide with current user */
        }
        await new Promise((r) => setTimeout(r, 700));
      }
      if (!cancelled) {
        setDebugNote('');
        setGateReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, isAdmin, user]);

  // Only redirect confirmed signed-in non-admins (give time to read debug)
  useEffect(() => {
    if (!gateReady || !isLoaded || !isSignedIn || isAdmin) return;
    const t = window.setTimeout(() => {
      window.location.replace(studentHome);
    }, 3500);
    return () => window.clearTimeout(t);
  }, [gateReady, isLoaded, isSignedIn, isAdmin, studentHome]);

  if (!isLoaded || (isSignedIn && !gateReady && !isAdmin)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">
            Checking admin access…
          </p>
          {debugNote ? (
            <p className="text-[11px] text-slate-400 font-medium">{debugNote}</p>
          ) : null}
        </div>
      </div>
    );
  }

  // Unauthenticated: stay on admin origin with branded SignIn (do NOT send to student login)
  if (!isSignedIn) {
    return <LoginView />;
  }

  if (!isAdmin) {
    const role = user?.publicMetadata?.role;
    const allEmails = collectUserEmails(user).join(', ') || '(none)';
    const allowlist = getAdminEmails().join(', ');
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-lg space-y-4">
          <h1 className="text-xl font-bold text-slate-900">Not an admin account</h1>
          <p className="text-sm text-slate-600">
            You signed in on the admin site, but this account is a student. Redirecting to the
            student portal in a few seconds…
          </p>
          <div className="text-left text-xs font-mono bg-white border border-slate-200 rounded-lg p-4 text-slate-700 space-y-1">
            <p>
              <span className="text-slate-400">Emails:</span> {allEmails}
            </p>
            <p>
              <span className="text-slate-400">Clerk publicMetadata.role:</span>{' '}
              {role != null ? JSON.stringify(role) : '(missing)'}
            </p>
            <p>
              <span className="text-slate-400">publicMetadata (full):</span>{' '}
              {JSON.stringify(user?.publicMetadata ?? {})}
            </p>
            <p>
              <span className="text-slate-400">Allowlist (build):</span> {allowlist}
            </p>
            <p className="pt-2 text-slate-500 normal-case font-sans text-xs leading-relaxed">
              <strong>If you should be an admin:</strong> Clerk Dashboard → Users → this user →
              Public metadata → set <code className="mx-1 bg-slate-100 px-1 rounded">role</code> to
              <code className="mx-1 bg-slate-100 px-1 rounded">&quot;ADMIN&quot;</code>
              (uppercase), or add your email to{' '}
              <code className="mx-1 bg-slate-100 px-1 rounded">VITE_ADMIN_EMAILS</code> on the web
              Vercel project and <code className="mx-1 bg-slate-100 px-1 rounded">ADMIN_EMAILS</code>{' '}
              on Render, then redeploy and open <code className="mx-1 bg-slate-100 px-1 rounded">/admin</code>.
            </p>
          </div>
          <a
            href={studentHome}
            className="inline-block text-sm font-semibold text-[#0b2c6a] underline"
          >
            Go to student site now
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
