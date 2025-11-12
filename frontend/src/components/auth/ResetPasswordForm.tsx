// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

/**
 * ResetPasswordForm Component
 * Provides a form for users to reset their password with a token
 */

import React, { useState, useId } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/lib/auth/api'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Card } from '@/components/Card'

/**
 * ResetPasswordForm component props
 */
export interface ResetPasswordFormProps {
  /**
   * Reset token from email link
   */
  token: string
  /**
   * Callback function called after successful password reset
   */
  onSuccess?: () => void
  /**
   * Callback function called when user clicks "Back to Log In" link
   */
  onLoginClick?: () => void
}

/**
 * ResetPasswordForm Component
 * Renders a form for resetting password with a token
 *
 * @param props - Component props
 * @returns ResetPasswordForm component
 *
 * @example
 * ```tsx
 * <ResetPasswordForm token={token} onSuccess={() => router.push('/login')} />
 * ```
 */
export function ResetPasswordForm({ token, onSuccess, onLoginClick }: ResetPasswordFormProps): React.ReactElement {
  const formId = useId()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState<{
    password?: string
    confirmPassword?: string
  }>({})

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    // Clear previous errors
    setError(null)
    setErrors({})
    setSuccessMessage(null)

    // Validate fields
    const newErrors: {
      password?: string
      confirmPassword?: string
    } = {}

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // If there are validation errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Attempt password reset
    setIsLoading(true)
    void (async () => {
      try {
        await resetPassword(token, password)
        setSuccessMessage('Password reset successful! You can now log in with your new password.')
        if (onSuccess) {
          onSuccess()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to reset password')
      } finally {
        setIsLoading(false)
      }
    })()
  }

  return (
    <Card variant="info">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">Set New Password</h2>
          <p className="text-neutral-600 dark:text-neutral-300">Enter your new password below</p>
        </div>

        {error && (
          <div
            className="p-4 rounded-lg bg-error-50 dark:bg-error-900 border border-error-200 dark:border-error-700"
            role="alert"
            data-testid="reset-error"
          >
            <p className="text-error-700 dark:text-error-200">{error}</p>
          </div>
        )}

        {successMessage && (
          <div
            className="p-4 rounded-lg bg-success-50 dark:bg-success-900 border border-success-200 dark:border-success-700"
            role="alert"
            data-testid="password-reset-success"
          >
            <p className="text-success-700 dark:text-success-200">{successMessage}</p>
          </div>
        )}

        <Input
          type="password"
          label="New Password"
          id={`${formId}-password`}
          value={password}
          onChange={e => {
            setPassword(e.target.value)
          }}
          error={errors.password}
          required
          autoComplete="new-password"
          placeholder="At least 8 characters"
          disabled={isLoading}
          data-testid="reset-password-form-password"
        />

        <Input
          type="password"
          label="Confirm Password"
          id={`${formId}-confirmPassword`}
          value={confirmPassword}
          onChange={e => {
            setConfirmPassword(e.target.value)
          }}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
          placeholder="Re-enter your password"
          disabled={isLoading}
          data-testid="reset-password-form-confirm-password"
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
          size="lg"
          data-testid="reset-password-form-submit"
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
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
