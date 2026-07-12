'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sun, Moon, Users, FileText, TrendingUp } from 'lucide-react';
import API from '@/lib/api';
import { useTheme } from '@/lib/useTheme';

export default function AdminPage() {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, totalScans: 0, avgScore: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);

  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      router.replace('/login');
      return;
    }
    const user = JSON.parse(rawUser);
    if (user.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }
    setAuthorized(true);

    (async () => {
      try {
        const { data } = await API.get('/admin/dashboard');
        setStats({ totalUsers: data.totalUsers, totalScans: data.totalScans, avgScore: data.avgScore });
        setUsers(data.users);
        setResumes(data.allResumes);
      } catch (err: any) {
        alert(err?.response?.data?.message || 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleDownload = async (id: string, fileName: string) => {
    try {
      const res = await API.get(`/resume/download/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `ATS_Report_${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Download failed');
    }
  };

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-zinc-400">Checking access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-8 py-4 border-b bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-indigo-600 dark:text-amber-400"
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />} {darkMode ? 'Light' : 'Dark'}
          </button>
          <button onClick={handleLogout} className="text-sm font-medium text-red-500">Sign Out</button>
        </div>
      </header>

      <div className="p-8 max-w-6xl mx-auto space-y-8">
        {loading ? (
          <p className="text-center text-sm text-slate-500 dark:text-zinc-400 py-10">Loading admin data...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: Users },
                { label: 'Total Scans', value: stats.totalScans, icon: FileText },
                { label: 'Average Score', value: `${stats.avgScore}%`, icon: TrendingUp },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="p-6 rounded-2xl border bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 uppercase font-bold">{label}</p>
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase text-slate-500 dark:text-zinc-400 mb-3">
                All Users ({users.length})
              </h2>
              <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="text-xs uppercase font-bold text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60">
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                        <td className="px-6 py-3 font-medium text-slate-800 dark:text-zinc-200">{u.name}</td>
                        <td className="px-6 py-3 text-slate-600 dark:text-zinc-400">{u.email}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            u.role === 'admin' ? 'bg-indigo-600/10 text-indigo-600' : 'bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-slate-500 dark:text-zinc-500 text-xs">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase text-slate-500 dark:text-zinc-400 mb-3">
                All Resume Scans ({resumes.length})
              </h2>
              <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="text-xs uppercase font-bold text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60">
                      <th className="px-6 py-3">File</th>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Score</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3 text-right">Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {resumes.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                        <td className="px-6 py-3 font-medium text-slate-800 dark:text-zinc-200 max-w-[180px] truncate">{r.fileName}</td>
                        <td className="px-6 py-3 text-slate-600 dark:text-zinc-400">
                          {r.userId ? `${r.userId.name} (${r.userId.email})` : 'Unknown'}
                        </td>
                        <td className="px-6 py-3 text-slate-600 dark:text-zinc-400">{r.targetRole || 'General'}</td>
                        <td className="px-6 py-3">
                          <span className={`font-bold ${r.atsScore >= 75 ? 'text-emerald-600' : r.atsScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                            {r.atsScore}%
                          </span>
                        </td>
                        <td className="px-6 py-3 text-slate-500 dark:text-zinc-500 text-xs">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => handleDownload(r._id, r.fileName)}
                            className="text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}