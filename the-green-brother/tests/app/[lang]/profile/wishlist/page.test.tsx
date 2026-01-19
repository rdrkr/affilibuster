// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for wishlist page
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

import Wishlist from '@/app/[lang]/profile/wishlist/page'

describe('Wishlist', () => {
  it('should render wishlist page', () => {
    render(<Wishlist />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Wishlist')
  })

  it('should render back button linking to profile', () => {
    render(<Wishlist />)

    expect(screen.getByRole('link', { name: /arrow_back/i })).toHaveAttribute('href', '/profile')
  })

  it('should render wishlist items', () => {
    render(<Wishlist />)

    expect(screen.getByText('Bamboo Toothbrush Set')).toBeInTheDocument()
    expect(screen.getByText('Reusable Coffee Cup')).toBeInTheDocument()
    expect(screen.getByText('Solar Powered Charger')).toBeInTheDocument()
  })

  it('should render item prices', () => {
    render(<Wishlist />)

    expect(screen.getByText('$12.99')).toBeInTheDocument()
    expect(screen.getByText('$25.00')).toBeInTheDocument()
    expect(screen.getByText('$49.50')).toBeInTheDocument()
  })

  it('should render product images', () => {
    render(<Wishlist />)

    const images = screen.getAllByRole('img')
    expect(images.length).toBe(3)
  })

  it('should render delete buttons', () => {
    render(<Wishlist />)

    const deleteButtons = screen.getAllByText('delete')
    expect(deleteButtons.length).toBe(3)
  })

  it('should render add to cart buttons', () => {
    render(<Wishlist />)

    const addToCartButtons = screen.getAllByRole('button', { name: /Add to Cart/i })
    expect(addToCartButtons.length).toBe(3)
  })
})
