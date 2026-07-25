'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';
import API from '@/lib/api';
import { useTheme } from '@/lib/useTheme';

const ROLES = [
  'General', 'Software Developer', 'Full Stack Developer', 'Frontend Developer',
  'Backend Developer', 'Mobile App Developer', 'Desktop Application Developer',
  'Game Developer', 'Data Scientist', 'Data Analyst', 'DevOps Engineer',
  'Machine Learning Engineer', 'UI/UX Designer', 'QA / Test Engineer', 'Product Manager',
];

export default function DashboardPage() {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();
  const [view, setView] = useState('upload');
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('General');
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const { data } = await API.get('/resume/history');
        setHistory(data);
      } catch {
        alert('Could not load history');
      } finally {
        setLoadingHistory(false);
      }
    };

    if (view === 'history') fetchHistory();
  }, [view]);

  const acceptFile = (f: File) => {
    if (f.type !== 'application/pdf') {
      alert('Only PDF files are supported');
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', targetRole);
    try {
      const { data } = await API.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Safely extract result regardless of backend wrapper structure
      const analysisResult = data.data || data.scan || data;
      setResult(analysisResult);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownload = async (id: string) => {
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

  const scoreColor =
    result && result.atsScore >= 75 ? 'text-emerald-600' : result && result.atsScore >= 50 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-8 py-4 border-b bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {view === 'upload' ? 'ATS Audit Workspace' : 'Your Scan History'}
        </h1>
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

      <div className="max-w-3xl mx-auto px-8 pt-6 flex gap-2">
        <button
          onClick={() => setView('upload')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold ${
            view === 'upload' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800'
          }`}
        >
          Audit Workspace
        </button>
        <button
          onClick={() => setView('history')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold ${
            view === 'history' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800'
          }`}
        >
          Scan History
        </button>
      </div>

      <div className="p-8 max-w-3xl mx-auto space-y-6">

        {view === 'upload' && (
          <>
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-slate-700 dark:text-zinc-300">Target Job Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:border-indigo-600"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">The AI will tailor its scoring and feedback to this role.</p>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files[0]) acceptFile(e.dataTransfer.files[0]);
              }}
              className={`border-2 border-dashed rounded-2xl p-10 text-center relative ${
                isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
              }`}
            >
              <input
                type="file" accept=".pdf"
                onChange={(e) => e.target.files && e.target.files[0] && acceptFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {file ? (
                <p className="text-sm font-semibold text-indigo-600">{file.name}</p>
              ) : (
                <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Drag & drop your resume here, or click to browse</p>
              )}
            </div>

            {file && !result && (
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl disabled:opacity-50"
              >
                {analyzing ? 'Analyzing...' : 'Run ATS Analysis'}
              </button>
            )}

            {result && (
              <div className="space-y-5">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <p className="text-xs font-bold uppercase text-slate-500 dark:text-zinc-400 mb-1">
                    ATS Match Score — {result.targetRole}
                  </p>
                  <p className={`text-3xl font-extrabold ${scoreColor}`}>{result.atsScore}%</p>
                  <p className="text-sm text-slate-700 dark:text-zinc-300 mt-3">{result.summary}</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-2">Strengths</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-zinc-300">
                    {result.strengths && result.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-2">Improvement Areas</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-zinc-300">
                    {result.improvementAreas && result.improvementAreas.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Missing Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords && result.missingKeywords.map((k: string, i: number) => (
                      <span key={i} className="px-3 py-1 text-xs font-medium rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30">
                        + {k}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Formatting Issues</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-zinc-300">
                    {result.formattingIssues && result.formattingIssues.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400 mb-2">Actionable Tips</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-zinc-300">
                    {result.actionableTips && result.actionableTips.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-500/10 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-500/30">
                  <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-2">Final Recommendation</p>
                  <p className="text-sm text-indigo-900 dark:text-indigo-200">{result.finalRecommendation}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownload(result._id)}
                    className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl"
                  >
                    Download PDF Report
                  </button>
                  <button
                    onClick={() => { setFile(null); setResult(null); }}
                    className="border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold px-6 py-3 rounded-xl"
                  >
                    Analyze Another
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {view === 'history' && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
            {loadingHistory ? (
              <p className="p-8 text-center text-sm text-slate-500 dark:text-zinc-400">Loading history...</p>
            ) : history.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500 dark:text-zinc-400">No scans yet — upload a resume to get started.</p>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="text-xs uppercase font-bold text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60">
                    <th className="px-5 py-3">File</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Score</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-right">Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {history.map((scan) => (
                    <tr key={scan._id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                      <td className="px-5 py-3 font-medium text-slate-800 dark:text-zinc-200 max-w-[160px] truncate">{scan.fileName}</td>
                      <td className="px-5 py-3 text-slate-600 dark:text-zinc-400">{scan.targetRole || 'General'}</td>
                      <td className="px-5 py-3">
                        <span className={`font-bold ${scan.atsScore >= 75 ? 'text-emerald-600' : scan.atsScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                          {scan.atsScore}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 dark:text-zinc-500 text-xs">{new Date(scan.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDownload(scan._id)}
                          className="text-xs font-semibold text-indigo-600 hover:underline"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}