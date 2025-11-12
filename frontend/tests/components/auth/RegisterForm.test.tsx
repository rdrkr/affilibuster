// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for RegisterForm component
 * Following TDD: Tests written FIRST, before implementation
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { User } from '@/lib/auth/types'
import { StatusEnum } from '@/lib/auth'
import { AuthProvider } from '@/lib/auth/AuthProvider'
import { RegisterForm } from '@/components/auth/RegisterForm'
import * as authApi from '@/lib/auth/api'

// Mock the auth API
jest.mock('@/lib/auth/api')
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>

describe('RegisterForm Component', () => {
  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: false,
    status: StatusEnum.ACTIVE,
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-11-01T10:00:00Z',
    lastLoginAt: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock refresh to fail (no active session)
    mockedAuthApi.refresh.mockRejectedValue(new Error('No session'))
  })

  it('should render registration form with all fields', async () => {
    render(
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument()
    })

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('At least 8 characters')).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument()
    const button = screen.getByRole('button', { name: /^create account$/i })
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
  })

  it('should handle successful registration', async () => {
    mockedAuthApi.register.mockResolvedValueOnce({
      success: true,
      user: mockUser,
      message: 'Registration successful',
    })

    const onSuccess = jest.fn()

    render(
      <AuthProvider>
        <RegisterForm onSuccess={onSuccess} />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument()
    })

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'password123!' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123!' },
    })
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Test User' },
    })

    // Submit form
    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    // Wait for async operations
    await waitFor(() => {
      expect(mockedAuthApi.register).toHaveBeenCalledWith('test@example.com', 'password123!', 'Test User')
    })

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockUser)
    })
  })

  it('should display error message on registration failure', async () => {
    mockedAuthApi.register.mockRejectedValueOnce(new Error('Email already exists'))

    render(
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument()
    })

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'existing@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'password123!' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123!' },
    })
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Test User' },
    })

    // Submit form
    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
    })
  })

  it('should validate email format', async () => {
    render(
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument()
    })

    // Enter invalid email and valid other fields
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'notanemail' },
    })
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'password123!' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123!' },
    })
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Test User' },
    })

    // Submit form
    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })

    // Should not call API
    expect(mockedAuthApi.register).not.toHaveBeenCalled()
  })

  it('should require email field', async () => {
    render(
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument()
    })

    // Fill in only other fields
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'password123!' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123!' },
    })
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Test User' },
    })

    // Submit form
    const form = screen.getByPlaceholderText('At least 8 characters').closest('form')
    fireEvent.submit(form!)

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })

    // Should not call API
    expect(mockedAuthApi.register).not.toHaveBeenCalled()
  })

  it('should require password field', async () => {
    render(
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument()
    })

    // Fill in only email and display name
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Test User' },
    })

    // Submit form
    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })

    // Should not call API
    expect(mockedAuthApi.register).not.toHaveBeenCalled()
  })

  it('should require display name field', async () => {
    render(
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument()
    })

    // Fill in only email and password
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'password123!' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123!' },
    })

    // Submit form
    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/display name is required/i)).toBeInTheDocument()
    })

    // Should not call API
    expect(mockedAuthApi.register).not.toHaveBeenCalled()
  })

  it('should validate password confirmation match', async () => {
    render(
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument()
    })

    // Fill in form with mismatched passwords
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'password123!' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'differentpassword' },
    })
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Test User' },
    })

    // Submit form
    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })

    // Should not call API
    expect(mockedAuthApi.register).not.toHaveBeenCalled()
  })

  it('should validate password strength (minimum 8 characters)', async () => {
    render(
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument()
    })

    // Fill in form with weak password
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'weak' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'weak' },
    })
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Test User' },
    })

    // Submit form
    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })

    // Should not call API
    expect(mockedAuthApi.register).not.toHaveBeenCalled()
  })

  it('should disable submit button while loading', async () => {
    mockedAuthApi.register.mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({ success: true, user: mockUser, message: 'Registration successful' })
          }, 100)
        })
    )

    render(
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument()
    })

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'password123!' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123!' },
    })
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Test User' },
    })

    // Submit form
    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    // Button should be disabled during loading
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating account|signing up/i })).toBeDisabled()
    })
  })

  it('should show link to login page', async () => {
    render(
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument()
    })

    const loginLink = screen.getByRole('link', { name: /log in|sign in/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', expect.stringContaining('/login'))
  })

  it('should call onSuccess callback after successful registration', async () => {
    const onSuccess = jest.fn()
    mockedAuthApi.register.mockResolvedValueOnce({
      success: true,
      user: mockUser,
      message: 'Registration successful',
    })

    render(
      <AuthProvider>
        <RegisterForm onSuccess={onSuccess} />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument()
    })

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'password123!' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123!' },
    })
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Test User' },
    })

    // Submit form
    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    // Wait for registration to complete and callback to be called
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockUser)
    })
  })

  it('should call onLoginClick when login button is clicked', async () => {
    const onLoginClick = jest.fn()

    render(
      <AuthProvider>
        <RegisterForm onLoginClick={onLoginClick} />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument()
    })

    // Click the login button
    const loginButton = screen.getByRole('button', { name: /log in|sign in/i })
    fireEvent.click(loginButton)

    expect(onLoginClick).toHaveBeenCalled()
  })

  it('should not call onSuccess when registration returns null user', async () => {
    const onSuccess = jest.fn()
    mockedAuthApi.register.mockResolvedValueOnce({
      success: false,
      user: null as unknown as User,
      message: 'Registration failed',
    })

    render(
      <AuthProvider>
        <RegisterForm onSuccess={onSuccess} />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument()
    })

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'password123!' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123!' },
    })
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Test User' },
    })

    // Submit form
    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    // Wait for registration to complete
    await waitFor(() => {
      expect(mockedAuthApi.register).toHaveBeenCalled()
    })

    // onSuccess should not be called
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
