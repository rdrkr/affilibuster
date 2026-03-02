// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for product detail page server component
 */

// Mock draft mode
const mockDraftMode = jest.fn().mockResolvedValue({ isEnabled: false })
jest.mock('next/headers', () => ({
  draftMode: (...args: unknown[]) => mockDraftMode(...args),
}))

// Mock the client module
jest.mock('@/lib/content', () => ({
  getProductBySlug: jest.fn(),
  getProductCategoriesPage: jest.fn(),
  getProducts: jest.fn(),
  getNavigation: jest.fn(),
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

// Mock JsonLdScript component
jest.mock('@/components/seo', () => ({
  JsonLdScript: jest.fn(({ data }: { data: Record<string, unknown> }) => (
    <script type="application/ld+json" data-testid="json-ld">
      {JSON.stringify(data)}
    </script>
  )),
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

import ProductDetailPage, { generateMetadata, generateStaticParams } from '@/app/[lang]/products/[slug]/page'
import { JsonLdScript } from '@/components/seo'
import { getNavigation, getProductBySlug, getProductCategoriesPage, getProducts } from '@/lib/content'
import { userProfileFlag } from '@/lib/feature-flags'
import { LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { render, screen } from '@testing-library/react'

const mockGetProductBySlug = getProductBySlug as jest.MockedFunction<typeof getProductBySlug>
const mockGetProductCategoriesPage = getProductCategoriesPage as jest.MockedFunction<typeof getProductCategoriesPage>
const mockGetProducts = getProducts as jest.MockedFunction<typeof getProducts>
const mockGetNavigation = getNavigation as jest.MockedFunction<typeof getNavigation>
const mockUserProfileFlag = userProfileFlag as jest.MockedFunction<typeof userProfileFlag>
const mockJsonLdScript = JsonLdScript as unknown as jest.Mock

describe('ProductDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDraftMode.mockResolvedValue({ isEnabled: false })
    // Default mock implementation
    mockGetProducts.mockResolvedValue([])
    mockUserProfileFlag.mockResolvedValue(true)
  })

  it('should fetch product, categories page, and related products and pass to ProductDetailClient', async () => {
    const mockProduct = {
      documentId: 'prod-1',
      slug: 'prod-slug',
      header: { header: { text: 'Product Name' } },
      category: { slug: 'electronics', content: { text: 'Electronics' } },
      seller: { firstName: 'John', lastName: 'Doe' },
      images: [{ url: 'https://example.com/img.jpg' }],
      prices: [{ amount: 29.99, currency: { code: 'USD' } }],
      seoMetadata: { metaTitle: 'Product Name', metaDescription: 'A product' },
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
    mockGetProducts.mockResolvedValue(mockRelatedProducts as any[])

    // Act
    const jsx = await ProductDetailPage({ params: Promise.resolve({ lang: LanguageCode.EN, slug: 'prod-slug' }) })
    render(jsx)

    // Assert
    expect(mockGetProductBySlug).toHaveBeenCalledWith('prod-slug', { locale: LanguageCode.EN })
    expect(mockGetProductCategoriesPage).toHaveBeenCalledWith(LanguageCode.EN, {})
    expect(mockUserProfileFlag).toHaveBeenCalled()
    expect(mockGetProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({
          category: { slug: { $eq: 'electronics' } },
        }),
        pagination: { page: 1, pageSize: 10 },
        locale: LanguageCode.EN,
      })
    )

    const client = screen.getByTestId('product-detail-client')
    expect(client).toBeInTheDocument()
    expect(client).toHaveAttribute('data-has-header', 'true')
    expect(client).toHaveAttribute('data-header-text', 'Certificates Header')
    expect(client).toHaveAttribute('data-related-products-count', '1')
    expect(client).toHaveAttribute('data-enable-user-profile', 'true')
  })

  it('should render JSON-LD structured data for Product and Breadcrumb', async () => {
    const mockProduct = {
      documentId: 'prod-1',
      slug: 'prod-slug',
      header: { header: { text: 'Eco Bottle' } },
      category: { slug: 'eco', content: { text: 'Eco Products' } },
      seller: { firstName: 'Jane' },
      images: [{ url: 'https://example.com/img1.jpg' }],
      prices: [{ amount: 19.99, currency: { code: 'EUR' } }],
      seoMetadata: { metaDescription: 'A great product' },
    }
    const mockCategoriesPage = {
      certificatesSectionHeader: { header: { text: 'Certs' } },
      relatedProductsSectionHeader: { header: { text: 'Related' } },
      bySellerText: 'by',
    }

    mockGetProductBySlug.mockResolvedValue(mockProduct as unknown as Awaited<ReturnType<typeof getProductBySlug>>)
    mockGetProductCategoriesPage.mockResolvedValue(
      mockCategoriesPage as unknown as Awaited<ReturnType<typeof getProductCategoriesPage>>
    )
    mockGetProducts.mockResolvedValue([])

    const jsx = await ProductDetailPage({ params: Promise.resolve({ lang: LanguageCode.EN, slug: 'prod-slug' }) })
    render(jsx)

    // Should render two JsonLdScript components (Product + Breadcrumb)
    expect(mockJsonLdScript).toHaveBeenCalledTimes(2)
    expect(mockJsonLdScript).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ '@type': 'Product', name: 'Eco Bottle' }),
      }),
      undefined
    )
    expect(mockJsonLdScript).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ '@type': 'BreadcrumbList' }),
      }),
      undefined
    )
  })

  describe('Environment variable fallback for site URL', () => {
    const originalEnv = process.env

    beforeEach(() => {
      jest.resetModules()
      process.env = { ...originalEnv }
    })

    afterAll(() => {
      process.env = originalEnv
    })

    it('should use fallback URL when NEXT_PUBLIC_SITE_URL is missing', async () => {
      delete process.env.NEXT_PUBLIC_SITE_URL
      mockGetProductBySlug.mockResolvedValue({
        documentId: 'prod-1',
        slug: 'prod-slug',
        header: { header: { text: 'Eco Bottle' } },
        category: { slug: 'eco', content: { text: 'Eco Products' } },
        seller: { firstName: 'Jane' },
        images: [{ url: 'https://example.com/img1.jpg' }],
        prices: [{ amount: 19.99, currency: { code: 'EUR' } }],
        seoMetadata: { metaDescription: 'A great product' },
      } as unknown as Awaited<ReturnType<typeof getProductBySlug>>)
      mockGetProductCategoriesPage.mockResolvedValue({ certificatesSectionHeader: {} } as any)
      mockGetProducts.mockResolvedValue([])

      const jsx = await ProductDetailPage({ params: Promise.resolve({ lang: LanguageCode.EN, slug: 'prod-slug' }) })
      render(jsx)

      expect(mockJsonLdScript).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            '@type': 'Product',
            offers: expect.arrayContaining([
              expect.objectContaining({ url: 'http://localhost:3000/en/products/prod-slug' }),
            ]),
          }),
        }),
        undefined
      )
    })
  })

  it('should call notFound when product is null', async () => {
    mockGetProductBySlug.mockResolvedValue(null)
    mockGetProductCategoriesPage.mockResolvedValue({ certificatesSectionHeader: {} } as any)

    await expect(
      ProductDetailPage({ params: Promise.resolve({ lang: LanguageCode.EN, slug: 'non-existent' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('should pass draft status when draft mode is enabled', async () => {
    mockDraftMode.mockResolvedValue({ isEnabled: true })

    const mockProduct = {
      documentId: 'prod-1',
      slug: 'prod-slug',
      header: { header: { text: 'Product' } },
      category: { slug: 'electronics', content: { text: 'Electronics' } },
      seller: { firstName: 'John', lastName: 'Doe' },
      images: [{ url: 'https://example.com/img.jpg' }],
      prices: [{ amount: 29.99, currency: { code: 'USD' } }],
      seoMetadata: {},
    }
    const mockCategoriesPage = {
      certificatesSectionHeader: { header: { text: 'Certificates Header' } },
      relatedProductsSectionHeader: { header: { text: 'Related Products Header' } },
      bySellerText: 'by',
    }

    mockGetProductBySlug.mockResolvedValue(mockProduct as unknown as Awaited<ReturnType<typeof getProductBySlug>>)
    mockGetProductCategoriesPage.mockResolvedValue(
      mockCategoriesPage as unknown as Awaited<ReturnType<typeof getProductCategoriesPage>>
    )
    mockGetProducts.mockResolvedValue([])

    const jsx = await ProductDetailPage({ params: Promise.resolve({ lang: LanguageCode.EN, slug: 'prod-slug' }) })
    render(jsx)

    expect(mockGetProductBySlug).toHaveBeenCalledWith('prod-slug', {
      locale: LanguageCode.EN,
      status: SchemaEnum.DRAFT,
    })
    expect(mockGetProductCategoriesPage).toHaveBeenCalledWith(LanguageCode.EN, { status: SchemaEnum.DRAFT })
    expect(mockGetProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: LanguageCode.EN,
        status: SchemaEnum.DRAFT,
      })
    )
  })

  it('should fallback to empty array when getProducts returns undefined', async () => {
    mockGetProductBySlug.mockResolvedValue({
      documentId: 'prod-1',
      slug: 'prod-slug',
      header: { header: { text: 'Product' } },
      category: { slug: 'electronics', content: { text: 'Electronics' } },
      seller: { firstName: 'John' },
      images: [],
      prices: [],
      seoMetadata: {},
    } as unknown as Awaited<ReturnType<typeof getProductBySlug>>)
    mockGetProductCategoriesPage.mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof getProductCategoriesPage>>
    )
    mockGetProducts.mockResolvedValue(null as any)

    const jsx = await ProductDetailPage({ params: Promise.resolve({ lang: LanguageCode.EN, slug: 'prod-slug' }) })
    render(jsx)

    expect(screen.getByTestId('product-detail-client')).toHaveAttribute('data-related-products-count', '0')
  })

  it('should fallback to slug when header text is missing', async () => {
    mockGetProductBySlug.mockResolvedValue({
      documentId: 'prod-1',
      slug: 'prod-slug-fallback',
      header: { header: { text: undefined } },
      category: { slug: 'electronics', content: { text: 'Electronics' } },
      seller: { firstName: 'John' },
      images: [],
      prices: [],
      seoMetadata: {},
    } as unknown as Awaited<ReturnType<typeof getProductBySlug>>)
    mockGetProductCategoriesPage.mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof getProductCategoriesPage>>
    )
    mockGetProducts.mockResolvedValue([])

    const jsx = await ProductDetailPage({
      params: Promise.resolve({ lang: LanguageCode.EN, slug: 'prod-slug-fallback' }),
    })
    render(jsx)

    expect(mockJsonLdScript).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ '@type': 'Product', name: 'prod-slug-fallback' }),
      }),
      undefined
    )
  })
})

