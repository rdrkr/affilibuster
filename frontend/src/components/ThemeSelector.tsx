// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Theme Selector Component
 * Allows users to switch between light, dark, and system theme modes
 */

'use client'

import { Dropdown, type DropdownItem } from '@/components/Dropdown'
import { getNavigation } from '@/lib/client'
import type { Navigation } from '@/lib/types'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useEffect, useState, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark' | 'system'

const themeIcons: Record<Theme, ReactNode> = {
  light: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  dark: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  ),
  system: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
        clipRule="evenodd"
      />
    </svg>
  ),
}

/**
 * Helper function to apply theme to document
 * @param newTheme - Theme to apply
 */
function applyTheme(newTheme: Theme): void {
  const root = document.documentElement

  // Determine if should be dark mode
  let isDark = false

  if (newTheme === 'dark') {
    localStorage.theme = 'dark'
    isDark = true
  } else if (newTheme === 'light') {
    localStorage.theme = 'light'
    isDark = false
  } else {
    // System mode - remove theme from localStorage
    localStorage.removeItem('theme')
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  root.classList.remove('light', 'dark')
  root.classList.add(isDark ? 'dark' : 'light')
}

export function ThemeSelector() {
  const pathname = usePathname()
  const [navData, setNavData] = useState<Navigation | null>(null)

  // Use lazy initialization for theme
  const [theme, setTheme] = useState<Theme>(() => {
    // This code only runs on the client after mount
    /* istanbul ignore next */
    if (typeof window === 'undefined') return 'system'
    const savedTheme = localStorage.getItem('theme') as Theme | null
    return savedTheme ?? 'system'
  })

  // Track if we're on the client using useSyncExternalStore
  /* istanbul ignore next - useSyncExternalStore callbacks are not fully testable in Jest */
  const isClient = useSyncExternalStore(
    () => {
      return () => {
        // No-op unsubscribe function
      }
    },
    () => true, // getSnapshot for client
    () => false // getServerSnapshot for SSR
  )

  // Apply theme on mount and listen for system changes
  useEffect(() => {
    // Apply the theme (already in state from lazy initialization)
    applyTheme(theme)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      // Only respond to system changes if user has selected 'system' mode
      if (!('theme' in localStorage)) {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [theme])

  // Fetch navigation labels from CMS
  useEffect(() => {
    async function fetchNavigation() {
      try {
        const navContent = await getNavigation()
        if (navContent) {
          setNavData(navContent)
        }
      } catch (error) {
        console.error('Failed to fetch navigation:', error)
      }
    }
    void fetchNavigation()
  }, [pathname])

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  // Don't render until client-side hydration is complete
  if (!isClient || !navData) {
    return <div className="w-32 h-10 bg-primary-700 animate-pulse rounded-lg" />
  }

  const themes: DropdownItem<Theme>[] = [
    {
      value: 'light',
      label: navData.themeLightLabel ?? 'Light',
      icon: themeIcons.light,
    },
    {
      value: 'dark',
      label: navData.themeDarkLabel ?? 'Dark',
      icon: themeIcons.dark,
    },
    {
      value: 'system',
      label: navData.themeSystemLabel ?? 'System',
      icon: themeIcons.system,
    },
  ]

  return (
    <Dropdown
      value={theme}
      items={themes}
      onChange={handleThemeChange}
      ariaLabel={navData.themeSelectorAriaLabel ?? 'Select theme'}
      buttonClassName="flex items-center space-x-2 px-3 py-2 bg-primary-900 hover:bg-primary-800 text-white rounded-lg transition-colors shadow-sm whitespace-nowrap h-10"
      renderTrigger={selectedItem => (
        <div className="flex items-center gap-2">
          {selectedItem?.icon}
          <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
      renderItem={(item, isSelected) => (
        <div className="flex items-center gap-3">
          {item.icon}
          <span>{item.label}</span>
          {isSelected && (
            <svg className="w-4 h-4 ml-auto text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      )}
    />
  )
}
