// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Tests for SEO metadata utility functions.
 * Covers canonical URL building, alternates generation, and full page metadata assembly.
 */

import { LanguageCode } from '@/lib/generated/types.gen'
import { buildAlternates, buildCanonicalUrl, buildNoIndexMetadata, buildPageMetadata } from '@/lib/seo/metadata'
import type { ElementsSeoMetadataEntry } from '@/lib/generated/types.gen'

describe('buildCanonicalUrl', () => {
  it('builds a canonical URL for a language and path', () => {
    expect(buildCanonicalUrl(LanguageCode.EN, '/about')).toBe('http://localhost:3000/en/about')
  })

  it('builds a canonical URL for the homepage (empty path)', () => {
    expect(buildCanonicalUrl(LanguageCode.IT, '')).toBe('http://localhost:3000/it')
  })

  it('builds a canonical URL for Hebrew', () => {
    expect(buildCanonicalUrl(LanguageCode.HE, '/products')).toBe('http://localhost:3000/he/products')
  })
})

describe('buildAlternates', () => {
  it('returns canonical and all language alternates', () => {
    const result = buildAlternates(LanguageCode.EN, '/about')

    expect(result.canonical).toBe('http://localhost:3000/en/about')
    expect(result.languages).toEqual({
      en: 'http://localhost:3000/en/about',
      it: 'http://localhost:3000/it/about',
      he: 'http://localhost:3000/he/about',
      'x-default': 'http://localhost:3000/en/about',
    })
  })

  it('uses Italian as canonical when lang is IT', () => {
    const result = buildAlternates(LanguageCode.IT, '/products')

    expect(result.canonical).toBe('http://localhost:3000/it/products')
    // x-default always points to English
    expect(result.languages).toHaveProperty('x-default', 'http://localhost:3000/en/products')
  })
})

describe('buildPageMetadata', () => {
  const seoMetadata: ElementsSeoMetadataEntry = {
    metaTitle: 'Test Title',
    metaDescription: 'Test description',
    metaKeywords: ['keyword1', 'keyword2'],
  }

  it('builds complete metadata with all fields', () => {
    const result = buildPageMetadata({
      seoMetadata,
      lang: LanguageCode.EN,
      path: '/about',
      siteName: 'TestSite',
      ogType: 'website',
      ogImageUrl: 'https://example.com/image.jpg',
    })

    expect(result.title).toBe('Test Title')
    expect(result.description).toBe('Test description')
    expect(result.keywords).toEqual(['keyword1', 'keyword2'])
    expect(result.alternates).toBeDefined()
    expect(result.openGraph).toEqual({
      title: 'Test Title',
      description: 'Test description',
      url: 'http://localhost:3000/en/about',
      siteName: 'TestSite',
      locale: 'en_US',
      type: 'website',
      images: [{ url: 'https://example.com/image.jpg' }],
    })
    expect(result.twitter).toEqual({
      card: 'summary_large_image',
      title: 'Test Title',
      description: 'Test description',
      images: ['https://example.com/image.jpg'],
    })
  })

  it('uses default ogType of website when not specified', () => {
    const result = buildPageMetadata({
      seoMetadata,
      lang: LanguageCode.EN,
      path: '/about',
    })

    expect(result.openGraph).toHaveProperty('type', 'website')
  })

  it('handles article ogType', () => {
    const result = buildPageMetadata({
      seoMetadata,
      lang: LanguageCode.EN,
      path: '/blog/post',
      ogType: 'article',
    })

    expect(result.openGraph).toHaveProperty('type', 'article')
  })

  it('omits OG images when ogImageUrl is not provided', () => {
    const result = buildPageMetadata({
      seoMetadata,
      lang: LanguageCode.EN,
      path: '/about',
    })

    expect(result.openGraph).not.toHaveProperty('images')
    expect(result.twitter).not.toHaveProperty('images')
  })

  it('handles undefined seoMetadata', () => {
    const result = buildPageMetadata({
      seoMetadata: undefined,
      lang: LanguageCode.EN,
      path: '/about',
    })

    expect(result.title).toBeUndefined()
    expect(result.description).toBeUndefined()
    expect(result.keywords).toBeUndefined()
  })

  it('handles non-array metaKeywords', () => {
    const result = buildPageMetadata({
      seoMetadata: {
        metaTitle: 'Title',
        metaDescription: 'Desc',
        metaKeywords: 'not-an-array' as unknown as string[],
      },
      lang: LanguageCode.EN,
      path: '/about',
    })

    expect(result.keywords).toBeUndefined()
  })

  it('sets correct locale for Italian', () => {
    const result = buildPageMetadata({
      seoMetadata,
      lang: LanguageCode.IT,
      path: '/about',
    })

    expect(result.openGraph).toHaveProperty('locale', 'it_IT')
  })

  it('sets correct locale for Hebrew', () => {
    const result = buildPageMetadata({
      seoMetadata,
      lang: LanguageCode.HE,
      path: '/about',
    })

    expect(result.openGraph).toHaveProperty('locale', 'he_IL')
  })

  it('adds noIndex robots directive when noIndex is true', () => {
    const result = buildPageMetadata({
      seoMetadata,
      lang: LanguageCode.EN,
      path: '/about',
      noIndex: true,
    })

    expect(result.robots).toEqual({ index: false, follow: false })
  })

  it('omits robots directive when noIndex is false or undefined', () => {
    const result = buildPageMetadata({
      seoMetadata,
      lang: LanguageCode.EN,
      path: '/about',
      noIndex: false,
    })

    expect(result.robots).toBeUndefined()
  })
})

describe('buildNoIndexMetadata', () => {
  it('builds metadata with noindex robots', () => {
    const result = buildNoIndexMetadata({ title: 'Login', description: 'Login page' })

    expect(result.title).toBe('Login')
    expect(result.description).toBe('Login page')
    expect(result.robots).toEqual({ index: false, follow: false })
  })

  it('handles undefined title and description', () => {
    const result = buildNoIndexMetadata({})

    expect(result.title).toBeUndefined()
    expect(result.description).toBeUndefined()
    expect(result.robots).toEqual({ index: false, follow: false })
  })
})
