import React, { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

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
    // If they aren't logged in at all, we can safely send them to the public login
    window.location.href = 'http://localhost:5173/login';
    return null;
  }

  const role = user?.publicMetadata?.role as string | undefined;
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500 p-6 rounded-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="mb-4">You do not have the ADMIN role.</p>
          
          <div className="bg-black/50 p-4 rounded text-left font-mono text-sm mb-4">
            <p className="text-gray-400 mb-2">DEBUG INFO:</p>
            <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
            <p>Role in Clerk: {role ? `"${role}"` : "undefined (or null)"}</p>
            <p>Public Metadata: {JSON.stringify(user.publicMetadata)}</p>
          </div>
          
          <a href="http://localhost:5173" className="inline-block bg-white text-black px-4 py-2 rounded font-medium hover:bg-gray-200">
            Go back to Public Site
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

