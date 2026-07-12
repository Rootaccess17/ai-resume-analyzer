"use client";

import Link from "next/link";
import { Sun, Moon, ScanSearch, FileCheck2, Mail } from "lucide-react";
import { useTheme } from "@/lib/useTheme";

export default function HomePage() {
  const { darkMode, toggleDarkMode } = useTheme();

  const features = [
    {
      icon: ScanSearch,
      title: "ATS Scoring",
      desc: "Get a precise match score against real ATS filters, tailored to your target role.",
    },
    {
      icon: FileCheck2,
      title: "Keyword Gaps",
      desc: "See exactly which keywords, skills, and formatting issues are holding you back.",
    },
    {
      icon: Mail,
      title: "Emailed Reports",
      desc: "A downloadable PDF report, delivered straight to your inbox every time.",
    },
  ];

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center text-slate-900 dark:text-white px-4 text-center"
      style={{
        backgroundImage: darkMode
          ? "linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.65) 18%, rgba(9,9,11,0.85) 38%, #09090b 50%, rgba(9,9,11,0.85) 62%, rgba(0,0,0,0.65) 82%, rgba(0,0,0,0.95) 100%), url('/hero-bg.jpg')"
          : "linear-gradient(to right, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.55) 18%, rgba(248,250,252,0.80) 38%, #f8fafc 50%, rgba(248,250,252,0.80) 62%, rgba(15,23,42,0.55) 82%, rgba(15,23,42,0.92) 100%), url('/hero-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <button
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-indigo-600 dark:text-amber-400 shadow-sm"
      >
        {darkMode ? <Sun size={14} /> : <Moon size={14} />}{" "}
        {darkMode ? "Light" : "Dark"}
      </button>

      <div className="max-w-2xl py-16">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-2xl mb-6 shadow-xl shadow-indigo-600/20">
          AI
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Optimize Your Resume For{" "}
          <span className="text-indigo-600">AI Screeners</span>
        </h1>

        <p className="text-base md:text-lg font-medium text-slate-800 dark:text-zinc-200 mb-4 max-w-lg mx-auto [text-shadow:0_1px_3px_rgba(255,255,255,0.5)] dark:[text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
          Upload your resume, discover hidden ATS formatting flaws, identify
          missing keywords, and get an emailed, downloadable report — powered by
          Gemini AI.
        </p>

        <p className="font-bold text-indigo-700 dark:text-indigo-400 mb-10 text-sm md:text-base">
          Built for job seekers who want real, role-specific feedback — not
          generic advice.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            href="/signup"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-sm"
          >
            Get Started For Free
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 font-semibold px-8 py-3 rounded-xl transition-all text-sm shadow-sm"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-5 rounded-2xl border bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm"
            >
              <Icon className="text-indigo-600 mb-2" size={20} />
              <h3 className="font-bold text-sm mb-1 text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
