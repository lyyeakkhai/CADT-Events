import React, { useState } from 'react';
import Logo from '../../../assets/images/CADT Event Logo (1).png';
import { useAuth } from '../../../hooks/useAuth';

interface AdminLoginProps {
  onBackClick: () => void;
  onAdminLoginSuccess: () => void; // kept for compat
}

export default function AdminLogin({ onBackClick }: AdminLoginProps) {
  const { signInWithEmail, isLoading, error, clearError } = useAuth();

  const [adminId, setAdminId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    // Clerk authenticates by email — adminId is UI metadata only
    await signInWithEmail(email, password);
    // On success, App.tsx checks user.publicMetadata.role === 'admin'
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] bg-gradient-to-b from-white to-[#f1f5f9] flex flex-col justify-between font-sans antialiased selection:bg-slate-200">
      
      {/* Upper Subtle Back Navigation Row */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4">
        <button 
          onClick={onBackClick}
          className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
        >
          ← Back to Role Selection
        </button>
      </div>

      {/* Main Administrative Card Container Frame */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-slate-200/60 p-6 sm:p-8 space-y-6 animate-fade-in">
          
          <div className="text-center space-y-2 flex flex-col items-center">
            <div>
              <img src={Logo} alt="CADT Logo" className="w-14 h-14 text-white rounded-xl flex items-center justify-center shadow-md mb-6 " />
            </div>
            <h2 className="text-xl font-black text-[#0f172a] tracking-tight">
              Admin Portal Login
            </h2>
            <p className="text-xs font-semibold text-slate-400">
              System management & Event administrator
            </p>
          </div>

          {/* Clerk error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          {/* Credentials Input Layout Matrix */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* Admin ID Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                Admin ID
              </label>
              <input 
                type="text"
                required
                placeholder="ID-2024-0000"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 hover:border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-950/5 focus:bg-white focus:border-slate-950 transition-all"
              />
            </div>

            {/* Email Address Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                Email Address
              </label>
              <input 
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 hover:border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-950/5 focus:bg-white focus:border-slate-950 transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center select-none">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200 hover:border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-950/5 focus:bg-white focus:border-slate-950 transition-all"
                />
              </div>
            </div>

            {/* Primary Submit Action Trigger CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#030a1c] hover:bg-slate-900 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-sm transition-all duration-150 cursor-pointer flex items-center justify-center gap-1 active:scale-[0.98]"
              >
                {isLoading ? 'Authenticating…' : 'Enter Admin Dashboard →'}
              </button>
            </div>

          </form>

          {/* Fallback Intent Redirection Trailing Row */}
          <div className="text-center pt-4 border-t border-slate-100 text-[11px] font-semibold text-slate-400 select-none">
            Not an administrator?{' '}
            <div 
              onClick={onBackClick}
              className="text-slate-900 font-bold underline cursor-pointer hover:text-blue-900 block mt-1 text-sm tracking-tight transition-colors"
            >
              Go to user login
            </div>
          </div>

        </div>
      </main>

      {/* System Framework Diagnostics Trailing Footer */}
      <footer className="w-full bg-[#0a0f1d] border-t border-slate-900 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between text-[10px] font-bold text-slate-500 gap-2 select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Systems Operational: V2.4.1</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-300 cursor-pointer">Security Protocols</span>
          <span className="hover:text-slate-300 cursor-pointer">Technical Support</span>
        </div>
      </footer>

    </div>
  );
}