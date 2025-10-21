// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Locale Provider Component
 * Reference: T118 (LocaleProvider wrapper)
 * Context provider for locale data throughout the app
 */

'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { languagesAPI } from '@/lib/api'

interface LocaleContextValue {
  locale: string
  direction: 'ltr' | 'rtl'
  language: Language | null
  setLocale: (locale: string) => void
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  direction: 'ltr',
  language: null,
  setLocale: () => {},
})

interface LocaleProviderProps {
  children: ReactNode
  initialLocale?: string
}

export function LocaleProvider({ children, initialLocale = 'en' }: LocaleProviderProps) {
  const [locale, setLocale] = useState(initialLocale)
  const [language, setLanguage] = useState<Language | null>(null)

  useEffect(() => {
    // Fetch language details
    languagesAPI
      .getAll()
      .then(languages => {
        const found = languages.find(l => l.code === locale)
        setLanguage(found || null)
      })
      .catch(console.error)
  }, [locale])

  const direction = language?.direction || 'ltr'

  return <LocaleContext.Provider value={{ locale, direction, language, setLocale }}>{children}</LocaleContext.Provider>
}

/**
 * Hook to access locale context
 */
export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