describe('generateStaticParams', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return params for all products across all languages', async () => {
    mockGetProducts.mockResolvedValue([{ slug: 'eco-bottle' }, { slug: 'bamboo-brush' }] as Awaited<
      ReturnType<typeof getProducts>
    >)

    const params = await generateStaticParams()

    expect(params).toEqual(
      expect.arrayContaining([
        { lang: 'en', slug: 'eco-bottle' },
        { lang: 'it', slug: 'eco-bottle' },
        { lang: 'he', slug: 'eco-bottle' },
        { lang: 'en', slug: 'bamboo-brush' },
        { lang: 'it', slug: 'bamboo-brush' },
        { lang: 'he', slug: 'bamboo-brush' },
      ])
    )
    expect(params.length).toBe(6)
  })

  it('should return empty array when products is null', async () => {
    mockGetProducts.mockResolvedValue(null as unknown as Awaited<ReturnType<typeof getProducts>>)

    const params = await generateStaticParams()

    expect(params).toEqual([])
  })
})

describe('generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return metadata from CMS product data', async () => {
    mockGetProductBySlug.mockResolvedValue({
      seoMetadata: { metaTitle: 'Eco Bottle', metaDescription: 'Best eco bottle' },
      images: [{ url: 'https://example.com/bottle.jpg' }],
    } as unknown as Awaited<ReturnType<typeof getProductBySlug>>)
    mockGetNavigation.mockResolvedValue({
      siteTitle: 'TheGreenBrother',
    } as Awaited<ReturnType<typeof getNavigation>>)

    const metadata = await generateMetadata({
      params: Promise.resolve({ lang: LanguageCode.EN, slug: 'eco-bottle' }),
    })

    expect(metadata.title).toBe('Eco Bottle')
    expect(metadata.description).toBe('Best eco bottle')
    expect(metadata.openGraph?.images).toEqual([{ url: 'https://example.com/bottle.jpg' }])
  })

  it('should handle null product gracefully', async () => {
    mockGetProductBySlug.mockResolvedValue(null)
    mockGetNavigation.mockResolvedValue(null)

    const metadata = await generateMetadata({
      params: Promise.resolve({ lang: LanguageCode.EN, slug: 'non-existent' }),
    })

    expect(metadata.title).toBeUndefined()
    expect(metadata.description).toBeUndefined()
  })
})
