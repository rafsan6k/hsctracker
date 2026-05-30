'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'studyflow-theme';
type Theme = 'light' | 'dark';

function getPreferredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  const color = theme === 'dark' ? '#0f0d15' : '#f7f7fb';
  if (meta) meta.setAttribute('content', color);
}

export default function ThemeToggle({ variant = 'default', className = '' }: { variant?: 'default' | 'icon'; className?: string }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const isDark = theme === 'dark';

  useEffect(() => {
    const initial = getPreferredTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggleTheme = () => {
    const next: Theme = isDark ? 'light' : 'dark';
    setTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={!isDark}
      className={`theme-toggle ${variant === 'icon' ? 'theme-toggle--icon' : ''} ${className}`.trim()}
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb">
          <span className="material-symbols-rounded theme-toggle__icon">
            {isDark ? 'dark_mode' : 'light_mode'}
          </span>
        </span>
      </span>
      {variant !== 'icon' && (
        <span className="theme-toggle__label">{isDark ? 'Dark' : 'Light'} mode</span>
      )}
    </button>
  );
}
