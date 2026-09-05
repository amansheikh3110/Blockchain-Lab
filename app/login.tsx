'use client';

import { useState, useEffect } from 'react';
import { usePrivy, useLoginWithEmail } from '@privy-io/react-auth';

export default function LoyaltyApp() {
  const { ready, authenticated, user, logout, login, getAccessToken } = usePrivy();
  const { sendCode, loginWithCode } = useLoginWithEmail();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [stamps, setStamps] = useState(0);
  const [loadingStamp, setLoadingStamp] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch current stamp balance when customer is authenticated
  useEffect(() => {
    async function loadStamps() {
      if (!authenticated) return;
      try {
        const token = await getAccessToken();
        const res = await fetch('/api/award-stamp', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setStamps(data.stamps);
        }
      } catch (e) {
        console.error('Failed to load stamps', e);
      }
    }
    loadStamps();
  }, [authenticated, getAccessToken]);

  // 1. Initializing state handled before auth-dependent UI renders (Test 4)
  if (!ready) {
    return (
      <div className="p-6 text-center">
        <p className="text-zinc-500 animate-pulse font-medium">
          Loading Ramesh's Bakery Loyalty Card...
        </p>
      </div>
    );
  }

  // 2. Route gating on Privy authenticated state (Test 3)
  if (authenticated && user) {
    // Award stamp handler for staff counter (Test 7)
    const handleAwardStamp = async () => {
      setLoadingStamp(true);
      setMessage('');
      try {
        const token = await getAccessToken();
        const res = await fetch('/api/award-stamp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setStamps(data.stamps);
          setMessage(data.message || 'Stamp awarded successfully!');
        } else {
          setMessage(data.error || 'Failed to award stamp.');
        }
      } catch (err: any) {
        setMessage('Network error while awarding stamp.');
      } finally {
        setLoadingStamp(false);
      }
    };

    return (
      <div className="w-full max-w-md p-6 border border-amber-300 rounded-2xl bg-amber-50/70 shadow-md text-zinc-800 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-amber-200 pb-3">
          <div>
            <h1 className="text-xl font-bold text-amber-900">🍞 Ramesh's Bakery</h1>
            <p className="text-xs text-amber-700">Digital Punch Card (Anti-Photocopy)</p>
          </div>
          <button
            onClick={logout}
            className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        {/* Customer Identity Info */}
        <div className="bg-white/80 p-3 rounded-xl border border-amber-200 text-xs space-y-1">
          <p><strong>Customer:</strong> {user.email?.address || 'Anonymous Regular'}</p>
          <p><strong>User ID:</strong> <span className="font-mono">{user.id}</span></p>
          <p><strong>Embedded Wallet:</strong> <span className="font-mono text-emerald-700">{user.wallet?.address || 'Created automatically'}</span></p>
        </div>

        {/* Visual Stamp Card */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-inner">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-sm">Loyalty Stamps</span>
            <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full">
              {stamps} / 10 Stamps
            </span>
          </div>

          {/* 10 Punch Holes */}
          <div className="grid grid-cols-5 gap-2 my-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-12 rounded-xl flex items-center justify-center text-lg font-bold border-2 transition-all ${
                  i < stamps
                    ? 'bg-amber-400 border-amber-500 text-white shadow-sm'
                    : 'bg-zinc-100 border-dashed border-zinc-300 text-zinc-300'
                }`}
              >
                {i < stamps ? '🎂' : i + 1}
              </div>
            ))}
          </div>

          {stamps >= 10 ? (
            <p className="text-center font-bold text-emerald-700 text-sm animate-bounce">
              🎉 10 stamps reached! Claim your FREE cake at the counter! 🎂
            </p>
          ) : (
            <p className="text-center text-xs text-zinc-500">
              {10 - stamps} more stamps until a free cake!
            </p>
          )}
        </div>

        {/* Staff Counter Action */}
        <div className="bg-amber-100/60 p-3 rounded-xl border border-amber-300 space-y-2">
          <p className="text-xs font-semibold text-amber-900">Counter Staff Action:</p>
          <button
            onClick={handleAwardStamp}
            disabled={loadingStamp}
            className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-sm transition-colors shadow cursor-pointer disabled:opacity-50"
          >
            {loadingStamp ? 'Verifying on Server...' : '⭐ Award 1 Stamp (Staff)'}
          </button>
          {message && (
            <p className="text-xs text-center font-medium text-amber-900 mt-1">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 3. Pre-login UI: Email OTP + 1-Tap Privy Login (Test 1)
  return (
    <div className="w-full max-w-md p-6 border border-zinc-200 rounded-2xl bg-white shadow-lg space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-900">🍞 Ramesh's Bakery</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Buy 10 breads, get 1 free cake! Sign in with your email to earn stamps.
        </p>
      </div>

      {/* Email Input & Send OTP */}
      <div className="space-y-3 pt-2">
        <div>
          <label className="block text-xs font-semibold text-zinc-600 uppercase mb-1">
            Email Address
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="customer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={() => sendCode({ email })}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-sm cursor-pointer"
            >
              Send Code
            </button>
          </div>
        </div>

        {/* Enter Code */}
        <div>
          <label className="block text-xs font-semibold text-zinc-600 uppercase mb-1">
            Enter 6-Digit Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={() => loginWithCode({ code })}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm cursor-pointer"
            >
              Log In
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-zinc-200"></div>
          <span className="flex-shrink mx-3 text-xs text-zinc-400">or</span>
          <div className="flex-grow border-t border-zinc-200"></div>
        </div>

        {/* Privy 1-Click Login Dialog (Invokes Privy SDK login method directly) */}
        <button
          onClick={login}
          className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-medium transition cursor-pointer"
        >
          Sign In with Privy Modal
        </button>
      </div>
    </div>
  );
}
