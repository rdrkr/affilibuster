// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for ProfileForm component
 * Following TDD: Tests written FIRST, before implementation
 */

import { ProfileForm } from '@/components/auth/ProfileForm'
import { StatusEnum } from '@/lib/auth'
import * as authApi from '@/lib/auth/api'
import { AuthProvider } from '@/lib/auth/AuthProvider'
import type { User } from '@/lib/auth/types'
import type { UserProfile } from '@/lib/generated/types.gen'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

// Mock the auth API
jest.mock('@/lib/auth/api')
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>

describe('ProfileForm Component', () => {
  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
    status: StatusEnum.ACTIVE,
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-11-01T10:00:00Z',
    lastLoginAt: '2025-11-01T10:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock refresh to return authenticated user
    mockedAuthApi.refresh.mockResolvedValue({
      success: true,
      sessionToken: 'mock-token',
      expiresAt: '2025-12-31T00:00:00Z',
      user: mockUser,
    })
  })

  it('should render profile form when authenticated', async () => {
    render(
      <AuthProvider>
        <ProfileForm />
      </AuthProvider>
    )

    // Wait for auth provider to finish initial check and form to be populated
    await waitFor(() => {
      const displayNameInput = screen.getByLabelText(/display name/i) as HTMLInputElement
      expect(displayNameInput.value).toBe(mockUser.displayName)
    })

    const displayNameInput = screen.getByLabelText(/display name/i) as HTMLInputElement
    expect(displayNameInput.value).toBe(mockUser.displayName)

    // Email is now displayed as read-only text (not an input field)
    expect(screen.getByText(new RegExp(mockUser.email))).toBeInTheDocument()
    expect(screen.getByText(/cannot be changed/i)).toBeInTheDocument()
  })

  it('should update display name successfully', async () => {
    const updatedProfile: UserProfile = {
      id: mockUser.id,
      email: mockUser.email,
      display_name: 'Updated Name',
      email_verified: mockUser.emailVerified,
      created_at: mockUser.createdAt,
      last_login_at: mockUser.lastLoginAt ?? null,
    }
    mockedAuthApi.refresh.mockResolvedValue({
      success: true,
      sessionToken: 'mock-token',
      expiresAt: '2025-12-31T00:00:00Z',
      user: mockUser,
    })
    // Backend returns UserProfile directly per OpenAPI spec (no wrapper)
    mockedAuthApi.updateProfile.mockResolvedValueOnce(updatedProfile)

    render(
      <AuthProvider>
        <ProfileForm />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/display name/i)).not.toBeDisabled()
    })

    // Change display name
    const displayNameInput = screen.getByLabelText(/display name/i)
    fireEvent.change(displayNameInput, { target: { value: 'Updated Name' } })

    // Click update button
    const updateButton = screen.getByRole('button', { name: /update profile|save/i })
    fireEvent.click(updateButton)

    await waitFor(() => {
      // Backend now only accepts displayName (email cannot be updated per OpenAPI spec)
      expect(mockedAuthApi.updateProfile).toHaveBeenCalledWith({ displayName: 'Updated Name' })
    })

    await waitFor(() => {
      expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument()
    })
  })

  it('should require display name field', async () => {
    render(
      <AuthProvider>
        <ProfileForm />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/display name/i)).not.toBeDisabled()
    })

    // Clear display name
    const displayNameInput = screen.getByLabelText(/display name/i)
    fireEvent.change(displayNameInput, { target: { value: '' } })

    // Try to submit
    const updateButton = screen.getByRole('button', { name: /update profile|save/i })
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(screen.getByText(/display name is required/i)).toBeInTheDocument()
    })
  })

  it('should show disabled state when not authenticated', async () => {
    // Mock refresh to fail (no active session)
    mockedAuthApi.refresh.mockRejectedValue(new Error('No session'))

    render(
      <AuthProvider>
        <ProfileForm />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /update profile|save/i })).toBeDisabled()
    })
  })

  it('should display error on update failure', async () => {
    mockedAuthApi.updateProfile.mockRejectedValueOnce(new Error('Failed to update profile'))

    render(
      <AuthProvider>
        <ProfileForm />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/display name/i)).not.toBeDisabled()
    })

    // Change display name
    const displayNameInput = screen.getByLabelText(/display name/i)
    fireEvent.change(displayNameInput, { target: { value: 'New Name' } })

    // Click update button
    const updateButton = screen.getByRole('button', { name: /update profile|save/i })
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to update profile/i)).toBeInTheDocument()
    })
  })

  it('should disable button while loading', async () => {
    // Backend returns UserProfile directly per OpenAPI spec (no wrapper)
    mockedAuthApi.updateProfile.mockImplementation(
      () =>
        new Promise<UserProfile>(resolve => {
          setTimeout(() => {
            resolve({
              id: mockUser.id,
              email: mockUser.email,
              display_name: 'New Name',
              email_verified: mockUser.emailVerified,
              created_at: mockUser.createdAt,
              last_login_at: mockUser.lastLoginAt ?? null,
            })
          }, 100)
        })
    )

    render(
      <AuthProvider>
        <ProfileForm />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/display name/i)).not.toBeDisabled()
    })

    // Change display name
    const displayNameInput = screen.getByLabelText(/display name/i)
    fireEvent.change(displayNameInput, { target: { value: 'New Name' } })

    // Click update button
    const updateButton = screen.getByRole('button', { name: /update profile|save/i })
    fireEvent.click(updateButton)

    // Button should be disabled during loading
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /updating|saving/i })).toBeDisabled()
    })
  })

  // NOTE: Email validation test removed because email is now read-only (cannot be updated per OpenAPI spec)
  // The backend PATCH /auth/profile endpoint only accepts displayName, not email

  it('should handle non-Error exceptions', async () => {
    mockedAuthApi.updateProfile.mockRejectedValueOnce('Network error')

    render(
      <AuthProvider>
        <ProfileForm />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/display name/i)).not.toBeDisabled()
    })

    // Change display name
    const displayNameInput = screen.getByLabelText(/display name/i)
    fireEvent.change(displayNameInput, { target: { value: 'New Name' } })

    // Click update button
    const updateButton = screen.getByRole('button', { name: /update profile|save/i })
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to update profile/i)).toBeInTheDocument()
    })
  })

  it('should call onSuccess callback after successful update', async () => {
    const onSuccessMock = jest.fn()
    const updatedProfile: UserProfile = {
      id: mockUser.id,
      email: mockUser.email,
      display_name: 'Updated Name',
      email_verified: mockUser.emailVerified,
      created_at: mockUser.createdAt,
      last_login_at: mockUser.lastLoginAt ?? null,
    }

    // Backend returns UserProfile directly per OpenAPI spec (no wrapper)
    mockedAuthApi.updateProfile.mockResolvedValueOnce(updatedProfile)

    render(
      <AuthProvider>
        <ProfileForm onSuccess={onSuccessMock} />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/display name/i)).not.toBeDisabled()
    })

    // Change display name
    const displayNameInput = screen.getByLabelText(/display name/i)
    fireEvent.change(displayNameInput, { target: { value: 'Updated Name' } })

    // Click update button
    const updateButton = screen.getByRole('button', { name: /update profile|save/i })
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalled()
    })
  })

  describe('Email Verification Features', () => {
    it('should show verified status when email is verified', async () => {
      const verifiedUser: User = {
        ...mockUser,
        emailVerified: true,
      }

      mockedAuthApi.refresh.mockResolvedValue({
        success: true,
        sessionToken: 'mock-token',
        expiresAt: '2025-12-31T00:00:00Z',
        user: verifiedUser,
      })

      render(
        <AuthProvider>
          <ProfileForm />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('profile-form-email-status')).toBeInTheDocument()
      })

      // Should show verified icon and text
      expect(screen.getByText(/email verified/i)).toBeInTheDocument()
      // Should NOT show resend button
      expect(screen.queryByTestId('resend-verification-button')).not.toBeInTheDocument()
    })

    it('should show unverified status and resend button when email is not verified', async () => {
      const unverifiedUser: User = {
        ...mockUser,
        emailVerified: false,
      }

      mockedAuthApi.refresh.mockResolvedValue({
        success: true,
        sessionToken: 'mock-token',
        expiresAt: '2025-12-31T00:00:00Z',
        user: unverifiedUser,
      })

      render(
        <AuthProvider>
          <ProfileForm />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('profile-form-email-status')).toBeInTheDocument()
      })

      // Should show unverified warning and text
      expect(screen.getByText(/email not verified/i)).toBeInTheDocument()
      // Should show resend button
      expect(screen.getByTestId('resend-verification-button')).toBeInTheDocument()
    })

    it('should successfully resend verification email', async () => {
      const unverifiedUser: User = {
        ...mockUser,
        emailVerified: false,
      }

      mockedAuthApi.refresh.mockResolvedValue({
        success: true,
        sessionToken: 'mock-token',
        expiresAt: '2025-12-31T00:00:00Z',
        user: unverifiedUser,
      })

      mockedAuthApi.resendVerification.mockResolvedValueOnce({
        success: true,
        message: 'Verification email sent',
      })

      render(
        <AuthProvider>
          <ProfileForm />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('resend-verification-button')).toBeInTheDocument()
      })

      // Click resend button
      const resendButton = screen.getByTestId('resend-verification-button')
      fireEvent.click(resendButton)

      await waitFor(() => {
        expect(mockedAuthApi.resendVerification).toHaveBeenCalled()
      })

      // Should show success notification
      await waitFor(() => {
        expect(screen.getByTestId('verification-resent-success')).toBeInTheDocument()
        expect(screen.getByText(/verification email sent/i)).toBeInTheDocument()
      })
    })

    it('should show loading state while resending verification email', async () => {
      const unverifiedUser: User = {
        ...mockUser,
        emailVerified: false,
      }

      mockedAuthApi.refresh.mockResolvedValue({
        success: true,
        sessionToken: 'mock-token',
        expiresAt: '2025-12-31T00:00:00Z',
        user: unverifiedUser,
      })

      mockedAuthApi.resendVerification.mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve({
                success: true,
                message: 'Verification email sent',
              })
            }, 100)
          })
      )

      render(
        <AuthProvider>
          <ProfileForm />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('resend-verification-button')).toBeInTheDocument()
      })

      // Click resend button
      const resendButton = screen.getByTestId('resend-verification-button')
      fireEvent.click(resendButton)

      // Should show loading text
      await waitFor(() => {
        expect(screen.getByText(/sending/i)).toBeInTheDocument()
      })

      // Button should be disabled
      expect(resendButton).toBeDisabled()
    })

    it('should handle rate limit error when resending verification email', async () => {
      const unverifiedUser: User = {
        ...mockUser,
        emailVerified: false,
      }

      mockedAuthApi.refresh.mockResolvedValue({
        success: true,
        sessionToken: 'mock-token',
        expiresAt: '2025-12-31T00:00:00Z',
        user: unverifiedUser,
      })

      mockedAuthApi.resendVerification.mockRejectedValueOnce(new Error('rate limit exceeded'))

      render(
        <AuthProvider>
          <ProfileForm />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('resend-verification-button')).toBeInTheDocument()
      })

      // Click resend button
      const resendButton = screen.getByTestId('resend-verification-button')
      fireEvent.click(resendButton)

      await waitFor(() => {
        expect(mockedAuthApi.resendVerification).toHaveBeenCalled()
      })

      // Should show rate limit error
      await waitFor(() => {
        expect(screen.getByTestId('rate-limit-error')).toBeInTheDocument()
        expect(screen.getByText(/please wait before requesting another/i)).toBeInTheDocument()
      })
    })

    it('should handle generic error when resending verification email', async () => {
      const unverifiedUser: User = {
        ...mockUser,
        emailVerified: false,
      }

      mockedAuthApi.refresh.mockResolvedValue({
        success: true,
        sessionToken: 'mock-token',
        expiresAt: '2025-12-31T00:00:00Z',
        user: unverifiedUser,
      })

      mockedAuthApi.resendVerification.mockRejectedValueOnce(new Error('Network error'))

      render(
        <AuthProvider>
          <ProfileForm />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('resend-verification-button')).toBeInTheDocument()
      })

      // Click resend button
      const resendButton = screen.getByTestId('resend-verification-button')
      fireEvent.click(resendButton)

      await waitFor(() => {
        expect(mockedAuthApi.resendVerification).toHaveBeenCalled()
      })

      // Should show generic error
      await waitFor(() => {
        expect(screen.getByTestId('rate-limit-error')).toBeInTheDocument()
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })

    it('should close success notification when close button clicked', async () => {
      const unverifiedUser: User = {
        ...mockUser,
        emailVerified: false,
      }

      mockedAuthApi.refresh.mockResolvedValue({
        success: true,
        sessionToken: 'mock-token',
        expiresAt: '2025-12-31T00:00:00Z',
        user: unverifiedUser,
      })

      mockedAuthApi.resendVerification.mockResolvedValueOnce({
        success: true,
        message: 'Verification email sent',
      })

      render(
        <AuthProvider>
          <ProfileForm />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('resend-verification-button')).toBeInTheDocument()
      })

      // Click resend button
      const resendButton = screen.getByTestId('resend-verification-button')
      fireEvent.click(resendButton)

      // Wait for success notification
      await waitFor(() => {
        expect(screen.getByTestId('verification-resent-success')).toBeInTheDocument()
      })

      // Click close button
      const closeButtons = screen.getAllByTestId('close-notification')
      fireEvent.click(closeButtons[0]!)

      // Success notification should be removed
      await waitFor(() => {
        expect(screen.queryByTestId('verification-resent-success')).not.toBeInTheDocument()
      })
    })

    it('should close error notification when close button clicked', async () => {
      const unverifiedUser: User = {
        ...mockUser,
        emailVerified: false,
      }

      mockedAuthApi.refresh.mockResolvedValue({
        success: true,
        sessionToken: 'mock-token',
        expiresAt: '2025-12-31T00:00:00Z',
        user: unverifiedUser,
      })

      mockedAuthApi.resendVerification.mockRejectedValueOnce(new Error('rate limit exceeded'))

      render(
        <AuthProvider>
          <ProfileForm />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('resend-verification-button')).toBeInTheDocument()
      })

      // Click resend button
      const resendButton = screen.getByTestId('resend-verification-button')
      fireEvent.click(resendButton)

      // Wait for error notification
      await waitFor(() => {
        expect(screen.getByTestId('rate-limit-error')).toBeInTheDocument()
      })

      // Click close button
      const closeButtons = screen.getAllByTestId('close-notification')
      fireEvent.click(closeButtons[0]!)

      // Error notification should be removed
      await waitFor(() => {
        expect(screen.queryByTestId('rate-limit-error')).not.toBeInTheDocument()
      })
    })
  })
})
