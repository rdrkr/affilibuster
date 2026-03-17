// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Navigation Provider Module
 *
 * Context provider for responsive navigation management across the application.
 * Provides visibility state and controls for dynamic element collapse based on available space.
 */

'use client'

import { createContext, useContext, type ReactNode } from 'react'

import { useNavigationResize, type UseNavigationResizeReturn } from '@/lib/navigation'

/**
 * Navigation context value - same as UseNavigationResizeReturn
 */
type NavigationContextValue = UseNavigationResizeReturn

const NavigationContext = createContext<NavigationContextValue | null>(null)

/**
 * Props for the NavigationProvider component
 */
export interface NavigationProviderProps {
  /** Child components to receive navigation context */
  children: ReactNode
}

/**
 * Navigation context provider component
 *
 * Wraps the navigation area to provide responsive visibility state to all child components.
 * Handles ResizeObserver-based width monitoring and visibility calculations.
 * @param props - Component props
 * @param props.children - Child components to wrap
 * @returns Provider component with navigation context
 * @example
 * ```tsx
 * // In Navigation.tsx
 * export function Navigation({ data }: NavigationProps) {
 *   return (
 *     <NavigationProvider>
 *       <NavContent data={data} />
 *     </NavigationProvider>
 *   )
 * }
 * ```
 */
export function NavigationProvider({ children }: NavigationProviderProps) {
  const navigationValue = useNavigationResize()

  return <NavigationContext.Provider value={navigationValue}>{children}</NavigationContext.Provider>
}

/**
 * Hook to access navigation context
 *
 * Must be used within a NavigationProvider. Throws an error if used outside.
 * @returns Navigation context value with visibility state and controls
 * @throws {Error} If used outside of NavigationProvider
 * @example
 * ```tsx
 * function NavLinks() {
 *   const { visibility } = useNavigationContext()
 *   if (!visibility.showNavLinks) return null
 *   return <div>Nav Links</div>
 * }
 * ```
 */
export function useNavigationContext(): NavigationContextValue {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigationContext must be used within a NavigationProvider')
  }
  return context
}
