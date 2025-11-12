// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Authentication types
 * Re-exports OpenAPI-generated types and defines frontend-specific context types
 */

import type { User } from '@/lib/generated/types.gen'

// Re-export StatusEnum for use in tests and components
export { StatusEnum } from '@/lib/generated/types.gen'

// ============================================================================
// Re-export OpenAPI-Generated Types
// ============================================================================

/**
 * User account information
 * @see {@link User} from generated types
 */
export type { User }

// ============================================================================
// Frontend-Specific Context Types
// ============================================================================

/**
 * Auth context state
 */
export interface AuthState {
  /**
   * Currently authenticated user (null if not logged in)
   */
  user: User | null
  /**
   * Whether auth state is currently being loaded
   */
  isLoading: boolean
  /**
   * Whether user is authenticated
   */
  isAuthenticated: boolean
  /**
   * Current error (if any)
   */
  error: string | null
}

/**
 * Auth context actions
 */
export interface AuthActions {
  /**
   * Login with email and password
   *
   * @param email - User email
   * @param password - User password
   * @param rememberMe - Whether to remember user for 30 days
   * @returns Promise resolving to user or null on error
   */
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User | null>

  /**
   * Register new user account
   *
   * @param email - User email
   * @param password - User password (min 8 characters)
   * @param displayName - User display name
   * @returns Promise resolving to user or null on error
   */
  register: (email: string, password: string, displayName: string) => Promise<User | null>

  /**
   * Logout current user
   *
   * @returns Promise resolving when logout is complete
   */
  logout: () => Promise<void>

  /**
   * Request password reset email
   *
   * @param email - User email address
   * @returns Promise resolving to success status
   */
  forgotPassword: (email: string) => Promise<boolean>

  /**
   * Reset password with token
   *
   * @param token - Reset token from email
   * @param newPassword - New password
   * @returns Promise resolving to success status
   */
  resetPassword: (token: string, newPassword: string) => Promise<boolean>

  /**
   * Verify email with token
   *
   * @param token - Verification token from email
   * @returns Promise resolving to success status
   */
  verifyEmail: (token: string) => Promise<boolean>

  /**
   * Resend email verification
   *
   * @returns Promise resolving to success status
   */
  resendVerification: () => Promise<boolean>

  /**
   * Refresh authentication token
   *
   * @returns Promise resolving to user or null on error
   */
  refresh: () => Promise<User | null>

  /**
   * Clear error state
   */
  clearError: () => void
}

/**
 * Combined auth context type
 */
export type AuthContextType = AuthState & AuthActions
