'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Sun, Moon } from 'lucide-react';
import API from '@/lib/api';
import { useTheme } from '@/lib/useTheme';

export default function SignupPage() {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = { name: '', email: '', password: '' };
    let isValid = true;
    if (name.trim().length < 2) { newErrors.name = 'Name must be at least 2 characters'; isValid = false; }
    if (!email.includes('@') || !email.includes('.')) { newErrors.email = 'Enter a valid email address'; isValid = false; }
    if (password.length < 6) { newErrors.password = 'Password must be at least 6 characters'; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { data } = await API.post('/auth/signup', { name, email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      alert('Account created successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Signup failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        backgroundImage: darkMode
          ? "linear-gradient(to right, rgba(30,27,75,0.95) 0%, rgba(30,27,75,0.65) 18%, rgba(9,9,11,0.85) 38%, #09090b 50%, rgba(9,9,11,0.85) 62%, rgba(30,27,75,0.65) 82%, rgba(30,27,75,0.95) 100%), url('/hero-bg.jpg')"
          : "linear-gradient(to right, rgba(67,56,202,0.85) 0%, rgba(67,56,202,0.45) 18%, rgba(248,250,252,0.80) 38%, #f8fafc 50%, rgba(248,250,252,0.80) 62%, rgba(67,56,202,0.45) 82%, rgba(67,56,202,0.85) 100%), url('/hero-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create Account</h2>
          <p className="text-xs mt-1 text-slate-500 dark:text-zinc-400">Optimize your resume for modern ATS screeners.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase mb-1.5 text-slate-700 dark:text-zinc-300">Full Name</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-600"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1.5 text-slate-700 dark:text-zinc-300">Email Address</label>
            <input
              type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com"
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-600"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1.5 text-slate-700 dark:text-zinc-300">Password</label>
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
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all text-sm disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>

        <p className="text-center text-xs mt-6 text-slate-600 dark:text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}