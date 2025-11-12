// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for ResendVerificationForm component
 * Following TDD: Tests written FIRST, before implementation
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { User } from '@/lib/auth/types'
import { StatusEnum } from '@/lib/auth'
import { AuthProvider } from '@/lib/auth/AuthProvider'
import { ResendVerificationForm } from '@/components/auth/ResendVerificationForm'
import * as authApi from '@/lib/auth/api'

// Mock the auth API
jest.mock('@/lib/auth/api')
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>

describe('ResendVerificationForm Component', () => {
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
  })

  it('should render resend verification form when authenticated', async () => {
    // Mock refresh to return authenticated user
    mockedAuthApi.refresh.mockResolvedValue({
      success: true,
      sessionToken: 'mock-token',
      expiresAt: '2025-12-31T00:00:00Z',
      user: mockUser,
    })

    render(
      <AuthProvider>
        <ResendVerificationForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resend|send/i })).not.toBeDisabled()
    })

    expect(screen.getByRole('button', { name: /resend|send/i })).toBeInTheDocument()
    expect(screen.getByText(new RegExp(mockUser.email, 'i'))).toBeInTheDocument()
  })

  it('should handle successful resend request', async () => {
    mockedAuthApi.refresh.mockResolvedValue({
      success: true,
      sessionToken: 'mock-token',
      expiresAt: '2025-12-31T00:00:00Z',
      user: mockUser,
    })
    mockedAuthApi.resendVerification.mockResolvedValueOnce({
      success: true,
      message: 'Verification email sent',
    })

    const onSuccess = jest.fn()

    render(
      <AuthProvider>
        <ResendVerificationForm onSuccess={onSuccess} />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resend|send/i })).not.toBeDisabled()
    })

    // Submit form
    const form = screen.getByRole('button', { name: /resend|send/i }).closest('form')
    fireEvent.submit(form!)

    // Wait for async operations
    await waitFor(() => {
      expect(mockedAuthApi.resendVerification).toHaveBeenCalledWith()
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
    mockedAuthApi.refresh.mockResolvedValue({
      success: true,
      sessionToken: 'mock-token',
      expiresAt: '2025-12-31T00:00:00Z',
      user: mockUser,
    })
    mockedAuthApi.resendVerification.mockRejectedValueOnce(new Error('Email already verified'))

    render(
      <AuthProvider>
        <ResendVerificationForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resend|send/i })).not.toBeDisabled()
    })

    // Submit form
    const form = screen.getByRole('button', { name: /resend|send/i }).closest('form')
    fireEvent.submit(form!)

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/email already verified/i)).toBeInTheDocument()
    })
  })

  it('should disable submit button while loading', async () => {
    mockedAuthApi.refresh.mockResolvedValue({
      success: true,
      sessionToken: 'mock-token',
      expiresAt: '2025-12-31T00:00:00Z',
      user: mockUser,
    })
    mockedAuthApi.resendVerification.mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({ success: true, message: 'Email sent' })
          }, 100)
        })
    )

    render(
      <AuthProvider>
        <ResendVerificationForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resend|send/i })).not.toBeDisabled()
    })

    // Submit form
    const form = screen.getByRole('button', { name: /resend|send/i }).closest('form')
    fireEvent.submit(form!)

    // Button should be disabled during loading
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled()
    })
  })

  it('should show link to login page', async () => {
    mockedAuthApi.refresh.mockResolvedValue({
      success: true,
      sessionToken: 'mock-token',
      expiresAt: '2025-12-31T00:00:00Z',
      user: mockUser,
    })

    render(
      <AuthProvider>
        <ResendVerificationForm />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resend|send/i })).not.toBeDisabled()
    })

    const loginLink = screen.getByRole('link', { name: /back to log in|log in/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', expect.stringContaining('/login'))
  })

  it('should call onLoginClick when login button is clicked', async () => {
    mockedAuthApi.refresh.mockResolvedValue({
      success: true,
      sessionToken: 'mock-token',
      expiresAt: '2025-12-31T00:00:00Z',
      user: mockUser,
    })

    const onLoginClick = jest.fn()

    render(
      <AuthProvider>
        <ResendVerificationForm onLoginClick={onLoginClick} />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resend|send/i })).not.toBeDisabled()
    })

    // Click the login button
    const loginButton = screen.getByRole('button', { name: /back to log in|log in/i })
    fireEvent.click(loginButton)

    expect(onLoginClick).toHaveBeenCalled()
  })

  it('should call onSuccess callback after successful request', async () => {
    mockedAuthApi.refresh.mockResolvedValue({
      success: true,
      sessionToken: 'mock-token',
      expiresAt: '2025-12-31T00:00:00Z',
      user: mockUser,
    })

    const onSuccess = jest.fn()
    mockedAuthApi.resendVerification.mockResolvedValueOnce({
      success: true,
      message: 'Email sent',
    })

    render(
      <AuthProvider>
        <ResendVerificationForm onSuccess={onSuccess} />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resend|send/i })).not.toBeDisabled()
    })

    // Submit form
    const form = screen.getByRole('button', { name: /resend|send/i }).closest('form')
    fireEvent.submit(form!)

    // Wait for request to complete and callback to be called
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should handle non-Error exceptions', async () => {
    mockedAuthApi.refresh.mockResolvedValue({
      success: true,
      sessionToken: 'mock-token',
      expiresAt: '2025-12-31T00:00:00Z',
      user: mockUser,
    })
    mockedAuthApi.resendVerification.mockRejectedValueOnce('Network error')

    render(
      <AuthProvider>
        <ResendVerificationForm />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resend|send/i })).not.toBeDisabled()
    })

    // Submit form
    const form = screen.getByRole('button', { name: /resend|send/i }).closest('form')
    fireEvent.submit(form!)

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/failed to send verification email/i)).toBeInTheDocument()
    })
  })

  it('should disable button when not authenticated', async () => {
    // Mock refresh to fail (no active session)
    mockedAuthApi.refresh.mockRejectedValue(new Error('No session'))

    render(
      <AuthProvider>
        <ResendVerificationForm />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resend|send/i })).toBeDisabled()
    })

    expect(screen.getByText(/please log in/i)).toBeInTheDocument()
  })

  it('should show error when submitting without authentication', async () => {
    // Mock refresh to fail (no active session)
    mockedAuthApi.refresh.mockRejectedValue(new Error('No session'))

    render(
      <AuthProvider>
        <ResendVerificationForm />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resend|send/i })).toBeDisabled()
    })

    // Try to submit form (shouldn't work because button is disabled, but test the handler)
    const form = screen.getByRole('button', { name: /resend|send/i }).closest('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(screen.getByText(/you must be logged in/i)).toBeInTheDocument()
    })
  })
})
