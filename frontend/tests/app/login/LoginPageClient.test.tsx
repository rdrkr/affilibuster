// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for LoginPageClient component
 * Following TDD: These tests ensure proper client-side navigation and interaction handling
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { LoginPageClient } from '@/app/[lang]/login/LoginPageClient'
import { LoginForm } from '@/components/auth'
import type { User } from '@/lib/auth'
import { StatusEnum } from '@/lib/auth'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock LoginForm component
jest.mock('@/components/auth', () => ({
  LoginForm: jest.fn(() => <div data-testid="mock-login-form">Login Form</div>),
}))

describe('LoginPageClient', () => {
  const mockPush = jest.fn()
  const mockRouter = { push: mockPush }

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(LoginForm as jest.Mock).mockClear()
  })

  describe('Component Rendering', () => {
    it('should render with correct layout structure', () => {
      const { container } = render(<LoginPageClient lang="en" />)

      // Check main container has correct classes
      const mainElement = container.querySelector('main')
      expect(mainElement).toBeInTheDocument()
      expect(mainElement).toHaveClass('min-h-screen')
      expect(mainElement).toHaveClass('flex')
      expect(mainElement).toHaveClass('items-center')
      expect(mainElement).toHaveClass('justify-center')
      expect(mainElement).toHaveClass('bg-neutral-50')
      expect(mainElement).toHaveClass('dark:bg-neutral-900')

      // Check inner wrapper has correct classes
      const wrapper = container.querySelector('.max-w-md')
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).toHaveClass('w-full')
    })

    it('should render LoginForm component', () => {
      render(<LoginPageClient lang="en" />)

      expect(screen.getByTestId('mock-login-form')).toBeInTheDocument()
      expect(LoginForm).toHaveBeenCalledTimes(1)
    })

    it('should pass onSuccess and onRegisterClick handlers to LoginForm', () => {
      render(<LoginPageClient lang="en" />)

      const mockCalls = (LoginForm as jest.Mock).mock.calls
      expect(mockCalls.length).toBeGreaterThan(0)
      const callArgs = mockCalls[0]?.[0] as Record<string, unknown>
      expect(callArgs).toHaveProperty('onSuccess')
      expect(callArgs).toHaveProperty('onRegisterClick')
      expect(typeof callArgs.onSuccess).toBe('function')
      expect(typeof callArgs.onRegisterClick).toBe('function')
    })
  })

  describe('Navigation Handling', () => {
    it('should navigate to homepage on successful login', () => {
      render(<LoginPageClient lang="en" />)

      // Get the onSuccess callback from LoginForm mock
      const mockCalls = (LoginForm as jest.Mock).mock.calls
      const callArgs = mockCalls[0]?.[0] as { onSuccess: (user: User) => void }
      const onSuccessCallback = callArgs.onSuccess
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

      // Call onSuccess
      onSuccessCallback(mockUser)

      // Verify navigation to homepage
      expect(mockPush).toHaveBeenCalledWith('/en')
    })

    it('should navigate to register page when register link clicked', () => {
      render(<LoginPageClient lang="en" />)

      // Get the onRegisterClick callback from LoginForm mock
      const mockCalls = (LoginForm as jest.Mock).mock.calls
      const callArgs = mockCalls[0]?.[0] as { onRegisterClick: () => void }
      const onRegisterClickCallback = callArgs.onRegisterClick

      // Call onRegisterClick
      onRegisterClickCallback()

      // Verify navigation to register page
      expect(mockPush).toHaveBeenCalledWith('/en/register')
    })

    it('should navigate with correct language code (Italian)', () => {
      render(<LoginPageClient lang="it" />)

      const mockCalls = (LoginForm as jest.Mock).mock.calls
      const callArgs = mockCalls[0]?.[0] as { onSuccess: (user: User) => void }
      const onSuccessCallback = callArgs.onSuccess
      const mockUser: User = {
        id: '456',
        email: 'italiano@example.com',
        displayName: 'Italian User',
        emailVerified: true,
        status: StatusEnum.ACTIVE,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-11-01T10:00:00Z',
        lastLoginAt: '2025-11-01T10:00:00Z',
      }

      onSuccessCallback(mockUser)

      expect(mockPush).toHaveBeenCalledWith('/it')
    })

    it('should navigate with correct language code (Hebrew)', () => {
      render(<LoginPageClient lang="he" />)

      const mockCalls = (LoginForm as jest.Mock).mock.calls
      const callArgs = mockCalls[0]?.[0] as { onRegisterClick: () => void }
      const onRegisterClickCallback = callArgs.onRegisterClick

      onRegisterClickCallback()

      expect(mockPush).toHaveBeenCalledWith('/he/register')
    })
  })

  describe('Console Logging', () => {
    it('should log successful login with user email', () => {
      const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation()

      render(<LoginPageClient lang="en" />)

      const mockCalls = (LoginForm as jest.Mock).mock.calls
      const callArgs = mockCalls[0]?.[0] as { onSuccess: (user: User) => void }
      const onSuccessCallback = callArgs.onSuccess
      const mockUser: User = {
        id: '789',
        email: 'logger@example.com',
        displayName: 'Logger User',
        emailVerified: false,
        status: StatusEnum.ACTIVE,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-11-01T10:00:00Z',
        lastLoginAt: '2025-11-01T10:00:00Z',
      }

      onSuccessCallback(mockUser)

      expect(consoleInfoSpy).toHaveBeenCalledWith('User logger@example.com logged in successfully')

      consoleInfoSpy.mockRestore()
    })

    it('should log even when email is not verified', () => {
      const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation()

      render(<LoginPageClient lang="en" />)

      const mockCalls = (LoginForm as jest.Mock).mock.calls
      const callArgs = mockCalls[0]?.[0] as { onSuccess: (user: User) => void }
      const onSuccessCallback = callArgs.onSuccess
      const mockUser: User = {
        id: '999',
        email: 'unverified@example.com',
        displayName: 'Unverified User',
        emailVerified: false,
        status: StatusEnum.ACTIVE,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-11-01T10:00:00Z',
        lastLoginAt: '2025-11-01T10:00:00Z',
      }

      onSuccessCallback(mockUser)

      expect(consoleInfoSpy).toHaveBeenCalledWith('User unverified@example.com logged in successfully')

      consoleInfoSpy.mockRestore()
    })
  })
})
