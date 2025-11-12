// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for useVerificationGate hook
 * Hook that checks email verification status and shows verification prompt
 */

import { renderHook, act } from '@testing-library/react'
import { useVerificationGate } from '@/lib/auth/useVerificationGate'
import { useAuth } from '@/lib/auth'
import type { User } from '@/lib/auth'
import { StatusEnum } from '@/lib/generated/types.gen'

// Mock useAuth hook
jest.mock('@/lib/auth', () => ({
  useAuth: jest.fn(),
}))

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('useVerificationGate', () => {
  const mockVerifiedUser: User = {
    id: '123',
    email: 'verified@example.com',
    displayName: 'Verified User',
    emailVerified: true,
    status: StatusEnum.ACTIVE,
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-11-01T10:00:00Z',
    lastLoginAt: '2025-11-01T10:00:00Z',
  }

  const mockUnverifiedUser: User = {
    ...mockVerifiedUser,
    email: 'unverified@example.com',
    emailVerified: false,
  }

  const mockAuthContextBase = {
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    clearError: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerification: jest.fn(),
    refresh: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Return Values', () => {
    it('should return checkVerification function and modal state', () => {
      mockedUseAuth.mockReturnValue({
        ...mockAuthContextBase,
        user: mockVerifiedUser,
        isAuthenticated: true,
      })

      const { result } = renderHook(() => useVerificationGate())

      expect(result.current).toHaveProperty('checkVerification')
      expect(result.current).toHaveProperty('showPrompt')
      expect(result.current).toHaveProperty('closePrompt')
      expect(typeof result.current.checkVerification).toBe('function')
      expect(typeof result.current.closePrompt).toBe('function')
      expect(typeof result.current.showPrompt).toBe('boolean')
    })

    it('should initially have showPrompt as false', () => {
      mockedUseAuth.mockReturnValue({
        ...mockAuthContextBase,
        user: mockVerifiedUser,
        isAuthenticated: true,
      })

      const { result } = renderHook(() => useVerificationGate())
      expect(result.current.showPrompt).toBe(false)
    })
  })

  describe('Verification Checks', () => {
    it('should return true for verified user without showing prompt', () => {
      mockedUseAuth.mockReturnValue({
        ...mockAuthContextBase,
        user: mockVerifiedUser,
        isAuthenticated: true,
      })

      const { result } = renderHook(() => useVerificationGate())

      let checkResult = false
      act(() => {
        checkResult = result.current.checkVerification()
      })

      expect(checkResult).toBe(true)
      expect(result.current.showPrompt).toBe(false)
    })

    it('should return false for unverified user and show prompt', () => {
      mockedUseAuth.mockReturnValue({
        ...mockAuthContextBase,
        user: mockUnverifiedUser,
        isAuthenticated: true,
      })

      const { result } = renderHook(() => useVerificationGate())

      let checkResult = false
      act(() => {
        checkResult = result.current.checkVerification()
      })

      expect(checkResult).toBe(false)
      expect(result.current.showPrompt).toBe(true)
    })

    it('should return true when user is not authenticated (allow access)', () => {
      mockedUseAuth.mockReturnValue({
        ...mockAuthContextBase,
        user: null,
      })

      const { result } = renderHook(() => useVerificationGate())

      let checkResult = false
      act(() => {
        checkResult = result.current.checkVerification()
      })

      expect(checkResult).toBe(true)
      expect(result.current.showPrompt).toBe(false)
    })
  })

  describe('Modal Control', () => {
    it('should close prompt when closePrompt is called', () => {
      mockedUseAuth.mockReturnValue({
        ...mockAuthContextBase,
        user: mockUnverifiedUser,
        isAuthenticated: true,
      })

      const { result } = renderHook(() => useVerificationGate())

      // Show the prompt first
      act(() => {
        result.current.checkVerification()
      })

      expect(result.current.showPrompt).toBe(true)

      // Close the prompt
      act(() => {
        result.current.closePrompt()
      })

      expect(result.current.showPrompt).toBe(false)
    })

    it('should allow showing prompt multiple times', () => {
      mockedUseAuth.mockReturnValue({
        ...mockAuthContextBase,
        user: mockUnverifiedUser,
        isAuthenticated: true,
      })

      const { result } = renderHook(() => useVerificationGate())

      // First check
      act(() => {
        result.current.checkVerification()
      })
      expect(result.current.showPrompt).toBe(true)

      // Close
      act(() => {
        result.current.closePrompt()
      })
      expect(result.current.showPrompt).toBe(false)

      // Second check
      act(() => {
        result.current.checkVerification()
      })
      expect(result.current.showPrompt).toBe(true)
    })
  })

  describe('User Email', () => {
    it('should provide user email when available', () => {
      mockedUseAuth.mockReturnValue({
        ...mockAuthContextBase,
        user: mockUnverifiedUser,
        isAuthenticated: true,
      })

      const { result } = renderHook(() => useVerificationGate())

      act(() => {
        result.current.checkVerification()
      })

      expect(result.current).toHaveProperty('userEmail')
      expect(result.current.userEmail).toBe(mockUnverifiedUser.email)
    })

    it('should provide empty string when user is not authenticated', () => {
      mockedUseAuth.mockReturnValue({
        ...mockAuthContextBase,
        user: null,
      })

      const { result } = renderHook(() => useVerificationGate())

      expect(result.current.userEmail).toBe('')
    })
  })

  describe('Edge Cases', () => {
    it('should handle auth loading state', () => {
      mockedUseAuth.mockReturnValue({
        ...mockAuthContextBase,
        user: null,
        isLoading: true,
      })

      const { result } = renderHook(() => useVerificationGate())

      let checkResult = false
      act(() => {
        checkResult = result.current.checkVerification()
      })

      // Should allow access during loading
      expect(checkResult).toBe(true)
      expect(result.current.showPrompt).toBe(false)
    })

    it('should update when user changes from unverified to verified', () => {
      mockedUseAuth.mockReturnValue({
        ...mockAuthContextBase,
        user: mockUnverifiedUser,
        isAuthenticated: true,
      })

      const { result, rerender } = renderHook(() => useVerificationGate())

      // First check with unverified user
      act(() => {
        result.current.checkVerification()
      })
      expect(result.current.showPrompt).toBe(true)

      // User becomes verified
      mockedUseAuth.mockReturnValue({
        ...mockAuthContextBase,
        user: mockVerifiedUser,
        isAuthenticated: true,
      })

      rerender()

      // Check again with verified user
      let checkResult = false
      act(() => {
        checkResult = result.current.checkVerification()
      })

      expect(checkResult).toBe(true)
      expect(result.current.showPrompt).toBe(false)
    })
  })
})
