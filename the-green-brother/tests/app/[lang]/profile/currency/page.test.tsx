// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for currency settings page
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

import Currency from '@/app/[lang]/profile/currency/page'

describe('Currency', () => {
  it('should render currency page', () => {
    render(<Currency />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Select Currency')
  })

  it('should render back button linking to profile', () => {
    render(<Currency />)

    expect(screen.getByRole('link', { name: /arrow_back/i })).toHaveAttribute('href', '/profile')
  })

  it('should render currency options', () => {
    render(<Currency />)

    expect(screen.getByText('USD')).toBeInTheDocument()
    expect(screen.getByText('EUR')).toBeInTheDocument()
    expect(screen.getByText('GBP')).toBeInTheDocument()
    expect(screen.getByText('CAD')).toBeInTheDocument()
    expect(screen.getByText('AUD')).toBeInTheDocument()
  })

  it('should have USD selected by default', () => {
    render(<Currency />)

    // USD should be highlighted
    const usdLabel = screen.getByText('United States Dollar').closest('label')
    expect(usdLabel).toHaveClass('border-primary')
  })

  it('should change selection on click', () => {
    render(<Currency />)

    // Click on EUR
    const eurLabel = screen.getByText('Euro').closest('label')!
    fireEvent.click(eurLabel)

    // EUR should now be selected
    expect(eurLabel).toHaveClass('border-primary')
  })

  it('should render save button', () => {
    render(<Currency />)

    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
  })

  it('should render currency flags', () => {
    render(<Currency />)

    const flags = screen.getAllByRole('img')
    expect(flags.length).toBe(5)
  })
})
