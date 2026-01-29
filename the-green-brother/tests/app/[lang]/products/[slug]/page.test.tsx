// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for product detail page server component
 */

// Mock the client module
jest.mock('@/lib/content', () => ({
  getProductBySlug: jest.fn(),
}))

// Mock next/navigation
const mockNotFound = jest.fn()
jest.mock('next/navigation', () => ({
  notFound: (): void => {
    mockNotFound()
  },
}))

// Mock the ProductDetailClient component
jest.mock('@/app/[lang]/products/[slug]/ProductDetailClient', () => ({
  __esModule: true,
  default: function MockProductDetailClient({ product }: { product: unknown }) {
    return <div data-testid="product-detail-client" data-has-product={product ? 'true' : 'false'} />
  },
}))

import ProductDetailPage from '@/app/[lang]/products/[slug]/page'
import { getProductBySlug } from '@/lib/content'
import { CodeEnum } from '@/lib/generated/types.gen'
import { render, screen } from '@testing-library/react'

const mockGetProductBySlug = getProductBySlug as jest.MockedFunction<typeof getProductBySlug>

describe('ProductDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch product and pass to ProductDetailClient', async () => {
    const mockProduct = { documentId: 'prod-1', slug: 'prod-slug', header: { header: {} } }
    mockGetProductBySlug.mockResolvedValue(mockProduct as unknown as Awaited<ReturnType<typeof getProductBySlug>>)

    const Component = await ProductDetailPage({ params: Promise.resolve({ lang: CodeEnum.EN, slug: 'prod-slug' }) })
    render(Component)

    expect(mockGetProductBySlug).toHaveBeenCalledWith('prod-slug', { locale: CodeEnum.EN })
    expect(screen.getByTestId('product-detail-client')).toBeInTheDocument()
  })

  it('should call notFound when product is null', async () => {
    mockGetProductBySlug.mockResolvedValue(null)

    await ProductDetailPage({ params: Promise.resolve({ lang: CodeEnum.EN, slug: 'non-existent' }) })

    expect(mockNotFound).toHaveBeenCalled()
  })
})
