// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Tests for SEO module barrel export.
 * Verifies that all public functions and types are re-exported correctly.
 */

import {
  buildAlternates,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildCanonicalUrl,
  buildNoIndexMetadata,
  buildOrganizationJsonLd,
  buildPageMetadata,
  buildProductJsonLd,
  buildWebSiteJsonLd,
} from '@/lib/seo'

describe('SEO module barrel export', () => {
  it('exports all metadata functions', () => {
    expect(buildCanonicalUrl).toBeDefined()
    expect(buildAlternates).toBeDefined()
    expect(buildPageMetadata).toBeDefined()
    expect(buildNoIndexMetadata).toBeDefined()
  })

  it('exports all JSON-LD functions', () => {
    expect(buildOrganizationJsonLd).toBeDefined()
    expect(buildWebSiteJsonLd).toBeDefined()
    expect(buildProductJsonLd).toBeDefined()
    expect(buildArticleJsonLd).toBeDefined()
    expect(buildBreadcrumbJsonLd).toBeDefined()
  })
})
