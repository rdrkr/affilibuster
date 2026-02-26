// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * SEO module barrel export.
 * Re-exports all SEO metadata and JSON-LD structured data utility functions.
 */

export { buildAlternates, buildCanonicalUrl, buildNoIndexMetadata, buildPageMetadata } from './metadata'
export {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildProductJsonLd,
  buildWebSiteJsonLd,
} from './json-ld'
export type { BreadcrumbEntry } from './json-ld'
export type {
  ArticleJsonLd,
  BreadcrumbItemJsonLd,
  BreadcrumbListJsonLd,
  OfferJsonLd,
  OrganizationJsonLd,
  ProductJsonLd,
  WebSiteJsonLd,
} from './types'
