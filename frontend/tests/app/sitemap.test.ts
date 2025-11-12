// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for sitemap generation
 */

import sitemap from '@/app/sitemap'
import * as client from '@/lib/client'
import type { CodeEnum } from '@/lib/generated/types.gen'
import { CurrencyCode, TranslationStatusEnum, type ProductGetProductsResponses } from '@/lib/generated/types.gen'

// Mock the client module
jest.mock('@/lib/client', () => ({
  getProducts: jest.fn(),
}))

describe('sitemap', () => {
  const mockProducts: ProductGetProductsResponses[200] = {
    data: [
      {
        documentId: 'test-product-1-id',
        id: 1,
        title: 'Test Product 1',
        slug: 'test-product-1',
        content: 'Test content 1',
        currency: CurrencyCode.USD,
        featured: false,
        translationStatus: TranslationStatusEnum.COMPLETE,
        updatedAt: '2024-01-15T00:00:00Z',
        publishedAt: '2024-01-01T00:00:00Z',
        locale: 'en' as CodeEnum,
      },
      {
        documentId: 'test-product-2-id',
        id: 2,
        title: 'Test Product 2',
        slug: 'test-product-2',
        content: 'Test content 2',
        currency: CurrencyCode.USD,
        featured: false,
        translationStatus: TranslationStatusEnum.COMPLETE,
        updatedAt: '2024-01-20T00:00:00Z',
        publishedAt: '2024-01-01T00:00:00Z',
        locale: 'en' as CodeEnum,
      },
      {
        documentId: 'test-product-3-id',
        id: 3,
        title: 'Test Product 3',
        slug: 'test-product-3',
        content: 'Test content 3',
        currency: CurrencyCode.USD,
        featured: false,
        translationStatus: TranslationStatusEnum.COMPLETE,
        publishedAt: '2024-01-01T00:00:00Z',
        locale: 'en' as CodeEnum,
        // No updatedAt - should use current date
      },
    ],
    meta: {},
  }

  // Note: SITE_URL in sitemap.ts is evaluated at module load time,
  // so it will be 'http://localhost:3000' in tests
  const SITE_URL = 'http://localhost:3000'

  beforeEach(() => {
    jest.clearAllMocks()
    ;(client.getProducts as jest.Mock).mockResolvedValue(mockProducts)
  })

  it('should generate sitemap entries', async () => {
    const entries = await sitemap()

    // All entries generated successfully

    // Should have entries (at minimum 18 static + 9 product = 27 total)
    expect(entries.length).toBeGreaterThanOrEqual(27)
  })

  it('should generate entries for all static routes in all languages', async () => {
    const entries = await sitemap()

    // Should have 6 static routes × 3 languages = 18 entries for static pages
    const homeEntries = entries.filter(e => /\/en$|\/it$|\/he$/.exec(e.url))
    const productsEntries = entries.filter(e => /\/(en|it|he)\/products$/.exec(e.url))
    const aboutEntries = entries.filter(e => /\/(en|it|he)\/about$/.exec(e.url))
    const contactEntries = entries.filter(e => /\/(en|it|he)\/contact$/.exec(e.url))
    const privacyEntries = entries.filter(e => /\/(en|it|he)\/privacy$/.exec(e.url))
    const termsEntries = entries.filter(e => /\/(en|it|he)\/terms$/.exec(e.url))

    expect(homeEntries).toHaveLength(3) // en, it, he
    expect(productsEntries).toHaveLength(3)
    expect(aboutEntries).toHaveLength(3)
    expect(contactEntries).toHaveLength(3)
    expect(privacyEntries).toHaveLength(3)
    expect(termsEntries).toHaveLength(3)
  })

  it('should generate entries for product pages in all languages', async () => {
    const entries = await sitemap()

    // Should have 3 products × 3 languages = 9 product entries
    const productEntries = entries.filter(e => e.url.includes('/products/test-product'))
    expect(productEntries).toHaveLength(9) // 3 products × 3 languages
  })

  it('should have correct URLs for English pages', async () => {
    const entries = await sitemap()

    const enHome = entries.find(e => e.url === `${SITE_URL}/en`)
    expect(enHome).toBeDefined()
    expect(enHome?.priority).toBe(1.0)
    expect(enHome?.changeFrequency).toBe('daily')

    const enProducts = entries.find(e => e.url === `${SITE_URL}/en/products`)
    expect(enProducts).toBeDefined()
    expect(enProducts?.priority).toBe(0.9)
  })

  it('should have correct URLs for Italian pages', async () => {
    const entries = await sitemap()

    const itHome = entries.find(e => e.url === `${SITE_URL}/it`)
    expect(itHome).toBeDefined()

    const itAbout = entries.find(e => e.url === `${SITE_URL}/it/about`)
    expect(itAbout).toBeDefined()
    expect(itAbout?.priority).toBe(0.7)
    expect(itAbout?.changeFrequency).toBe('weekly')
  })

  it('should have correct URLs for Hebrew pages', async () => {
    const entries = await sitemap()

    const heHome = entries.find(e => e.url === `${SITE_URL}/he`)
    expect(heHome).toBeDefined()

    const heContact = entries.find(e => e.url === `${SITE_URL}/he/contact`)
    expect(heContact).toBeDefined()
    expect(heContact?.priority).toBe(0.6)
    expect(heContact?.changeFrequency).toBe('monthly')
  })

  it('should have correct product URLs', async () => {
    const entries = await sitemap()

    const productEn = entries.find(e => e.url === `${SITE_URL}/en/products/test-product-1`)
    expect(productEn).toBeDefined()
    expect(productEn?.priority).toBe(0.8)
    expect(productEn?.changeFrequency).toBe('weekly')

    const productIt = entries.find(e => e.url === `${SITE_URL}/it/products/test-product-2`)
    expect(productIt).toBeDefined()

    const productHe = entries.find(e => e.url === `${SITE_URL}/he/products/test-product-3`)
    expect(productHe).toBeDefined()
  })

  it('should use product updatedAt when available', async () => {
    const entries = await sitemap()

    const product1 = entries.find(e => e.url === `${SITE_URL}/en/products/test-product-1`)
    expect(product1?.lastModified).toEqual(new Date('2024-01-15T00:00:00Z'))

    const product2 = entries.find(e => e.url === `${SITE_URL}/it/products/test-product-2`)
    expect(product2?.lastModified).toEqual(new Date('2024-01-20T00:00:00Z'))
  })

  it('should use current date when product has no updatedAt', async () => {
    const entries = await sitemap()

    const product3 = entries.find(e => e.url === `${SITE_URL}/en/products/test-product-3`)
    const now = new Date()
    const product3Date = product3?.lastModified as Date

    // Should be very recent (within last minute)
    expect(product3Date.getTime()).toBeGreaterThan(now.getTime() - 60000)
    expect(product3Date.getTime()).toBeLessThanOrEqual(now.getTime())
  })

  it('should skip products without slug', async () => {
    ;(client.getProducts as jest.Mock).mockResolvedValue({
      data: [
        {
          documentId: 'valid-id',
          id: 1,
          title: 'Valid Product',
          slug: 'valid-product',
          content: 'Valid content',
          currency: CurrencyCode.USD,
          featured: false,
          translationStatus: TranslationStatusEnum.COMPLETE,
          updatedAt: '2024-01-01T00:00:00Z',
          publishedAt: '2024-01-01T00:00:00Z',
          locale: 'en' as CodeEnum,
        },
        {
          documentId: 'invalid-id-1',
          id: 2,
          title: 'Invalid Product 1',
          slug: null,
          content: 'Invalid content',
          currency: CurrencyCode.USD,
          featured: false,
          translationStatus: TranslationStatusEnum.COMPLETE,
          updatedAt: '2024-01-01T00:00:00Z',
          publishedAt: '2024-01-01T00:00:00Z',
          locale: 'en' as CodeEnum,
        },
        {
          documentId: 'invalid-id-2',
          id: 3,
          title: 'Invalid Product 2',
          slug: '',
          content: 'Invalid content',
          currency: CurrencyCode.USD,
          featured: false,
          translationStatus: TranslationStatusEnum.COMPLETE,
          updatedAt: '2024-01-01T00:00:00Z',
          publishedAt: '2024-01-01T00:00:00Z',
          locale: 'en' as CodeEnum,
        },
      ],
      meta: {},
    } as ProductGetProductsResponses[200])

    const entries = await sitemap()

    // Only 1 valid product × 3 languages = 3 product entries
    const productEntries = entries.filter(e => e.url.includes('/products/'))
    expect(productEntries).toHaveLength(3)

    const validProduct = entries.find(e => e.url.includes('/products/valid-product'))
    expect(validProduct).toBeDefined()
  })

  it('should handle getProducts API failure gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    ;(client.getProducts as jest.Mock).mockRejectedValue(new Error('API Error'))

    const entries = await sitemap()

    // Should still generate static pages (6 routes × 3 languages = 18)
    expect(entries.length).toBeGreaterThanOrEqual(18)

    // Should not have product entries
    const productEntries = entries.filter(e => e.url.includes('/products/'))
    expect(productEntries).toHaveLength(0)

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch products for sitemap:', expect.any(Error))

    consoleErrorSpy.mockRestore()
  })

  it('should handle null products response gracefully', async () => {
    ;(client.getProducts as jest.Mock).mockResolvedValue(null)

    const entries = await sitemap()

    // Should still generate static pages
    expect(entries.length).toBeGreaterThanOrEqual(18)

    // Should not have product entries
    const productEntries = entries.filter(e => e.url.includes('/products/'))
    expect(productEntries).toHaveLength(0)
  })

  it('should handle missing data property in response', async () => {
    ;(client.getProducts as jest.Mock).mockResolvedValue({})

    const entries = await sitemap()

    // Should still generate static pages
    expect(entries.length).toBeGreaterThanOrEqual(18)

    // Should not have product entries
    const productEntries = entries.filter(e => e.url.includes('/products/'))
    expect(productEntries).toHaveLength(0)
  })

  it('should use localhost in test environment', async () => {
    const entries = await sitemap()

    const homeEntry = entries.find(e => e.url === `${SITE_URL}/en`)
    expect(homeEntry).toBeDefined()

    const productEntry = entries.find(e => e.url.startsWith(`${SITE_URL}/en/products/`))
    expect(productEntry).toBeDefined()
  })

  it('should fetch products with correct parameters', async () => {
    await sitemap()

    expect(client.getProducts).toHaveBeenCalledWith({
      locale: 'en',
      'pagination[pageSize]': 100,
    })
  })

  it('should have all static routes with correct priorities and frequencies', async () => {
    const entries = await sitemap()

    const enHome = entries.find(e => e.url === `${SITE_URL}/en`)
    expect(enHome).toMatchObject({
      priority: 1.0,
      changeFrequency: 'daily',
    })

    const enProducts = entries.find(e => e.url === `${SITE_URL}/en/products`)
    expect(enProducts).toMatchObject({
      priority: 0.9,
      changeFrequency: 'daily',
    })

    const enAbout = entries.find(e => e.url === `${SITE_URL}/en/about`)
    expect(enAbout).toMatchObject({
      priority: 0.7,
      changeFrequency: 'weekly',
    })

    const enContact = entries.find(e => e.url === `${SITE_URL}/en/contact`)
    expect(enContact).toMatchObject({
      priority: 0.6,
      changeFrequency: 'monthly',
    })

    const enPrivacy = entries.find(e => e.url === `${SITE_URL}/en/privacy`)
    expect(enPrivacy).toMatchObject({
      priority: 0.5,
      changeFrequency: 'monthly',
    })

    const enTerms = entries.find(e => e.url === `${SITE_URL}/en/terms`)
    expect(enTerms).toMatchObject({
      priority: 0.5,
      changeFrequency: 'monthly',
    })
  })

  it('should have lastModified for all entries', async () => {
    const entries = await sitemap()

    for (const entry of entries) {
      expect(entry.lastModified).toBeDefined()
      expect(entry.lastModified).toBeInstanceOf(Date)
    }
  })
})
