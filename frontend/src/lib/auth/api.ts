// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Authentication API Client
 * Provides type-safe API operations for user authentication
 */

import { apiRequest, createApiRequest } from '@/lib/core/client'
export { ApiError } from '@/lib/core/client'
import type {
  LoginUserData,
  LoginUserResponses,
  RegisterUserData,
  RegisterUserResponses,
  LogoutUserData,
  LogoutUserResponses,
  ForgotPasswordData,
  ForgotPasswordResponses,
  ResetPasswordData,
  ResetPasswordResponses,
  VerifyEmailData,
  VerifyEmailResponses,
  ResendVerificationData,
  ResendVerificationResponses,
  RefreshTokenData,
  RefreshTokenResponses,
  UpdateUserProfileData,
  UpdateUserProfileResponses,
} from '@/lib/generated/types.gen'

/**
 * Login with email and password
 *
 * @param email - User email address
 * @param password - User password
 * @param rememberMe - Whether to extend session to 30 days (default: 7 days)
 * @returns Login response with user data
 * @throws Error when login fails
 *
 * @example
 * ```typescript
 * const response = await login('user@example.com', 'password123', true)
 * console.log('Logged in as:', response.user.displayName)
 * ```
 */
export async function login(email: string, password: string, rememberMe = false): Promise<LoginUserResponses[200]> {
  const request = createApiRequest<LoginUserData>('/auth/login', {
    body: { email, password, rememberMe },
  })
  return apiRequest<LoginUserResponses[200]>(request, {
    method: 'POST',
    credentials: 'include',
  })
}

/**
 * Register a new user account
 *
 * @param email - User email address
 * @param password - User password (min 8 characters)
 * @param displayName - User display name (1-100 characters)
 * @returns Registration response with user data
 * @throws Error when registration fails
 *
 * @example
 * ```typescript
 * const response = await register('newuser@example.com', 'SecurePass123!', 'John Doe')
 * console.log('User registered:', response.user.email)
 * ```
 */
export async function register(
  email: string,
  password: string,
  displayName: string
): Promise<RegisterUserResponses[201]> {
  const request = createApiRequest<RegisterUserData>('/auth/register', {
    body: { email, password, displayName },
  })
  return apiRequest<RegisterUserResponses[201]>(request, {
    method: 'POST',
    credentials: 'include',
  })
}

/**
 * Logout current user
 * Invalidates session and clears authentication cookies
 *
 * @returns Logout response with success message
 * @throws Error when logout fails
 *
 * @example
 * ```typescript
 * await logout()
 * console.log('User logged out successfully')
 * ```
 */
export async function logout(): Promise<LogoutUserResponses[200]> {
  const request = createApiRequest<LogoutUserData>('/auth/logout', {})
  return apiRequest<LogoutUserResponses[200]>(request, {
    method: 'POST',
    credentials: 'include',
  })
}

/**
 * Request password reset email
 * Always returns success for security (doesn't reveal if email exists)
 *
 * @param email - User email address
 * @returns Generic success response
 * @throws Error when request fails
 *
 * @example
 * ```typescript
 * await forgotPassword('user@example.com')
 * // Show: "If email exists, reset link has been sent"
 * ```
 */
export async function forgotPassword(email: string): Promise<ForgotPasswordResponses[200]> {
  const request = createApiRequest<ForgotPasswordData>('/auth/forgot-password', {
    body: { email },
  })
  return apiRequest<ForgotPasswordResponses[200]>(request, {
    method: 'POST',
    credentials: 'include',
  })
}

/**
 * Reset password using token from reset email
 *
 * @param token - Reset token from email
 * @param newPassword - New password (min 8 characters)
 * @returns Success response
 * @throws Error when token is invalid or expired
 *
 * @example
 * ```typescript
 * await resetPassword('reset-token-123', 'NewSecurePass123!')
 * console.log('Password reset successfully')
 * ```
 */
export async function resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponses[200]> {
  const request = createApiRequest<ResetPasswordData>('/auth/reset-password', {
    body: { token, newPassword },
  })
  return apiRequest<ResetPasswordResponses[200]>(request, {
    method: 'POST',
    credentials: 'include',
  })
}

/**
 * Verify email address using token from verification email
 *
 * @param token - Verification token from email
 * @returns Success response
 * @throws Error when token is invalid or expired
 *
 * @example
 * ```typescript
 * await verifyEmail('verify-token-123')
 * console.log('Email verified successfully')
 * ```
 */
export async function verifyEmail(token: string): Promise<VerifyEmailResponses[200]> {
  const request = createApiRequest<VerifyEmailData>('/auth/verify-email', {
    body: { token },
  })
  return apiRequest<VerifyEmailResponses[200]>(request, {
    method: 'POST',
    credentials: 'include',
  })
}

/**
 * Resend email verification to current user
 * Requires user to be authenticated
 *
 * @returns Success response
 * @throws Error when user not authenticated or email already verified
 *
 * @example
 * ```typescript
 * await resendVerification()
 * console.log('Verification email sent')
 * ```
 */
export async function resendVerification(): Promise<ResendVerificationResponses[200]> {
  const request = createApiRequest<ResendVerificationData>('/auth/resend-verification', {})
  return apiRequest<ResendVerificationResponses[200]>(request, {
    method: 'POST',
    credentials: 'include',
  })
}

/**
 * Refresh authentication token
 * Extends session expiration and returns updated user data
 *
 * @returns Refresh response with updated user data
 * @throws Error when refresh token is invalid or expired
 *
 * @example
 * ```typescript
 * const response = await refresh()
 * console.log('Token refreshed for:', response.user.email)
 * ```
 */
export async function refresh(): Promise<RefreshTokenResponses[200]> {
  const request = createApiRequest<RefreshTokenData>('/auth/refresh', {})
  return apiRequest<RefreshTokenResponses[200]>(request, {
    method: 'POST',
    credentials: 'include',
  })
}

/**
 * Update user profile information
 * Requires user to be authenticated
 *
 * @param updates - Profile fields to update (displayName)
 * @returns Update response with updated user data
 * @throws Error when user not authenticated or validation fails
 *
 * @example
 * ```typescript
 * const response = await updateProfile({ displayName: 'New Name' })
 * console.log('Profile updated:', response.displayName)
 * ```
 */
export async function updateProfile(updates: UpdateUserProfileData['body']): Promise<UpdateUserProfileResponses[200]> {
  const request = createApiRequest<UpdateUserProfileData>('/auth/profile', {
    body: updates,
  })
  return apiRequest<UpdateUserProfileResponses[200]>(request, {
    method: 'PATCH',
    credentials: 'include',
  })
}
