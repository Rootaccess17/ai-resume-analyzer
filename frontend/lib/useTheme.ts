'use client';

import { useEffect, useState } from 'react';

export function useTheme() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    setDarkMode(saved === 'dark');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return { darkMode, toggleDarkMode: () => setDarkMode((d) => !d) };
}