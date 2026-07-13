import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { USER_FRONTEND_URL } from '../lib/urls';
import { isAdminUser } from '../lib/adminAccess';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-slate-500">
        Checking authorization...
      </div>
    );
  }

  if (!isSignedIn) {
    window.location.href = `${USER_FRONTEND_URL}/login`;
    return null;
  }

  const role = user?.publicMetadata?.role as string | undefined;
  const email = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = isAdminUser({ role, email });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500 p-6 rounded-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="mb-4">
            You need the teacher/admin role to open this portal. Ask the organizer to add your
            email to <code className="text-amber-300">ADMIN_EMAILS</code>.
          </p>

          <div className="bg-black/50 p-4 rounded text-left font-mono text-sm mb-4">
            <p className="text-gray-400 mb-2">DEBUG INFO:</p>
            <p>Email: {email}</p>
            <p>Role in Clerk: {role ? `"${role}"` : 'undefined (or null)'}</p>
            <p>Public Metadata: {JSON.stringify(user.publicMetadata)}</p>
          </div>

          <a
            href={USER_FRONTEND_URL}
            className="inline-block bg-white text-black px-4 py-2 rounded font-medium hover:bg-gray-200"
          >
            Go back to Public Site
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
