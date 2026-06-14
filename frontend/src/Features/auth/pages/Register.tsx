import React, { useState } from 'react';

interface RegisterProps {
  onBackClick: () => void;
  onInstituteLoginClick: () => void;
  onLoginClick: () => void; // Routes existing external users to ExternalLogin
  onExternalSubmitComplete: () => void;
}

export default function Register({ 
  onBackClick, 
  onInstituteLoginClick, 
  onLoginClick, 
  onExternalSubmitComplete 
}: RegisterProps) {
  
  const [formData, setFormData] = useState({
    fullName: '',
    professionalRole: '',
    organization: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeToTerms) {
      alert("Please review and agree to the institutional terms of service to continue.");
      return;
    }
    onExternalSubmitComplete();
  };

  return (
    <div className="min-h-screen w-full bg-[#f0f4f9] flex flex-col justify-between font-sans antialiased selection:bg-blue-100">
      
      {/* Upper Subtle Back Navigation Row */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4">
        <button 
          onClick={onBackClick}
          className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
        >
          ← Back to Role Selection
        </button>
      </div>

      {/* Main Form Dashboard Split-Card Frame */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 items-stretch animate-fade-in">
          
          {/* =======================================================================
              LEFT DARK PANEL: INTERNAL CADT INSTITUTIONAL ACCOUNT ENTRY GATEWAY
             ======================================================================= */}
          <div className="md:col-span-5 bg-[#030712] p-8 sm:p-10 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
            <div className="space-y-4">
              <h3 className="text-xl font-black tracking-tight text-white">
                Student/Staff Login
              </h3>
              <p className="text-xs font-medium text-slate-400 leading-relaxed">
                Are you an active student, researcher, or staff member of the CADT community? Use your institutional credentials for instant access. 
              </p>
              
              {/* Clicking this moves users straight to Login.tsx (Institute login portal) */}
              <button 
                type="button"
                onClick={onInstituteLoginClick}
                className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-xs py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                🏛️ Login with Institute Account
              </button>
            </div>

            {/* Premium Institutional Perks Metadata Checklist */}
            <div className="pt-8 md:pt-0 space-y-3.5 border-t border-slate-800/80 mt-8 md:mt-0">
              <h4 className="text-[10px] font-black tracking-wider text-slate-500 uppercase">
                Institutional Perks
              </h4>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Early registration access
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Waived entry fees
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Certificate tracking utilities
                </li>
              </ul>
            </div>
          </div>

          {/* =======================================================================
              RIGHT PANEL: EXTERNAL ATTENDEE ACCOUNT REGISTRATION SIGNUP FORM
             ======================================================================= */}
          <form onSubmit={handleSubmit} className="md:col-span-7 p-8 sm:p-10 space-y-5 bg-white">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                Create Your Account
              </h2>
              <p className="text-xs font-medium text-slate-400">
                Create an attendee account if you are not an active CADT student or internal staff member. 
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" required placeholder="Enter your legal name" value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Professional Role</label>
                <input 
                  type="text" required placeholder="e.g. Developer / Lead" value={formData.professionalRole}
                  onChange={e => setFormData({...formData, professionalRole: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Organization</label>
              <input 
                type="text" required placeholder="Company or School name" value={formData.organization}
                onChange={e => setFormData({...formData, organization: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" required placeholder="name@example.com" value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Password</label>
                <input 
                  type="password" required placeholder="••••••••" value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Confirm Password</label>
                <input 
                  type="password" required placeholder="••••••••" value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2">
              <input 
                type="checkbox" id="terms" checked={formData.agreeToTerms}
                onChange={e => setFormData({...formData, agreeToTerms: e.target.checked})}
                className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
              />
              <label htmlFor="terms" className="text-[11px] font-semibold text-slate-400 leading-normal select-none cursor-pointer">
                I agree to the <span className="text-slate-600 underline">terms of service</span> and <span className="text-slate-600 underline">privacy policy</span> of CADT EVENT.
              </label>
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                className="w-full bg-[#0f172a] hover:bg-blue-900 text-white font-extrabold text-xs py-3 rounded-xl shadow-sm hover:shadow transition-all duration-150 cursor-pointer active:scale-[0.98]"
              >
                Create Account →
              </button>
            </div>
          </form>

        </div>
      </main>

      {/* Embedded Mini-Tray Login Redirect Trigger Link */}
      <footer className="w-full text-center py-4 bg-[#090d16] text-[11px] font-bold text-slate-500 border-t border-slate-900">
        Already have an account? <span onClick={onLoginClick} className="text-blue-400 underline cursor-pointer hover:text-blue-300 pl-1 font-extrabold">log in</span>
      </footer>

    </div>
  );
}