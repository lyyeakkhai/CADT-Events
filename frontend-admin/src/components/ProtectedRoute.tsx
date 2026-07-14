import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { USER_FRONTEND_URL } from '../lib/urls';
import { getAdminEmails, isAdminUser } from '../lib/adminAccess';
import LoginView from '../views/LoginView';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Same login UI as student. Admin stays; non-admin goes to student site.
 * Waits briefly for Clerk metadata before deciding (avoids false "not admin").
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [gateReady, setGateReady] = useState(false);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return isAdminUser({
      role: user.publicMetadata?.role as string | undefined,
      email: user.primaryEmailAddress?.emailAddress,
      user,
    });
  }, [user]);

  const studentHome = (USER_FRONTEND_URL || 'https://cadt-events.vercel.app').replace(
    /\/$/,
    '',
  );

  // Give Clerk a moment to settle metadata before redirecting "non-admins"
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setGateReady(true);
      return;
    }
    if (isAdmin) {
      setGateReady(true);
      return;
    }
    const t = window.setTimeout(() => setGateReady(true), 800);
    return () => window.clearTimeout(t);
  }, [isLoaded, isSignedIn, isAdmin]);

  useEffect(() => {
    if (!gateReady || !isLoaded || !isSignedIn || isAdmin) return;
    const t = window.setTimeout(() => {
      window.location.replace(studentHome);
    }, 2500); // time to read debug info
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
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <LoginView />;
  }

  if (!isAdmin) {
    const role = user?.publicMetadata?.role;
    const email = user?.primaryEmailAddress?.emailAddress;
    const allEmails =
      user?.emailAddresses?.map((e) => e.emailAddress).filter(Boolean).join(', ') || email;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-lg space-y-4">
          <h1 className="text-xl font-bold text-slate-900">Not an admin account</h1>
          <p className="text-sm text-slate-600">
            You signed in, but this app only allows teachers/admins. Redirecting to the student
            portal in a few seconds…
          </p>
          <div className="text-left text-xs font-mono bg-white border border-slate-200 rounded-lg p-4 text-slate-700 space-y-1">
            <p>
              <span className="text-slate-400">Email:</span> {allEmails || '(none)'}
            </p>
            <p>
              <span className="text-slate-400">Clerk publicMetadata.role:</span>{' '}
              {role != null ? JSON.stringify(role) : '(missing)'}
            </p>
            <p>
              <span className="text-slate-400">Allowlist (build):</span>{' '}
              {getAdminEmails().join(', ')}
            </p>
            <p className="pt-2 text-slate-500 normal-case font-sans text-xs leading-relaxed">
              <strong>Fix in Clerk Dashboard:</strong> Users → this user → Public metadata → set
              <code className="mx-1 bg-slate-100 px-1 rounded">role</code> to
              <code className="mx-1 bg-slate-100 px-1 rounded">&quot;ADMIN&quot;</code>
              (uppercase). Save, sign out, sign in again on the admin URL.
            </p>
          </div>
          <a href={studentHome} className="inline-block text-sm font-semibold text-[#0b2c6a] underline">
            Go to student site now
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
