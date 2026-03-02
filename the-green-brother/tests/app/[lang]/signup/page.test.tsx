// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for signup page
 */

import { fireEvent, render, screen } from '@testing-library/react'

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

// Mock next/navigation
const mockPush = jest.fn()
const mockNotFound = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  notFound: (): void => {
    mockNotFound()
    throw new Error('NEXT_NOT_FOUND')
  },
}))

// Mock API
jest.mock('@/lib/content/api', () => ({
  getAuthPage: jest.fn(),
}))

import Signup, { generateMetadata } from '@/app/[lang]/signup/page'
import { getAuthPage } from '@/lib/content/api'

const mockAuthPage = {
  signupHeader: {
    header: { text: 'Create Account' },
    subheader: { text: 'Join us today' },
  },
  nameLabel: { text: 'Full Name' },
  namePlaceholder: 'Enter your name',
  emailLabel: { text: 'Email' },
  emailPlaceholder: 'Enter your email',
  passwordLabel: { text: 'Password' },
  passwordPlaceholder: 'Create a password',
  signupButton: { label: { text: 'Sign Up' } },
  orDividerText: 'OR',
  googleButton: { label: { text: 'Google' }, url: '#', openInNewTab: false },
  appleButton: { label: { text: 'Apple' }, url: '#', openInNewTab: false },
  haveAccountText: 'Have an account?',
  loginLinkText: 'Log In',
  termsLinkText: 'Terms',
  privacyLinkText: 'Privacy Policy',
  termsText: 'I agree to',
}

describe('Signup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    ;(getAuthPage as jest.Mock).mockResolvedValue(mockAuthPage)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render signup form', async () => {
    const ui = await Signup({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Create Account')
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument()
  })

  it('should render signup button', async () => {
    const ui = await Signup({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
  })

  it('should render terms checkbox', async () => {
    const ui = await Signup({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Terms' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument()
  })

  it('should render login link', async () => {
    const ui = await Signup({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('link', { name: 'Log In' })).toHaveAttribute('href', '/en/login')
  })

  it('should render form labels', async () => {
    const ui = await Signup({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByText('Full Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Password')).toBeInTheDocument()
  })

  it('should handle form input changes', async () => {
    const ui = await Signup({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: 'John Doe' } })
    expect(screen.getByPlaceholderText('Enter your name')).toHaveValue('John Doe')

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'john@test.com' } })
    expect(screen.getByPlaceholderText('Enter your email')).toHaveValue('john@test.com')

    fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'secret123' } })
    expect(screen.getByPlaceholderText('Create a password')).toHaveValue('secret123')
  })

  it('should show alert when submitting without accepting terms', async () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation()

    const ui = await Signup({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    // Fill required text fields to isolate terms validation
    fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'john@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'secret123' } })

    // Use fireEvent.submit to simulate form submission even if HTML5 validation might block click usually,
    // or to ensure we reach the handler to test the JS validation fallback.
    // However, since we want to test that the JS handler catches it, we need the handler to fire.
    // Assuming standard button click might be blocked by 'required' checkbox in some envs.
    // Let's try filling fields and clicking first. If jsdom blocks it, we might need to rely on the fact that
    // we want to test the JS logic.
    const form = screen.getByRole('button', { name: 'Sign Up' }).closest('form')!
    fireEvent.submit(form)

    expect(mockAlert).toHaveBeenCalledWith('Please accept terms')
    expect(mockPush).not.toHaveBeenCalled()
    mockAlert.mockRestore()
  })

  it('should handle form submission with accepted terms', async () => {
    const ui = await Signup({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'john@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'secret123' } })

    // Accept terms
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    const submitButton = screen.getByRole('button', { name: 'Sign Up' })
    fireEvent.click(submitButton)

    // After timeout, should redirect
    jest.advanceTimersByTime(1000)
    expect(mockPush).toHaveBeenCalledWith('/en/profile')
  })

  it('should toggle password visibility', async () => {
    const ui = await Signup({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    const passwordInput = screen.getByPlaceholderText('Create a password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleButton = screen.getByText('visibility_off').closest('button')!
    fireEvent.click(toggleButton)

    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  it('should render correctly in RTL', async () => {
    const ui = await Signup({ params: Promise.resolve({ lang: 'he' }) })
    render(ui)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('should handle missing labels gracefully', async () => {
    const mockDataMissing = {
      ...mockAuthPage,
      signupHeader: { header: undefined },
      signupButton: { label: undefined },
      termsLinkText: undefined,
      privacyLinkText: undefined,
      termsText: undefined,
    }
    ;(getAuthPage as jest.Mock).mockResolvedValueOnce(mockDataMissing)

    const ui = await Signup({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument() // Default
    expect(screen.getByText('Terms')).toBeInTheDocument() // Default
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument() // Default
  })

  it('should call notFound when auth page is null', async () => {
    ;(getAuthPage as jest.Mock).mockResolvedValueOnce(null)

    // We already mocked notFound above, but might need to ensure it is mocked appropriately.
    // If not, we can use the same pattern as in other pages. We need to mock next/navigation's notFound.
    // However, it seems we only mocked `useRouter` from next/navigation in this file. Let's make sure `notFound` is mocked.
    const mockNotFound = jest.fn()
    jest.mocked(require('next/navigation')).notFound = (): void => {
      mockNotFound()
      throw new Error('NEXT_NOT_FOUND')
    }

    await expect(Signup({ params: Promise.resolve({ lang: 'en' }) })).rejects.toThrow('NEXT_NOT_FOUND')

    expect(mockNotFound).toHaveBeenCalled()
  })
})

describe('generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return noindex metadata from CMS data', async () => {
    ;(getAuthPage as jest.Mock).mockResolvedValue({
      seoMetadata: { metaTitle: 'Sign Up', metaDescription: 'Create your account' },
    })

    const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) })

    expect(metadata.title).toBe('Sign Up')
    expect(metadata.description).toBe('Create your account')
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })

  it('should handle null auth page gracefully', async () => {
    ;(getAuthPage as jest.Mock).mockResolvedValue(null)

    const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) })

    expect(metadata.title).toBeUndefined()
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })
})
