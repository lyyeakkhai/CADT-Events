import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';

interface RegisterProps {
  onBackClick: () => void;
  onInstituteLoginClick: () => void;
  onLoginClick: () => void;
  onExternalSubmitComplete: () => void; // kept for compat; Clerk auto-exits
}

export default function Register({
  onBackClick,
  onInstituteLoginClick,
  onLoginClick,
}: RegisterProps) {
  const { signUpWithEmail, verifyEmailCode, signInWithOAuth, isLoading, error, clearError } = useAuth();

  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [otp, setOtp] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    professionalRole: '',
    organization: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!formData.agreeToTerms) {
      return alert('Please agree to the terms of service to continue.');
    }
    if (formData.password !== formData.confirmPassword) {
      return alert('Passwords do not match.');
    }

    const [firstName, ...rest] = formData.fullName.trim().split(' ');
    const lastName = rest.join(' ');

    const result = await signUpWithEmail(formData.email, formData.password, firstName, lastName);

    if (error === 'CHECK_EMAIL') {
      setStep('verify'); // show OTP screen
    }
    // If result is true, Clerk auto-sets session → App.tsx transitions
    if (result) {
      // signed up and verified in one step (rare but possible)
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await verifyEmailCode(otp);
    // On success Clerk sets session → App.tsx transitions
  };

  // ── OTP verification screen ────────────────────────────────────────────────
  if (step === 'verify') {
    return (
      <div className="min-h-screen w-full bg-[#f0f4f9] flex flex-col justify-between font-sans antialiased">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4">
          <button onClick={() => setStep('form')} className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer">
            ← Back
          </button>
        </div>
        <main className="flex-grow flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 space-y-6 animate-fade-in text-center">
            <div>
              <div className="text-4xl mb-3">📧</div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">Check your email</h2>
              <p className="text-xs font-medium text-slate-400">
                We sent a 6-digit code to <strong>{formData.email}</strong>
              </p>
            </div>
            {error && error !== 'CHECK_EMAIL' && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-xl">
                {error}
              </div>
            )}
            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center bg-slate-50 border border-slate-200 rounded-xl p-3 text-xl font-black text-slate-900 tracking-[0.5em] placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="w-full bg-slate-950 hover:bg-blue-900 disabled:opacity-50 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer active:scale-[0.98]"
              >
                {isLoading ? 'Verifying…' : 'Verify Email →'}
              </button>
            </form>
          </div>
        </main>
        <footer className="w-full text-center py-4 bg-[#090d16] text-[11px] font-bold text-slate-500 border-t border-slate-900">
          © 2026 CADT Event Central. All rights reserved.
        </footer>
      </div>
    );
  }

  // ── Registration form ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-[#f0f4f9] flex flex-col justify-between font-sans antialiased selection:bg-blue-100">

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4">
        <button onClick={onBackClick} className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer">
          ← Back to Role Selection
        </button>
      </div>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 items-stretch animate-fade-in">

          {/* Left: Institute login panel */}
          <div className="md:col-span-5 bg-[#030712] p-8 sm:p-10 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
            <div className="space-y-4">
              <h3 className="text-xl font-black tracking-tight text-white">Student/Staff Login</h3>
              <p className="text-xs font-medium text-slate-400 leading-relaxed">
                Are you an active student, researcher, or staff member? Use your institutional credentials for instant access.
              </p>
              <button
                type="button"
                onClick={onInstituteLoginClick}
                className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-xs py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                🏛️ Login with Institute Account
              </button>
            </div>
            <div className="pt-8 md:pt-0 space-y-3.5 border-t border-slate-800/80 mt-8 md:mt-0">
              <h4 className="text-[10px] font-black tracking-wider text-slate-500 uppercase">Institutional Perks</h4>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-300">
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Early registration access</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Waived entry fees</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Certificate tracking utilities</li>
              </ul>
            </div>
          </div>

          {/* Right: External registration form */}
          <div className="md:col-span-7 p-8 sm:p-10 space-y-5 bg-white">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Create Your Account</h2>
              <p className="text-xs font-medium text-slate-400">
                Create an attendee account if you are not an active CADT student or internal staff member.
              </p>
            </div>

            {error && error !== 'CHECK_EMAIL' && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input type="text" required placeholder="Enter your legal name" value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Professional Role</label>
                  <input type="text" required placeholder="e.g. Developer / Lead" value={formData.professionalRole}
                    onChange={e => setFormData({ ...formData, professionalRole: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Organization</label>
                <input type="text" required placeholder="Company or School name" value={formData.organization}
                  onChange={e => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address</label>
                <input type="email" required placeholder="name@example.com" value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Password</label>
                  <input type="password" required placeholder="••••••••" value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Confirm Password</label>
                  <input type="password" required placeholder="••••••••" value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all" />
                </div>
              </div>

              {/* OAuth quick signup */}
              <button type="button" onClick={() => signInWithOAuth('oauth_google')} disabled={isLoading}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11C18.432 1.495 15.608 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.854 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z" /></svg>
                Sign up with Google
              </button>

              <div className="flex items-start gap-2.5 pt-2">
                <input type="checkbox" id="terms" checked={formData.agreeToTerms}
                  onChange={e => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer" />
                <label htmlFor="terms" className="text-[11px] font-semibold text-slate-400 leading-normal select-none cursor-pointer">
                  I agree to the <span className="text-slate-600 underline">terms of service</span> and <span className="text-slate-600 underline">privacy policy</span> of CADT EVENT.
                </label>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isLoading}
                  className="w-full bg-[#0f172a] hover:bg-blue-900 disabled:opacity-50 text-white font-extrabold text-xs py-3 rounded-xl shadow-sm transition-all duration-150 cursor-pointer active:scale-[0.98]">
                  {isLoading ? 'Creating account…' : 'Create Account →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="w-full text-center py-4 bg-[#090d16] text-[11px] font-bold text-slate-500 border-t border-slate-900">
        Already have an account?{' '}
        <span onClick={onLoginClick} className="text-blue-400 underline cursor-pointer hover:text-blue-300 pl-1 font-extrabold">
          log in
        </span>
      </footer>
    </div>
  );
}