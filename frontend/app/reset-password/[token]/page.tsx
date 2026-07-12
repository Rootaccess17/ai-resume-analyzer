'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Sun, Moon } from 'lucide-react';
import API from '@/lib/api';
import { useTheme } from '@/lib/useTheme';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await API.post(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Reset failed. The link may have expired.');
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reset Password</h2>
          <p className="text-xs mt-1 text-slate-500 dark:text-zinc-400">Enter your new password below.</p>
        </div>

        {success ? (
          <p className="text-center text-sm text-emerald-600 font-medium">
            Password reset successful! Redirecting you to sign in...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-slate-700 dark:text-zinc-300">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border text-sm outline-none bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-slate-700 dark:text-zinc-300">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border text-sm outline-none bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all text-sm disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <p className="text-center text-xs text-slate-600 dark:text-zinc-400">
              <Link href="/login" className="text-indigo-600 font-semibold hover:underline">Back to Sign In</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}