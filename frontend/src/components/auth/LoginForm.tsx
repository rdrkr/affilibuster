// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

/**
 * LoginForm Component
 * Provides a form for users to log in with email and password
 */

import React, { useState, useId } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import type { User } from '@/lib/auth'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Checkbox } from '@/components/Checkbox'
import { Card } from '@/components/Card'

/**
 * LoginForm component props
 */
export interface LoginFormProps {
  /**
   * Callback function called after successful login
   */
  onSuccess?: (user: User) => void | Promise<void>
  /**
   * Callback function called when user clicks "Create Account" link
   */
  onRegisterClick?: () => void | Promise<void>
}

/**
 * LoginForm Component
 * Renders a login form with email, password, and remember me fields
 *
 * @param props - Component props
 * @returns LoginForm component
 *
 * @example
 * ```tsx
 * <LoginForm onSuccess={(user) => router.push('/dashboard')} />
 * ```
 */
export function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps): React.ReactElement {
  const formId = useId()
  const { login, isLoading, error: authError, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

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
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    }

    // If there are validation errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Clear validation errors if all valid
    setErrors({})

    // Attempt login (fire and forget)
    void login(email, password, rememberMe).then(async user => {
      if (user && onSuccess) {
        await onSuccess(user)
      }
    })
  }

  return (
    <Card variant="info">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">Log In</h2>
          <p className="text-neutral-600 dark:text-neutral-300">Welcome back! Please log in to your account.</p>
        </div>

        {authError && (
          <div
            className="p-4 rounded-lg bg-error-50 dark:bg-error-900 border border-error-200 dark:border-error-700"
            role="alert"
            data-testid="login-error"
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
          data-testid="login-form-email"
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
          autoComplete="current-password"
          placeholder="Enter your password"
          disabled={isLoading}
          data-testid="login-form-password"
        />

        <Checkbox
          label="Remember me"
          id={`${formId}-rememberMe`}
          checked={rememberMe}
          onChange={e => {
            setRememberMe(e.target.checked)
          }}
          disabled={isLoading}
          data-testid="login-form-remember-me"
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
          size="lg"
          data-testid="login-form-submit"
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </Button>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Link
            href="/forgot-password"
            className="text-sm text-tertiary-600 dark:text-tertiary-400 hover:underline"
            tabIndex={isLoading ? -1 : 0}
          >
            Forgot password?
          </Link>
          <div className="text-sm text-neutral-600 dark:text-neutral-300">
            Don&apos;t have an account?{' '}
            {onRegisterClick ? (
              <button
                type="button"
                onClick={() => void onRegisterClick()}
                className="text-tertiary-600 dark:text-tertiary-400 hover:underline font-semibold"
                disabled={isLoading}
              >
                Create account
              </button>
            ) : (
              <Link href="/register" className="text-tertiary-600 dark:text-tertiary-400 hover:underline font-semibold">
                Create account
              </Link>
            )}
          </div>
        </div>
      </form>
    </Card>
  )
}
