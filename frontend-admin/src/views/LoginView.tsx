import { SignIn, useUser } from '@clerk/clerk-react';
import Logo from '../assets/CADT10-LOGO-anniversary-03.png';
import { USER_FRONTEND_URL } from '../lib/urls';

/**
 * Same Clerk SignIn chrome as the student app (split CADT branding + themed form).
 * Auth happens on the admin origin so sessions work without bouncing to student.
 */
export default function LoginView() {
  const { isLoaded } = useUser();

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

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans">
      {/* Left — CADT branding (same as student) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between bg-[#0b2c6a] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-600 rounded-full blur-[130px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-400 rounded-full blur-[130px]" />
        </div>

        <div className="relative z-10 p-12 xl:p-16 flex-grow flex flex-col justify-center">
          <div className="mb-10 bg-white p-4 rounded-2xl w-fit shadow-2xl">
            <img src={Logo} alt="CADT Logo" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight mb-6">
            CADT Events <br />
            <span className="text-blue-200 font-light">Admin Portal</span>
          </h1>
          <p className="text-blue-100/90 text-lg max-w-md leading-relaxed font-medium">
            Sign in with your teacher or organizer account to publish events, manage
            registrations, and track attendance.
          </p>
        </div>

        <div className="relative z-10 p-12 xl:p-16 border-t border-white/10">
          <p className="text-blue-200/60 text-sm font-medium">
            &copy; {new Date().getFullYear()} Cambodia Academy of Digital Technology
          </p>
        </div>
      </div>

      {/* Right — Clerk SignIn (same appearance as student) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <div className="lg:hidden mb-8 flex flex-col items-center">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mb-4">
            <img src={Logo} alt="CADT Logo" className="h-12 w-auto object-contain" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">CADT Events Admin</h2>
        </div>

        <div className="w-full max-w-[420px] flex flex-col items-center">
          <div className="w-full text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-sm font-medium text-slate-500">
              Please sign in with your institutional Gmail account
            </p>
          </div>

          <div className="w-full shadow-2xl shadow-slate-200/50 rounded-[1.5rem] overflow-hidden ring-1 ring-slate-200/50 bg-white">
            <SignIn
              routing="hash"
              forceRedirectUrl="/"
              appearance={{
                layout: {
                  socialButtonsPlacement: 'top',
                  socialButtonsVariant: 'blockButton',
                },
                variables: {
                  colorPrimary: '#0b2c6a',
                  colorText: '#0f172a',
                  colorTextSecondary: '#64748b',
                  colorBackground: '#ffffff',
                  colorInputBackground: '#f8fafc',
                  colorInputText: '#0f172a',
                  borderRadius: '0.75rem',
                },
                elements: {
                  card: 'shadow-none border-0 w-full p-8 sm:p-10',
                  header: 'hidden',
                  footer: 'hidden',
                  formButtonPrimary:
                    'bg-[#0b2c6a] hover:bg-[#082050] transition-colors shadow-md h-11 text-[15px]',
                  socialButtonsBlockButton:
                    'border-slate-200 hover:bg-slate-50 transition-colors h-11 shadow-sm',
                  socialButtonsBlockButtonText: 'font-semibold text-slate-700 text-[14px]',
                  dividerRow: 'my-6',
                  formFieldInput: 'h-11 text-[15px]',
                  formFieldLabel: 'text-[13px] font-semibold text-slate-700',
                },
              }}
            />
          </div>

          <p className="mt-8 text-xs font-medium text-slate-400 text-center max-w-xs leading-relaxed">
            By signing in, you agree to the CADT Events Terms of Service and Privacy Policy.
          </p>
          <p className="mt-3 text-[11px] text-slate-400 text-center max-w-sm leading-relaxed">
            Admin uses a separate domain from the student app. Even if you already signed in on the
            student site, sign in again here.
          </p>

          <a
            href={USER_FRONTEND_URL}
            className="mt-4 text-sm font-semibold text-[#0b2c6a] hover:underline"
          >
            ← Student portal
          </a>
        </div>
      </div>
    </div>
  );
}
