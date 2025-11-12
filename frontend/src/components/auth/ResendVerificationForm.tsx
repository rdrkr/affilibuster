// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

/**
 * ResendVerificationForm Component
 * Provides a form for users to resend email verification
 */

import React, { useState } from 'react'
import Link from 'next/link'
import { resendVerification } from '@/lib/auth/api'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'

/**
 * ResendVerificationForm component props
 */
export interface ResendVerificationFormProps {
  /**
   * Callback function called after successful verification email sent
   */
  onSuccess?: () => void
  /**
   * Callback function called when user clicks "Back to Log In" link
   */
  onLoginClick?: () => void
}

/**
 * ResendVerificationForm Component
 * Renders a form for resending email verification
 * Requires user to be authenticated
 *
 * @param props - Component props
 * @returns ResendVerificationForm component
 *
 * @example
 * ```tsx
 * <ResendVerificationForm onSuccess={() => setShowSuccess(true)} />
 * ```
 */
export function ResendVerificationForm({ onSuccess, onLoginClick }: ResendVerificationFormProps): React.ReactElement {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    // Clear previous errors
    setError(null)
    setSuccessMessage(null)

    if (!user) {
      setError('You must be logged in to resend verification email')
      return
    }

    // Attempt to resend verification email
    setIsLoading(true)
    void (async () => {
      try {
        await resendVerification()
        setSuccessMessage('Check your email for a verification link')
        if (onSuccess) {
          onSuccess()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send verification email')
      } finally {
        setIsLoading(false)
      }
    })()
  }

  return (
    <Card variant="info">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">Resend Verification</h2>
          <p className="text-neutral-600 dark:text-neutral-300">
            {user ? `We'll send a verification link to ${user.email}` : 'Please log in to resend verification email'}
          </p>
        </div>

        {error && (
          <div
            className="p-4 rounded-lg bg-error-50 dark:bg-error-900 border border-error-200 dark:border-error-700"
            role="alert"
          >
            <p className="text-error-700 dark:text-error-200">{error}</p>
          </div>
        )}

        {successMessage && (
          <div
            className="p-4 rounded-lg bg-success-50 dark:bg-success-900 border border-success-200 dark:border-success-700"
            role="alert"
            data-testid="verification-resent-success"
          >
            <p className="text-success-700 dark:text-success-200">{successMessage}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading || !user}
          size="lg"
          data-testid="resend-verification-button"
        >
          {isLoading ? 'Sending...' : 'Resend Verification Email'}
        </Button>

        <div className="flex justify-center items-center pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="text-sm text-neutral-600 dark:text-neutral-300">
            {onLoginClick ? (
              <button
                type="button"
                onClick={onLoginClick}
                className="text-tertiary-600 dark:text-tertiary-400 hover:underline font-semibold"
                disabled={isLoading}
              >
                Back to Log In
              </button>
            ) : (
              <Link href="/login" className="text-tertiary-600 dark:text-tertiary-400 hover:underline font-semibold">
                Back to Log In
              </Link>
            )}
          </div>
        </div>
      </form>
    </Card>
  )
}
