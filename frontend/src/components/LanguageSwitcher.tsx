// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Language Switcher Component
 * Reference: T109 (LanguageSwitcher component)
 * Allows users to switch between available languages
 */

'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getLanguages, getNavigation } from '@/lib/client'
import type { Language } from '@/lib/types'
import { LanguageCode, DEFAULT_LANGUAGE_CODE } from '@/lib/types'

interface NavigationData {
  languageSelectorAriaLabel?: string
}

export function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const [languages, setLanguages] = useState<Language[] | null>(null)
  const [currentLang, setCurrentLang] = useState(DEFAULT_LANGUAGE_CODE)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [navData, setNavData] = useState<NavigationData>({})

  useEffect(() => {
    // Extract current language from pathname (e.g., /it/products -> it, /he/products -> he)
    const pathParts = pathname.split('/').filter(Boolean)
    const firstSegment = pathParts[0]
    // Map URL prefixes to language codes
    let lang = DEFAULT_LANGUAGE_CODE
    if (firstSegment === LanguageCode.IT) lang = LanguageCode.IT
    else if (firstSegment === LanguageCode.HE) lang = LanguageCode.HE
    setCurrentLang(lang)

    // Fetch available languages and navigation data
    Promise.all([getLanguages(), getNavigation().catch(() => null)])
      .then(([languagesData, navContent]) => {
        setLanguages(languagesData)
        if (navContent) {
          setNavData(navContent)
        }
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false)
      })
  }, [pathname])

  const handleLanguageChange = (newLang: string) => {
    // Get the path without the language prefix
    const pathParts = pathname.split('/').filter(Boolean)

    // Check if first segment is a language prefix (it, he, or en)
    const knownPrefixes = Object.values(LanguageCode)
    const isCurrentPathLangPrefixed = pathParts[0] ? knownPrefixes.includes(pathParts[0] as LanguageCode) : false
    const pathWithoutLang = isCurrentPathLangPrefixed ? '/' + pathParts.slice(1).join('/') : pathname

    // Get the new language configuration
    /* istanbul ignore next -- Defensive code: UI prevents calling this when languages is null (dropdown only renders when languages exists) */
    if (!languages) {
      console.error('Languages not loaded')
      return
    }
    const language = languages.find(l => l.code === (newLang as LanguageCode))
    if (!language) {
      console.error(`Language ${newLang} not found`)
      return
    }

    // Construct new path with language prefix
    // All languages now have explicit prefixes: /en /it /he
    let newPath: string
    if (language.urlPrefix) {
      const basePath = pathWithoutLang === '/' ? '' : pathWithoutLang
      newPath = `${language.urlPrefix}${basePath}`
    } else {
      // Fallback for languages without urlPrefix (shouldn't happen)
      newPath = pathWithoutLang
    }

    // Ensure we have at least '/' for root paths
    if (!newPath || newPath === '') {
      newPath = '/'
    }

    // Use router.push for language switching
    router.push(newPath)
    router.refresh() // Refresh to ensure content is reloaded
    setIsOpen(false)
  }

  if (loading || !languages) {
    return <div className="w-32 h-10 bg-primary-700 animate-pulse rounded-lg" />
  }

  const currentLanguage = languages.find(l => l.code === currentLang)

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        className="flex items-center space-x-2 px-4 py-2 bg-primary-700 hover:bg-primary-600 text-white rounded-lg transition-colors shadow-sm whitespace-nowrap"
        aria-label={navData.languageSelectorAriaLabel ?? ''}
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium">{currentLanguage?.nativeName}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setIsOpen(false)
            }}
            aria-hidden="true"
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 border border-primary-200 dark:border-primary-700 rounded-lg shadow-xl z-20 overflow-hidden">
            {languages.map(language => (
              <button
                key={language.code}
                onClick={() => {
                  handleLanguageChange(language.code)
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors ${
                  language.code === currentLang
                    ? 'bg-primary-50 dark:bg-primary-900 font-medium text-primary-700 dark:text-primary-300'
                    : 'text-neutral-700 dark:text-neutral-200'
                }`}
                dir={language.direction}
              >
                <div className="flex items-center justify-between">
                  <span>{language.nativeName}</span>
                  {language.code === currentLang && (
                    <svg className="w-4 h-4 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
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
  )
}
