import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { CheckCircle } from 'lucide-react';
import { useTelegramApi } from '../services/api';

interface TelegramConnectPromptProps {
  open: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export default function TelegramConnectPrompt({ open, onClose, onConnected }: TelegramConnectPromptProps) {
  const { user } = useUser();
  const { getConnectLink } = useTelegramApi();
  const [loading, setLoading] = useState(false);
  const [linkData, setLinkData] = useState<{ deepLink: string | null; botUsername: string; instructions?: string } | null>(null);
  const [preferTelegram, setPreferTelegram] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const handleOpenConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getConnectLink();
      setLinkData(data);

      if (data.deepLink) {
        // Open Telegram deep link in new tab/window
        window.open(data.deepLink, '_blank', 'noopener,noreferrer');
      }
    } catch (e: any) {
      setError(e?.message || 'Could not generate Telegram link. Is the bot configured?');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    setConnected(true);
    onConnected?.();
    // Give user time to finish in Telegram, then close
    setTimeout(() => {
      onClose();
      // Clear for next session if needed
      try { localStorage.setItem('telegramPromptDismissed', '1'); } catch {}
    }, 800);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3">
          <div className="text-xl font-black tracking-tight">Stay updated via Telegram?</div>
          <div className="text-sm text-slate-500 mt-1">
            Get booking confirmations, reminders, and event updates directly in Telegram from our bot.
          </div>
        </div>

        {!linkData && !connected && (
          <div className="space-y-4 pt-2">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={preferTelegram}
                onChange={(e) => setPreferTelegram(e.target.checked)}
                className="accent-[#0b2c6a]"
              />
              I prefer to receive notifications on Telegram
            </label>

            <div className="text-xs text-slate-500 leading-relaxed">
              After connecting, our bot will message you for important updates.
            </div>

            <button
              onClick={handleOpenConnect}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#0b2c6a] text-white font-bold text-sm disabled:opacity-60 active:scale-[0.985] transition"
            >
              {loading ? 'Generating link…' : 'Connect Telegram'}
            </button>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button onClick={onClose} className="w-full text-xs text-slate-500 hover:text-slate-700 py-1">
              Maybe later
            </button>
          </div>
        )}

        {linkData && !connected && (
          <div className="space-y-4 pt-1 text-sm">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="font-semibold mb-1">Next step:</div>
              <ol className="list-decimal pl-5 space-y-1 text-slate-600">
                <li>Open Telegram and search for <span className="font-mono">@{linkData.botUsername}</span></li>
                <li>Tap <span className="font-semibold">Start</span> (or paste the command from the link).</li>
                <li>You'll receive a confirmation.</li>
              </ol>
            </div>

            {linkData.deepLink && (
              <a
                href={linkData.deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-[#0b2c6a] font-bold underline"
              >
                Open Telegram link →
              </a>
            )}

            <div className="flex gap-2 pt-2">
              <button onClick={handleDone} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm">
                I've sent /start in Telegram
              </button>
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-semibold">
                Close
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400">You can connect later from My Bookings.</p>
          </div>
        )}

        {connected && (
          <div className="flex flex-col items-center justify-center p-8 bg-green-50/50 rounded-2xl mb-4 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
            <h4 className="text-lg font-bold text-slate-900 mb-1">Successfully Connected</h4>
            <div className="text-slate-600 text-sm">Check your Telegram for a confirmation message.</div>
          </div>
        )}
      </div>
    </div>
  );
}
