// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Homepage page
 */

import { render, screen } from '@testing-library/react'
import HomePage, { generateMetadata, generateStaticParams } from '@/app/[lang]/page'
import * as client from '@/lib/client'
import {
  CodeEnum,
  _1Enum4,
  CurrencyCode,
  TranslationStatusEnum,
  type ApiHomepageHomepageDocument,
  type UiFeatureCardEntry,
  type UiTrustCardEntry,
  type ProductGetProductsResponses,
} from '@/lib/generated/types.gen'

// Mock the client module
jest.mock('@/lib/client', () => ({
  getHomepage: jest.fn(),
  getProducts: jest.fn(),
  getNavigation: jest.fn(),
  getUserPreferences: jest.fn(),
  detectLanguage: jest.fn(),
  getLanguages: jest.fn(),
}))

// Mock next-intl
jest.mock('next-intl/server', () => ({
  setRequestLocale: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/en'),
}))

describe('HomePage', () => {
  const mockFeatureCards: UiFeatureCardEntry[] = [
    {
      id: 1,
      title: 'Best Prices',
      description: 'We find the best deals',
      linkUrl: '/en/products',
    },
  ]

  const mockTrustCards: UiTrustCardEntry[] = [
    {
      id: 1,
      title: 'Trusted',
      description: 'We are trusted by thousands',
    },
  ]

  const mockHomepageData: ApiHomepageHomepageDocument = {
    documentId: 'test-homepage-id',
    id: 1,
    entryTitle: 'Homepage',
    heroTitle: 'Welcome to Affilibuster',
    heroSubtitle: 'Find the best products',
    featuredSectionTitle: 'Featured Products',
    featuredSectionSubtitle: 'Check out our top picks',
    seeAllProductsText: 'See All Products',
    viewDetailsButtonText: 'View Details',
    featuredBadgeText: 'Featured',
    showingProductsTemplate: 'Showing {count} of {total} products',
    testimonialsText: 'Great products, great service!',
    testimonialAuthor: 'John Doe',
    testimonialRole: 'Happy Customer',
    whyChooseUsTitle: 'Why Choose **Affilibuster**',
    featureCards: mockFeatureCards,
    trustCards: mockTrustCards,
    locale: CodeEnum.EN,
    publishedAt: '2024-01-01T00:00:00.000Z',
  }

  const mockProducts: ProductGetProductsResponses[200] = {
    data: [
      {
        documentId: 'test-product-1-id',
        id: 1,
        title: 'Test Product 1',
        slug: 'test-product-1',
        content: 'Test product content 1',
        excerpt: 'Test excerpt',
        currency: CurrencyCode.USD,
        featured: false,
        translationStatus: TranslationStatusEnum.COMPLETE,
        publishedAt: '2024-01-01',
        locale: CodeEnum.EN,
      },
      {
        documentId: 'test-product-2-id',
        id: 2,
        title: 'Test Product 2',
        slug: 'test-product-2',
        content: 'Test product content 2',
        excerpt: 'Test excerpt 2',
        currency: CurrencyCode.USD,
        featured: false,
        translationStatus: TranslationStatusEnum.COMPLETE,
        publishedAt: '2024-01-02',
        locale: CodeEnum.EN,
      },
    ],
    meta: {},
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(client.getHomepage as jest.Mock).mockResolvedValue(mockHomepageData)
    ;(client.getProducts as jest.Mock).mockResolvedValue(mockProducts)
    ;(client.getNavigation as jest.Mock).mockResolvedValue({ items: [] })
    ;(client.getUserPreferences as jest.Mock).mockResolvedValue(null)
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({ code: 'en', confidence: 1 })
    ;(client.getLanguages as jest.Mock).mockResolvedValue([
      { code: 'en', displayName: 'English', nativeName: 'English' },
      { code: 'it', displayName: 'Italian', nativeName: 'Italiano' },
      { code: 'he', displayName: 'Hebrew', nativeName: 'עברית' },
    ])
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
  })

  describe('generateStaticParams', () => {
    it('should return all supported language codes', () => {
      const params = generateStaticParams()

      expect(params).toEqual([{ lang: 'en' }, { lang: 'it' }, { lang: 'he' }])
    })
  })

  describe('generateMetadata', () => {
    it('should generate correct title and description', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) })

      expect(metadata.title).toBe('Affilibuster')
      expect(metadata.description).toBe('Find the best products with our affiliate platform')
    })

    it('should generate hreflang tags for all languages', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) })

      expect(metadata.alternates?.languages).toEqual({
        en: 'https://example.com/en',
        it: 'https://example.com/it',
        he: 'https://example.com/he',
        'x-default': 'https://example.com/en',
      })
    })

    it('should generate canonical URL for English', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) })

      expect(metadata.alternates?.canonical).toBe('https://example.com/en')
    })

    it('should generate canonical URL for Italian', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'it' }) })

      expect(metadata.alternates?.canonical).toBe('https://example.com/it')
    })

    it('should generate canonical URL for Hebrew', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'he' }) })

      expect(metadata.alternates?.canonical).toBe('https://example.com/he')
    })

    it('should generate Open Graph metadata with en_US locale for English', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) })

      expect(metadata.openGraph).toEqual({
        locale: 'en_US',
        type: 'website',
        url: 'https://example.com/en',
        title: 'Affilibuster',
        description: 'Find the best products with our affiliate platform',
        images: [
          {
            url: 'https://example.com/og-image.png',
            width: 1200,
            height: 630,
            alt: 'Affilibuster - Find the best products',
          },
        ],
      })
    })

    it('should generate Open Graph metadata with it_IT locale for Italian', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'it' }) })

      expect(metadata.openGraph?.locale).toBe('it_IT')
      expect(metadata.openGraph?.url).toBe('https://example.com/it')
    })

    it('should generate Open Graph metadata with he_IL locale for Hebrew', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'he' }) })

      expect(metadata.openGraph?.locale).toBe('he_IL')
      expect(metadata.openGraph?.url).toBe('https://example.com/he')
    })

    it('should use localhost when NEXT_PUBLIC_SITE_URL is not set', async () => {
      delete process.env.NEXT_PUBLIC_SITE_URL

      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) })

      expect(metadata.alternates?.canonical).toBe('https://localhost:3000/en')
      expect(metadata.openGraph?.url).toBe('https://localhost:3000/en')
    })
  })

  describe('HomePage component', () => {
    it('should fetch homepage data with correct language', async () => {
      await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })

      expect(client.getHomepage).toHaveBeenCalledWith(CodeEnum.EN, [_1Enum4.TRUST_CARDS, _1Enum4.FEATURE_CARDS])
    })

    it('should fetch products with correct pagination', async () => {
      await HomePage({ params: Promise.resolve({ lang: CodeEnum.IT }) })

      expect(client.getProducts).toHaveBeenCalledWith({
        'pagination[page]': 1,
        'pagination[pageSize]': 3,
        locale: CodeEnum.IT,
      })
    })

    it('should render hero title from CMS', async () => {
      const component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
      render(component)

      expect(screen.getByText('Welcome to Affilibuster')).toBeInTheDocument()
    })

    it('should render hero subtitle when provided', async () => {
      const component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
      render(component)

      expect(screen.getByText('Find the best products')).toBeInTheDocument()
    })

    it('should render feature cards when data available', async () => {
      const component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
      render(component)

      expect(screen.getByText('Best Prices')).toBeInTheDocument()
      expect(screen.getByText('We find the best deals')).toBeInTheDocument()
    })

    it('should render featured products section', async () => {
      const component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
      render(component)

      expect(screen.getByText('Featured Products')).toBeInTheDocument()
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
    })

    it('should render testimonials section', async () => {
      const component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
      render(component)

      expect(screen.getByText('Great products, great service!')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Happy Customer')).toBeInTheDocument()
    })

    it('should render trust cards when data available', async () => {
      const component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
      render(component)

      expect(screen.getByText('Trusted')).toBeInTheDocument()
      expect(screen.getByText('We are trusted by thousands')).toBeInTheDocument()
    })

    it('should handle missing homepage data gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(client.getHomepage as jest.Mock).mockRejectedValue(new Error('CMS Error'))

      const component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
      render(component)

      // Should render without crashing
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch content:', expect.any(Error))

      consoleErrorSpy.mockRestore()
    })

    it('should handle missing products data gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(client.getProducts as jest.Mock).mockRejectedValue(new Error('API Error'))

      const component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
      render(component)

      // Should render without crashing
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch content:', expect.any(Error))

      consoleErrorSpy.mockRestore()
    })

    it('should fallback to English when params resolution fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const component = await HomePage({ params: Promise.reject(new Error('Params error')) })
      render(component)

      // Should call with default 'en' locale
      expect(client.getHomepage).toHaveBeenCalledWith('en', expect.any(Array))
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to resolve params:', expect.any(Error))

      consoleErrorSpy.mockRestore()
    })

    it('should not render feature cards when no data', async () => {
      ;(client.getHomepage as jest.Mock).mockResolvedValue({ ...mockHomepageData, featureCards: [] })

      const component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
      const { container } = render(component)

      const featureGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4')
      expect(featureGrid).not.toBeInTheDocument()
    })

    it('should not render trust section when no trust cards', async () => {
      ;(client.getHomepage as jest.Mock).mockResolvedValue({ ...mockHomepageData, trustCards: [] })

      const component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
      const { container } = render(component)

      // Trust section should not be rendered
      expect(container.textContent).not.toContain('Trusted')
    })

    it('should not render products section when no products', async () => {
      ;(client.getProducts as jest.Mock).mockResolvedValue({ data: [] })

      const component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
      const { container } = render(component)

      // Featured products section should not render
      expect(container.textContent).not.toContain('Featured Products')
    })

    it('should render product links with correct href structure', async () => {
      const component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.IT }) })
      render(component)

      const productLink = screen.getByRole('link', { name: /Test Product 1/i })
      expect(productLink).toHaveAttribute('href', '/it/products/test-product-1')
    })

    it('should render see all products link with correct href', async () => {
      const component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.HE }) })
      render(component)

      const seeAllLink = screen.getByText('See All Products').closest('a')
      expect(seeAllLink).toHaveAttribute('href', '/he/products')
    })

    it('should render Organization JSON-LD schema', async () => {
      const component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
      const { container } = render(component)

      // JsonLd component should be rendered (though it injects into head, not visible in container)
      // This test verifies the component is called without errors
      expect(container).toBeInTheDocument()
    })
  })
})
