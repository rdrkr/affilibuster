// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for product detail page server component
 */

// Mock the client module
jest.mock('@/lib/content', () => ({
  getProductBySlug: jest.fn(),
  getProductCategoriesPage: jest.fn(),
  getProducts: jest.fn(),
}))

// Mock feature flags
jest.mock('@/lib/feature-flags', () => ({
  userProfileFlag: jest.fn(),
}))

// Mock next/navigation
const mockNotFound = jest.fn()
jest.mock('next/navigation', () => ({
  notFound: (): void => {
    mockNotFound()
    throw new Error('NEXT_NOT_FOUND')
  },
}))

// Mock the ProductDetailClient component
jest.mock('@/app/[lang]/products/[slug]/ProductDetailClient', () => ({
  __esModule: true,
  default: function MockProductDetailClient({
    product,
    certificatesHeader,
    relatedProducts,
    enableUserProfile,
  }: {
    product: unknown
    certificatesHeader?: any
    relatedProducts?: any[]
    enableUserProfile?: boolean
  }) {
    return (
      <div
        data-testid="product-detail-client"
        data-has-product={product ? 'true' : 'false'}
        data-has-header={certificatesHeader ? 'true' : 'false'}
        data-header-text={certificatesHeader?.header?.text}
        data-related-products-count={relatedProducts?.length ?? 0}
        data-enable-user-profile={enableUserProfile ? 'true' : 'false'}
      />
    )
  },
}))

import ProductDetailPage from '@/app/[lang]/products/[slug]/page'
import { getProductBySlug, getProductCategoriesPage, getProducts } from '@/lib/content'
import { userProfileFlag } from '@/lib/feature-flags'
import { CodeEnum } from '@/lib/generated/types.gen'
import { render, screen } from '@testing-library/react'

const mockGetProductBySlug = getProductBySlug as jest.MockedFunction<typeof getProductBySlug>
const mockGetProductCategoriesPage = getProductCategoriesPage as jest.MockedFunction<typeof getProductCategoriesPage>
const mockGetProducts = getProducts as jest.MockedFunction<typeof getProducts>
const mockUserProfileFlag = userProfileFlag as jest.MockedFunction<typeof userProfileFlag>

describe('ProductDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock implementation
    mockGetProducts.mockResolvedValue({ data: [], meta: { pagination: { page: 1, pageSize: 10, total: 0 } } })
    mockUserProfileFlag.mockResolvedValue(true)
  })

  it('should fetch product, categories page, and related products and pass to ProductDetailClient', async () => {
    const mockProduct = {
      documentId: 'prod-1',
      slug: 'prod-slug',
      header: { header: {} },
      category: { slug: 'electronics' },
    }
    const mockCategoriesPage = {
      certificatesSectionHeader: { header: { text: 'Certificates Header' } },
      relatedProductsSectionHeader: { header: { text: 'Related Products Header' } },
      bySellerText: 'by',
    }
    const mockRelatedProducts = [{ documentId: 'prod-2', slug: 'related-1' }]

    mockGetProductBySlug.mockResolvedValue(mockProduct as unknown as Awaited<ReturnType<typeof getProductBySlug>>)
    mockGetProductCategoriesPage.mockResolvedValue(
      mockCategoriesPage as unknown as Awaited<ReturnType<typeof getProductCategoriesPage>>
    )
    mockGetProducts.mockResolvedValue({
      data: mockRelatedProducts as any[],
      meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: 1 } },
    } as any)

    // Act
    const jsx = await ProductDetailPage({ params: Promise.resolve({ lang: CodeEnum.EN, slug: 'prod-slug' }) })
    render(jsx)

    // Assert
    expect(mockGetProductBySlug).toHaveBeenCalledWith('prod-slug', { locale: CodeEnum.EN })
    expect(mockGetProductCategoriesPage).toHaveBeenCalledWith(CodeEnum.EN)
    expect(mockUserProfileFlag).toHaveBeenCalled()
    expect(mockGetProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({
          category: { slug: { $eq: 'electronics' } },
          slug: { $ne: 'prod-slug' },
        }),
        pagination: { page: 1, pageSize: 10 },
        locale: CodeEnum.EN,
      })
    )

    const client = screen.getByTestId('product-detail-client')
    expect(client).toBeInTheDocument()
    expect(client).toHaveAttribute('data-has-header', 'true')
    expect(client).toHaveAttribute('data-header-text', 'Certificates Header')
    expect(client).toHaveAttribute('data-related-products-count', '1')
    expect(client).toHaveAttribute('data-enable-user-profile', 'true')
  })

  it('should call notFound when product is null', async () => {
    mockGetProductBySlug.mockResolvedValue(null)
    mockGetProductCategoriesPage.mockResolvedValue({ certificatesSectionHeader: {} } as any)

    // Expecting notFound() to be called.
    // Ensure we await the async component if it throws or returns promise (server component)
    // Server components are async functions.
    await expect(
      ProductDetailPage({ params: Promise.resolve({ lang: CodeEnum.EN, slug: 'non-existent' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(mockNotFound).toHaveBeenCalled()
  })
})
