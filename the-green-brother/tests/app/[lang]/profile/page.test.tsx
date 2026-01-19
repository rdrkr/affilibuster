// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for profile page
 */

import { render, screen } from '@testing-library/react'

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

import Profile from '@/app/[lang]/profile/page'

describe('Profile', () => {
  it('should render profile page', () => {
    render(<Profile />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Alex Green')
    expect(screen.getByText('alex.green@example.com')).toBeInTheDocument()
  })

  it('should render account settings section', () => {
    render(<Profile />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Account Settings')
  })

  it('should render edit profile link', () => {
    render(<Profile />)

    const editLinks = screen.getAllByRole('link', { name: /Edit Profile/i })
    expect(editLinks.length).toBeGreaterThan(0)
    expect(editLinks[0]).toHaveAttribute('href', '/profile/edit')
  })

  it('should render currency link', () => {
    render(<Profile />)

    expect(screen.getByRole('link', { name: /Currency/i })).toHaveAttribute('href', '/profile/currency')
  })

  it('should render wishlist link', () => {
    render(<Profile />)

    expect(screen.getByRole('link', { name: /Wishlist/i })).toHaveAttribute('href', '/profile/wishlist')
  })

  it('should render logout button', () => {
    render(<Profile />)

    expect(screen.getByRole('button', { name: /Log Out/i })).toBeInTheDocument()
  })

  it('should render delete account link', () => {
    render(<Profile />)

    expect(screen.getByRole('link', { name: /Delete Account/i })).toHaveAttribute('href', '/profile/delete')
  })

  it('should render profile image', () => {
    render(<Profile />)

    expect(screen.getByRole('img', { name: 'Profile' })).toBeInTheDocument()
  })
})
