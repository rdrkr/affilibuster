// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for VerificationRequiredPrompt component
 * Following TDD: Modal that prompts unverified users to verify their email
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VerificationRequiredPrompt } from '@/components/auth/VerificationRequiredPrompt'
import * as authApi from '@/lib/auth/api'

// Mock auth API
jest.mock('@/lib/auth/api', () => ({
  resendVerification: jest.fn(),
}))

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>

describe('VerificationRequiredPrompt', () => {
  const mockEmail = 'unverified@example.com'
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Visibility', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <VerificationRequiredPrompt isOpen={false} email={mockEmail} onClose={mockOnClose} />
      )
      expect(container.firstChild).toBeNull()
    })

    it('should render when isOpen is true', () => {
      render(<VerificationRequiredPrompt isOpen={true} email={mockEmail} onClose={mockOnClose} />)
      expect(screen.getByTestId('verification-required-modal')).toBeInTheDocument()
    })

    it('should show email verification required message', () => {
      render(<VerificationRequiredPrompt isOpen={true} email={mockEmail} onClose={mockOnClose} />)
      expect(screen.getByText(/email verification required/i)).toBeInTheDocument()
    })

    it('should display user email address', () => {
      render(<VerificationRequiredPrompt isOpen={true} email={mockEmail} onClose={mockOnClose} />)
      expect(screen.getByText(mockEmail)).toBeInTheDocument()
    })
  })

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', () => {
      render(<VerificationRequiredPrompt isOpen={true} email={mockEmail} onClose={mockOnClose} />)
      const closeButton = screen.getByTestId('close-verification-modal')
      fireEvent.click(closeButton)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when overlay is clicked', () => {
      render(<VerificationRequiredPrompt isOpen={true} email={mockEmail} onClose={mockOnClose} />)
      const overlay = screen.getByTestId('modal-overlay')
      fireEvent.click(overlay)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should not close when modal content is clicked', () => {
      render(<VerificationRequiredPrompt isOpen={true} email={mockEmail} onClose={mockOnClose} />)
      const modalContent = screen.getByTestId('modal-content')
      fireEvent.click(modalContent)
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('Resend Verification', () => {
    it('should have a resend verification button', () => {
      render(<VerificationRequiredPrompt isOpen={true} email={mockEmail} onClose={mockOnClose} />)
      expect(screen.getByTestId('resend-verification-modal')).toBeInTheDocument()
    })

    it('should call resendVerification when resend button is clicked', async () => {
      mockedAuthApi.resendVerification.mockResolvedValueOnce({
        success: true,
        message: 'Verification email sent',
      })

      render(<VerificationRequiredPrompt isOpen={true} email={mockEmail} onClose={mockOnClose} />)
      const resendButton = screen.getByTestId('resend-verification-modal')
      fireEvent.click(resendButton)

      await waitFor(() => {
        expect(mockedAuthApi.resendVerification).toHaveBeenCalledTimes(1)
      })
    })

    it('should show loading state while sending', async () => {
      mockedAuthApi.resendVerification.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => {
              resolve({ success: true, message: 'Sent' })
            }, 100)
          )
      )

      render(<VerificationRequiredPrompt isOpen={true} email={mockEmail} onClose={mockOnClose} />)
      const resendButton = screen.getByTestId('resend-verification-modal')
      fireEvent.click(resendButton)

      await waitFor(() => {
        expect(resendButton).toHaveTextContent(/sending/i)
        expect(resendButton).toBeDisabled()
      })
    })

    it('should show success message after successful resend', async () => {
      mockedAuthApi.resendVerification.mockResolvedValueOnce({
        success: true,
        message: 'Verification email sent',
      })

      render(<VerificationRequiredPrompt isOpen={true} email={mockEmail} onClose={mockOnClose} />)
      const resendButton = screen.getByTestId('resend-verification-modal')
      fireEvent.click(resendButton)

      await waitFor(() => {
        expect(screen.getByText(/verification email sent/i)).toBeInTheDocument()
      })
    })

    it('should show error message when resend fails', async () => {
      mockedAuthApi.resendVerification.mockRejectedValueOnce(new Error('Rate limit exceeded'))

      render(<VerificationRequiredPrompt isOpen={true} email={mockEmail} onClose={mockOnClose} />)
      const resendButton = screen.getByTestId('resend-verification-modal')
      fireEvent.click(resendButton)

      await waitFor(() => {
        expect(screen.getByText(/rate limit exceeded/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have modal role', () => {
      render(<VerificationRequiredPrompt isOpen={true} email={mockEmail} onClose={mockOnClose} />)
      const modal = screen.getByTestId('verification-required-modal')
      expect(modal).toHaveAttribute('role', 'dialog')
    })

    it('should have aria-modal attribute', () => {
      render(<VerificationRequiredPrompt isOpen={true} email={mockEmail} onClose={mockOnClose} />)
      const modal = screen.getByTestId('verification-required-modal')
      expect(modal).toHaveAttribute('aria-modal', 'true')
    })

    it('should have aria-labelledby', () => {
      render(<VerificationRequiredPrompt isOpen={true} email={mockEmail} onClose={mockOnClose} />)
      const modal = screen.getByTestId('verification-required-modal')
      expect(modal).toHaveAttribute('aria-labelledby')
    })

    it('should have close button with aria-label', () => {
      render(<VerificationRequiredPrompt isOpen={true} email={mockEmail} onClose={mockOnClose} />)
      const closeButton = screen.getByTestId('close-verification-modal')
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal')
    })
  })

  describe('Keyboard Navigation', () => {
    it('should close modal when Escape key is pressed', () => {
      render(<VerificationRequiredPrompt isOpen={true} email={mockEmail} onClose={mockOnClose} />)
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should not close for other keys', () => {
      render(<VerificationRequiredPrompt isOpen={true} email={mockEmail} onClose={mockOnClose} />)
      fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' })
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })
})
