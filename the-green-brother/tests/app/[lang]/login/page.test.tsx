// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for login page
 */

import { fireEvent, render, screen } from '@testing-library/react'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ alt, src }: { alt: string; src: string }) {
    return <img src={src} alt={alt} />
  },
}))

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock API
jest.mock('@/lib/content/api', () => ({
  getAuthPage: jest.fn(),
}))

const mockAuthPage = {
  loginHeader: {
    header: { text: 'Welcome Back' },
    subheader: { text: 'Sign in to continue' },
  },
  emailLabel: { text: 'Email' },
  emailPlaceholder: 'Enter your email',
  passwordLabel: { text: 'Password' },
  passwordPlaceholder: 'Enter password',
  forgotPasswordButton: { label: { text: 'Forgot?' }, url: '/forgot-password' },
  loginButton: { label: { text: 'Log In' } },
  orDividerText: 'OR',
  googleButton: { label: { text: 'Google' }, url: '#', openInNewTab: false },
  appleButton: { label: { text: 'Apple' }, url: '#', openInNewTab: false },
  noAccountText: "Don't have an account?",
  signupLinkText: 'Sign Up',
}

import Login from '@/app/[lang]/login/page'
import { getAuthPage } from '@/lib/content/api'

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    ;(getAuthPage as jest.Mock).mockResolvedValue(mockAuthPage)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render login form', async () => {
    const ui = await Login({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome Back')
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument()
  })

  it('should render login button', async () => {
    const ui = await Login({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument()
  })

  it('should render social login buttons', async () => {
    const ui = await Login({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('link', { name: /Google/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Apple/i })).toBeInTheDocument()
  })

  it('should render forgot password link', async () => {
    const ui = await Login({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('link', { name: 'Forgot?' })).toBeInTheDocument()
  })

  it('should render signup link', async () => {
    const ui = await Login({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('link', { name: 'Sign Up' })).toHaveAttribute('href', '/en/signup')
  })

  it('should render email and password labels', async () => {
    const ui = await Login({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Password')).toBeInTheDocument()
  })

  it('should handle form input changes', async () => {
    const ui = await Login({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    const emailInput = screen.getByPlaceholderText('Enter your email')
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } })
    expect(emailInput).toHaveValue('test@test.com')

    const passwordInput = screen.getByPlaceholderText('Enter password')
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    expect(passwordInput).toHaveValue('password123')
  })

  it('should toggle password visibility', async () => {
    const ui = await Login({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    const passwordInput = screen.getByPlaceholderText('Enter password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Click visibility toggle button
    const toggleButton = screen.getByText('visibility_off').closest('button')!
    fireEvent.click(toggleButton)

    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(screen.getByText('visibility')).toBeInTheDocument()
  })

  it('should handle form submission', async () => {
    const ui = await Login({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    const emailInput = screen.getByPlaceholderText('Enter your email')
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } })

    const passwordInput = screen.getByPlaceholderText('Enter password')
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByRole('button', { name: 'Log In' })
    fireEvent.click(submitButton)

    // After timeout, should redirect
    jest.advanceTimersByTime(1000)
    expect(mockPush).toHaveBeenCalledWith('/en/profile')
  })

  it('should render correctly in RTL', async () => {
    const ui = await Login({ params: Promise.resolve({ lang: 'he' }) })
    render(ui)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('should handle missing labels gracefully', async () => {
    const mockDataMissing = {
      ...mockAuthPage,
      loginHeader: { header: undefined },
      loginButton: { label: undefined },
    }
    ;(getAuthPage as jest.Mock).mockResolvedValueOnce(mockDataMissing)

    const ui = await Login({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument() // Default
  })
})
