// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for auth API module
 */

import {
  changePassword,
  deleteAccount,
  exportUserData,
  forgotPassword,
  getUserProfile,
  login,
  logout,
  refreshToken,
  register,
  resendVerification,
  resetPassword,
  updateUserProfile,
  verifyEmail,
} from '@/lib/auth/api'

// Mock the core client module
jest.mock('@/lib/core/client', () => ({
  ApiError: class ApiError extends Error {
    status: number
    constructor(message: string, status: number) {
      super(message)
      this.status = status
    }
  },
  apiRequest: jest.fn(),
  createApiRequest: jest.fn((url: string, data: unknown) => ({ url, ...(data as object) })),
}))

import { apiRequest } from '@/lib/core/client'

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>

describe('auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(
      /* no-op */ () => {
        return
      }
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('login', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { user: { id: '1', email: 'test@test.com' }, accessToken: 'token' }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      const body = { email: 'test@test.com', password: 'password123' }
      const result = await login(body)

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(expect.objectContaining({ url: '/auth/login', body }), {
        method: 'POST',
        credentials: 'include',
      })
    })

    it('should return null on error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Failed'))
      const result = await login({ email: 'test@test.com', password: 'wrong' })
      expect(result).toBeNull()
    })
  })

  describe('register', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { user: { id: '1' } }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      const body = { email: 'test@test.com', password: 'password123', displayName: 'Test' }
      const result = await register(body)

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(expect.objectContaining({ url: '/auth/register', body }), {
        method: 'POST',
        credentials: 'include',
      })
    })

    it('should return null on error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Failed'))
      const result = await register({ email: 'test@test.com', password: 'pass', displayName: 'Test' })
      expect(result).toBeNull()
    })
  })

  describe('logout', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { message: 'Logged out' }
      mockApiRequest.mockResolvedValueOnce(mockResponse)

      const result = await logout()

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(expect.objectContaining({ url: '/auth/logout' }), {
        method: 'POST',
        credentials: 'include',
      })
    })

    it('should return null on error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Failed'))
      const result = await logout()
      expect(result).toBeNull()
    })
  })

  describe('forgotPassword', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { message: 'Email sent' }
      mockApiRequest.mockResolvedValueOnce(mockResponse)

      const result = await forgotPassword({ email: 'test@test.com' })

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(expect.objectContaining({ url: '/auth/forgot-password' }), {
        method: 'POST',
      })
    })

    it('should return null on error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Failed'))
      const result = await forgotPassword({ email: 'test@test.com' })
      expect(result).toBeNull()
    })
  })

  describe('resetPassword', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { message: 'Password reset' }
      mockApiRequest.mockResolvedValueOnce(mockResponse)

      const result = await resetPassword({ token: 'reset-token', newPassword: 'newpassword' })

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(expect.objectContaining({ url: '/auth/reset-password' }), {
        method: 'POST',
      })
    })

    it('should return null on error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Failed'))
      const result = await resetPassword({ token: 'token', newPassword: 'pass' })
      expect(result).toBeNull()
    })
  })

  describe('verifyEmail', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { message: 'Email verified' }
      mockApiRequest.mockResolvedValueOnce(mockResponse)

      const result = await verifyEmail({ token: 'verify-token' })

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(expect.objectContaining({ url: '/auth/verify-email' }), {
        method: 'POST',
      })
    })

    it('should return null on error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Failed'))
      const result = await verifyEmail({ token: 'token' })
      expect(result).toBeNull()
    })
  })

  describe('resendVerification', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { message: 'Verification sent' }
      mockApiRequest.mockResolvedValueOnce(mockResponse)

      const result = await resendVerification({ email: 'test@test.com' } as Parameters<typeof resendVerification>[0])

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(expect.objectContaining({ url: '/auth/resend-verification' }), {
        method: 'POST',
      })
    })

    it('should return null on error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Failed'))
      const result = await resendVerification({ email: 'test@test.com' } as Parameters<typeof resendVerification>[0])
      expect(result).toBeNull()
    })
  })

  describe('refreshToken', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { accessToken: 'new-token' }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      const result = await refreshToken()

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(expect.objectContaining({ url: '/auth/refresh' }), {
        method: 'POST',
        credentials: 'include',
      })
    })

    it('should return null on error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Failed'))
      const result = await refreshToken()
      expect(result).toBeNull()
    })
  })

  describe('getUserProfile', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { id: '1', email: 'test@test.com', display_name: 'Test' }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      const result = await getUserProfile()

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(expect.objectContaining({ url: '/auth/profile' }), {
        credentials: 'include',
      })
    })

    it('should return null on error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Failed'))
      const result = await getUserProfile()
      expect(result).toBeNull()
    })
  })

  describe('updateUserProfile', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { id: '1', display_name: 'Updated Name' }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      const result = await updateUserProfile({ displayName: 'Updated Name' })

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(expect.objectContaining({ url: '/auth/profile' }), {
        method: 'PUT',
        credentials: 'include',
      })
    })

    it('should return null on error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Failed'))
      const result = await updateUserProfile({ displayName: 'Test' })
      expect(result).toBeNull()
    })
  })

  describe('changePassword', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { message: 'Password changed' }
      mockApiRequest.mockResolvedValueOnce(mockResponse)

      const result = await changePassword({ currentPassword: 'old', newPassword: 'new' })

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(expect.objectContaining({ url: '/auth/profile/change-password' }), {
        method: 'POST',
        credentials: 'include',
      })
    })

    it('should return null on error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Failed'))
      const result = await changePassword({ currentPassword: 'old', newPassword: 'new' })
      expect(result).toBeNull()
    })
  })

  describe('deleteAccount', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { success: true, message: 'Account deleted successfully' }
      mockApiRequest.mockResolvedValueOnce(mockResponse)

      const result = await deleteAccount({ password: 'MyPassword123!' })

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/auth/profile', body: { password: 'MyPassword123!' } }),
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )
    })

    it('should return null on error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Failed'))
      const result = await deleteAccount({ password: 'wrong' })
      expect(result).toBeNull()
    })
  })

  describe('exportUserData', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = {
        profile: { id: '1', email: 'test@test.com' },
        consentRecords: [],
        preferences: null,
        activeSessions: [],
        exportedAt: '2026-02-12T00:00:00Z',
      }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      const result = await exportUserData()

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(expect.objectContaining({ url: '/auth/profile/export' }), {
        credentials: 'include',
      })
    })

    it('should return null on error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Failed'))
      const result = await exportUserData()
      expect(result).toBeNull()
    })
  })
})
