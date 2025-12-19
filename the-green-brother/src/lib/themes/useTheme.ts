// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Theme Hook Module
 *
 * Provides React hook for managing theme state (light/dark/system).
 * Handles localStorage persistence and system preference detection.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

/** Available theme modes */
export type ThemeMode = 'light' | 'dark' | 'system'

/** Storage key for theme preference */
const THEME_STORAGE_KEY = 'theme-preference'

/** Default theme mode */
const DEFAULT_THEME: ThemeMode = 'system'

/**
 * Resolves the actual theme based on mode and system preference
 * @param mode - The theme mode (light, dark, or system)
 * @returns The resolved theme (light or dark)
 */
function getResolvedTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'dark' // Default to dark if window is not available
  }
  return mode
}

/**
 * Gets the initial theme from localStorage
 * @returns The stored theme mode or default
 */
function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return DEFAULT_THEME
}

/**
 * Applies the theme to the document
 * @param mode - The theme mode to apply
 */
function applyTheme(mode: ThemeMode): void {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement

  // Resolve to actual theme (dark/light) for CSS dark: variant to work
  // The CSS uses @custom-variant dark (&:where([data-theme=dark], ...))
  const resolvedTheme = getResolvedTheme(mode)
  root.setAttribute('data-theme', resolvedTheme)
}

/**
 * Hook return type
 */
export interface UseThemeReturn {
  /** Current theme mode (light, dark, or system) */
  theme: ThemeMode
  /** Resolved theme based on mode and system preference */
  resolvedTheme: 'light' | 'dark'
  /** Updates the theme mode */
  setTheme: (theme: ThemeMode) => void
  /** Whether the theme is being initialized */
  isLoading: boolean
}

/**
 * React hook for managing theme state
 *
 * Provides theme mode, resolved theme, and setter function.
 * Persists preference to localStorage and applies theme to document.
 * @returns Theme state and controls
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const { theme, setTheme } = useTheme()
 *   return (
 *     <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
 *       Toggle Theme
 *     </button>
 *   )
 * }
 * ```
 */
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<ThemeMode>(DEFAULT_THEME)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark')
  const [isLoading, setIsLoading] = useState(true)

  // Initialize theme from localStorage on mount
  // This is a standard hydration pattern - reading from localStorage (client-only API) and syncing React state
  useEffect(() => {
    const stored = getStoredTheme()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration pattern: sync with localStorage on mount
    setThemeState(stored)
    setResolvedTheme(getResolvedTheme(stored))
    applyTheme(stored)
    setIsLoading(false)
  }, [])

  // Listen for system preference changes when in system mode
  useEffect(() => {
    if (theme !== 'system') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (event: MediaQueryListEvent): void => {
      const newResolved = event.matches ? 'dark' : 'light'
      setResolvedTheme(newResolved)
      // Also update the DOM so dark: variant activates
      document.documentElement.setAttribute('data-theme', newResolved)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  // Theme setter with persistence
  const setTheme = useCallback((newTheme: ThemeMode): void => {
    setThemeState(newTheme)
    setResolvedTheme(getResolvedTheme(newTheme))
    applyTheme(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  }, [])

  return {
    theme,
    resolvedTheme,
    setTheme,
    isLoading,
  }
}
