// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

/**
 * Authentication Provider Component
 * Manages authentication state and provides auth methods to the application
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import * as authApi from './api'
import { AuthContext } from './AuthContext'
import type { AuthContextType, User } from './types'

/**
 * AuthProvider props
 */
interface AuthProviderProps {
  /**
   * Child components
   */
  children: ReactNode
}

/**
 * Authentication Provider Component
 * Wraps the application to provide authentication state and methods
 *
 * @param props - Provider props
 * @returns Provider component
 *
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Check if user is authenticated
   * Attempts to refresh token on mount
   */
  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      try {
        setIsLoading(true)
        const response = await authApi.refresh()
        setUser(response.user)
      } catch {
        // No active session, user is not authenticated
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    void checkAuth()
  }, [])

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string, rememberMe = false): Promise<User | null> => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await authApi.login(email, password, rememberMe)
      setUser(response.user)
      return response.user
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Register new user account
   */
  const register = useCallback(async (email: string, password: string, displayName: string): Promise<User | null> => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await authApi.register(email, password, displayName)
      setUser(response.user)
      return response.user
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'Registration failed'

      // Handle 409 Conflict (Email already exists)
      if (err instanceof authApi.ApiError && err.status === 409) {
        errorMessage = 'Email already registered'
      }

      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Logout current user
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      await authApi.logout()
      setUser(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Request password reset email
   */
  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)
      await authApi.forgotPassword(email)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Request failed'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Reset password with token
   */
  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)
      await authApi.resetPassword(token, newPassword)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Verify email with token
   */
  const verifyEmail = useCallback(async (token: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)
      await authApi.verifyEmail(token)
      // Refresh user data to update emailVerified status
      const response = await authApi.refresh()
      setUser(response.user)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Email verification failed'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Resend email verification
   */
  const resendVerification = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)
      await authApi.resendVerification()
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend verification'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Refresh authentication token
   */
  const refresh = useCallback(async (): Promise<User | null> => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await authApi.refresh()
      setUser(response.user)
      return response.user
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Token refresh failed'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Clear error state
   */
  const clearError = useCallback((): void => {
    setError(null)
  }, [])

  const value: AuthContextType = {
    // State
    user,
    isLoading,
    isAuthenticated: user !== null,
    error,
    // Actions
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    refresh,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
