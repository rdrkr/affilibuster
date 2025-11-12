// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

/**
 * VerificationRequiredPrompt Component
 * Modal that prompts unverified users to verify their email before accessing features
 */

import React, { useState, useEffect } from 'react'
import { resendVerification } from '@/lib/auth/api'
import { Button } from '@/components/Button'

/**
 * VerificationRequiredPrompt props
 */
export interface VerificationRequiredPromptProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean
  /**
   * User's email address
   */
  email: string
  /**
   * Callback when modal should close
   */
  onClose: () => void
}

/**
 * VerificationRequiredPrompt Component
 * Shows a modal prompting users to verify their email
 *
 * @param props - Component props
 * @returns VerificationRequiredPrompt component or null
 *
 * @example
 * ```tsx
 * <VerificationRequiredPrompt
 *   isOpen={showModal}
 *   email="user@example.com"
 *   onClose={() => setShowModal(false)}
 * />
 * ```
 */
export function VerificationRequiredPrompt({
  isOpen,
  email,
  onClose,
}: VerificationRequiredPromptProps): React.ReactElement | null {
  const [isResending, setIsResending] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  /**
   * Handle resend verification email
   */
  const handleResendVerification = async (): Promise<void> => {
    setSuccessMessage(null)
    setErrorMessage(null)
    setIsResending(true)

    try {
      await resendVerification()
      setSuccessMessage('Verification email sent! Please check your inbox.')
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to resend verification email'
      setErrorMessage(error)
    } finally {
      setIsResending(false)
    }
  }

  /**
   * Handle overlay click
   */
  const handleOverlayClick = (): void => {
    onClose()
  }

  /**
   * Prevent modal content clicks from closing modal
   */
  const handleContentClick = (e: React.MouseEvent): void => {
    e.stopPropagation()
  }

  if (!isOpen) {
    return null
  }

  return (
    <div
      data-testid="modal-overlay"
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="verification-modal-title"
        data-testid="verification-required-modal"
        onClick={handleContentClick}
        className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Warning Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-warning-100 dark:bg-warning-900 flex items-center justify-center">
              <svg className="w-6 h-6 text-warning-700 dark:text-warning-300" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <h2 id="verification-modal-title" className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Email Verification Required
            </h2>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            data-testid="close-verification-modal"
            aria-label="Close modal"
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div data-testid="modal-content" className="space-y-4">
          <p className="text-neutral-700 dark:text-neutral-300">
            This feature requires email verification. Please check your inbox at{' '}
            <span className="font-medium text-neutral-900 dark:text-neutral-100">{email}</span> and click the
            verification link.
          </p>

          {/* Success Message */}
          {successMessage && (
            <div className="p-3 rounded-lg bg-success-50 dark:bg-success-900 border border-success-200 dark:border-success-700">
              <p className="text-sm text-success-700 dark:text-success-200">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-error-50 dark:bg-error-900 border border-error-200 dark:border-error-700">
              <p className="text-sm text-error-700 dark:text-error-200">{errorMessage}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => {
                void handleResendVerification()
              }}
              disabled={isResending}
              data-testid="resend-verification-modal"
              fullWidth
            >
              {isResending ? 'Sending...' : 'Resend verification email'}
            </Button>

            <Button type="button" variant="secondary" size="md" onClick={onClose} fullWidth>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
