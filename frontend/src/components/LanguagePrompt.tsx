// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Language Prompt Component
 * Reference: T111 (LanguagePrompt component)
 * Prompts users to switch to their detected language
 */

'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getNavigation, getLanguages, detectLanguage, getUserPreferences, updateUserPreferences } from '@/lib/client'
import { useSession } from '@/hooks/useSession'
import type { Language } from '@/lib/types'
import { LanguageCode, SUPPORTED_LANGUAGE_CODES } from '@/lib/types'

interface NavigationData {
  promptTitleTemplate?: string
  promptMessageTemplate?: string
  yesButtonTemplate?: string
  noButtonText?: string
}

export function LanguagePrompt() {
  const sessionId = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [show, setShow] = useState(false)
  const [detectedLang, setDetectedLang] = useState<string | null>(null)
  const [detectedLanguage, setDetectedLanguage] = useState<Language | null>(null)
  const [navData, setNavData] = useState<NavigationData>({})

  useEffect(() => {
    if (!sessionId) return

    // Extract current language from pathname
    const pathParts = pathname.split('/').filter(Boolean)
    const firstSegment = pathParts[0]
    let lang = LanguageCode.EN
    if (firstSegment === LanguageCode.IT) lang = LanguageCode.IT
    else if (firstSegment === LanguageCode.HE) lang = LanguageCode.HE

    // Fetch navigation data from CMS
    void getNavigation()
      .then(navContent => {
        if (navContent) {
          setNavData(navContent)
        }
      })
      .catch(console.error)

    // Check preferences and detect language
    void getUserPreferences()
      .then(prefs => {
        // Don't show if user already dismissed
        if (!prefs || prefs.dismissedLanguagePrompt) return

        // Detect language from browser
        void detectLanguage(navigator.language, navigator.userAgent)
          .then(async result => {
            if (!result) return

            if (result.shouldPrompt && result.detectedLanguage !== lang) {
              setDetectedLang(result.detectedLanguage)

              // Get language details
              const languages = await getLanguages()
              const detected = languages.find(l => l.code === result.detectedLanguage)
              setDetectedLanguage(detected ?? null)
              setShow(true)
            }
          })
          .catch(console.error)
      })
      .catch(console.error)
  }, [sessionId, pathname])

  const handleAccept = async () => {
    if (!detectedLang || !detectedLanguage) return

    try {
      // Update preferences
      await updateUserPreferences({
        dismissedLanguagePrompt: true,
        detectedLanguage: detectedLanguage.code,
      })

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
      await updateUserPreferences({ dismissedLanguagePrompt: true })
      setShow(false)
    } catch (error) {
      console.error('Failed to dismiss prompt:', error)
    }
  }

  // Only show if CMS data is fully loaded with all required fields
  if (
    !show ||
    !detectedLanguage ||
    !navData.promptTitleTemplate ||
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
      <div className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-auto sm:right-4 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-t-lg sm:rounded-lg shadow-xl p-6 max-w-md sm:max-w-sm z-50 animate-slide-up">
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
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">{messageText}</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  void handleAccept()
                }}
                className="px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors font-medium"
              >
                {yesButtonText}
              </button>
              <button
                onClick={() => {
                  void handleDismiss()
                }}
                className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
              >
                {noButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
