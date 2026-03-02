// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for delete account page
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

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
  notFound: (...args: unknown[]) => mockNotFound(...args),
}))

// Mock content API
jest.mock('@/lib/content/api', () => ({
  getProfile: jest.fn(),
}))

// Mock auth API
const mockDeleteAccount = jest.fn()
jest.mock('@/lib/auth/api', () => ({
  deleteAccount: (...args: unknown[]) => mockDeleteAccount(...args),
}))

import DeleteAccount, { generateMetadata } from '@/app/[lang]/profile/delete/page'
import { getProfile } from '@/lib/content/api'

const mockProfileData = {
  deleteAccountHeader: {
    header: { text: 'Are you sure?' },
    subheader: {
      text: 'This action is irreversible. All your data, affiliations, and settings will be permanently deleted.',
    },
  },
  passwordLabel: { text: 'Password' },
  passwordPlaceholder: 'Password',
  confirmButton: { label: { text: 'Confirm Delete' } },
  cancelButton: { label: { text: 'Cancel' } },
  confirmationLabel: 'Enter your password to confirm',
}

describe('DeleteAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getProfile as jest.Mock).mockResolvedValue(mockProfileData)
  })

  it('should render delete account page', async () => {
    const ui = await DeleteAccount({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Are you sure?')
  })

  it('should render warning icon', async () => {
    const ui = await DeleteAccount({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByText('warning')).toBeInTheDocument()
  })

  it('should render warning message', async () => {
    const ui = await DeleteAccount({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(
      screen.getByText(
        /This action is irreversible. All your data, affiliations, and settings will be permanently deleted./i
      )
    ).toBeInTheDocument()
  })

  it('should render password input', async () => {
    const ui = await DeleteAccount({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByText('Enter your password to confirm')).toBeInTheDocument()
  })

  it('should render confirm delete button', async () => {
    const ui = await DeleteAccount({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('button', { name: 'Confirm Delete' })).toBeInTheDocument()
  })

  it('should render cancel link', async () => {
    const ui = await DeleteAccount({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/en/profile')
  })

  it('should call deleteAccount and redirect on success', async () => {
    mockDeleteAccount.mockResolvedValueOnce({ success: true, message: 'Account deleted successfully' })

    const ui = await DeleteAccount({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    const passwordInput = screen.getByPlaceholderText('Password')
    fireEvent.change(passwordInput, { target: { value: 'MyPassword123!' } })

    const submitButton = screen.getByRole('button', { name: 'Confirm Delete' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalledWith({ password: 'MyPassword123!' })
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('should show error message on failed deletion', async () => {
    mockDeleteAccount.mockResolvedValueOnce(null)

    const ui = await DeleteAccount({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    const passwordInput = screen.getByPlaceholderText('Password')
    fireEvent.change(passwordInput, { target: { value: 'WrongPassword' } })

    const submitButton = screen.getByRole('button', { name: 'Confirm Delete' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Failed to delete account. Please check your password and try again.'
      )
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should show loading state during submission', async () => {
    let resolvePromise: (value: unknown) => void
    const promise = new Promise(resolve => {
      resolvePromise = resolve
    })
    mockDeleteAccount.mockReturnValueOnce(promise)

    const ui = await DeleteAccount({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    const passwordInput = screen.getByPlaceholderText('Password')
    fireEvent.change(passwordInput, { target: { value: 'MyPassword123!' } })

    const submitButton = screen.getByRole('button', { name: 'Confirm Delete' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Deleting...' })).toBeDisabled()
    })

    resolvePromise!({ success: true, message: 'ok' })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('should render correctly in RTL', async () => {
    const ui = await DeleteAccount({ params: Promise.resolve({ lang: 'he' }) })
    render(ui)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('should handle missing button labels gracefully', async () => {
    const mockDataMissingLabels = {
      ...mockProfileData,
      confirmButton: { label: undefined },
      cancelButton: { label: undefined },
    }
    ;(getProfile as jest.Mock).mockResolvedValueOnce(mockDataMissingLabels)

    const ui = await DeleteAccount({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByText('Confirm Delete')).toBeInTheDocument() // Default
    expect(screen.getByText('Cancel')).toBeInTheDocument() // Default
  })

  it('should call notFound when profile data is missing', async () => {
    ;(getProfile as jest.Mock).mockResolvedValueOnce(null)
    try {
      await DeleteAccount({ params: Promise.resolve({ lang: 'en' }) })
    } catch {
      // notFound throws an error
    }

    expect(mockNotFound).toHaveBeenCalled()
  })
})

describe('generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return noindex metadata from CMS data', async () => {
    ;(getProfile as jest.Mock).mockResolvedValue({
      seoMetadata: { metaTitle: 'Delete Account', metaDescription: 'Delete your account' },
    })

    const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) })

    expect(metadata.title).toBe('Delete Account')
    expect(metadata.description).toBe('Delete your account')
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })

  it('should handle null profile data gracefully', async () => {
    ;(getProfile as jest.Mock).mockResolvedValue(null)

    const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) })

    expect(metadata.title).toBeUndefined()
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })
})
