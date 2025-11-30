// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for delete account page
 */

import { render, screen } from '@testing-library/react'

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

import DeleteAccount from '@/app/[lang]/profile/delete/page'

describe('DeleteAccount', () => {
  it('should render delete account page', () => {
    render(<DeleteAccount />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Are you sure?')
  })

  it('should render warning icon', () => {
    render(<DeleteAccount />)

    expect(screen.getByText('warning')).toBeInTheDocument()
  })

  it('should render warning message', () => {
    render(<DeleteAccount />)

    expect(
      screen.getByText(
        /This action is irreversible. All your data, affiliations, and settings will be permanently deleted./i
      )
    ).toBeInTheDocument()
  })

  it('should render password input', () => {
    render(<DeleteAccount />)

    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByText('Enter your password to confirm')).toBeInTheDocument()
  })

  it('should render confirm delete button', () => {
    render(<DeleteAccount />)

    expect(screen.getByRole('button', { name: 'Confirm Delete' })).toBeInTheDocument()
  })

  it('should render cancel link', () => {
    render(<DeleteAccount />)

    expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/profile')
  })
})
