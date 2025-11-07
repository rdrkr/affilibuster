// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Locale Provider Component
 * Reference: T118 (LocaleProvider wrapper)
 * Context provider for locale data throughout the app
 */

'use client'

import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { getLanguages } from '@/lib/client'
import type { Language, LanguageCode } from '@/lib/types'
import { Direction, DEFAULT_LANGUAGE_CODE } from '@/lib/types'

interface LocaleContextValue {
  locale: string
  direction: Direction
  language: Language | null
  setLocale: (locale: string) => void
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LANGUAGE_CODE,
  direction: Direction.LTR,
  language: null,
  // Default no-op setLocale - will be overridden by LocaleProvider
  setLocale: () => {
    // Intentionally empty default implementation
  },
})

interface LocaleProviderProps {
  children: ReactNode
  initialLocale?: string
}

export function LocaleProvider({ children, initialLocale = DEFAULT_LANGUAGE_CODE }: LocaleProviderProps) {
  const [locale, setLocale] = useState(initialLocale)
  const [language, setLanguage] = useState<Language | null>(null)

  useEffect(() => {
    // Fetch language details
    void getLanguages()
      .then(languages => {
        const found = languages.find(l => l.code === (locale as LanguageCode))
        setLanguage(found ?? null)
      })
      .catch(console.error)
  }, [locale])

  const direction: Direction = language?.direction ?? Direction.LTR

  return <LocaleContext.Provider value={{ locale, direction, language, setLocale }}>{children}</LocaleContext.Provider>
}

/**
 * Hook to access locale context
 */
export function useLocale() {
  return useContext(LocaleContext)
}
