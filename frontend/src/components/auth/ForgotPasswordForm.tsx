// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

/**
 * ForgotPasswordForm Component
 * Provides a form for users to request a password reset email
 */

import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { forgotPassword } from '@/lib/auth/api'
import Link from 'next/link'
import React, { useId, useState } from 'react'

/**
 * ForgotPasswordForm component props
 */
export interface ForgotPasswordFormProps {
  /**
   * Callback function called after successful password reset request
   */
  onSuccess?: () => void
  /**
   * Callback function called when user clicks "Back to Log In" link
   */
  onLoginClick?: () => void
}

/**
 * ForgotPasswordForm Component
 * Renders a form for requesting a password reset email
 *
 * @param props - Component props
 * @returns ForgotPasswordForm component
 *
 * @example
 * ```tsx
 * <ForgotPasswordForm onSuccess={() => setShowSuccessMessage(true)} />
 * ```
 */
export function ForgotPasswordForm({ onSuccess, onLoginClick }: ForgotPasswordFormProps): React.ReactElement {
  const formId = useId()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | undefined>(undefined)

  /**
   * Validate email format
   */
  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    // Clear previous errors
    setError(null)
    setEmailError(undefined)
    setSuccessMessage(null)

    // Validate email
    if (!email) {
      setEmailError('Email is required')
      return
    }

    if (!validateEmail(email)) {
      setEmailError('Invalid email address')
      return
    }

    // Attempt password reset request
    setIsLoading(true)
    void (async () => {
      try {
        await forgotPassword(email)
        setSuccessMessage('Check your email for a password reset link')
        if (onSuccess) {
          onSuccess()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send reset email')
      } finally {
        setIsLoading(false)
      }
    })()
  }

  return (
    <Card variant="info">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">Reset Password</h2>
          <p className="text-neutral-600 dark:text-neutral-300">
            Enter your email address and we&apos;ll send you a link to reset your password
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
            data-testid="password-reset-requested"
          >
            <p className="text-success-700 dark:text-success-200">{successMessage}</p>
          </div>
        )}

        <Input
          type="email"
          label="Email"
          id={`${formId}-email`}
          value={email}
          onChange={e => {
            setEmail(e.target.value)
          }}
          error={emailError}
          required
          autoComplete="email"
          placeholder="you@example.com"
          disabled={isLoading}
          data-testid="forgot-password-form-email"
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
          size="lg"
          data-testid="forgot-password-form-submit"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>

        <div className="flex justify-center items-center pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="text-sm text-neutral-600 dark:text-neutral-300">
            Remember your password?{' '}
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
              <Link
                href="/login"
                className="text-tertiary-600 dark:text-tertiary-400 hover:underline font-semibold"
                data-testid="back-to-login"
              >
                Back to Log In
              </Link>
            )}
          </div>
        </div>
      </form>
    </Card>
  )
}
