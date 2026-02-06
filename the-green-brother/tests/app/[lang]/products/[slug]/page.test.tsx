// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for product detail page server component
 */

// Mock the client module
jest.mock('@/lib/content', () => ({
  getProductBySlug: jest.fn(),
  getProductCategoriesPage: jest.fn(),
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
  default: function MockProductDetailClient({
    product,
    certificatesHeader,
  }: {
    product: unknown
    certificatesHeader?: any
  }) {
    return (
      <div
        data-testid="product-detail-client"
        data-has-product={product ? 'true' : 'false'}
        data-has-header={certificatesHeader ? 'true' : 'false'}
        data-header-text={certificatesHeader?.header?.text}
      />
    )
  },
}))

import ProductDetailPage from '@/app/[lang]/products/[slug]/page'
import { getProductBySlug, getProductCategoriesPage } from '@/lib/content'
import { CodeEnum } from '@/lib/generated/types.gen'
import { render, screen } from '@testing-library/react'

const mockGetProductBySlug = getProductBySlug as jest.MockedFunction<typeof getProductBySlug>
const mockGetProductCategoriesPage = getProductCategoriesPage as jest.MockedFunction<typeof getProductCategoriesPage>

describe('ProductDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch product and categories page and pass to ProductDetailClient', async () => {
    const mockProduct = { documentId: 'prod-1', slug: 'prod-slug', header: { header: {} } }
    const mockCategoriesPage = {
      certificatesSectionHeader: { header: { text: 'Certificates Header' } },
    }

    mockGetProductBySlug.mockResolvedValue(mockProduct as unknown as Awaited<ReturnType<typeof getProductBySlug>>)
    mockGetProductCategoriesPage.mockResolvedValue(
      mockCategoriesPage as unknown as Awaited<ReturnType<typeof getProductCategoriesPage>>
    )

    const Component = await ProductDetailPage({ params: Promise.resolve({ lang: CodeEnum.EN, slug: 'prod-slug' }) })
    render(Component)

    expect(mockGetProductBySlug).toHaveBeenCalledWith('prod-slug', { locale: CodeEnum.EN })
    expect(mockGetProductCategoriesPage).toHaveBeenCalledWith(CodeEnum.EN)

    const client = screen.getByTestId('product-detail-client')
    expect(client).toBeInTheDocument()
    expect(client).toHaveAttribute('data-has-header', 'true')
    expect(client).toHaveAttribute('data-header-text', 'Certificates Header')
  })

  it('should call notFound when product is null', async () => {
    mockGetProductBySlug.mockResolvedValue(null)

    // We don't care about categories page here as it should 404 before fetching it (or after, but not rendering)
    // Actually implementation fetches product first and if null returns 404 immediately.

    await ProductDetailPage({ params: Promise.resolve({ lang: CodeEnum.EN, slug: 'non-existent' }) })

    expect(mockNotFound).toHaveBeenCalled()
  })
})
