// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Theme Selector Component
 * Allows users to switch between light, dark, and system theme modes
 */

'use client';

import { useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function ThemeSelector() {
  const [theme, setTheme] = useState<Theme>('system');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const currentTheme: Theme = (savedTheme as Theme) || 'system';
    setTheme(currentTheme);
    applyTheme(currentTheme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      // Only respond to system changes if user has selected 'system' mode
      if (!('theme' in localStorage)) {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;

    // Determine if should be dark mode
    let isDark = false;

    if (newTheme === 'dark') {
      localStorage.theme = 'dark';
      isDark = true;
    } else if (newTheme === 'light') {
      localStorage.theme = 'light';
      isDark = false;
    } else {
      // System mode - remove theme from localStorage
      localStorage.removeItem('theme');
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    root.classList.remove('light', 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    setIsOpen(false);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="w-32 h-10 bg-primary-700 animate-pulse rounded-lg" />
    );
  }

  const themes: { value: Theme; label: string; icon: ReactNode }[] = [
    {
      value: 'light',
      label: 'Light',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      ),
    },
    {
      value: 'system',
      label: 'System',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  const currentTheme = themes.find((t) => t.value === theme);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-primary-700 hover:bg-primary-600 text-white rounded-lg transition-colors shadow-sm"
        aria-label="Select theme"
        aria-expanded={isOpen}
      >
        {currentTheme?.icon}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-neutral-800 border border-primary-200 dark:border-primary-700 rounded-lg shadow-xl z-20 overflow-hidden">
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => handleThemeChange(themeOption.value)}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors flex items-center gap-3 ${
                  themeOption.value === theme
                    ? 'bg-primary-50 dark:bg-primary-900 font-medium text-primary-700 dark:text-primary-300'
                    : 'text-neutral-700 dark:text-neutral-200'
                }`}
              >
                {themeOption.icon}
                <span>{themeOption.label}</span>
                {themeOption.value === theme && (
                  <svg
                    className="w-4 h-4 ml-auto text-secondary-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
