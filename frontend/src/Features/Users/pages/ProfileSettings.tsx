import React, { useState } from 'react';
import UserProfile from '../../../asset/Profile free icons designed by Freepik.jpg';

interface ProfileSettingsProps {
  onBackClick?: () => void;
}

export default function ProfileSettings({ onBackClick }: ProfileSettingsProps) {
  const [fullName, setFullName] = useState('Alexander Thorne');
  const [email, setEmail] = useState('a.thorne@cadt.edu');
  const [phone, setPhone] = useState('+1 (555) 012-3456');
  const [location, setLocation] = useState('Phnom Penh, Cambodia');
  const [bio, setBio] = useState(
    'Senior Research Fellow specializing in Artificial Intelligence and Sustainable Urban Development. Frequent speaker at CADT Innovation Summits.'
  );

  const [notifEvents, setNotifEvents] = useState(true);
  const [notifNewsletters, setNotifNewsletters] = useState(false);
  const [notifPeers, setNotifPeers] = useState(true);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="w-full bg-[#f8fafc] min-h-screen font-sans antialiased">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">Profile Settings</h1>
            <p className="text-sm text-slate-500 font-medium">Manage your institutional identity and event credentials.</p>
          </div>
          <button
            onClick={handleSave}
            className={`px-6 py-2.5 rounded-xl text-sm font-extrabold shadow-sm transition-all active:scale-[0.97] cursor-pointer ${
              saved
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 hover:bg-blue-900 text-white'
            }`}
          >
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>

        {/* Top Section: Personal Info + Account Verified */}
        <div className="flex flex-col lg:flex-row gap-5 mb-5">

          {/* Personal Information Card */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200/60 shadow-xs p-6">
            {/* Card Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                <img src={UserProfile} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 leading-tight">Personal Information</h2>
                <p className="text-xs text-slate-500 font-medium">Update your account details and contact info.</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all bg-slate-50/50 hover:border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Institutional Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all bg-slate-50/50 hover:border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all bg-slate-50/50 hover:border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Location</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all bg-slate-50/50 hover:border-slate-300"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Professional Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all bg-slate-50/50 hover:border-slate-300 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Account Verified Badge */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs p-5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-wider mb-0.5">Account Verified</p>
                <p className="text-xs text-slate-500 font-medium leading-snug">Full access to institutional grants.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Security & Notifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Security & Access */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 leading-tight">Security & Access</h2>
                <p className="text-xs text-slate-500 font-medium">Control your password and authentication.</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Change Password */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Change Password</p>
                    <p className="text-[10px] text-slate-400 font-medium">Last updated 3 months ago</p>
                  </div>
                </div>
                <button className="text-xs font-extrabold text-slate-700 hover:text-slate-950 underline underline-offset-2 cursor-pointer transition-colors">
                  Update
                </button>
              </div>

              {/* Two-Factor Auth */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3" />
                  </svg>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Two-Factor Auth</p>
                    <p className="text-[10px] text-emerald-500 font-bold">● Enabled</p>
                  </div>
                </div>
                <button className="text-xs font-extrabold text-slate-700 hover:text-slate-950 underline underline-offset-2 cursor-pointer transition-colors">
                  Manage
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.039a2.25 2.25 0 012.134 0l7.5 4.039a2.25 2.25 0 011.183 1.98V19.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 leading-tight">Notifications</h2>
                <p className="text-xs text-slate-500 font-medium">Customize how we keep you informed.</p>
              </div>
            </div>

            <div className="space-y-4">
              <NotifRow
                icon={
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                }
                label="Event Reminders & Updates"
                checked={notifEvents}
                onChange={setNotifEvents}
              />
              <NotifRow
                icon={
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                  </svg>
                }
                label="Institutional Newsletters"
                checked={notifNewsletters}
                onChange={setNotifNewsletters}
              />
              <NotifRow
                icon={
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                }
                label="Peer Connection Requests"
                checked={notifPeers}
                onChange={setNotifPeers}
              />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

/* ── Toggle Row ── */
function NotifRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-xs font-bold text-slate-700">{label}</span>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none shrink-0 ${
          checked ? 'bg-slate-950' : 'bg-slate-200'
        }`}
        style={{ width: '40px', height: '22px' }}
        role="switch"
        aria-checked={checked}
      >
        <span
          className="absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200"
          style={{ transform: checked ? 'translateX(18px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}