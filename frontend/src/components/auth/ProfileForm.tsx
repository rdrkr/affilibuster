// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

/**
 * ProfileForm Component
 * Provides a form for users to update their profile information
 */

import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { useAuth } from '@/lib/auth'
import { resendVerification, updateProfile } from '@/lib/auth/api'
import React, { useEffect, useId, useState } from 'react'

/**
 * ProfileForm component props
 */
export interface ProfileFormProps {
  /**
   * Callback function called after successful profile update
   */
  onSuccess?: () => void
}

/**
 * ProfileForm Component
 * Renders a form for updating user profile information
 * Requires user to be authenticated
 *
 * @param props - Component props
 * @returns ProfileForm component
 *
 * @example
 * ```tsx
 * <ProfileForm onSuccess={() => console.log('Profile updated!')} />
 * ```
 */
export function ProfileForm({ onSuccess }: ProfileFormProps): React.ReactElement {
  const formId = useId()
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ displayName?: string }>({})
  const [isResendingVerification, setIsResendingVerification] = useState(false)
  const [verificationResentSuccess, setVerificationResentSuccess] = useState(false)
  const [rateLimitError, setRateLimitError] = useState<string | null>(null)

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName)
    }
  }, [user])

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    // Clear previous errors
    setError(null)
    setErrors({})
    setSuccessMessage(null)

    // Validate form
    const newErrors: { displayName?: string } = {}
    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Attempt to update profile
    setIsLoading(true)
    void (async () => {
      try {
        const updatedProfile = await updateProfile({
          displayName: displayName.trim(),
        })
        // Backend returns UserProfile directly (no message field per OpenAPI spec)
        setSuccessMessage(`Profile updated successfully. Display name: ${updatedProfile.display_name}`)
        if (onSuccess) {
          onSuccess()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update profile')
      } finally {
        setIsLoading(false)
      }
    })()
  }

  /**
   * Handle resend verification email
   */
  const handleResendVerification = async (): Promise<void> => {
    // Clear previous messages
    setVerificationResentSuccess(false)
    setRateLimitError(null)

    setIsResendingVerification(true)
    try {
      await resendVerification()
      setVerificationResentSuccess(true)
    } catch (err) {
      // Check if it's a rate limit error (429)
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend verification email'
      if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
        setRateLimitError('Please wait before requesting another verification email')
      } else {
        setRateLimitError(errorMessage)
      }
    } finally {
      setIsResendingVerification(false)
    }
  }

  /**
   * Close notification
   */
  const closeNotification = (): void => {
    setVerificationResentSuccess(false)
    setRateLimitError(null)
  }

  return (
    <Card variant="info">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">Update Profile</h2>
          <p className="text-neutral-600 dark:text-neutral-300">Update your profile information</p>
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
          >
            <p className="text-success-700 dark:text-success-200">{successMessage}</p>
          </div>
        )}

        <Input
          type="text"
          label="Display Name"
          id={`${formId}-displayName`}
          value={displayName}
          onChange={e => {
            setDisplayName(e.target.value)
          }}
          placeholder="Enter your display name"
          required
          disabled={isLoading || !user}
          error={errors.displayName}
        />

        {user && (
          <div className="space-y-4">
            <div className="text-sm text-neutral-600 dark:text-neutral-300">
              <strong>Email:</strong> {user.email} (cannot be changed)
            </div>

            {/* Email Verification Status */}
            <div data-testid="profile-form-email-status" className="space-y-3">
              {user.emailVerified ? (
                <div className="flex items-center gap-2 text-sm text-success-700 dark:text-success-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Email verified</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-warning-700 dark:text-warning-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Email not verified</span>
                  </div>

                  {/* Verification Resent Success Notification */}
                  {verificationResentSuccess && (
                    <div
                      data-testid="verification-resent-success"
                      className="p-3 rounded-lg bg-success-50 dark:bg-success-900 border border-success-200 dark:border-success-700 flex items-start justify-between"
                      role="alert"
                    >
                      <p className="text-sm text-success-700 dark:text-success-200">
                        Verification email sent! Please check your inbox.
                      </p>
                      <button
                        type="button"
                        onClick={closeNotification}
                        data-testid="close-notification"
                        className="ml-2 text-success-700 dark:text-success-200 hover:text-success-900 dark:hover:text-success-100"
                        aria-label="Close notification"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Rate Limit Error Notification */}
                  {rateLimitError && (
                    <div
                      data-testid="rate-limit-error"
                      className="p-3 rounded-lg bg-error-50 dark:bg-error-900 border border-error-200 dark:border-error-700 flex items-start justify-between"
                      role="alert"
                    >
                      <p className="text-sm text-error-700 dark:text-error-200">{rateLimitError}</p>
                      <button
                        type="button"
                        onClick={closeNotification}
                        data-testid="close-notification"
                        className="ml-2 text-error-700 dark:text-error-200 hover:text-error-900 dark:hover:text-error-100"
                        aria-label="Close notification"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Resend Verification Button */}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      void handleResendVerification()
                    }}
                    disabled={isResendingVerification}
                    data-testid="resend-verification-button"
                  >
                    {isResendingVerification ? 'Sending...' : 'Resend verification email'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <Button type="submit" variant="primary" fullWidth disabled={isLoading || !user} size="lg">
          {isLoading ? 'Updating Profile...' : 'Update Profile'}
        </Button>
      </form>
    </Card>
  )
}
