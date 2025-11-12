// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for RegisterPageClient component
 * Following TDD: These tests ensure proper client-side navigation and interaction handling
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { RegisterPageClient } from '@/app/[lang]/register/RegisterPageClient'
import { RegisterForm } from '@/components/auth'
import type { User } from '@/lib/auth'
import { StatusEnum } from '@/lib/auth'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock RegisterForm component
jest.mock('@/components/auth', () => ({
  RegisterForm: jest.fn(() => <div data-testid="mock-register-form">Register Form</div>),
}))

describe('RegisterPageClient', () => {
  const mockPush = jest.fn()
  const mockRouter = { push: mockPush }

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(RegisterForm as jest.Mock).mockClear()
  })

  describe('Component Rendering', () => {
    it('should render with correct layout structure', () => {
      const { container } = render(<RegisterPageClient lang="en" />)

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

    it('should render RegisterForm component', () => {
      render(<RegisterPageClient lang="en" />)

      expect(screen.getByTestId('mock-register-form')).toBeInTheDocument()
      expect(RegisterForm).toHaveBeenCalledTimes(1)
    })

    it('should pass onSuccess and onLoginClick handlers to RegisterForm', () => {
      render(<RegisterPageClient lang="en" />)

      const mockCalls = (RegisterForm as jest.Mock).mock.calls
      expect(mockCalls.length).toBeGreaterThan(0)
      const callArgs = mockCalls[0]?.[0] as Record<string, unknown>
      expect(callArgs).toHaveProperty('onSuccess')
      expect(callArgs).toHaveProperty('onLoginClick')
      expect(typeof callArgs.onSuccess).toBe('function')
      expect(typeof callArgs.onLoginClick).toBe('function')
    })
  })

  describe('Navigation Handling', () => {
    it('should navigate to homepage on successful registration', () => {
      render(<RegisterPageClient lang="en" />)

      // Get the onSuccess callback from RegisterForm mock
      const mockCalls = (RegisterForm as jest.Mock).mock.calls
      const callArgs = mockCalls[0]?.[0] as { onSuccess: (user: User) => void }
      const onSuccessCallback = callArgs.onSuccess
      const mockUser: User = {
        id: '123',
        email: 'newuser@example.com',
        displayName: 'New User',
        emailVerified: false,
        status: StatusEnum.ACTIVE,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-11-01T10:00:00Z',
        lastLoginAt: null,
      }

      // Call onSuccess
      onSuccessCallback(mockUser)

      // Verify navigation to homepage
      expect(mockPush).toHaveBeenCalledWith('/en')
    })

    it('should navigate to login page when login link clicked', () => {
      render(<RegisterPageClient lang="en" />)

      // Get the onLoginClick callback from RegisterForm mock
      const mockCalls = (RegisterForm as jest.Mock).mock.calls
      const callArgs = mockCalls[0]?.[0] as { onLoginClick: () => void }
      const onLoginClickCallback = callArgs.onLoginClick

      // Call onLoginClick
      onLoginClickCallback()

      // Verify navigation to login page
      expect(mockPush).toHaveBeenCalledWith('/en/login')
    })

    it('should navigate with correct language code (Italian)', () => {
      render(<RegisterPageClient lang="it" />)

      const mockCalls = (RegisterForm as jest.Mock).mock.calls
      const callArgs = mockCalls[0]?.[0] as { onSuccess: (user: User) => void }
      const onSuccessCallback = callArgs.onSuccess
      const mockUser: User = {
        id: '456',
        email: 'italiano@example.com',
        displayName: 'Italian User',
        emailVerified: false,
        status: StatusEnum.ACTIVE,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-11-01T10:00:00Z',
        lastLoginAt: null,
      }

      onSuccessCallback(mockUser)

      expect(mockPush).toHaveBeenCalledWith('/it')
    })

    it('should navigate with correct language code (Hebrew)', () => {
      render(<RegisterPageClient lang="he" />)

      const mockCalls = (RegisterForm as jest.Mock).mock.calls
      const callArgs = mockCalls[0]?.[0] as { onLoginClick: () => void }
      const onLoginClickCallback = callArgs.onLoginClick

      onLoginClickCallback()

      expect(mockPush).toHaveBeenCalledWith('/he/login')
    })
  })

  describe('Console Logging', () => {
    it('should log successful registration with user email', () => {
      const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation()

      render(<RegisterPageClient lang="en" />)

      const mockCalls = (RegisterForm as jest.Mock).mock.calls
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
        lastLoginAt: null,
      }

      onSuccessCallback(mockUser)

      expect(consoleInfoSpy).toHaveBeenCalledWith('User logger@example.com registered successfully')

      consoleInfoSpy.mockRestore()
    })

    it('should log registration with lastLoginAt as null', () => {
      const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation()

      render(<RegisterPageClient lang="en" />)

      const mockCalls = (RegisterForm as jest.Mock).mock.calls
      const callArgs = mockCalls[0]?.[0] as { onSuccess: (user: User) => void }
      const onSuccessCallback = callArgs.onSuccess
      const mockUser: User = {
        id: '999',
        email: 'newregistration@example.com',
        displayName: 'New Registration',
        emailVerified: false,
        status: StatusEnum.ACTIVE,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-11-01T10:00:00Z',
        lastLoginAt: null,
      }

      onSuccessCallback(mockUser)

      expect(consoleInfoSpy).toHaveBeenCalledWith('User newregistration@example.com registered successfully')

      consoleInfoSpy.mockRestore()
    })
  })
})
