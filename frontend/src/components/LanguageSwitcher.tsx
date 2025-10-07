// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Language Switcher Component
 * Reference: T109 (LanguageSwitcher component)
 * Allows users to switch between available languages
 */

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { languagesAPI } from '@/lib/api';
import { Language } from '@/types/api';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [currentLang, setCurrentLang] = useState('en');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract current language from pathname (e.g., /it/products -> it)
    const pathParts = pathname.split('/').filter(Boolean);
    const lang = pathParts[0] === 'it' || pathParts[0] === 'he' ? pathParts[0] : 'en';
    setCurrentLang(lang);

    // Fetch available languages
    languagesAPI
      .getAll()
      .then(setLanguages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLanguageChange = (newLang: string) => {
    // Get the path without the language prefix
    const pathParts = pathname.split('/').filter(Boolean);
    const isCurrentPathLangPrefixed = pathParts[0] === 'it' || pathParts[0] === 'he';
    const pathWithoutLang = isCurrentPathLangPrefixed
      ? '/' + pathParts.slice(1).join('/')
      : pathname;

    // Construct new path with new language
    const language = languages.find((l) => l.code === newLang);
    const newPath = language?.urlPrefix
      ? `${language.urlPrefix}${pathWithoutLang}`
      : pathWithoutLang;

    router.push(newPath || '/');
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
    );
  }

  const currentLanguage = languages.find((l) => l.code === currentLang);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium">
          {currentLanguage?.nativeName || 'English'}
        </span>
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
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  language.code === currentLang
                    ? 'bg-gray-50 dark:bg-gray-700 font-medium'
                    : ''
                }`}
                dir={language.direction}
              >
                <div className="flex items-center justify-between">
                  <span>{language.nativeName}</span>
                  {language.code === currentLang && (
                    <svg
                      className="w-4 h-4 text-blue-600"
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
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
