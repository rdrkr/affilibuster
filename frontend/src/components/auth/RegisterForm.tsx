// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

/**
 * RegisterForm Component
 * Provides a form for users to create a new account
 */

import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import type { User } from '@/lib/auth'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import React, { useId, useState } from 'react'

/**
 * RegisterForm component props
 */
export interface RegisterFormProps {
  /**
   * Callback function called after successful registration
   */
  onSuccess?: (user: User) => void | Promise<void>
  /**
   * Callback function called when user clicks "Log In" link
   */
  onLoginClick?: () => void | Promise<void>
}

/**
 * RegisterForm Component
 * Renders a registration form with email, password, confirm password, and display name fields
 *
 * @param props - Component props
 * @returns RegisterForm component
 *
 * @example
 * ```tsx
 * <RegisterForm onSuccess={(user) => router.push('/dashboard')} />
 * ```
 */
export function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps): React.ReactElement {
  const formId = useId()
  const { register, isLoading, error: authError, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
    displayName?: string
  }>({})

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

    // Clear auth provider error
    clearError()

    // Validate fields
    const newErrors: {
      email?: string
      password?: string
      confirmPassword?: string
      displayName?: string
    } = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!displayName) {
      newErrors.displayName = 'Display name is required'
    }

    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // If there are validation errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Clear validation errors if all valid
    setErrors({})

    // Attempt registration (fire and forget)
    void register(email, password, displayName).then(async user => {
      if (user && onSuccess) {
        await onSuccess(user)
      }
    })
  }

  return (
    <Card variant="info">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">Create Account</h2>
          <p className="text-neutral-600 dark:text-neutral-300">Sign up to get started</p>
        </div>

        {authError && (
          <div
            className="p-4 rounded-lg bg-error-50 dark:bg-error-900 border border-error-200 dark:border-error-700"
            role="alert"
            data-testid="registration-error"
          >
            <p className="text-error-700 dark:text-error-200">{authError}</p>
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
          error={errors.email}
          required
          autoComplete="email"
          placeholder="you@example.com"
          disabled={isLoading}
          data-testid="register-form-email"
        />

        <Input
          type="text"
          label="Display Name"
          id={`${formId}-displayName`}
          value={displayName}
          onChange={e => {
            setDisplayName(e.target.value)
          }}
          error={errors.displayName}
          required
          autoComplete="name"
          placeholder="John Doe"
          disabled={isLoading}
          data-testid="register-form-name"
        />

        <Input
          type="password"
          label="Password"
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
          data-testid="register-form-password"
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
          data-testid="register-form-confirm-password"
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
          size="lg"
          data-testid="register-form-submit"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <div className="flex justify-center items-center pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="text-sm text-neutral-600 dark:text-neutral-300">
            Already have an account?{' '}
            {onLoginClick ? (
              <button
                type="button"
                onClick={() => void onLoginClick()}
                className="text-tertiary-600 dark:text-tertiary-400 hover:underline font-semibold"
                disabled={isLoading}
              >
                Log In
              </button>
            ) : (
              <Link href="/login" className="text-tertiary-600 dark:text-tertiary-400 hover:underline font-semibold">
                Log In
              </Link>
            )}
          </div>
        </div>
      </form>
    </Card>
  )
}
