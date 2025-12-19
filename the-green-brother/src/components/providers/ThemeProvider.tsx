// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Theme Provider Module
 *
 * Context provider for theme management across the application.
 * Handles SSR-safe theme initialization and provides theme context to children.
 */

'use client'

import { createContext, useContext, type ReactNode } from 'react'

import { useTheme, type UseThemeReturn } from '@/lib/themes'

/**
 * Theme context value - same as UseThemeReturn
 */
type ThemeContextValue = UseThemeReturn

const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * Props for the ThemeProvider component
 */
export interface ThemeProviderProps {
  /** Child components to receive theme context */
  children: ReactNode
}

/**
 * Theme context provider component
 *
 * Wraps the application to provide theme state to all child components.
 * Handles theme initialization, persistence, and system preference detection.
 * @param props - Component props
 * @param props.children - Child components to wrap
 * @returns Provider component with theme context
 * @example
 * ```tsx
 * // In layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <ThemeProvider>{children}</ThemeProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeValue = useTheme()

  return <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>
}

/**
 * Hook to access theme context
 *
 * Must be used within a ThemeProvider. Throws an error if used outside.
 * @returns Theme context value with theme state and controls
 * @throws {Error} If used outside of ThemeProvider
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const { theme, setTheme } = useThemeContext()
 *   return <button onClick={() => setTheme('dark')}>Set Dark</button>
 * }
 * ```
 */
export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}
