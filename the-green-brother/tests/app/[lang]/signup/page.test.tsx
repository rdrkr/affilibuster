// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for signup page
 */

import { render, screen } from '@testing-library/react'

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

import Signup from '@/app/[lang]/signup/page'

describe('Signup', () => {
  it('should render signup form', () => {
    render(<Signup />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Create Account')
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument()
  })

  it('should render signup button', () => {
    render(<Signup />)

    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
  })

  it('should render terms checkbox', () => {
    render(<Signup />)

    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Terms' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument()
  })

  it('should render login link', () => {
    render(<Signup />)

    expect(screen.getByRole('link', { name: 'Log In' })).toHaveAttribute('href', '/login')
  })

  it('should render form labels', () => {
    render(<Signup />)

    expect(screen.getByText('Full Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Password')).toBeInTheDocument()
  })
})
