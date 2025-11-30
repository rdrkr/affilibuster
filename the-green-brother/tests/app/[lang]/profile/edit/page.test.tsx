// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for edit profile page
 */

import { render, screen } from '@testing-library/react'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ alt, src }: { alt: string; src: string }) {
    // eslint-disable-next-line @next/next/no-img-element
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

import EditProfile from '@/app/[lang]/profile/edit/page'

describe('EditProfile', () => {
  it('should render edit profile page', () => {
    render(<EditProfile />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Edit Profile')
  })

  it('should render back button linking to profile', () => {
    render(<EditProfile />)

    expect(screen.getByRole('link', { name: /arrow_back/i })).toHaveAttribute('href', '/profile')
  })

  it('should render profile image', () => {
    render(<EditProfile />)

    expect(screen.getByRole('img', { name: 'Profile' })).toBeInTheDocument()
  })

  it('should render form fields', () => {
    render(<EditProfile />)

    expect(screen.getByText('First Name')).toBeInTheDocument()
    expect(screen.getByText('Last Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Bio')).toBeInTheDocument()
  })

  it('should have default values in inputs', () => {
    render(<EditProfile />)

    expect(screen.getByDisplayValue('Alex')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Green')).toBeInTheDocument()
    expect(screen.getByDisplayValue('alex.green@example.com')).toBeInTheDocument()
  })

  it('should render cancel link', () => {
    render(<EditProfile />)

    expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/profile')
  })

  it('should render save button', () => {
    render(<EditProfile />)

    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
  })
})
