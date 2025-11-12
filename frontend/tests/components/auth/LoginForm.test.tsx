// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for LoginForm component
 * Following TDD: Tests written FIRST, before implementation
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { User } from '@/lib/auth/types'
import { StatusEnum } from '@/lib/auth'
import { AuthProvider } from '@/lib/auth/AuthProvider'
import { LoginForm } from '@/components/auth/LoginForm'
import * as authApi from '@/lib/auth/api'

// Mock the auth API
jest.mock('@/lib/auth/api')
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>

describe('LoginForm Component', () => {
  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: false,
    status: StatusEnum.ACTIVE,
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-11-01T10:00:00Z',
    lastLoginAt: '2025-11-01T10:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock refresh to fail (no active session) - need to set this for each test
    mockedAuthApi.refresh.mockRejectedValue(new Error('No session'))
  })

  it('should render login form with all fields', async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log in/i })).not.toBeDisabled()
    })

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('should handle successful login', async () => {
    mockedAuthApi.login.mockResolvedValueOnce({
      success: true,
      user: mockUser,
      sessionToken: 'mock-session-token',
    })

    const onSuccess = jest.fn()

    render(
      <AuthProvider>
        <LoginForm onSuccess={onSuccess} />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log in/i })).not.toBeDisabled()
    })

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    // Wait for async operations
    await waitFor(() => {
      expect(mockedAuthApi.login).toHaveBeenCalledWith('test@example.com', 'password123', false)
    })

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockUser)
    })
  })

  it('should handle rememberMe checkbox', async () => {
    mockedAuthApi.login.mockResolvedValueOnce({
      success: true,
      user: mockUser,
      sessionToken: 'mock-session-token',
    })

    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log in/i })).not.toBeDisabled()
    })

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })

    // Check "Remember me"
    fireEvent.click(screen.getByLabelText(/remember me/i))

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(mockedAuthApi.login).toHaveBeenCalledWith('test@example.com', 'password123', true)
    })
  })

  it('should display error message on login failure', async () => {
    mockedAuthApi.login.mockRejectedValueOnce(new Error('Invalid credentials'))

    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log in/i })).not.toBeDisabled()
    })

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    })

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('should validate email format', async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log in/i })).not.toBeDisabled()
    })

    // Enter invalid email and valid password
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

    fireEvent.change(emailInput, {
      target: { value: 'notanemail' },
    })
    fireEvent.change(passwordInput, {
      target: { value: 'password123' },
    })

    // Submit form - get the form element and submit it
    const form = emailInput.closest('form')
    fireEvent.submit(form!)

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })

    // Should not call API
    expect(mockedAuthApi.login).not.toHaveBeenCalled()
  })

  it('should require email field', async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log in/i })).not.toBeDisabled()
    })

    // Enter only password
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })

    // Submit form
    const form = screen.getByLabelText(/password/i).closest('form')
    fireEvent.submit(form!)

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })

    // Should not call API
    expect(mockedAuthApi.login).not.toHaveBeenCalled()
  })

  it('should require password field', async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log in/i })).not.toBeDisabled()
    })

    // Enter only email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })

    // Submit form
    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })

    // Should not call API
    expect(mockedAuthApi.login).not.toHaveBeenCalled()
  })

  it('should disable submit button while loading', async () => {
    mockedAuthApi.login.mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({ success: true, user: mockUser, sessionToken: 'mock-session-token' })
          }, 100)
        })
    )

    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log in/i })).not.toBeDisabled()
    })

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })

    // Submit form
    const submitButton = screen.getByRole('button', { name: /log in/i })
    fireEvent.click(submitButton)

    // Button should be disabled while loading
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })
  })

  it('should show link to registration page', async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log in/i })).not.toBeDisabled()
    })

    const registerLink = screen.getByRole('link', { name: /create account|sign up|register/i })
    expect(registerLink).toBeInTheDocument()
    expect(registerLink).toHaveAttribute('href', expect.stringContaining('/register'))
  })

  it('should show link to forgot password page', async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log in/i })).not.toBeDisabled()
    })

    const forgotLink = screen.getByRole('link', { name: /forgot password/i })
    expect(forgotLink).toBeInTheDocument()
    expect(forgotLink).toHaveAttribute('href', expect.stringContaining('/forgot-password'))
  })

  it('should call onSuccess callback after successful login', async () => {
    const onSuccess = jest.fn()
    mockedAuthApi.login.mockResolvedValueOnce({
      success: true,
      user: mockUser,
      sessionToken: 'mock-session-token',
    })

    render(
      <AuthProvider>
        <LoginForm onSuccess={onSuccess} />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log in/i })).not.toBeDisabled()
    })

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })

    // Submit form
    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    // Wait for login to complete and callback to be called
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockUser)
    })
  })

  it('should call onRegisterClick when register button is clicked', async () => {
    const onRegisterClick = jest.fn()

    render(
      <AuthProvider>
        <LoginForm onRegisterClick={onRegisterClick} />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log in/i })).not.toBeDisabled()
    })

    // Click the register button
    const registerButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(registerButton)

    expect(onRegisterClick).toHaveBeenCalled()
  })

  it('should not call onSuccess when login returns null user', async () => {
    const onSuccess = jest.fn()
    mockedAuthApi.login.mockResolvedValueOnce({
      success: false,
      user: null as unknown as User,
      sessionToken: 'mock-session-token',
    })

    render(
      <AuthProvider>
        <LoginForm onSuccess={onSuccess} />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log in/i })).not.toBeDisabled()
    })

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })

    // Submit form
    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    // Wait for login to complete
    await waitFor(() => {
      expect(mockedAuthApi.login).toHaveBeenCalled()
    })

    // onSuccess should not be called
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
