// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for ForgotPasswordForm component
 * Following TDD: Tests written FIRST, before implementation
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import * as authApi from '@/lib/auth/api'

// Mock the auth API
jest.mock('@/lib/auth/api')
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>

describe('ForgotPasswordForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render forgot password form with email field', () => {
    render(<ForgotPasswordForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send reset link|reset password/i })).toBeInTheDocument()
  })

  it('should handle successful password reset request', async () => {
    mockedAuthApi.forgotPassword.mockResolvedValueOnce({
      success: true,
      message: 'Password reset email sent',
    })

    const onSuccess = jest.fn()

    render(<ForgotPasswordForm onSuccess={onSuccess} />)

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })

    // Submit form
    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    // Wait for async operations
    await waitFor(() => {
      expect(mockedAuthApi.forgotPassword).toHaveBeenCalledWith('test@example.com')
    })

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })

    // Success message should be displayed
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })
  })

  it('should display error message on request failure', async () => {
    mockedAuthApi.forgotPassword.mockRejectedValueOnce(new Error('User not found'))

    render(<ForgotPasswordForm />)

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'nonexistent@example.com' },
    })

    // Submit form
    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/user not found/i)).toBeInTheDocument()
    })
  })

  it('should validate email format', async () => {
    render(<ForgotPasswordForm />)

    // Enter invalid email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'notanemail' },
    })

    // Submit form
    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })

    // Should not call API
    expect(mockedAuthApi.forgotPassword).not.toHaveBeenCalled()
  })

  it('should require email field', async () => {
    render(<ForgotPasswordForm />)

    // Submit form without filling email
    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })

    // Should not call API
    expect(mockedAuthApi.forgotPassword).not.toHaveBeenCalled()
  })

  it('should disable submit button while loading', async () => {
    mockedAuthApi.forgotPassword.mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({ success: true, message: 'Email sent' })
          }, 100)
        })
    )

    render(<ForgotPasswordForm />)

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })

    // Submit form
    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    // Button should be disabled during loading
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled()
    })
  })

  it('should show link to login page', () => {
    render(<ForgotPasswordForm />)

    const loginLink = screen.getByRole('link', { name: /back to log in|log in/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', expect.stringContaining('/login'))
  })

  it('should call onLoginClick when login button is clicked', () => {
    const onLoginClick = jest.fn()

    render(<ForgotPasswordForm onLoginClick={onLoginClick} />)

    // Click the login button
    const loginButton = screen.getByRole('button', { name: /back to log in|log in/i })
    fireEvent.click(loginButton)

    expect(onLoginClick).toHaveBeenCalled()
  })

  it('should call onSuccess callback after successful request', async () => {
    const onSuccess = jest.fn()
    mockedAuthApi.forgotPassword.mockResolvedValueOnce({
      success: true,
      message: 'Email sent',
    })

    render(<ForgotPasswordForm onSuccess={onSuccess} />)

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })

    // Submit form
    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    // Wait for request to complete and callback to be called
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should handle non-Error exceptions', async () => {
    mockedAuthApi.forgotPassword.mockRejectedValueOnce('Network error')

    render(<ForgotPasswordForm />)

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })

    // Submit form
    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/failed to send reset email/i)).toBeInTheDocument()
    })
  })
})
