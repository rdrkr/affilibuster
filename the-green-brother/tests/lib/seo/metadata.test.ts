// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for SEO metadata utility functions.
 * Tests buildCanonicalUrl, buildAlternates, buildPageMetadata, and buildNoIndexMetadata.
 */

import { buildAlternates, buildCanonicalUrl, buildNoIndexMetadata, buildPageMetadata } from '@/lib/seo/metadata'
import type { ElementsSeoMetadataEntry } from '@/lib/generated/types.gen'
import { LanguageCode } from '@/lib/generated/types.gen'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

describe('buildCanonicalUrl', () => {
  it('should build canonical URL for root path', () => {
    const url = buildCanonicalUrl(LanguageCode.EN, '')
    expect(url).toBe(`${SITE_URL}/en`)
  })

  it('should build canonical URL with path', () => {
    const url = buildCanonicalUrl(LanguageCode.IT, '/about')
    expect(url).toBe(`${SITE_URL}/it/about`)
  })

  it('should build canonical URL for Hebrew', () => {
    const url = buildCanonicalUrl(LanguageCode.HE, '/products')
    expect(url).toBe(`${SITE_URL}/he/products`)
  })

  it('should build canonical URL with nested path', () => {
    const url = buildCanonicalUrl(LanguageCode.EN, '/products/eco-bottle')
    expect(url).toBe(`${SITE_URL}/en/products/eco-bottle`)
  })
})

describe('buildAlternates', () => {
  it('should include canonical URL', () => {
    const alternates = buildAlternates(LanguageCode.EN, '/about')
    expect(alternates.canonical).toBe(`${SITE_URL}/en/about`)
  })

  it('should include all language alternates', () => {
    const alternates = buildAlternates(LanguageCode.EN, '/about')
    expect(alternates.languages).toEqual({
      en: `${SITE_URL}/en/about`,
      it: `${SITE_URL}/it/about`,
      he: `${SITE_URL}/he/about`,
      'x-default': `${SITE_URL}/en/about`,
    })
  })

  it('should build alternates for root path', () => {
    const alternates = buildAlternates(LanguageCode.EN, '')
    expect(alternates.canonical).toBe(`${SITE_URL}/en`)
    expect(alternates.languages?.en).toBe(`${SITE_URL}/en`)
    expect(alternates.languages?.it).toBe(`${SITE_URL}/it`)
    expect(alternates.languages?.he).toBe(`${SITE_URL}/he`)
    expect(alternates.languages?.['x-default']).toBe(`${SITE_URL}/en`)
  })

  it('should set canonical based on current language', () => {
    const alternates = buildAlternates(LanguageCode.IT, '/contact')
    expect(alternates.canonical).toBe(`${SITE_URL}/it/contact`)
  })
})

