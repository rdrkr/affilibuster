// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Language Prompt Component
 * Reference: T111 (LanguagePrompt component)
 * Prompts users to switch to their detected language
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { languagesAPI, preferencesAPI } from '@/lib/api';
import { useSession } from '@/hooks/useSession';
import { Language } from '@/types/api';

export function LanguagePrompt() {
  const sessionId = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<Language | null>(null);
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    if (!sessionId) return;

    // Extract current language from pathname
    const pathParts = pathname.split('/').filter(Boolean);
    const firstSegment = pathParts[0];
    let lang = 'en';
    if (firstSegment === 'it') lang = 'it';
    else if (firstSegment === 'he') lang = 'he';
    setCurrentLang(lang);

    // Check preferences and detect language
    preferencesAPI
      .get()
      .then((prefs) => {
        // Don't show if user already dismissed
        if (prefs.dismissedLanguagePrompt) return;

        // Detect language from browser
        languagesAPI
          .detect({
            acceptLanguage: navigator.language,
            userAgent: navigator.userAgent,
          })
          .then(async (result) => {
            if (result.shouldPrompt && result.detectedLanguage !== lang) {
              setDetectedLang(result.detectedLanguage);

              // Get language details
              const languages = await languagesAPI.getAll();
              const detected = languages.find((l) => l.code === result.detectedLanguage);
              setDetectedLanguage(detected || null);
              setShow(true);
            }
          })
          .catch(console.error);
      })
      .catch(console.error);
  }, [sessionId, pathname]);

  const handleAccept = async () => {
    if (!detectedLang || !detectedLanguage) return;

    try {
      // Update preferences
      await preferencesAPI.update({
        dismissedLanguagePrompt: true,
        detectedLanguage: detectedLang,
      });

      // Navigate to detected language
      const pathParts = pathname.split('/').filter(Boolean);
      const isCurrentPathLangPrefixed = pathParts[0] === 'it' || pathParts[0] === 'he' || pathParts[0] === 'en';
      const pathWithoutLang = isCurrentPathLangPrefixed
        ? '/' + pathParts.slice(1).join('/')
        : pathname;

      const newPath = detectedLanguage.urlPrefix
        ? `${detectedLanguage.urlPrefix}${pathWithoutLang || '/'}`
        : pathWithoutLang || '/';

      router.push(newPath);
      setShow(false);
    } catch (error) {
      console.error('Failed to switch language:', error);
    }
  };

  const handleDismiss = async () => {
    try {
      await preferencesAPI.update({ dismissedLanguagePrompt: true });
      setShow(false);
    } catch (error) {
      console.error('Failed to dismiss prompt:', error);
    }
  };

  if (!show || !detectedLanguage) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" aria-hidden="true" />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-auto sm:right-4 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-t-lg sm:rounded-lg shadow-xl p-6 max-w-md sm:max-w-sm z-50 animate-slide-up">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-secondary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
              Switch to {detectedLanguage.nativeName}?
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              We detected you might prefer viewing this site in {detectedLanguage.displayName}.
              Would you like to switch?
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAccept}
                className="px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors font-medium"
              >
                Yes, switch to {detectedLanguage.nativeName}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
              >
                No thanks
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
