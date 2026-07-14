import React, { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { USER_FRONTEND_URL } from '../lib/urls';
import { isAdminUser } from '../lib/adminAccess';
import LoginView from '../views/LoginView';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Same Clerk login UI as student (LoginView).
 * After sign-in: admins enter the portal; students are sent to the student site.
 * Sign-in stays on the admin domain (no redirect loop across Vercel apps).
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn, user } = useUser();

  const role = user?.publicMetadata?.role as string | undefined;
  const email = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = isAdminUser({ role, email });

  // Student (or any non-admin) who opens admin URL → redirect to student frontend
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (isAdmin) return;
    const target = USER_FRONTEND_URL || 'https://cadt-events.vercel.app';
    window.location.replace(target);
  }, [isLoaded, isSignedIn, isAdmin]);

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
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm space-y-3">
          <div className="w-8 h-8 mx-auto rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-slate-600">
            This account is for students. Redirecting to the student portal…
          </p>
          <a href={USER_FRONTEND_URL} className="text-sm font-semibold text-[#0b2c6a] underline">
            Continue to student site
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