describe('buildPageMetadata', () => {
  const baseSeoMetadata: ElementsSeoMetadataEntry = {
    metaTitle: 'Test Page Title',
    metaDescription: 'Test page description for SEO.',
    metaKeywords: ['test', 'seo', 'metadata'],
  }

  it('should build metadata with all fields from CMS data', () => {
    const metadata = buildPageMetadata({
      seoMetadata: baseSeoMetadata,
      lang: LanguageCode.EN,
      path: '/about',
      siteName: 'TheGreenBrother',
    })

    expect(metadata.title).toBe('Test Page Title')
    expect(metadata.description).toBe('Test page description for SEO.')
    expect(metadata.keywords).toEqual(['test', 'seo', 'metadata'])
  })

  it('should build alternates', () => {
    const metadata = buildPageMetadata({
      seoMetadata: baseSeoMetadata,
      lang: LanguageCode.EN,
      path: '/about',
    })

    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/en/about`)
    expect(metadata.alternates?.languages).toBeDefined()
  })

  it('should build openGraph metadata', () => {
    const metadata = buildPageMetadata({
      seoMetadata: baseSeoMetadata,
      lang: LanguageCode.EN,
      path: '/about',
      siteName: 'TheGreenBrother',
    })

    expect(metadata.openGraph).toEqual(
      expect.objectContaining({
        title: 'Test Page Title',
        description: 'Test page description for SEO.',
        url: `${SITE_URL}/en/about`,
        siteName: 'TheGreenBrother',
        locale: 'en_US',
        type: 'website',
      })
    )
  })

  it('should build twitter metadata', () => {
    const metadata = buildPageMetadata({
      seoMetadata: baseSeoMetadata,
      lang: LanguageCode.EN,
      path: '/about',
    })

    expect(metadata.twitter).toEqual(
      expect.objectContaining({
        card: 'summary_large_image',
        title: 'Test Page Title',
        description: 'Test page description for SEO.',
      })
    )
  })

  it('should use Italian OG locale for IT language', () => {
    const metadata = buildPageMetadata({
      seoMetadata: baseSeoMetadata,
      lang: LanguageCode.IT,
      path: '/about',
    })

    expect(metadata.openGraph?.locale).toBe('it_IT')
  })

  it('should use Hebrew OG locale for HE language', () => {
    const metadata = buildPageMetadata({
      seoMetadata: baseSeoMetadata,
      lang: LanguageCode.HE,
      path: '/about',
    })

    expect(metadata.openGraph?.locale).toBe('he_IL')
  })

  it('should support article ogType', () => {
    const metadata = buildPageMetadata({
      seoMetadata: baseSeoMetadata,
      lang: LanguageCode.EN,
      path: '/blog/my-post',
      ogType: 'article',
    })

    expect(metadata.openGraph).toEqual(expect.objectContaining({ type: 'article' }))
  })

  it('should include ogImageUrl when provided', () => {
    const metadata = buildPageMetadata({
      seoMetadata: baseSeoMetadata,
      lang: LanguageCode.EN,
      path: '/products/eco-bottle',
      ogImageUrl: 'https://example.com/image.jpg',
    })

    expect(metadata.openGraph?.images).toEqual([{ url: 'https://example.com/image.jpg' }])
    expect(metadata.twitter?.images).toEqual(['https://example.com/image.jpg'])
  })

  it('should not include images when ogImageUrl is not provided', () => {
    const metadata = buildPageMetadata({
      seoMetadata: baseSeoMetadata,
      lang: LanguageCode.EN,
      path: '/about',
    })

    expect(metadata.openGraph?.images).toBeUndefined()
    expect(metadata.twitter?.images).toBeUndefined()
  })

  it('should handle undefined seoMetadata gracefully', () => {
    const metadata = buildPageMetadata({
      seoMetadata: undefined,
      lang: LanguageCode.EN,
      path: '/about',
    })

    expect(metadata.title).toBeUndefined()
    expect(metadata.description).toBeUndefined()
    expect(metadata.keywords).toBeUndefined()
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/en/about`)
  })

  it('should handle seoMetadata with missing fields', () => {
    const metadata = buildPageMetadata({
      seoMetadata: { metaTitle: 'Title Only' },
      lang: LanguageCode.EN,
      path: '/about',
    })

    expect(metadata.title).toBe('Title Only')
    expect(metadata.description).toBeUndefined()
    expect(metadata.keywords).toBeUndefined()
  })

  it('should handle metaKeywords as non-array gracefully', () => {
    const metadata = buildPageMetadata({
      seoMetadata: { metaKeywords: 'not-an-array' as unknown },
      lang: LanguageCode.EN,
      path: '/about',
    })

    expect(metadata.keywords).toBeUndefined()
  })

  it('should set noindex when noIndex option is true', () => {
    const metadata = buildPageMetadata({
      seoMetadata: baseSeoMetadata,
      lang: LanguageCode.EN,
      path: '/secret',
      noIndex: true,
    })

    expect(metadata.robots).toEqual({ index: false, follow: false })
  })

  it('should not set robots when noIndex is false', () => {
    const metadata = buildPageMetadata({
      seoMetadata: baseSeoMetadata,
      lang: LanguageCode.EN,
      path: '/about',
      noIndex: false,
    })

    expect(metadata.robots).toBeUndefined()
  })

  it('should not set robots when noIndex is not provided', () => {
    const metadata = buildPageMetadata({
      seoMetadata: baseSeoMetadata,
      lang: LanguageCode.EN,
      path: '/about',
    })

    expect(metadata.robots).toBeUndefined()
  })

  it('should default ogType to website', () => {
    const metadata = buildPageMetadata({
      seoMetadata: baseSeoMetadata,
      lang: LanguageCode.EN,
      path: '/about',
    })

    expect(metadata.openGraph).toEqual(expect.objectContaining({ type: 'website' }))
  })

  it('should handle undefined siteName', () => {
    const metadata = buildPageMetadata({
      seoMetadata: baseSeoMetadata,
      lang: LanguageCode.EN,
      path: '/about',
    })

    expect(metadata.openGraph?.siteName).toBeUndefined()
  })

  it('should build OG with undefined title/description when seoMetadata is undefined', () => {
    const metadata = buildPageMetadata({
      seoMetadata: undefined,
      lang: LanguageCode.EN,
      path: '/about',
    })

    expect(metadata.openGraph?.title).toBeUndefined()
    expect(metadata.openGraph?.description).toBeUndefined()
    expect(metadata.twitter?.title).toBeUndefined()
    expect(metadata.twitter?.description).toBeUndefined()
  })
})

describe('buildNoIndexMetadata', () => {
  it('should return metadata with noindex robots', () => {
    const metadata = buildNoIndexMetadata({
      title: 'Login',
      description: 'Login page',
    })

    expect(metadata.title).toBe('Login')
    expect(metadata.description).toBe('Login page')
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })

  it('should not include alternates', () => {
    const metadata = buildNoIndexMetadata({
      title: 'Profile',
      description: 'Your profile',
    })

    expect(metadata.alternates).toBeUndefined()
  })

  it('should not include openGraph', () => {
    const metadata = buildNoIndexMetadata({
      title: 'Signup',
      description: 'Create account',
    })

    expect(metadata.openGraph).toBeUndefined()
  })

  it('should not include twitter', () => {
    const metadata = buildNoIndexMetadata({
      title: 'Signup',
      description: 'Create account',
    })

    expect(metadata.twitter).toBeUndefined()
  })

  it('should handle undefined title and description', () => {
    const metadata = buildNoIndexMetadata({})

    expect(metadata.title).toBeUndefined()
    expect(metadata.description).toBeUndefined()
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })
})
