// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for login page
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

import Login from '@/app/[lang]/login/page'

describe('Login', () => {
  it('should render login form', () => {
    render(<Login />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome Back')
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument()
  })

  it('should render login button', () => {
    render(<Login />)

    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument()
  })

  it('should render social login buttons', () => {
    render(<Login />)

    expect(screen.getByRole('button', { name: /Google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Apple/i })).toBeInTheDocument()
  })

  it('should render forgot password link', () => {
    render(<Login />)

    expect(screen.getByRole('link', { name: 'Forgot?' })).toBeInTheDocument()
  })

  it('should render signup link', () => {
    render(<Login />)

    expect(screen.getByRole('link', { name: 'Sign Up' })).toHaveAttribute('href', '/signup')
  })

  it('should render email and password labels', () => {
    render(<Login />)

    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Password')).toBeInTheDocument()
  })
})
