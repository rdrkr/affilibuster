// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for the sitemap generator.
 *
 * Tests cover:
 * - Static page entries with correct URLs, priorities, and change frequencies
 * - Dynamic product, category, and blog post entries from CMS
 * - Localized alternates for all supported languages (en, it, he)
 * - Graceful handling when CMS returns null
 */

// Mock content API
jest.mock('@/lib/content/api', () => ({
  getProducts: jest.fn(),
  getProductCategories: jest.fn(),
  getBlogPosts: jest.fn(),
}))

import sitemap from '@/app/sitemap'
import { getBlogPosts, getProductCategories, getProducts } from '@/lib/content/api'
import { LanguageCode } from '@/lib/generated/types.gen'

const mockGetProducts = getProducts as jest.MockedFunction<typeof getProducts>
const mockGetProductCategories = getProductCategories as jest.MockedFunction<typeof getProductCategories>
const mockGetBlogPosts = getBlogPosts as jest.MockedFunction<typeof getBlogPosts>

describe('sitemap', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should generate static page entries with correct structure', async () => {
    mockGetProducts.mockResolvedValueOnce([])
    mockGetProductCategories.mockResolvedValueOnce([])
    mockGetBlogPosts.mockResolvedValueOnce({ data: [], meta: {} } as Awaited<ReturnType<typeof getBlogPosts>>)

    const result = await sitemap()

    // Should have 8 static entries
    expect(result.length).toBe(8)

    // Homepage
    const homepage = result.find(entry => entry.url.endsWith('/en'))
    expect(homepage).toBeDefined()
    expect(homepage?.changeFrequency).toBe('daily')
    expect(homepage?.priority).toBe(1.0)

    // About page
    const about = result.find(entry => entry.url.includes('/about'))
    expect(about).toBeDefined()
    expect(about?.changeFrequency).toBe('monthly')
    expect(about?.priority).toBe(0.5)

    // Products listing page
    const products = result.find(entry => entry.url.endsWith('/en/products'))
    expect(products).toBeDefined()
    expect(products?.changeFrequency).toBe('daily')
    expect(products?.priority).toBe(0.8)

    // Blog listing page
    const blog = result.find(entry => entry.url.endsWith('/en/blog'))
    expect(blog).toBeDefined()
    expect(blog?.changeFrequency).toBe('daily')
    expect(blog?.priority).toBe(0.7)
  })

  it('should include localized alternates for all languages', async () => {
    mockGetProducts.mockResolvedValueOnce([])
    mockGetProductCategories.mockResolvedValueOnce([])
    mockGetBlogPosts.mockResolvedValueOnce({ data: [], meta: {} } as Awaited<ReturnType<typeof getBlogPosts>>)

    const result = await sitemap()

    // Every entry should have alternates for all 3 languages
    for (const entry of result) {
      expect(entry.alternates).toBeDefined()
      const languages = entry.alternates?.languages as Record<string, string> | undefined
      expect(languages?.[LanguageCode.EN]).toBeDefined()
      expect(languages?.[LanguageCode.IT]).toBeDefined()
      expect(languages?.[LanguageCode.HE]).toBeDefined()
    }
  })

  it('should include dynamic product entries from CMS', async () => {
    mockGetProducts.mockResolvedValueOnce([
      { slug: 'eco-bottle', updatedAt: '2026-01-15T10:00:00Z' },
      { slug: 'solar-charger', updatedAt: undefined },
    ] as Awaited<ReturnType<typeof getProducts>>)
    mockGetProductCategories.mockResolvedValueOnce([])
    mockGetBlogPosts.mockResolvedValueOnce({ data: [], meta: {} } as Awaited<ReturnType<typeof getBlogPosts>>)

    const result = await sitemap()

    const productEntries = result.filter(
      entry => entry.url.includes('/products/eco-bottle') || entry.url.includes('/products/solar-charger')
    )
    expect(productEntries.length).toBe(2)

    for (const entry of productEntries) {
      expect(entry.priority).toBe(0.8)
      expect(entry.changeFrequency).toBe('weekly')
    }
  })

  it('should include dynamic category entries from CMS', async () => {
    mockGetProducts.mockResolvedValueOnce([])
    mockGetProductCategories.mockResolvedValueOnce([{ slug: 'kitchen', updatedAt: '2026-01-10T10:00:00Z' }] as Awaited<
      ReturnType<typeof getProductCategories>
    >)
    mockGetBlogPosts.mockResolvedValueOnce({ data: [], meta: {} } as Awaited<ReturnType<typeof getBlogPosts>>)

    const result = await sitemap()

    const categoryEntries = result.filter(entry => entry.url.includes('/products/category/kitchen'))
    expect(categoryEntries.length).toBe(1)
    expect(categoryEntries[0]?.priority).toBe(0.7)
    expect(categoryEntries[0]?.changeFrequency).toBe('weekly')
  })

  it('should include dynamic blog post entries from CMS', async () => {
    mockGetProducts.mockResolvedValueOnce([])
    mockGetProductCategories.mockResolvedValueOnce([])
    mockGetBlogPosts.mockResolvedValueOnce({
      data: [
        { slug: 'sustainable-living', updatedAt: '2026-02-01T10:00:00Z' },
        { slug: 'green-tips', updatedAt: undefined },
      ],
      meta: {},
    } as Awaited<ReturnType<typeof getBlogPosts>>)

    const result = await sitemap()

    const blogEntries = result.filter(
      entry => entry.url.includes('/blog/sustainable-living') || entry.url.includes('/blog/green-tips')
    )
    expect(blogEntries.length).toBe(2)

    for (const entry of blogEntries) {
      expect(entry.priority).toBe(0.6)
      expect(entry.changeFrequency).toBe('monthly')
    }
  })

  it('should handle null CMS responses gracefully', async () => {
    mockGetProducts.mockResolvedValueOnce(null)
    mockGetProductCategories.mockResolvedValueOnce(null)
    mockGetBlogPosts.mockResolvedValueOnce(null)

    const result = await sitemap()

    // Should only have static entries (8)
    expect(result.length).toBe(8)
  })

  it('should use base URL from env var or default in all URLs', async () => {
    mockGetProducts.mockResolvedValueOnce([])
    mockGetProductCategories.mockResolvedValueOnce([])
    mockGetBlogPosts.mockResolvedValueOnce({ data: [], meta: {} } as Awaited<ReturnType<typeof getBlogPosts>>)

    const result = await sitemap()

    // All entries should start with a valid base URL
    const expectedBase = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thegreenbrother.com'
    for (const entry of result) {
      expect(entry.url).toContain(expectedBase)
    }
  })

  it('should include alternates with base URL in language URLs', async () => {
    mockGetProducts.mockResolvedValueOnce([])
    mockGetProductCategories.mockResolvedValueOnce([])
    mockGetBlogPosts.mockResolvedValueOnce({ data: [], meta: {} } as Awaited<ReturnType<typeof getBlogPosts>>)

    const result = await sitemap()

    const expectedBase = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thegreenbrother.com'
    const languages = result[0]?.alternates?.languages as Record<string, string> | undefined
    expect(languages?.[LanguageCode.EN]).toContain(expectedBase)
  })

  it('should not include auth or profile pages', async () => {
    mockGetProducts.mockResolvedValueOnce([])
    mockGetProductCategories.mockResolvedValueOnce([])
    mockGetBlogPosts.mockResolvedValueOnce({ data: [], meta: {} } as Awaited<ReturnType<typeof getBlogPosts>>)

    const result = await sitemap()

    const urls = result.map(entry => entry.url)
    expect(urls.some(url => url.includes('/login'))).toBe(false)
    expect(urls.some(url => url.includes('/signup'))).toBe(false)
    expect(urls.some(url => url.includes('/profile'))).toBe(false)
    expect(urls.some(url => url.includes('/style-guide'))).toBe(false)
  })

  it('should pass locale to CMS fetch functions', async () => {
    mockGetProducts.mockResolvedValueOnce([])
    mockGetProductCategories.mockResolvedValueOnce([])
    mockGetBlogPosts.mockResolvedValueOnce({ data: [], meta: {} } as Awaited<ReturnType<typeof getBlogPosts>>)

    await sitemap()

    expect(mockGetProducts).toHaveBeenCalledWith({ locale: LanguageCode.EN })
    expect(mockGetProductCategories).toHaveBeenCalledWith({ locale: LanguageCode.EN })
    expect(mockGetBlogPosts).toHaveBeenCalledWith({ locale: LanguageCode.EN })
  })

  it('should include lastModified for all entries', async () => {
    mockGetProducts.mockResolvedValueOnce([])
    mockGetProductCategories.mockResolvedValueOnce([])
    mockGetBlogPosts.mockResolvedValueOnce({ data: [], meta: {} } as Awaited<ReturnType<typeof getBlogPosts>>)

    const result = await sitemap()

    for (const entry of result) {
      expect(entry.lastModified).toBeInstanceOf(Date)
    }
  })

  it('should include privacy, terms, and cookie-policy pages', async () => {
    mockGetProducts.mockResolvedValueOnce([])
    mockGetProductCategories.mockResolvedValueOnce([])
    mockGetBlogPosts.mockResolvedValueOnce({ data: [], meta: {} } as Awaited<ReturnType<typeof getBlogPosts>>)

    const result = await sitemap()

    const privacy = result.find(entry => entry.url.includes('/privacy'))
    const terms = result.find(entry => entry.url.includes('/terms'))
    const cookiePolicy = result.find(entry => entry.url.includes('/cookie-policy'))

    expect(privacy).toBeDefined()
    expect(privacy?.priority).toBe(0.3)

    expect(terms).toBeDefined()
    expect(terms?.priority).toBe(0.3)

    expect(cookiePolicy).toBeDefined()
    expect(cookiePolicy?.priority).toBe(0.3)
  })
})
