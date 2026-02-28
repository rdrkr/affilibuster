// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

import { ApiNavigationNavigationDocument, LanguageCode, DirectionEnum } from '@/lib/generated/types.gen'
import { createContext, ReactNode, useContext, useEffect } from 'react'

interface LayoutContextType {
  /** Current language code */
  lang: LanguageCode
  /** Text direction for RTL/LTR layout */
  direction: DirectionEnum
  /** Navigation data from CMS */
  navigation: ApiNavigationNavigationDocument | null
}

const LayoutContext = createContext<LayoutContextType | null>(null)

/**
 * Hook to access layout context data (lang, direction, navigation).
 * Must be used within a LayoutProvider.
 * @returns Layout context data
 */
export const useLayoutContext = () => {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider')
  }
  return context
}

interface LayoutProviderProps extends LayoutContextType {
  children: ReactNode
}

/**
 * Provider component for layout context.
 * Wraps the application to provide global access to lang, direction, and navigation data.
 * @param root0 - Component props
 * @param root0.children - Child components to render
 * @param root0.lang - Current language code
 * @param root0.direction - Text direction
 * @param root0.navigation - Navigation data
 * @returns Layout provider wrapping children
 */
export function LayoutProvider({ children, lang, direction, navigation }: LayoutProviderProps) {
  // Sync html element attributes when language/direction changes via client-side navigation.
  // The root layout's inline script only runs on initial page load, so client-side
  // route changes (e.g., language switch) need this effect to keep the DOM in sync.
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = direction === DirectionEnum.RTL ? 'rtl' : 'ltr'
  }, [lang, direction])

  return <LayoutContext.Provider value={{ lang, direction, navigation }}>{children}</LayoutContext.Provider>
}
