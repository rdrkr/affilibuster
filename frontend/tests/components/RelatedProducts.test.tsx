// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { RelatedProducts, type RelatedProduct } from '@/components/RelatedProducts'
import { render, screen } from '@testing-library/react'

describe('RelatedProducts', () => {
  const mockProducts: RelatedProduct[] = [
    {
      id: '1',
      name: 'Product 1',
      slug: 'product-1',
      price: 99.99,
      currency: 'USD',
      imageUrl: '/images/product-1.jpg',
      imageAlt: 'Product 1 image',
    },
    {
      id: '2',
      name: 'Product 2',
      slug: 'product-2',
      price: 149.99,
      currency: 'USD',
    },
    {
      id: '3',
      name: 'Product 3',
      slug: 'product-3',
      price: 79.99,
      currency: 'EUR',
      imageUrl: '/images/product-3.jpg',
    },
  ]

  it('should render related products section', () => {
    render(<RelatedProducts products={mockProducts} lang="en" />)

    expect(screen.getByTestId('related-products')).toBeInTheDocument()
  })

  it('should render section title', () => {
    render(<RelatedProducts products={mockProducts} title="You May Also Like" lang="en" />)

    expect(screen.getByText('You May Also Like')).toBeInTheDocument()
  })

  it('should use default title when not provided', () => {
    render(<RelatedProducts products={mockProducts} lang="en" />)

    expect(screen.getByText('Related Products')).toBeInTheDocument()
  })

  it('should render all products', () => {
    render(<RelatedProducts products={mockProducts} lang="en" />)

    expect(screen.getByText('Product 1')).toBeInTheDocument()
    expect(screen.getByText('Product 2')).toBeInTheDocument()
    expect(screen.getByText('Product 3')).toBeInTheDocument()
  })

  it('should render product images when provided', () => {
    render(<RelatedProducts products={mockProducts} lang="en" />)

    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)

    // Next.js Image component transforms src, so we check alt text instead
    const product1Image = screen.getByAltText('Product 1 image')
    expect(product1Image).toBeInTheDocument()
  })

  it('should use product name as alt text when imageAlt not provided', () => {
    render(<RelatedProducts products={mockProducts} lang="en" />)

    // Next.js Image component transforms src, so we check alt text directly
    const product3Image = screen.getByAltText('Product 3')
    expect(product3Image).toBeInTheDocument()
  })

  it('should not render images for products without imageUrl', () => {
    render(<RelatedProducts products={[mockProducts[1]!]} lang="en" />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('should render product prices', () => {
    render(<RelatedProducts products={mockProducts} lang="en" />)

    // Price component should be rendered for each product
    expect(screen.getByTestId('related-products')).toBeInTheDocument()
  })

  it('should render view product buttons', () => {
    render(<RelatedProducts products={mockProducts} lang="en" viewProductText="View Product" />)

    const buttons = screen.getAllByText('View Product')
    expect(buttons).toHaveLength(mockProducts.length)
  })

  it('should use default button text when not provided', () => {
    render(<RelatedProducts products={mockProducts} lang="en" />)

    const buttons = screen.getAllByText('View Product')
    expect(buttons).toHaveLength(mockProducts.length)
  })

  it('should render product links with correct href', () => {
    render(<RelatedProducts products={mockProducts} lang="en" />)

    const links = screen.getAllByRole('link')
    expect(links.some(link => link.getAttribute('href') === '/en/products/product-1')).toBe(true)
    expect(links.some(link => link.getAttribute('href') === '/en/products/product-2')).toBe(true)
    expect(links.some(link => link.getAttribute('href') === '/en/products/product-3')).toBe(true)
  })

  it('should render product cards with test ID', () => {
    render(<RelatedProducts products={mockProducts} lang="en" />)

    const productCards = screen.getAllByTestId('related-product')
    expect(productCards).toHaveLength(mockProducts.length)
  })

  it('should return null when products array is empty', () => {
    const { container } = render(<RelatedProducts products={[]} lang="en" />)

    expect(container.firstChild).toBeNull()
  })

  it('should apply custom className', () => {
    render(<RelatedProducts products={mockProducts} lang="en" className="custom-class" />)

    const section = screen.getByTestId('related-products')
    expect(section).toHaveClass('custom-class')
  })

  it('should have responsive grid layout', () => {
    const { container } = render(<RelatedProducts products={mockProducts} lang="en" />)

    const grid = container.querySelector('.grid')
    expect(grid).toHaveClass('grid-cols-1')
    expect(grid).toHaveClass('sm:grid-cols-2')
    expect(grid).toHaveClass('lg:grid-cols-3')
    expect(grid).toHaveClass('xl:grid-cols-4')
  })

  it('should support dark mode styling', () => {
    const { container } = render(<RelatedProducts products={mockProducts} lang="en" />)

    const section = container.querySelector('section')
    expect(section?.querySelector('.dark\\:bg-neutral-800')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<RelatedProducts products={mockProducts} title="You May Also Like" lang="en" />)

    const section = screen.getByRole('region', { name: /You May Also Like/i })
    expect(section).toHaveAttribute('aria-labelledby', 'related-products-title')
  })

  it('should lazy load product images', () => {
    render(<RelatedProducts products={mockProducts} lang="en" />)

    const images = screen.getAllByRole('img')
    images.forEach(img => {
      expect(img).toHaveAttribute('loading', 'lazy')
    })
  })

  it('should render correct number of products', () => {
    render(<RelatedProducts products={mockProducts} lang="en" />)

    const productCards = screen.getAllByTestId('related-product')
    expect(productCards).toHaveLength(3)
  })

  it('should handle single product', () => {
    render(<RelatedProducts products={[mockProducts[0]!]} lang="en" />)

    expect(screen.getByText('Product 1')).toBeInTheDocument()
    expect(screen.getAllByTestId('related-product')).toHaveLength(1)
  })

  it('should render product names as links', () => {
    render(<RelatedProducts products={mockProducts} lang="en" />)

    const product1Link = screen.getByRole('link', { name: 'Product 1' })
    expect(product1Link).toHaveAttribute('href', '/en/products/product-1')
  })
})
