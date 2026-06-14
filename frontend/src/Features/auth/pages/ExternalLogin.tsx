import React, { useState } from 'react';

interface ExternalLoginProps {
  onBackClick: () => void;
  onLoginSuccess: () => void;
  onSignUpClick: () => void;
}

export default function ExternalLogin({ onBackClick, onLoginSuccess, onSignUpClick }: ExternalLoginProps) {
  // Simple state parameters for general consumer entities
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Fire success callback to route to the main discovery feed grid
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen w-full bg-[#f0f4f9] flex flex-col justify-between font-sans antialiased selection:bg-blue-100">
      
      {/* Upper Subtle Back Navigation Row */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4">
        <button 
          onClick={onBackClick}
          className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
        >
          ← Back to Options
        </button>
      </div>

      {/* Central Login Card Container */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 space-y-6 animate-fade-in">
          
          {/* Header Branding Panel */}
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
              Attendee Portal Login
            </h2>
            <p className="text-xs font-medium text-slate-400">
              Sign in with your email to view exclusive seminars, workshops, and high-tech summits[cite: 15, 538].
            </p>
          </div>

          {/* Form Matrix Inputs */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* Email Input Field */}
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

            {/* Password Input Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <span 
                  onClick={() => alert("Redirecting to help desk password recovery logs...")}
                  className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-wider cursor-pointer underline select-none"
                >
                  Forgot Password?
                </span>
              </div>
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all"
              />
            </div>

            {/* Login Trigger Action */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-slate-950 hover:bg-blue-900 text-white font-extrabold text-xs py-3 rounded-xl shadow-sm hover:shadow transition-all duration-150 cursor-pointer active:scale-[0.98]"
              >
                SIGN IN →
              </button>
            </div>

          </form>

          {/* Alternative Dynamic Form Link */}
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

      {/* Sticky Bottom Context Column Footer */}
      <footer className="w-full text-center py-4 bg-[#090d16] text-[11px] font-bold text-slate-500 border-t border-slate-900 select-none">
        &copy; 2026 CADT Event Central. All rights reserved[cite: 536].
      </footer>

    </div>
  );
}