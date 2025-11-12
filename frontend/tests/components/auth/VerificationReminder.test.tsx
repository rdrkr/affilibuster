// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for VerificationReminder component
 * Following TDD: These tests ensure the banner shows for unverified users
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VerificationReminder } from '@/components/auth/VerificationReminder'
import { useAuth } from '@/lib/auth'
import * as authApi from '@/lib/auth/api'
import type { User } from '@/lib/auth'
import { StatusEnum } from '@/lib/generated/types.gen'

// Mock useAuth hook
jest.mock('@/lib/auth', () => ({
  useAuth: jest.fn(),
}))

// Mock auth API
jest.mock('@/lib/auth/api', () => ({
  resendVerification: jest.fn(),
}))

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>

describe('VerificationReminder', () => {
  const mockUnverifiedUser: User = {
    id: '123',
    email: 'unverified@example.com',
    displayName: 'Unverified User',
    emailVerified: false,
    status: StatusEnum.ACTIVE,
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-11-01T10:00:00Z',
    lastLoginAt: '2025-11-01T10:00:00Z',
  }

  const mockVerifiedUser: User = {
    ...mockUnverifiedUser,
    emailVerified: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Visibility Rules', () => {
    it('should not render when user is not authenticated', () => {
      mockedUseAuth.mockReturnValue({
        user: null,
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
      })

      const { container } = render(<VerificationReminder />)
      expect(container.firstChild).toBeNull()
    })

    it('should not render when user email is verified', () => {
      mockedUseAuth.mockReturnValue({
        user: mockVerifiedUser,
        isAuthenticated: true,
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
      })

      const { container } = render(<VerificationReminder />)
      expect(container.firstChild).toBeNull()
    })

    it('should render banner when user email is not verified', () => {
      mockedUseAuth.mockReturnValue({
        user: mockUnverifiedUser,
        isAuthenticated: true,
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
      })

      render(<VerificationReminder />)
      expect(screen.getByTestId('verification-reminder-banner')).toBeInTheDocument()
      expect(screen.getByText(/verify your email/i)).toBeInTheDocument()
    })

    it('should show user email in the banner', () => {
      mockedUseAuth.mockReturnValue({
        user: mockUnverifiedUser,
        isAuthenticated: true,
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
      })

      render(<VerificationReminder />)
      expect(screen.getByText(mockUnverifiedUser.email)).toBeInTheDocument()
    })
  })

  describe('Dismiss Functionality', () => {
    it('should hide banner when dismiss button is clicked', async () => {
      mockedUseAuth.mockReturnValue({
        user: mockUnverifiedUser,
        isAuthenticated: true,
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
      })

      render(<VerificationReminder />)
      const dismissButton = screen.getByTestId('dismiss-verification-reminder')
      fireEvent.click(dismissButton)

      await waitFor(() => {
        expect(screen.queryByTestId('verification-reminder-banner')).not.toBeInTheDocument()
      })
    })

    it('should remember dismissal across re-renders', async () => {
      mockedUseAuth.mockReturnValue({
        user: mockUnverifiedUser,
        isAuthenticated: true,
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
      })

      const { rerender } = render(<VerificationReminder />)
      const dismissButton = screen.getByTestId('dismiss-verification-reminder')
      fireEvent.click(dismissButton)

      await waitFor(() => {
        expect(screen.queryByTestId('verification-reminder-banner')).not.toBeInTheDocument()
      })

      // Re-render component
      rerender(<VerificationReminder />)

      // Should still be dismissed
      expect(screen.queryByTestId('verification-reminder-banner')).not.toBeInTheDocument()
    })
  })

  describe('Resend Verification Email', () => {
    it('should have a resend verification button', () => {
      mockedUseAuth.mockReturnValue({
        user: mockUnverifiedUser,
        isAuthenticated: true,
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
      })

      render(<VerificationReminder />)
      expect(screen.getByTestId('resend-verification-from-banner')).toBeInTheDocument()
    })

    it('should call resendVerification when button is clicked', async () => {
      mockedUseAuth.mockReturnValue({
        user: mockUnverifiedUser,
        isAuthenticated: true,
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
      })

      mockedAuthApi.resendVerification.mockResolvedValueOnce({
        success: true,
        message: 'Verification email sent',
      })

      render(<VerificationReminder />)
      const resendButton = screen.getByTestId('resend-verification-from-banner')
      fireEvent.click(resendButton)

      await waitFor(() => {
        expect(mockedAuthApi.resendVerification).toHaveBeenCalledTimes(1)
      })
    })

    it('should show loading state while sending email', async () => {
      mockedUseAuth.mockReturnValue({
        user: mockUnverifiedUser,
        isAuthenticated: true,
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
      })

      mockedAuthApi.resendVerification.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => {
              resolve({ success: true, message: 'Sent' })
            }, 100)
          )
      )

      render(<VerificationReminder />)
      const resendButton = screen.getByTestId('resend-verification-from-banner')
      fireEvent.click(resendButton)

      // Should show loading text
      await waitFor(() => {
        expect(resendButton).toHaveTextContent(/sending/i)
        expect(resendButton).toBeDisabled()
      })
    })

    it('should show success message after successful resend', async () => {
      mockedUseAuth.mockReturnValue({
        user: mockUnverifiedUser,
        isAuthenticated: true,
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
      })

      mockedAuthApi.resendVerification.mockResolvedValueOnce({
        success: true,
        message: 'Verification email sent',
      })

      render(<VerificationReminder />)
      const resendButton = screen.getByTestId('resend-verification-from-banner')
      fireEvent.click(resendButton)

      await waitFor(() => {
        expect(screen.getByText(/verification email sent/i)).toBeInTheDocument()
      })
    })

    it('should show error message when resend fails', async () => {
      mockedUseAuth.mockReturnValue({
        user: mockUnverifiedUser,
        isAuthenticated: true,
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
      })

      mockedAuthApi.resendVerification.mockRejectedValueOnce(new Error('Rate limit exceeded'))

      render(<VerificationReminder />)
      const resendButton = screen.getByTestId('resend-verification-from-banner')
      fireEvent.click(resendButton)

      await waitFor(() => {
        expect(screen.getByText(/rate limit exceeded/i)).toBeInTheDocument()
      })
    })

    it('should clear success message after 5 seconds', async () => {
      jest.useFakeTimers()

      mockedUseAuth.mockReturnValue({
        user: mockUnverifiedUser,
        isAuthenticated: true,
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
      })

      mockedAuthApi.resendVerification.mockResolvedValueOnce({
        success: true,
        message: 'Verification email sent',
      })

      render(<VerificationReminder />)
      const resendButton = screen.getByTestId('resend-verification-from-banner')
      fireEvent.click(resendButton)

      await waitFor(() => {
        expect(screen.getByText(/verification email sent/i)).toBeInTheDocument()
      })

      // Fast-forward 5 seconds
      jest.advanceTimersByTime(5000)

      await waitFor(() => {
        expect(screen.queryByText(/verification email sent/i)).not.toBeInTheDocument()
      })

      jest.useRealTimers()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA role for banner', () => {
      mockedUseAuth.mockReturnValue({
        user: mockUnverifiedUser,
        isAuthenticated: true,
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
      })

      render(<VerificationReminder />)
      const banner = screen.getByTestId('verification-reminder-banner')
      expect(banner).toHaveAttribute('role', 'banner')
    })

    it('should have aria-label for dismiss button', () => {
      mockedUseAuth.mockReturnValue({
        user: mockUnverifiedUser,
        isAuthenticated: true,
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
      })

      render(<VerificationReminder />)
      const dismissButton = screen.getByTestId('dismiss-verification-reminder')
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss verification reminder')
    })
  })
})
