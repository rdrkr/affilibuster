// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for useAuth hook and AuthProvider
 * Following TDD: These tests are written FIRST, before implementation
 */

import React, { type ReactNode } from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { User } from '@/lib/auth/types'
import { StatusEnum } from '@/lib/auth'
import * as authApi from '@/lib/auth/api'
import { ApiError } from '@/lib/core/api-types'
import { AuthProvider } from '@/lib/auth/AuthProvider'
import { useAuth } from '@/lib/auth/useAuth'

// Mock the auth API module
jest.mock('@/lib/auth/api')

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>

// Make ApiError available on the mocked authApi module
Object.defineProperty(mockedAuthApi, 'ApiError', {
  value: ApiError,
  writable: false,
})

// Helper to create wrapper with AuthProvider
function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>
  }
}

describe('useAuth Hook', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have null user and isAuthenticated false initially', async () => {
      // Mock refresh to fail (no active session)
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should restore user session on mount if refresh succeeds', async () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true,
        status: StatusEnum.ACTIVE,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-11-01T10:00:00Z',
        lastLoginAt: '2025-11-01T10:00:00Z',
      }

      // Mock refresh to succeed (active session)
      mockedAuthApi.refresh.mockResolvedValueOnce({
        success: true,
        sessionToken: 'mock-token',
        expiresAt: '2025-12-31T00:00:00Z',
        user: mockUser,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {
        // Empty function
      })

      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')

      consoleError.mockRestore()
    })
  })

  describe('login', () => {
    it('should successfully login user', async () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: false,
        status: StatusEnum.ACTIVE,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-11-01T10:00:00Z',
        lastLoginAt: '2025-11-01T10:00:00Z',
      }

      // Mock refresh to fail initially (no session)
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      // Mock login to succeed
      mockedAuthApi.login.mockResolvedValueOnce({
        success: true,
        user: mockUser,
        sessionToken: 'mock-session-token',
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let user: User | null = null
      await act(async () => {
        user = await result.current.login('test@example.com', 'password123', false)
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.error).toBeNull()
      })

      expect(user).toEqual(mockUser)
      expect(mockedAuthApi.login).toHaveBeenCalledWith('test@example.com', 'password123', false)
    })

    it('should handle login error', async () => {
      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      // Mock login to fail
      mockedAuthApi.login.mockRejectedValueOnce(new Error('Invalid credentials'))

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let user: User | null = null
      await act(async () => {
        user = await result.current.login('test@example.com', 'wrong', false)
      })

      await waitFor(() => {
        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.error).toBe('Invalid credentials')
      })

      expect(user).toBeNull()
    })
  })

  describe('register', () => {
    it('should successfully register user', async () => {
      const mockUser: User = {
        id: '456',
        email: 'newuser@example.com',
        displayName: 'New User',
        emailVerified: false,
        status: StatusEnum.ACTIVE,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-11-01T10:00:00Z',
        lastLoginAt: null,
      }

      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      // Mock register to succeed
      mockedAuthApi.register.mockResolvedValueOnce({
        success: true,
        user: mockUser,
        message: 'Registration successful',
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let user: User | null = null
      await act(async () => {
        user = await result.current.register('newuser@example.com', 'password123', 'New User')
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.isAuthenticated).toBe(true)
      })

      expect(user).toEqual(mockUser)
      expect(mockedAuthApi.register).toHaveBeenCalledWith('newuser@example.com', 'password123', 'New User')
    })

    it('should handle registration error', async () => {
      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      // Mock register to fail
      mockedAuthApi.register.mockRejectedValueOnce(new Error('Email already exists'))

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let user: User | null = null
      await act(async () => {
        user = await result.current.register('existing@example.com', 'password123', 'User')
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Email already exists')
      })

      expect(user).toBeNull()
    })

    it('should handle 409 Conflict error with user-friendly message', async () => {
      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      // Mock register to throw ApiError with status 409
      const apiError = new ApiError('Email already exists', 409)
      mockedAuthApi.register.mockRejectedValueOnce(apiError)

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let user: User | null = null
      await act(async () => {
        user = await result.current.register('existing@example.com', 'password123', 'User')
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Email already registered')
      })

      expect(user).toBeNull()
    })
  })

  describe('logout', () => {
    it('should successfully logout user', async () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: false,
        status: StatusEnum.ACTIVE,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-11-01T10:00:00Z',
        lastLoginAt: '2025-11-01T10:00:00Z',
      }

      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      // Mock login and logout
      mockedAuthApi.login.mockResolvedValueOnce({
        success: true,
        user: mockUser,
        sessionToken: 'mock-session-token',
      })

      mockedAuthApi.logout.mockResolvedValueOnce({
        success: true,
        message: 'Logged out successfully',
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // First login
      await act(async () => {
        await result.current.login('test@example.com', 'password123', false)
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      // Then logout
      await act(async () => {
        await result.current.logout()
      })

      await waitFor(() => {
        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
      })

      expect(mockedAuthApi.logout).toHaveBeenCalled()
    })

    it('should handle logout error with Error instance', async () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: false,
        status: StatusEnum.ACTIVE,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-11-01T10:00:00Z',
        lastLoginAt: '2025-11-01T10:00:00Z',
      }

      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      // Mock login to succeed
      mockedAuthApi.login.mockResolvedValueOnce({
        success: true,
        user: mockUser,
        sessionToken: 'mock-session-token',
      })

      // Mock logout to fail with Error instance
      mockedAuthApi.logout.mockRejectedValueOnce(new Error('Logout failed'))

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // First login
      await act(async () => {
        await result.current.login('test@example.com', 'password123', false)
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      // Then logout (which will fail)
      await act(async () => {
        await result.current.logout()
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Logout failed')
      })

      expect(mockedAuthApi.logout).toHaveBeenCalled()
    })

    it('should handle logout error with non-Error value', async () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: false,
        status: StatusEnum.ACTIVE,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-11-01T10:00:00Z',
        lastLoginAt: '2025-11-01T10:00:00Z',
      }

      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      // Mock login to succeed
      mockedAuthApi.login.mockResolvedValueOnce({
        success: true,
        user: mockUser,
        sessionToken: 'mock-session-token',
      })

      // Mock logout to fail with non-Error value (string)
      mockedAuthApi.logout.mockRejectedValueOnce('String error')

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // First login
      await act(async () => {
        await result.current.login('test@example.com', 'password123', false)
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      // Then logout (which will fail)
      await act(async () => {
        await result.current.logout()
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Logout failed')
      })

      expect(mockedAuthApi.logout).toHaveBeenCalled()
    })
  })

  describe('forgotPassword', () => {
    it('should successfully request password reset', async () => {
      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      mockedAuthApi.forgotPassword.mockResolvedValueOnce({
        success: true,
        message: 'Reset link sent',
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let success = false
      await act(async () => {
        success = await result.current.forgotPassword('test@example.com')
      })

      expect(success).toBe(true)
      expect(mockedAuthApi.forgotPassword).toHaveBeenCalledWith('test@example.com')
    })

    it('should handle forgot password error', async () => {
      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      mockedAuthApi.forgotPassword.mockRejectedValueOnce(new Error('Request failed'))

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let success = true
      await act(async () => {
        success = await result.current.forgotPassword('test@example.com')
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Request failed')
    })
  })

  describe('resetPassword', () => {
    it('should successfully reset password', async () => {
      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      mockedAuthApi.resetPassword.mockResolvedValueOnce({
        success: true,
        message: 'Password reset successfully',
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let success = false
      await act(async () => {
        success = await result.current.resetPassword('token-123', 'newPassword123')
      })

      expect(success).toBe(true)
      expect(mockedAuthApi.resetPassword).toHaveBeenCalledWith('token-123', 'newPassword123')
    })

    it('should handle reset password error', async () => {
      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      mockedAuthApi.resetPassword.mockRejectedValueOnce(new Error('Password reset failed'))

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let success = true
      await act(async () => {
        success = await result.current.resetPassword('token-123', 'newPassword123')
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Password reset failed')
    })
  })

  describe('verifyEmail', () => {
    it('should successfully verify email', async () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true,
        status: StatusEnum.ACTIVE,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-11-01T10:00:00Z',
        lastLoginAt: null,
      }

      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      mockedAuthApi.verifyEmail.mockResolvedValueOnce({
        success: true,
        message: 'Email verified',
      })

      // Mock refresh after verification
      mockedAuthApi.refresh.mockResolvedValueOnce({
        success: true,
        sessionToken: 'mock-token',
        expiresAt: '2025-12-31T00:00:00Z',
        user: mockUser,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let success = false
      await act(async () => {
        success = await result.current.verifyEmail('token-123')
      })

      expect(success).toBe(true)
      expect(mockedAuthApi.verifyEmail).toHaveBeenCalledWith('token-123')
    })

    it('should handle verify email error', async () => {
      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      mockedAuthApi.verifyEmail.mockRejectedValueOnce(new Error('Email verification failed'))

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let success = true
      await act(async () => {
        success = await result.current.verifyEmail('token-123')
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Email verification failed')
    })
  })

  describe('resendVerification', () => {
    it('should successfully resend verification email', async () => {
      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      mockedAuthApi.resendVerification.mockResolvedValueOnce({
        success: true,
        message: 'Verification email sent',
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let success = false
      await act(async () => {
        success = await result.current.resendVerification()
      })

      expect(success).toBe(true)
      expect(mockedAuthApi.resendVerification).toHaveBeenCalled()
    })

    it('should handle resend verification error', async () => {
      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      mockedAuthApi.resendVerification.mockRejectedValueOnce(new Error('Failed to resend verification'))

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let success = true
      await act(async () => {
        success = await result.current.resendVerification()
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Failed to resend verification')
    })
  })

  describe('refresh', () => {
    it('should successfully refresh token', async () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true,
        status: StatusEnum.ACTIVE,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-11-01T10:00:00Z',
        lastLoginAt: null,
      }

      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      // Mock refresh call to succeed
      mockedAuthApi.refresh.mockResolvedValueOnce({
        success: true,
        sessionToken: 'mock-token',
        expiresAt: '2025-12-31T00:00:00Z',
        user: mockUser,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let user: User | null = null
      await act(async () => {
        user = await result.current.refresh()
      })

      expect(user).toEqual(mockUser)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should handle refresh error', async () => {
      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      // Mock refresh call to fail
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('Token refresh failed'))

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let user: User | null = { id: 'test' } as User
      await act(async () => {
        user = await result.current.refresh()
      })

      expect(user).toBeNull()
      expect(result.current.error).toBe('Token refresh failed')
    })
  })

  describe('clearError', () => {
    it('should clear error state', async () => {
      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      mockedAuthApi.login.mockRejectedValueOnce(new Error('Login failed'))

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Trigger an error
      await act(async () => {
        await result.current.login('test@example.com', 'wrong', false)
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Login failed')
      })

      // Clear the error
      act(() => {
        result.current.clearError()
      })

      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })
    })
  })

  describe('Non-Error Exception Handling', () => {
    it('should handle login error with non-Error value', async () => {
      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      // Mock login to fail with non-Error value (string)
      mockedAuthApi.login.mockRejectedValueOnce('String error')

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let user: User | null = null
      await act(async () => {
        user = await result.current.login('test@example.com', 'password', false)
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Login failed')
      })

      expect(user).toBeNull()
    })

    it('should handle register error with non-Error value', async () => {
      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      // Mock register to fail with non-Error value (number)
      mockedAuthApi.register.mockRejectedValueOnce(500)

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let user: User | null = null
      await act(async () => {
        user = await result.current.register('test@example.com', 'password', 'User')
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Registration failed')
      })

      expect(user).toBeNull()
    })

    it('should handle forgotPassword error with non-Error value', async () => {
      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      // Mock forgotPassword to fail with non-Error value
      mockedAuthApi.forgotPassword.mockRejectedValueOnce({ code: 'UNKNOWN' })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let success = false
      await act(async () => {
        success = await result.current.forgotPassword('test@example.com')
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Request failed')
      })

      expect(success).toBe(false)
    })

    it('should handle resetPassword error with non-Error value', async () => {
      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      // Mock resetPassword to fail with non-Error value
      mockedAuthApi.resetPassword.mockRejectedValueOnce(null)

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let success = false
      await act(async () => {
        success = await result.current.resetPassword('token123', 'newpass123')
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Password reset failed')
      })

      expect(success).toBe(false)
    })

    it('should handle verifyEmail error with non-Error value', async () => {
      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      // Mock verifyEmail to fail with non-Error value
      mockedAuthApi.verifyEmail.mockRejectedValueOnce(undefined)

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let success = false
      await act(async () => {
        success = await result.current.verifyEmail('token123')
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Email verification failed')
      })

      expect(success).toBe(false)
    })

    it('should handle resendVerification error with non-Error value', async () => {
      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      // Mock resendVerification to fail with non-Error value
      mockedAuthApi.resendVerification.mockRejectedValueOnce(false)

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let success = false
      await act(async () => {
        success = await result.current.resendVerification()
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to resend verification')
      })

      expect(success).toBe(false)
    })

    it('should handle refresh error with non-Error value', async () => {
      // Mock refresh to fail with non-Error value on mount
      mockedAuthApi.refresh.mockRejectedValueOnce('refresh failed')

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // User should be null due to failed refresh
      expect(result.current.user).toBeNull()

      // Now mock successful login
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: false,
        status: StatusEnum.ACTIVE,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-11-01T10:00:00Z',
        lastLoginAt: '2025-11-01T10:00:00Z',
      }

      mockedAuthApi.login.mockResolvedValueOnce({
        success: true,
        user: mockUser,
        sessionToken: 'token',
      })

      await act(async () => {
        await result.current.login('test@example.com', 'pass', false)
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      // Now test manual refresh with non-Error
      mockedAuthApi.refresh.mockRejectedValueOnce({ error: 'refresh error' })

      let refreshResult: User | null = null
      await act(async () => {
        refreshResult = await result.current.refresh()
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Token refresh failed')
      })

      expect(refreshResult).toBeNull()
    })

    it('should use default rememberMe=false when not provided', async () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: false,
        status: StatusEnum.ACTIVE,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-11-01T10:00:00Z',
        lastLoginAt: '2025-11-01T10:00:00Z',
      }

      // Mock refresh to fail initially
      mockedAuthApi.refresh.mockRejectedValueOnce(new Error('No session'))

      // Mock login to succeed
      mockedAuthApi.login.mockResolvedValueOnce({
        success: true,
        user: mockUser,
        sessionToken: 'token',
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Call login WITHOUT the rememberMe parameter (should use default)
      await act(async () => {
        await result.current.login('test@example.com', 'password')
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      // Verify login was called with rememberMe=false (the default)
      expect(mockedAuthApi.login).toHaveBeenCalledWith('test@example.com', 'password', false)
    })
  })
})
