// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

/**
 * VerificationReminder Component
 * Displays a banner for users with unverified email addresses
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { resendVerification } from '@/lib/auth/api'
import { Button } from '@/components/Button'

/**
 * VerificationReminder Component
 * Shows a dismissible banner prompting users to verify their email
 *
 * @returns VerificationReminder component or null if not applicable
 *
 * @example
 * ```tsx
 * <VerificationReminder />
 * ```
 */
export function VerificationReminder(): React.ReactElement | null {
  const { user } = useAuth()
  const [isDismissed, setIsDismissed] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      return () => {
        clearTimeout(timer)
      }
    }
    return undefined
  }, [successMessage])

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
   * Handle dismiss banner
   */
  const handleDismiss = (): void => {
    setIsDismissed(true)
  }

  // Don't show if user is not authenticated
  if (!user) {
    return null
  }

  // Don't show if email is already verified
  if (user.emailVerified) {
    return null
  }

  // Don't show if dismissed
  if (isDismissed) {
    return null
  }

  return (
    <div
      role="banner"
      data-testid="verification-reminder-banner"
      className="bg-warning-50 dark:bg-warning-900 border-b border-warning-200 dark:border-warning-700 px-4 py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-3">
          {/* Warning Icon */}
          <svg
            className="w-5 h-5 text-warning-700 dark:text-warning-300 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>

          {/* Message */}
          <div className="flex-1">
            <p className="text-sm text-warning-800 dark:text-warning-200">
              <span className="font-semibold">Verify your email</span> - Please check your inbox at{' '}
              <span className="font-medium">{user.email}</span> to verify your account.
            </p>

            {/* Success Message */}
            {successMessage && <p className="text-sm text-success-700 dark:text-success-300 mt-1">{successMessage}</p>}

            {/* Error Message */}
            {errorMessage && <p className="text-sm text-error-700 dark:text-error-200 mt-1">{errorMessage}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              void handleResendVerification()
            }}
            disabled={isResending}
            data-testid="resend-verification-from-banner"
          >
            {isResending ? 'Sending...' : 'Resend verification email'}
          </Button>

          <button
            type="button"
            onClick={handleDismiss}
            data-testid="dismiss-verification-reminder"
            aria-label="Dismiss verification reminder"
            className="p-1 text-warning-700 dark:text-warning-300 hover:text-warning-900 dark:hover:text-warning-100"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
