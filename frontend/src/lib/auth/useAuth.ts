// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

/**
 * useAuth Hook
 * Custom hook to access authentication context
 */

import { useContext } from 'react'
import { AuthContext } from './AuthContext'
import type { AuthContextType } from './types'

/**
 * Custom hook to access authentication state and actions
 *
 * @returns Auth context with user state and auth methods
 * @throws Error if used outside AuthProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, login, logout, isAuthenticated } = useAuth()
 *
 *   if (!isAuthenticated) {
 *     return <LoginButton onClick={() => login(email, password)} />
 *   }
 *
 *   return <div>Welcome, {user.displayName}!</div>
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
