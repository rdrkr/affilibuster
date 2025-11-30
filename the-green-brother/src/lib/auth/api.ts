// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Auth API Module
 *
 * Provides high-level helper functions for authentication operations.
 * All functions use the strongly-typed apiRequest() from the core client module.
 *
 * Authentication endpoints include:
 * - Login, Register, Logout
 * - Forgot Password, Reset Password
 * - Email Verification, Resend Verification
 * - Token Refresh
 * - Profile Management (Get, Update, Change Password)
 *
 * All auth requests use credentials: 'include' for cookie-based authentication.
 */

import { ApiError, apiRequest, createApiRequest } from '@/lib/core/client'

import type {
  ChangePasswordData,
  ChangePasswordResponses,
  ForgotPasswordData,
  ForgotPasswordResponses,
  GetUserProfileData,
  GetUserProfileResponses,
  LoginUserData,
  LoginUserResponses,
  LogoutUserData,
  LogoutUserResponses,
  RefreshTokenData,
  RefreshTokenResponses,
  RegisterUserData,
  RegisterUserResponses,
  ResendVerificationData,
  ResendVerificationResponses,
  ResetPasswordData,
  ResetPasswordResponses,
  UpdateUserProfileData,
  UpdateUserProfileResponses,
  VerifyEmailData,
  VerifyEmailResponses,
} from '@/lib/generated/types.gen'

/**
 * Login a user with email and password
 * @param body - Login credentials containing email and password
 * @returns The login response with user data and tokens, or null if login fails
 */
export async function login(body: NonNullable<LoginUserData['body']>): Promise<LoginUserResponses[200] | null> {
  try {
    const request = createApiRequest<LoginUserData>('/auth/login', {
      body,
    })
    return await apiRequest<LoginUserResponses[200]>(request, {
      method: 'POST',
      credentials: 'include',
    })
  } catch (error) {
    console.error('Failed to login:', error)
    return null
  }
}

/**
 * Register a new user
 * @param body - Registration data containing email, password, and user details
 * @returns The registration response with user data, or null if registration fails
 */
export async function register(
  body: NonNullable<RegisterUserData['body']>
): Promise<RegisterUserResponses[201] | null> {
  try {
    const request = createApiRequest<RegisterUserData>('/auth/register', {
      body,
    })
    return await apiRequest<RegisterUserResponses[201]>(request, {
      method: 'POST',
      credentials: 'include',
    })
  } catch (error) {
    console.error('Failed to register:', error)
    return null
  }
}

/**
 * Logout the current user
 * @returns Success message or null if logout fails
 */
export async function logout(): Promise<LogoutUserResponses[200] | null> {
  try {
    const request = createApiRequest<LogoutUserData>('/auth/logout', {})
    return await apiRequest<LogoutUserResponses[200]>(request, {
      method: 'POST',
      credentials: 'include',
    })
  } catch (error) {
    console.error('Failed to logout:', error)
    return null
  }
}

/**
 * Request a password reset email
 * @param body - Email address to send reset instructions to
 * @returns Success message or null if request fails
 */
export async function forgotPassword(
  body: NonNullable<ForgotPasswordData['body']>
): Promise<ForgotPasswordResponses[200] | null> {
  try {
    const request = createApiRequest<ForgotPasswordData>('/auth/forgot-password', {
      body,
    })
    return await apiRequest<ForgotPasswordResponses[200]>(request, {
      method: 'POST',
    })
  } catch (error) {
    console.error('Failed to request password reset:', error)
    return null
  }
}

/**
 * Reset password using a reset token
 * @param body - Reset token and new password
 * @returns Success message or null if reset fails
 */
export async function resetPassword(
  body: NonNullable<ResetPasswordData['body']>
): Promise<ResetPasswordResponses[200] | null> {
  try {
    const request = createApiRequest<ResetPasswordData>('/auth/reset-password', {
      body,
    })
    return await apiRequest<ResetPasswordResponses[200]>(request, {
      method: 'POST',
    })
  } catch (error) {
    console.error('Failed to reset password:', error)
    return null
  }
}

/**
 * Verify email address using a verification token
 * @param body - Email verification token
 * @returns Success message or null if verification fails
 */
export async function verifyEmail(
  body: NonNullable<VerifyEmailData['body']>
): Promise<VerifyEmailResponses[200] | null> {
  try {
    const request = createApiRequest<VerifyEmailData>('/auth/verify-email', {
      body,
    })
    return await apiRequest<VerifyEmailResponses[200]>(request, {
      method: 'POST',
    })
  } catch (error) {
    console.error('Failed to verify email:', error)
    return null
  }
}

/**
 * Resend email verification
 * @param body - Email address to resend verification to
 * @returns Success message or null if request fails
 */
export async function resendVerification(
  body: NonNullable<ResendVerificationData['body']>
): Promise<ResendVerificationResponses[200] | null> {
  try {
    const request = createApiRequest<ResendVerificationData>('/auth/resend-verification', {
      body,
    })
    return await apiRequest<ResendVerificationResponses[200]>(request, {
      method: 'POST',
    })
  } catch (error) {
    console.error('Failed to resend verification:', error)
    return null
  }
}

/**
 * Refresh the authentication tokens
 * @returns New tokens or null if refresh fails
 */
export async function refreshToken(): Promise<RefreshTokenResponses[200] | null> {
  try {
    const request = createApiRequest<RefreshTokenData>('/auth/refresh', {})
    return await apiRequest<RefreshTokenResponses[200]>(request, {
      method: 'POST',
      credentials: 'include',
    })
  } catch (error) {
    console.error('Failed to refresh token:', error)
    return null
  }
}

/**
 * Get the current user's profile
 * @returns The user profile data or null if not authenticated
 */
export async function getUserProfile(): Promise<GetUserProfileResponses[200] | null> {
  try {
    const request = createApiRequest<GetUserProfileData>('/auth/profile', {})
    return await apiRequest<GetUserProfileResponses[200]>(request, {
      credentials: 'include',
    })
  } catch (error) {
    console.error('Failed to get user profile:', error)
    return null
  }
}

/**
 * Update the current user's profile
 * @param body - Profile data to update
 * @returns Updated user profile or null if update fails
 */
export async function updateUserProfile(
  body: NonNullable<UpdateUserProfileData['body']>
): Promise<UpdateUserProfileResponses[200] | null> {
  try {
    const request = createApiRequest<UpdateUserProfileData>('/auth/profile', {
      body,
    })
    return await apiRequest<UpdateUserProfileResponses[200]>(request, {
      method: 'PUT',
      credentials: 'include',
    })
  } catch (error) {
    console.error('Failed to update user profile:', error)
    return null
  }
}

/**
 * Change the current user's password
 * @param body - Current password and new password
 * @returns Success message or null if change fails
 */
export async function changePassword(
  body: NonNullable<ChangePasswordData['body']>
): Promise<ChangePasswordResponses[200] | null> {
  try {
    const request = createApiRequest<ChangePasswordData>('/auth/profile/change-password', {
      body,
    })
    return await apiRequest<ChangePasswordResponses[200]>(request, {
      method: 'POST',
      credentials: 'include',
    })
  } catch (error) {
    console.error('Failed to change password:', error)
    return null
  }
}

/**
 * Export ApiError for use in consuming code
 */
export { ApiError }
