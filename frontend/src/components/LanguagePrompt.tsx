// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Language Prompt Component
 * Reference: T111 (LanguagePrompt component)
 * Prompts users to switch to their detected language
 */

'use client'

import { detectLanguage, getLanguages, getNavigation, getUserPreferences, updateUserPreferences } from '@/lib/client'
import { useSession } from '@/lib/core/useSession'
import type { Language, Navigation } from '@/lib/types'
import { LanguageCode, SUPPORTED_LANGUAGE_CODES } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from './Button'

export function LanguagePrompt() {
  const sessionId = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [show, setShow] = useState(false)
  const [detectedLang, setDetectedLang] = useState<string | null>(null)
  const [detectedLanguage, setDetectedLanguage] = useState<Language | null>(null)
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null)
  const [navData, setNavData] = useState<Navigation | null>(null)

  useEffect(() => {
    // Component can work without session for E2E testing
    // sessionId is used for preference persistence but not required for display

    // Extract current language from pathname
    const pathParts = pathname.split('/').filter(Boolean)
    const firstSegment = pathParts[0]
    let lang = LanguageCode.EN
    if (firstSegment === LanguageCode.IT) lang = LanguageCode.IT
    else if (firstSegment === LanguageCode.HE) lang = LanguageCode.HE

    // Fetch languages and set current language
    void getLanguages()
      .then(languages => {
        const current = languages.find(l => l.code === lang)
        setCurrentLanguage(current ?? null)
      })
      .catch(console.error)

    // Fetch navigation data from CMS
    void getNavigation()
      .then(navContent => {
        if (navContent) {
          setNavData(navContent)
        }
      })
      .catch(console.error)

    // Check preferences and detect language
    const checkPreferencesAndDetect = async () => {
      try {
        const prefs = sessionId ? await getUserPreferences() : null
        // Don't show if user already dismissed (only check if session exists)
        if (prefs?.dismissedLanguagePrompt) return

        // Detect language from browser
        const result = await detectLanguage(navigator.language, navigator.userAgent)
        if (!result) return

        if (result.shouldPrompt && result.detectedLanguage !== lang) {
          setDetectedLang(result.detectedLanguage)

          // Get language details
          const languages = await getLanguages()
          const detected = languages.find(l => l.code === result.detectedLanguage)
          setDetectedLanguage(detected ?? null)
          setShow(true)
        }
      } catch (error) {
        console.error('Failed to check preferences and detect language:', error)
      }
    }

    void checkPreferencesAndDetect()
  }, [sessionId, pathname])

  const handleAccept = async () => {
    if (!detectedLang || !detectedLanguage) return

    try {
      // Update preferences only if session exists
      if (sessionId) {
        await updateUserPreferences({
          dismissedLanguagePrompt: true,
          detectedLanguage: detectedLanguage.code,
        })
      }

      // Navigate to detected language
      const pathParts = pathname.split('/').filter(Boolean)
      const isCurrentPathLangPrefixed = SUPPORTED_LANGUAGE_CODES.includes(pathParts[0] as LanguageCode)
      const pathWithoutLang = isCurrentPathLangPrefixed ? '/' + pathParts.slice(1).join('/') : pathname

      const newPath = detectedLanguage.urlPrefix
        ? `${detectedLanguage.urlPrefix}${pathWithoutLang || '/'}`
        : pathWithoutLang || '/'

      router.push(newPath)
      setShow(false)
    } catch (error) {
      console.error('Failed to switch language:', error)
    }
  }

  const handleDismiss = async () => {
    try {
      // Update preferences only if session exists
      if (sessionId) {
        await updateUserPreferences({ dismissedLanguagePrompt: true })
      }
      setShow(false)
    } catch (error) {
      console.error('Failed to dismiss prompt:', error)
    }
  }

  // Only show if CMS data is fully loaded with all required fields
  if (
    !show ||
    !detectedLanguage ||
    !navData?.promptTitleTemplate ||
    !navData.promptMessageTemplate ||
    !navData.yesButtonTemplate ||
    !navData.noButtonText
  )
    return null

  // Replace template variables with language names
  const titleText = navData.promptTitleTemplate.replace('{language}', detectedLanguage.nativeName)
  const messageText = navData.promptMessageTemplate.replace('{language}', detectedLanguage.displayName)
  const yesButtonText = navData.yesButtonTemplate.replace('{language}', detectedLanguage.nativeName)
  const noButtonText = navData.noButtonText

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" aria-hidden="true" />

      {/* Modal */}
      <div
        className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-auto sm:right-4 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-t-lg sm:rounded-lg shadow-xl p-6 max-w-md sm:max-w-sm z-50 animate-slide-up"
        data-testid="language-prompt"
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">{titleText}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">{messageText}</p>
            {currentLanguage && (
              <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-4">
                <span className="font-medium">Current:</span>{' '}
                <span data-testid="current-language">{currentLanguage.displayName}</span>
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  void handleAccept()
                }}
                data-testid={`accept-language-${detectedLanguage.displayName.toLowerCase()}`}
              >
                {yesButtonText}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  void handleDismiss()
                }}
                data-testid="dismiss-language-prompt"
              >
                {noButtonText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
