// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for data transformers
 * Tests Product to ContentResponse transformation with all edge cases
 */

import { transformProductToContent } from '@/lib/core/transformers'
import { createMockProduct } from '../helpers/mockFactories'
import type { Product } from '@/lib/types'
import { LanguageCode, CurrencyCode } from '@/lib/types'
import { TranslationStatusEnum } from '@/lib/generated/types.gen'

describe('transformProductToContent', () => {
  const mockProduct: Product = createMockProduct({
    id: 123,
    documentId: 'product_123',
    title: 'Best Wireless Headphones',
    slug: 'best-wireless-headphones',
    excerpt: 'Top-rated wireless headphones for 2025',
    content: 'Detailed review of wireless headphones...',
    locale: LanguageCode.EN,
    metaTitle: 'Best Wireless Headphones 2025 - Review',
    metaDescription: 'Comprehensive review of the best wireless headphones',
    metaKeywords: ['headphones', 'wireless', 'audio', 'review'],
    publishedAt: '2025-01-15T10:00:00Z',
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-01-14T12:00:00Z',
    localizations: [
      {
        id: 124,
        documentId: 'product_124',
        locale: LanguageCode.IT,
        slug: 'migliori-cuffie-wireless',
        publishedAt: '2025-01-15T10:00:00Z',
        title: 'Migliori Cuffie Wireless',
        content: 'Recensione dettagliata delle cuffie wireless...',
        currency: CurrencyCode.EUR,
        featured: false,
        translationStatus: TranslationStatusEnum.COMPLETE,
      },
      {
        id: 125,
        documentId: 'product_125',
        locale: LanguageCode.HE,
        slug: 'אוזניות-אלחוטיות-הטובות',
        publishedAt: '2025-01-15T10:00:00Z',
        title: 'אוזניות אלחוטיות הטובות ביותר',
        content: 'סקירה מפורטת של אוזניות אלחוטיות...',
        currency: CurrencyCode.ILS,
        featured: false,
        translationStatus: TranslationStatusEnum.COMPLETE,
      },
    ],
  })

  it('should transform product with all fields correctly', () => {
    const result = transformProductToContent(mockProduct, LanguageCode.EN)

    expect(result).toEqual({
      id: '123',
      type: 'product',
      language: 'en',
      title: 'Best Wireless Headphones',
      slug: 'best-wireless-headphones',
      content: 'Detailed review of wireless headphones...',
      excerpt: 'Top-rated wireless headphones for 2025',
      seo: {
        title: 'Best Wireless Headphones 2025 - Review',
        description: 'Comprehensive review of the best wireless headphones',
        keywords: ['headphones', 'wireless', 'audio', 'review'],
        canonicalUrl: '/en/best-wireless-headphones',
      },
      urls: {
        path: '/best-wireless-headphones',
        languagePrefix: '/en',
        current: '/en/best-wireless-headphones',
        canonical: '/en/best-wireless-headphones',
        alternates: {
          it: '/it/migliori-cuffie-wireless',
          he: '/he/אוזניות-אלחוטיות-הטובות',
        },
      },
      status: 'published',
      createdAt: '2025-01-10T08:00:00Z',
      updatedAt: '2025-01-14T12:00:00Z',
      publishedAt: '2025-01-15T10:00:00Z',
      translations: {
        it: '/it/migliori-cuffie-wireless',
        he: '/he/אוזניות-אלחוטיות-הטובות',
      },
    })
  })

  it('should use product title as SEO title when metaTitle is missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { metaTitle, ...productWithoutMetaTitle } = mockProduct

    const result = transformProductToContent(productWithoutMetaTitle as Product, LanguageCode.EN)

    expect(result.seo.title).toBe('Best Wireless Headphones')
  })

  it('should use product excerpt as SEO description when metaDescription is missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { metaDescription, ...productWithoutMetaDescription } = mockProduct

    const result = transformProductToContent(productWithoutMetaDescription as Product, LanguageCode.EN)

    expect(result.seo.description).toBe('Top-rated wireless headphones for 2025')
  })

  it('should handle missing metaKeywords', () => {
    const productWithoutKeywords = {
      ...mockProduct,
      metaKeywords: undefined,
    }

    const result = transformProductToContent(productWithoutKeywords, LanguageCode.EN)

    expect(result.seo.keywords).toBeUndefined()
  })

  it('should handle non-array metaKeywords', () => {
    const productWithStringKeywords = {
      ...mockProduct,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metaKeywords: 'headphones, wireless, audio' as any,
    }

    const result = transformProductToContent(productWithStringKeywords, LanguageCode.EN)

    expect(result.seo.keywords).toBeUndefined()
  })

  it('should set status to draft when publishedAt is missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { publishedAt, ...draftProduct } = mockProduct

    const result = transformProductToContent(draftProduct as Product, LanguageCode.EN)

    expect(result.status).toBe('draft')
    expect(result.publishedAt).toBeUndefined()
  })

  it('should handle product without localizations', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { localizations, ...productWithoutLocalizations } = mockProduct

    const result = transformProductToContent(productWithoutLocalizations as Product, LanguageCode.EN)

    expect(result.translations).toEqual({})
    expect(result.urls.alternates).toEqual({})
  })

  it('should handle empty localizations array', () => {
    const productWithEmptyLocalizations = {
      ...mockProduct,
      localizations: [],
    }

    const result = transformProductToContent(productWithEmptyLocalizations, LanguageCode.EN)

    expect(result.translations).toEqual({})
    expect(result.urls.alternates).toEqual({})
  })

  it('should skip localizations without locale or slug', () => {
    const productWithPartialLocalizations = createMockProduct({
      localizations: [
        createMockProduct({
          id: 124,
          documentId: 'product_124',
          locale: LanguageCode.IT,
          slug: 'migliori-cuffie-wireless',
          publishedAt: '2025-01-15T10:00:00Z',
        }),
        // This one missing slug - spread and omit
        (() => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { slug, ...noSlug } = createMockProduct({
            id: 126,
            documentId: 'product_126',
            locale: LanguageCode.EN,
            publishedAt: '2025-01-15T10:00:00Z',
          })
          return noSlug as Product
        })(),
      ],
    })

    const result = transformProductToContent(productWithPartialLocalizations, LanguageCode.EN)

    expect(result.translations).toEqual({
      it: '/it/migliori-cuffie-wireless',
    })
    expect(Object.keys(result.translations ?? {})).toHaveLength(1)
  })

  it('should use provided lang parameter when product locale is missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { locale, ...productWithoutLocale } = mockProduct

    const result = transformProductToContent(productWithoutLocale as Product, LanguageCode.IT)

    expect(result.language).toBe('it')
    expect(result.urls.languagePrefix).toBe('/it')
    expect(result.urls.canonical).toBe('/it/best-wireless-headphones')
  })

  it('should default to "en" when both product locale and lang parameter are missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { locale, ...productWithoutLocale } = mockProduct

    const result = transformProductToContent(productWithoutLocale as Product)

    expect(result.language).toBe('en')
  })

  it('should handle missing createdAt with current date', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, ...productWithoutCreatedAt } = mockProduct

    const result = transformProductToContent(productWithoutCreatedAt as Product, LanguageCode.EN)

    expect(result.createdAt).toBeDefined()
    expect(typeof result.createdAt).toBe('string')
    // Should be a recent date (within last minute)
    const createdDate = new Date(result.createdAt)
    const now = new Date()
    const diffMs = now.getTime() - createdDate.getTime()
    expect(diffMs).toBeLessThan(60000) // Less than 1 minute
  })

  it('should handle missing updatedAt with current date', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { updatedAt, ...productWithoutUpdatedAt } = mockProduct

    const result = transformProductToContent(productWithoutUpdatedAt as Product, LanguageCode.EN)

    expect(result.updatedAt).toBeDefined()
    expect(typeof result.updatedAt).toBe('string')
    // Should be a recent date
    const updatedDate = new Date(result.updatedAt)
    const now = new Date()
    const diffMs = now.getTime() - updatedDate.getTime()
    expect(diffMs).toBeLessThan(60000)
  })

  it('should convert product ID to string', () => {
    const result = transformProductToContent(mockProduct, LanguageCode.EN)

    expect(result.id).toBe('123')
    expect(typeof result.id).toBe('string')
  })

  it('should set type to "product"', () => {
    const result = transformProductToContent(mockProduct, LanguageCode.EN)

    expect(result.type).toBe('product')
  })

  it('should construct URLs correctly for different languages', () => {
    const italianProduct = {
      ...mockProduct,
      locale: LanguageCode.IT,
      slug: 'migliori-cuffie',
    }

    const result = transformProductToContent(italianProduct, LanguageCode.IT)

    expect(result.urls).toEqual({
      path: '/migliori-cuffie',
      languagePrefix: '/it',
      current: '/it/migliori-cuffie',
      canonical: '/it/migliori-cuffie',
      alternates: {
        it: '/it/migliori-cuffie-wireless',
        he: '/he/אוזניות-אלחוטיות-הטובות',
      },
    })
  })

  it('should handle RTL languages (Hebrew)', () => {
    const hebrewProduct = {
      ...mockProduct,
      locale: LanguageCode.HE,
      slug: 'אוזניות-אלחוטיות',
      title: 'אוזניות אלחוטיות הטובות ביותר',
    }

    const result = transformProductToContent(hebrewProduct, LanguageCode.HE)

    expect(result.language).toBe('he')
    expect(result.title).toBe('אוזניות אלחוטיות הטובות ביותר')
    expect(result.urls.canonical).toBe('/he/אוזניות-אלחוטיות')
  })

  it('should handle minimal product data', () => {
    const minimalProduct = createMockProduct({
      id: 1,
      documentId: 'product_1',
      title: 'Minimal Product',
      slug: 'minimal-product',
      excerpt: 'A minimal product',
      content: 'Content',
      metaKeywords: undefined,
    })

    const result = transformProductToContent(minimalProduct, LanguageCode.EN)

    expect(result.id).toBe('1')
    expect(result.type).toBe('product')
    expect(result.language).toBe('en')
    expect(result.title).toBe('Minimal Product')
    expect(result.slug).toBe('minimal-product')
    expect(result.status).toBe('published')
    expect(result.translations).toEqual({})
    expect(result.seo.keywords).toBeUndefined()
  })
})
