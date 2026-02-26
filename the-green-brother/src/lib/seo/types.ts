// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * JSON-LD Structured Data Type Definitions
 *
 * Provides TypeScript interfaces for Schema.org JSON-LD structured data objects.
 * Used by the json-ld builder functions to ensure type-safe structured data generation.
 */

/** Base JSON-LD object with required `@context` and `@type` fields. */
interface JsonLdBase {
  /** Schema.org context URL. */
  '@context': 'https://schema.org'
  /** Schema.org type identifier. */
  '@type': string
  /** Index signature allowing JSON-LD objects to satisfy `Record<string, unknown>`. */
  [key: string]: unknown
}

/** Schema.org Organization structured data. */
export interface OrganizationJsonLd extends JsonLdBase {
  /** Schema.org type discriminator. */
  '@type': 'Organization'
  /** Organization name. */
  name: string
  /** Organization website URL. */
  url: string
  /** Organization logo URL. */
  logo?: string
}

/** Schema.org WebSite structured data with optional search action. */
export interface WebSiteJsonLd extends JsonLdBase {
  /** Schema.org type discriminator. */
  '@type': 'WebSite'
  /** Site name. */
  name: string
  /** Site base URL. */
  url: string
}

/** Schema.org Offer for product pricing. */
export interface OfferJsonLd {
  /** Schema.org type discriminator. */
  '@type': 'Offer'
  /** Price amount as a string. */
  price: string
  /** ISO 4217 currency code. */
  priceCurrency: string
  /** Item availability (e.g., InStock). */
  availability: string
  /** URL where the product can be purchased. */
  url: string
}

/** Schema.org Product structured data. */
export interface ProductJsonLd extends JsonLdBase {
  /** Schema.org type discriminator. */
  '@type': 'Product'
  /** Product name. */
  name: string
  /** Product description. */
  description?: string
  /** Product image URL(s). */
  image?: string[]
  /** Product brand information. */
  brand?: {
    /** Schema.org type discriminator. */
    '@type': 'Brand'
    /** Brand name. */
    name: string
  }
  /** Product pricing offers. */
  offers?: OfferJsonLd[]
}

/** Schema.org Article structured data. */
export interface ArticleJsonLd extends JsonLdBase {
  /** Schema.org type discriminator. */
  '@type': 'Article'
  /** Article headline. */
  headline: string
  /** Article description. */
  description?: string
  /** Article featured image URL. */
  image?: string
  /** Article author information. */
  author?: {
    /** Schema.org type discriminator. */
    '@type': 'Person'
    /** Author full name. */
    name: string
  }
  /** ISO 8601 date the article was published. */
  datePublished?: string
  /** ISO 8601 date the article was last modified. */
  dateModified?: string
  /** Article publisher information. */
  publisher?: {
    /** Schema.org type discriminator. */
    '@type': 'Organization'
    /** Publisher name. */
    name: string
  }
}

/** Single item in a BreadcrumbList. */
export interface BreadcrumbItemJsonLd {
  /** Schema.org type discriminator. */
  '@type': 'ListItem'
  /** Position in the breadcrumb trail (1-based). */
  position: number
  /** Breadcrumb display name. */
  name: string
  /** Breadcrumb URL (omitted for the last item). */
  item?: string
}

/** Schema.org BreadcrumbList structured data. */
export interface BreadcrumbListJsonLd extends JsonLdBase {
  /** Schema.org type discriminator. */
  '@type': 'BreadcrumbList'
  /** Ordered list of breadcrumb items. */
  itemListElement: BreadcrumbItemJsonLd[]
}
