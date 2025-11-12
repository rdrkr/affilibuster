// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for authentication API client
 * Following TDD: These tests are written FIRST, before implementation
 */

import type {
  LoginUserResponses,
  RegisterUserResponses,
  LogoutUserResponses,
  ForgotPasswordResponses,
  ResetPasswordResponses,
  VerifyEmailResponses,
  ResendVerificationResponses,
  RefreshTokenResponses,
  UpdateUserProfileResponses,
} from '@/lib/generated/types.gen'
import { StatusEnum } from '@/lib/auth'
import {
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  refresh,
  updateProfile,
} from '@/lib/auth/api'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch as unknown as typeof fetch

// Get API base URL from environment (same as auth/api.ts)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/v1'

describe('Auth API Client', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
  })

  describe('login', () => {
    it('should call /auth/login with correct payload', async () => {
      const mockResponse: LoginUserResponses[200] = {
        success: true,
        user: {
          id: '123',
          email: 'test@example.com',
          displayName: 'Test User',
          emailVerified: false,
          status: StatusEnum.ACTIVE,
          createdAt: '2025-11-01T10:00:00Z',
          updatedAt: '2025-11-01T10:00:00Z',
          lastLoginAt: '2025-11-01T10:00:00Z',
        },
        sessionToken: 'mock-session-token',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200,
      })

      const result = await login('test@example.com', 'password123', false)

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/login`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
            rememberMe: false,
          }),
          credentials: 'include',
        })
      )

      expect(result).toEqual(mockResponse)
    })

    it('should use default rememberMe value if not provided', async () => {
      const mockResponse: LoginUserResponses[200] = {
        success: true,
        user: {
          id: '123',
          email: 'test@example.com',
          displayName: 'Test User',
          emailVerified: false,
          status: StatusEnum.ACTIVE,
          createdAt: '2025-11-01T10:00:00Z',
          updatedAt: '2025-11-01T10:00:00Z',
          lastLoginAt: '2025-11-01T10:00:00Z',
        },
        sessionToken: 'mock-session-token',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200,
      })

      await login('test@example.com', 'password123')

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/login`,
        expect.objectContaining({
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
            rememberMe: false,
          }),
        })
      )
    })

    it('should throw error on failed login with message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Invalid credentials' }),
      })

      await expect(login('test@example.com', 'wrong', false)).rejects.toThrow('Invalid email or password')
    })

    it('should throw error with statusText when json parsing fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('JSON parse error')
        },
      })

      await expect(login('test@example.com', 'wrong', false)).rejects.toThrow(
        'API request failed: Internal Server Error'
      )
    })

    it('should throw default error message when no message in error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({}),
      })

      await expect(login('test@example.com', 'wrong', false)).rejects.toThrow('Invalid email or password')
    })

    it('should handle FastAPI detail field as string', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ detail: 'Email is required' }),
      })

      await expect(login('test@example.com', 'wrong', false)).rejects.toThrow('API request failed: Bad Request')
    })

    it('should handle FastAPI detail field as array of validation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => ({
          detail: [
            { msg: 'Field must be a valid email', type: 'value_error' },
            { msg: 'Password too short', type: 'value_error' },
          ],
        }),
      })

      await expect(login('invalid-email', 'short', false)).rejects.toThrow('API request failed: Unprocessable Entity')
    })
  })

  describe('register', () => {
    it('should call /auth/register with correct payload', async () => {
      const mockResponse: RegisterUserResponses[201] = {
        success: true,
        user: {
          id: '123',
          email: 'newuser@example.com',
          displayName: 'New User',
          emailVerified: false,
          status: StatusEnum.ACTIVE,
          createdAt: '2025-11-01T10:00:00Z',
          updatedAt: '2025-11-01T10:00:00Z',
          lastLoginAt: null,
        },
        message: 'Registration successful',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 201,
      })

      const result = await register('newuser@example.com', 'password123', 'New User')

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/register`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'newuser@example.com',
            password: 'password123',
            displayName: 'New User',
          }),
          credentials: 'include',
        })
      )

      expect(result).toEqual(mockResponse)
    })

    it('should throw error when email already exists', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        statusText: 'Conflict',
        json: async () => ({ message: 'Email already exists' }),
      })

      await expect(register('existing@example.com', 'password123', 'User')).rejects.toThrow()
    })
  })

  describe('logout', () => {
    it('should call /auth/logout', async () => {
      const mockResponse: LogoutUserResponses[200] = {
        success: true,
        message: 'Logged out successfully',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200,
      })

      const result = await logout()

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/logout`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      )

      expect(result).toEqual(mockResponse)
    })
  })

  describe('forgotPassword', () => {
    it('should call /auth/forgot-password with email', async () => {
      const mockResponse: ForgotPasswordResponses[200] = {
        success: true,
        message: 'If email exists, password reset link has been sent',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200,
      })

      const result = await forgotPassword('user@example.com')

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/forgot-password`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'user@example.com' }),
        })
      )

      expect(result).toEqual(mockResponse)
    })
  })

  describe('resetPassword', () => {
    it('should call /auth/reset-password with token and new password', async () => {
      const mockResponse: ResetPasswordResponses[200] = {
        success: true,
        message: 'Password reset successfully',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200,
      })

      const result = await resetPassword('reset-token-123', 'newPassword123!')

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/reset-password`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            token: 'reset-token-123',
            newPassword: 'newPassword123!',
          }),
        })
      )

      expect(result).toEqual(mockResponse)
    })
  })

  describe('verifyEmail', () => {
    it('should call /auth/verify-email with token', async () => {
      const mockResponse: VerifyEmailResponses[200] = {
        success: true,
        message: 'Email verified successfully',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200,
      })

      const result = await verifyEmail('verify-token-123')

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/verify-email`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ token: 'verify-token-123' }),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          credentials: 'include',
        })
      )

      expect(result).toEqual(mockResponse)
    })
  })

  describe('resendVerification', () => {
    it('should call /auth/resend-verification', async () => {
      const mockResponse: ResendVerificationResponses[200] = {
        success: true,
        message: 'Verification email sent',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200,
      })

      const result = await resendVerification()

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/resend-verification`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      )

      expect(result).toEqual(mockResponse)
    })
  })

  describe('refresh', () => {
    it('should call /auth/refresh', async () => {
      const mockResponse: RefreshTokenResponses[200] = {
        success: true,
        sessionToken: 'mock-session-token',
        expiresAt: '2025-12-31T00:00:00Z',
        user: {
          id: '123',
          email: 'test@example.com',
          displayName: 'Test User',
          emailVerified: true,
          status: StatusEnum.ACTIVE,
          createdAt: '2025-11-01T10:00:00Z',
          updatedAt: '2025-11-01T10:00:00Z',
          lastLoginAt: '2025-11-01T11:00:00Z',
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200,
      })

      const result = await refresh()

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/refresh`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      )

      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateProfile', () => {
    it('should call /auth/profile with PATCH method', async () => {
      // Backend returns UserProfile directly per OpenAPI spec (no wrapper with success/message)
      const mockResponse: UpdateUserProfileResponses[200] = {
        id: '123',
        email: 'test@example.com',
        display_name: 'Updated Name',
        email_verified: true,
        created_at: '2025-11-01T10:00:00Z',
        last_login_at: '2025-11-01T11:00:00Z',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200,
      })

      const result = await updateProfile({ displayName: 'Updated Name' })

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/profile`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ displayName: 'Updated Name' }),
          credentials: 'include',
        })
      )

      expect(result).toEqual(mockResponse)
    })

    it('should handle updating multiple profile fields', async () => {
      // Backend returns UserProfile directly per OpenAPI spec (no wrapper with success/message)
      const mockResponse: UpdateUserProfileResponses[200] = {
        id: '123',
        email: 'test@example.com',
        display_name: 'New Display Name',
        email_verified: true,
        created_at: '2025-11-01T10:00:00Z',
        last_login_at: '2025-11-01T11:00:00Z',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200,
      })

      const updates = {
        displayName: 'New Display Name',
      }

      const result = await updateProfile(updates)

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/profile`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updates),
        })
      )

      expect(result).toEqual(mockResponse)
    })

    it('should throw error on failed update', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid display name' }),
      })

      await expect(updateProfile({ displayName: '' })).rejects.toThrow('API request failed: Bad Request')
    })
  })
})
