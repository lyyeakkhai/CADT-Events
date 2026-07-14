import React, { useEffect, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { USER_FRONTEND_URL } from '../lib/urls';
import { isAdminUser } from '../lib/adminAccess';
import LoginView from '../views/LoginView';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 1) Not signed in → same CADT login UI as student (on this domain).
 * 2) Signed in + admin → dashboard.
 * 3) Signed in + student → redirect to student site (not a loop: admin stays if isAdmin).
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn, user } = useUser();

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

  // Non-admin signed-in users → student site
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (isAdmin) return;
    // Small delay so we don't flash before Clerk metadata settles
    const t = window.setTimeout(() => {
      window.location.replace(studentHome);
    }, 400);
    return () => window.clearTimeout(t);
  }, [isLoaded, isSignedIn, isAdmin, studentHome]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Loading…</p>
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
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md space-y-4">
          <div className="w-8 h-8 mx-auto rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-slate-700">
            This account is not an admin. Redirecting to the student portal…
          </p>
          <div className="text-left text-xs font-mono bg-white border border-slate-200 rounded-lg p-3 text-slate-600">
            <p>Email: {email || '(none)'}</p>
            <p>Clerk role: {role != null ? String(role) : '(missing)'}</p>
            <p className="mt-2 text-slate-500">
              Fix: Clerk → User → Public metadata →{' '}
              <code className="bg-slate-100 px-1">role: &quot;ADMIN&quot;</code>
              <br />
              or add this email to Render <code className="bg-slate-100 px-1">ADMIN_EMAILS</code> and
              Vercel <code className="bg-slate-100 px-1">VITE_ADMIN_EMAILS</code>, then re-login.
            </p>
          </div>
          <a href={studentHome} className="text-sm font-semibold text-[#0b2c6a] underline">
            Continue to student site
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
