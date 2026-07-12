'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';
import API from '@/lib/api';
import { useTheme } from '@/lib/useTheme';

export default function ForgotPasswordPage() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || !email.includes('.')) {
      alert('Enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <button
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-indigo-600 dark:text-amber-400 shadow-sm"
      >
        {darkMode ? <Sun size={14} /> : <Moon size={14} />} {darkMode ? 'Light' : 'Dark'}
      </button>

      <div className="w-full max-w-md rounded-2xl p-8 border shadow-xl bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xl mb-3">
            AI
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Forgot Password</h2>
          <p className="text-xs mt-1 text-slate-500 dark:text-zinc-400">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-slate-700 dark:text-zinc-300">
              If an account exists for <strong>{email}</strong>, a password reset link has been sent.
              Check your inbox (and spam folder).
            </p>
            <Link href="/login" className="text-indigo-600 font-semibold hover:underline text-sm">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-slate-700 dark:text-zinc-300">Email Address</label>
              <input
                type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com"
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-600"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all text-sm disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <p className="text-center text-xs text-slate-600 dark:text-zinc-400">
              Remembered it?{' '}
              <Link href="/login" className="text-indigo-600 font-semibold hover:underline">Sign In</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}