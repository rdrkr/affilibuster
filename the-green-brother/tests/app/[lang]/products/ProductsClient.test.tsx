// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for ProductsClient component
 */

import { fireEvent, render, screen } from '@testing-library/react'

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: mockPush })),
}))

// Mock CMS components
jest.mock('@/components/elements', () => ({
  CMSImage: function MockCMSImage({ fallbackAlt }: { fallbackAlt?: string }) {
    return <div data-testid="cms-image">{fallbackAlt}</div>
  },
  CMSText: function MockCMSText({ text }: { text?: string }) {
    return <span>{text}</span>
  },
}))

import ProductsClient from '@/app/[lang]/products/ProductsClient'
import type {
  ApiProductCategoriesPageProductCategoriesPageDocument,
  ApiProductCategoryProductCategoryDocument,
  ApiProductProductDocument,
} from '@/lib/generated/types.gen'

describe('ProductsClient', () => {
  const mockPageData: ApiProductCategoriesPageProductCategoriesPageDocument = {
    pageText: 'All Products',
    seoMetadata: { metaDescription: 'Browse our products' },
  } as unknown as ApiProductCategoriesPageProductCategoriesPageDocument

  const mockProducts: ApiProductProductDocument[] = [
    {
      documentId: 'prod-1',
      slug: 'product-1',
      content: { header: { header: { text: 'Product One' } } },
      price: '29.99',
      category: { content: { text: 'Electronics' } },
      images: [{ url: '/images/prod1.jpg' }],
    } as unknown as ApiProductProductDocument,
    {
      documentId: 'prod-2',
      slug: 'product-2',
      content: { header: { header: { text: 'Product Two' } } },
      price: '49.99',
      category: { content: { text: 'Clothing' } },
      images: [{ url: '/images/prod2.jpg' }],
    } as unknown as ApiProductProductDocument,
  ]

  const mockCategories: ApiProductCategoryProductCategoryDocument[] = [
    { content: { text: 'Electronics' } } as ApiProductCategoryProductCategoryDocument,
    { content: { text: 'Clothing' } } as ApiProductCategoryProductCategoryDocument,
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should render page title from CMS data', () => {
    render(<ProductsClient pageData={mockPageData} products={[]} categories={[]} />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('All Products')
  })

  it('should render default title when pageData is null', () => {
    render(<ProductsClient pageData={null} products={[]} categories={[]} />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Products')
  })

  it('should render products', () => {
    render(<ProductsClient pageData={mockPageData} products={mockProducts} categories={mockCategories} />)

    expect(screen.getAllByText('Product One').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Product Two').length).toBeGreaterThan(0)
  })

  it('should render empty state when no products', () => {
    render(<ProductsClient pageData={mockPageData} products={[]} categories={[]} />)

    expect(screen.getByText('No products found')).toBeInTheDocument()
  })

  it('should render category filters', () => {
    render(<ProductsClient pageData={mockPageData} products={mockProducts} categories={mockCategories} />)

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Electronics' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clothing' })).toBeInTheDocument()
  })

  it('should filter products by category', () => {
    render(<ProductsClient pageData={mockPageData} products={mockProducts} categories={mockCategories} />)

    fireEvent.click(screen.getByRole('button', { name: 'Electronics' }))

    expect(screen.getAllByText('Product One').length).toBeGreaterThan(0)
    expect(screen.queryAllByText('Product Two').length).toBe(0)
  })

  it('should filter products by search query', () => {
    render(<ProductsClient pageData={mockPageData} products={mockProducts} categories={mockCategories} />)

    const searchInput = screen.getByPlaceholderText('Search sustainable products...')
    fireEvent.change(searchInput, { target: { value: 'One' } })

    expect(screen.getAllByText('Product One').length).toBeGreaterThan(0)
    expect(screen.queryAllByText('Product Two').length).toBe(0)
  })

  it('should redirect to login when clicking wishlist without being logged in', () => {
    render(<ProductsClient pageData={mockPageData} products={mockProducts} categories={mockCategories} />)

    // Find wishlist button and click it
    const wishlistButtons = screen.getAllByText('favorite_border')
    fireEvent.click(wishlistButtons[0]!)

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('should add to wishlist when logged in', () => {
    localStorage.setItem('isLoggedIn', 'true')
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {
      return
    })

    render(<ProductsClient pageData={mockPageData} products={mockProducts} categories={mockCategories} />)

    const wishlistButtons = screen.getAllByText('favorite_border')
    fireEvent.click(wishlistButtons[0]!)

    expect(mockPush).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith('Added to wishlist')

    consoleSpy.mockRestore()
  })

  it('should render meta description when available', () => {
    render(<ProductsClient pageData={mockPageData} products={[]} categories={[]} />)

    expect(screen.getByText('Browse our products')).toBeInTheDocument()
  })
})
