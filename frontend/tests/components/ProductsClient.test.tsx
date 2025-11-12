// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { render, screen, fireEvent } from '@testing-library/react'
import { ProductsClient, type ProductsClientProps } from '@/components/ProductsClient'
import type { Product } from '@/lib/types'
import { useRouter, useSearchParams } from 'next/navigation'
import { createMockProduct } from '../helpers/mockFactories'

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock the Dropdown component
jest.mock('@/components/Dropdown', () => ({
  Dropdown: ({
    value,
    items,
    onChange,
    ariaLabel,
  }: {
    value: string
    items: { value: string; label: string }[]
    onChange: (value: string) => void
    ariaLabel: string
  }) => (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={e => {
        onChange(e.target.value)
      }}
    >
      {items.map(item => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  ),
}))

describe('ProductsClient', () => {
  const mockPush = jest.fn()
  const mockSearchParams = {
    toString: jest.fn(() => ''),
    get: jest.fn(),
  }

  const mockProducts: Product[] = [
    createMockProduct({
      id: 1,
      title: 'Test Product 1',
      slug: 'test-product-1',
      excerpt: 'Test excerpt 1',
      category: 'electronics',
      publishedAt: '2024-01-01',
    }),
    createMockProduct({
      id: 2,
      title: 'Test Product 2',
      slug: 'test-product-2',
      excerpt: 'Test excerpt 2',
      category: 'home',
      publishedAt: '2024-01-02',
    }),
  ]

  const mockCategories = [
    { id: 'electronics', name: 'Electronics' },
    { id: 'home', name: 'Home & Garden' },
  ]

  const defaultProps: ProductsClientProps = {
    products: mockProducts,
    lang: 'en',
    currentPage: 1,
    totalPages: 5,
    categories: mockCategories,
    selectedCategory: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
  })

  it('should render products grid', () => {
    render(<ProductsClient {...defaultProps} />)

    expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    expect(screen.getByText('Test Product 2')).toBeInTheDocument()
  })

  it('should render category filter when categories exist', () => {
    render(<ProductsClient {...defaultProps} />)

    expect(screen.getByLabelText('Filter by category')).toBeInTheDocument()
  })

  it('should not render category filter when no categories', () => {
    render(<ProductsClient {...defaultProps} categories={[]} />)

    expect(screen.queryByLabelText('Filter by category')).not.toBeInTheDocument()
  })

  it('should render pagination when multiple pages', () => {
    render(<ProductsClient {...defaultProps} />)

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument()
  })

  it('should not render pagination for single page', () => {
    render(<ProductsClient {...defaultProps} totalPages={1} />)

    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument()
  })

  it('should handle category change and reset page', () => {
    mockSearchParams.toString.mockReturnValue('')

    render(<ProductsClient {...defaultProps} />)

    const select = screen.getByLabelText('Filter by category')
    fireEvent.change(select, { target: { value: 'electronics' } })

    expect(mockPush).toHaveBeenCalledWith('/en/products?category=electronics')
  })

  it('should handle category change to "All Categories"', () => {
    mockSearchParams.toString.mockReturnValue('category=electronics')

    render(<ProductsClient {...defaultProps} selectedCategory="electronics" />)

    // Simulate selecting "All Categories" option (empty value)
    const select = screen.getByLabelText('Filter by category')
    fireEvent.change(select, { target: { value: '' } })

    expect(mockPush).toHaveBeenCalledWith('/en/products?')
  })

  it('should handle page change', () => {
    mockSearchParams.toString.mockReturnValue('')

    render(<ProductsClient {...defaultProps} />)

    fireEvent.click(screen.getByText('2'))

    expect(mockPush).toHaveBeenCalledWith('/en/products?page=2')
  })

  it('should preserve category when changing page', () => {
    mockSearchParams.toString.mockReturnValue('category=electronics')
    mockSearchParams.get.mockReturnValue('electronics')

    render(<ProductsClient {...defaultProps} selectedCategory="electronics" />)

    fireEvent.click(screen.getByText('2'))

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('category=electronics'))
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('page=2'))
  })

  it('should render product links with correct href', () => {
    render(<ProductsClient {...defaultProps} />)

    const links = screen.getAllByRole('link')
    const productLink = links.find(link => link.getAttribute('href')?.includes('test-product-1'))

    expect(productLink).toHaveAttribute('href', '/en/products/test-product-1')
  })

  it('should render product excerpts', () => {
    render(<ProductsClient {...defaultProps} />)

    expect(screen.getByText('Test excerpt 1')).toBeInTheDocument()
    expect(screen.getByText('Test excerpt 2')).toBeInTheDocument()
  })

  it('should show "No products found" when products array is empty', () => {
    render(<ProductsClient {...defaultProps} products={[]} />)

    expect(screen.getByText('No products found')).toBeInTheDocument()
  })

  it('should have hover effects on product cards', () => {
    const { container } = render(<ProductsClient {...defaultProps} />)

    const productCard = container.querySelector('.group')
    expect(productCard).toHaveClass('hover:shadow-xl')
  })

  it('should support dark mode styling', () => {
    const { container } = render(<ProductsClient {...defaultProps} />)

    const productCard = container.querySelector('.group')
    expect(productCard?.className).toContain('dark:')
  })
})
