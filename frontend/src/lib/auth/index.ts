// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Authentication Module
 * Exports all auth-related types, components, and hooks
 */

// Types
export type { User, AuthState, AuthActions, AuthContextType } from './types'

// Enums
export { StatusEnum } from './types'

// API Client
export {
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  refresh,
  updateProfile,
} from './api'

// Context
export { AuthContext } from './AuthContext'

// Provider
export { AuthProvider } from './AuthProvider'

// Hook
export { useAuth } from './useAuth'
