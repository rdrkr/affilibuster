// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for ResetPasswordForm component
 * Following TDD: Tests written FIRST, before implementation
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import * as authApi from '@/lib/auth/api'

// Mock the auth API
jest.mock('@/lib/auth/api')
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>

describe('ResetPasswordForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render reset password form with all fields', () => {
    render(<ResetPasswordForm token="test-token" />)

    expect(screen.getByPlaceholderText('At least 8 characters')).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset password|set new password/i })).toBeInTheDocument()
  })

  it('should handle successful password reset', async () => {
    mockedAuthApi.resetPassword.mockResolvedValueOnce({
      success: true,
      message: 'Password reset successful',
    })

    const onSuccess = jest.fn()

    render(<ResetPasswordForm token="test-token" onSuccess={onSuccess} />)

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'newpassword123!' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'newpassword123!' },
    })

    // Submit form
    const form = screen.getByPlaceholderText('At least 8 characters').closest('form')
    fireEvent.submit(form!)

    // Wait for async operations
    await waitFor(() => {
      expect(mockedAuthApi.resetPassword).toHaveBeenCalledWith('test-token', 'newpassword123!')
    })

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })

    // Success message should be displayed
    await waitFor(() => {
      expect(screen.getByText(/password reset successful/i)).toBeInTheDocument()
    })
  })

  it('should display error message on reset failure', async () => {
    mockedAuthApi.resetPassword.mockRejectedValueOnce(new Error('Invalid or expired token'))

    render(<ResetPasswordForm token="invalid-token" />)

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'newpassword123!' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'newpassword123!' },
    })

    // Submit form
    const form = screen.getByPlaceholderText('At least 8 characters').closest('form')
    fireEvent.submit(form!)

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/invalid or expired token/i)).toBeInTheDocument()
    })
  })

  it('should require password field', async () => {
    render(<ResetPasswordForm token="test-token" />)

    // Fill in only confirm password
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123!' },
    })

    // Submit form
    const form = screen.getByLabelText(/confirm password/i).closest('form')
    fireEvent.submit(form!)

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })

    // Should not call API
    expect(mockedAuthApi.resetPassword).not.toHaveBeenCalled()
  })

  it('should validate password strength (minimum 8 characters)', async () => {
    render(<ResetPasswordForm token="test-token" />)

    // Fill in form with weak password
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'weak' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'weak' },
    })

    // Submit form
    const form = screen.getByPlaceholderText('At least 8 characters').closest('form')
    fireEvent.submit(form!)

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })

    // Should not call API
    expect(mockedAuthApi.resetPassword).not.toHaveBeenCalled()
  })

  it('should validate password confirmation match', async () => {
    render(<ResetPasswordForm token="test-token" />)

    // Fill in form with mismatched passwords
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'password123!' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'differentpassword' },
    })

    // Submit form
    const form = screen.getByPlaceholderText('At least 8 characters').closest('form')
    fireEvent.submit(form!)

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })

    // Should not call API
    expect(mockedAuthApi.resetPassword).not.toHaveBeenCalled()
  })

  it('should disable submit button while loading', async () => {
    mockedAuthApi.resetPassword.mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({ success: true, message: 'Password reset' })
          }, 100)
        })
    )

    render(<ResetPasswordForm token="test-token" />)

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'newpassword123!' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'newpassword123!' },
    })

    // Submit form
    const form = screen.getByPlaceholderText('At least 8 characters').closest('form')
    fireEvent.submit(form!)

    // Button should be disabled during loading
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resetting/i })).toBeDisabled()
    })
  })

  it('should show link to login page', () => {
    render(<ResetPasswordForm token="test-token" />)

    const loginLink = screen.getByRole('link', { name: /back to log in|log in/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', expect.stringContaining('/login'))
  })

  it('should call onLoginClick when login button is clicked', () => {
    const onLoginClick = jest.fn()

    render(<ResetPasswordForm token="test-token" onLoginClick={onLoginClick} />)

    // Click the login button
    const loginButton = screen.getByRole('button', { name: /back to log in|log in/i })
    fireEvent.click(loginButton)

    expect(onLoginClick).toHaveBeenCalled()
  })

  it('should call onSuccess callback after successful reset', async () => {
    const onSuccess = jest.fn()
    mockedAuthApi.resetPassword.mockResolvedValueOnce({
      success: true,
      message: 'Password reset',
    })

    render(<ResetPasswordForm token="test-token" onSuccess={onSuccess} />)

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'newpassword123!' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'newpassword123!' },
    })

    // Submit form
    const form = screen.getByPlaceholderText('At least 8 characters').closest('form')
    fireEvent.submit(form!)

    // Wait for reset to complete and callback to be called
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should handle non-Error exceptions', async () => {
    mockedAuthApi.resetPassword.mockRejectedValueOnce('Network error')

    render(<ResetPasswordForm token="test-token" />)

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'newpassword123!' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'newpassword123!' },
    })

    // Submit form
    const form = screen.getByPlaceholderText('At least 8 characters').closest('form')
    fireEvent.submit(form!)

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/failed to reset password/i)).toBeInTheDocument()
    })
  })
})
