import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';

interface ExternalLoginProps {
  onBackClick: () => void;
  onSignUpClick: () => void;
  onLoginSuccess: () => void; // kept for compat; Clerk auto-redirects via useUser
}

export default function ExternalLogin({ onBackClick, onSignUpClick }: ExternalLoginProps) {
  const { signInWithEmail, signInWithOAuth, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await signInWithEmail(email, password);
    // On success, Clerk updates useUser() → App.tsx auto-transitions
  };

  return (
    <div className="min-h-screen w-full bg-[#f0f4f9] flex flex-col justify-between font-sans antialiased selection:bg-blue-100">

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4">
        <button
          onClick={onBackClick}
          className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
        >
          ← Back to Options
        </button>
      </div>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 space-y-6 animate-fade-in">

          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
              Attendee Portal Login
            </h2>
            <p className="text-xs font-medium text-slate-400">
              Sign in with your email to view exclusive seminars, workshops, and high-tech summits.
            </p>
          </div>

          {/* Clerk error banner */}
          {error && error !== 'CHECK_EMAIL' && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-950 hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs py-3 rounded-xl shadow-sm hover:shadow transition-all duration-150 cursor-pointer active:scale-[0.98]"
              >
                {isLoading ? 'Signing in…' : 'SIGN IN →'}
              </button>
            </div>
          </form>

          {/* OAuth */}
          <div className="relative flex items-center justify-center select-none py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <span className="relative bg-white px-3 text-[10px] font-black tracking-wider text-slate-400 uppercase">
              Or Continue With
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => signInWithOAuth('oauth_google')}
              disabled={isLoading}
              className="w-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl shadow-2xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11C18.432 1.495 15.608 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.854 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"/></svg>
              Continue with Google
            </button>
          </div>

          <div className="text-center pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-400">
            Don't have an attendee account?{' '}
            <span
              onClick={onSignUpClick}
              className="text-blue-600 hover:text-blue-800 underline cursor-pointer font-bold transition-colors"
            >
              Sign up here
            </span>
          </div>
        </div>
      </main>

      <footer className="w-full text-center py-4 bg-[#090d16] text-[11px] font-bold text-slate-500 border-t border-slate-900 select-none">
        © 2026 CADT Event Central. All rights reserved.
      </footer>
    </div>
  );
}