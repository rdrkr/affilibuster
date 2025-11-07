// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Seed Data Deserializer Utilities
 *
 * Provides strongly-typed mock data derived from /data/seed-data.json
 * Deserializes seed data into OpenAPI-generated types for use in tests
 *
 * Usage:
 *   import { getSeedNavigation, getSeedFooter, getSeedProducts, getSeedCurrencies } from '../utils/seed-data'
 *
 *   const navData = getSeedNavigation(CodeEnum.EN)
 *   const products = getSeedProducts(CodeEnum.EN)
 *   const currencies = getSeedCurrencies()
 */

import seedData from '../../../data/seed-data.json'
import type { Currency, Footer, Navigation, Product } from '@/lib/types'
import type { CodeEnum } from '@/lib/generated/types.gen'

/**
 * Interface for the seed data structure
 */
interface SeedData {
  singleTypes: {
    navigation: Record<CodeEnum, Record<string, unknown>>
    footer: Record<CodeEnum, Record<string, unknown>>
    homepage: Record<CodeEnum, Record<string, unknown>>
    about: Record<CodeEnum, Record<string, unknown>>
    contact: Record<CodeEnum, Record<string, unknown>>
    privacy: Record<CodeEnum, Record<string, unknown>>
    term: Record<CodeEnum, Record<string, unknown>>
    productPage: Record<CodeEnum, Record<string, unknown>>
    error404: Record<CodeEnum, Record<string, unknown>>
    error410: Record<CodeEnum, Record<string, unknown>>
    systemMessage: Record<CodeEnum, Record<string, unknown>>
  }
  collections: {
    products: Record<string, Record<string, unknown>[]>
    currencies: Record<string, unknown>[]
  }
}

const typedSeedData = seedData as SeedData

/**
 * Get Navigation data for a specific locale
 * @param locale - The locale to get navigation data for (CodeEnum.EN, CodeEnum.IT, CodeEnum.HE)
 * @returns Strongly-typed Navigation object
 *
 * @example
 * ```typescript
 * const navData = getSeedNavigation(CodeEnum.EN)
 * expect(navData.brandName).toBe('Affilibuster')
 * ```
 */
export function getSeedNavigation(locale: CodeEnum): Navigation {
  const nav = typedSeedData.singleTypes.navigation[locale]

  // Omit CMS metadata fields to match the Navigation type
  // We destructure and omit these fields intentionally
  const {
    documentId: _documentId,
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    publishedAt: _publishedAt,
    locale: _locale,
    localizations: _localizations,
    ...rest
  } = nav

  return rest as Navigation
}

/**
 * Get Footer data for a specific locale
 * @param locale - The locale to get footer data for (CodeEnum.EN, CodeEnum.IT, CodeEnum.HE)
 * @returns Strongly-typed Footer object
 *
 * @example
 * ```typescript
 * const footerData = getSeedFooter(CodeEnum.EN)
 * expect(footerData.copyrightText).toBeDefined()
 * ```
 */
export function getSeedFooter(locale: CodeEnum): Footer {
  const footer = typedSeedData.singleTypes.footer[locale]

  // Omit CMS metadata fields to match the Footer type
  const {
    documentId: _documentId,
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    publishedAt: _publishedAt,
    locale: _locale,
    localizations: _localizations,
    ...rest
  } = footer

  return rest as Footer
}

/**
 * Get all currencies from seed data
 * @returns Array of strongly-typed Currency objects
 *
 * @example
 * ```typescript
 * const currencies = getSeedCurrencies()
 * expect(currencies).toHaveLength(8)
 * expect(currencies[0].code).toBe(CurrencyCode.USD)
 * ```
 */
export function getSeedCurrencies(): Currency[] {
  const currencies = typedSeedData.collections.currencies

  return currencies.map(currency => {
    // Omit CMS metadata fields to match the Currency type
    const {
      documentId: _documentId,
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      publishedAt: _publishedAt,
      ...rest
    } = currency

    return rest as Currency
  })
}

/**
 * Get Products for a specific locale
 * @param locale - The locale to get products for (CodeEnum.EN, CodeEnum.IT, CodeEnum.HE)
 * @returns Array of strongly-typed Product objects
 *
 * @example
 * ```typescript
 * const products = getSeedProducts(CodeEnum.EN)
 * expect(products.length).toBeGreaterThan(0)
 * expect(products[0].title).toBeDefined()
 * ```
 */
export function getSeedProducts(locale: CodeEnum): Product[] {
  const products = typedSeedData.collections.products[locale]

  // Return empty array if locale products don't exist
  if (!products) {
    return []
  }

  return products.map(product => {
    // Omit CMS metadata fields to match the Product type
    const {
      documentId: _documentId,
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      publishedAt: _publishedAt,
      locale: _locale,
      localizations: _localizations,
      ...rest
    } = product

    return rest as Product
  })
}

/**
 * Get Homepage data for a specific locale
 * @param locale - The locale to get homepage data for (CodeEnum.EN, CodeEnum.IT, CodeEnum.HE)
 * @returns Homepage data object
 *
 * @example
 * ```typescript
 * const homepage = getSeedHomepage(CodeEnum.EN)
 * expect(homepage.heroTitle).toBeDefined()
 * ```
 */
export function getSeedHomepage(locale: CodeEnum) {
  const homepage = typedSeedData.singleTypes.homepage[locale]

  const {
    documentId: _documentId,
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    publishedAt: _publishedAt,
    locale: _locale,
    localizations: _localizations,
    ...rest
  } = homepage

  return rest
}

/**
 * Get About page data for a specific locale
 * @param locale - The locale to get about data for (CodeEnum.EN, CodeEnum.IT, CodeEnum.HE)
 * @returns About page data object
 *
 * @example
 * ```typescript
 * const about = getSeedAbout(CodeEnum.EN)
 * expect(about.heroTitle).toBeDefined()
 * ```
 */
export function getSeedAbout(locale: CodeEnum) {
  const about = typedSeedData.singleTypes.about[locale]

  const {
    documentId: _documentId,
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    publishedAt: _publishedAt,
    locale: _locale,
    localizations: _localizations,
    ...rest
  } = about

  return rest
}

/**
 * Get Contact page data for a specific locale
 * @param locale - The locale to get contact data for (CodeEnum.EN, CodeEnum.IT, CodeEnum.HE)
 * @returns Contact page data object
 *
 * @example
 * ```typescript
 * const contact = getSeedContact(CodeEnum.EN)
 * expect(contact.heroTitle).toBeDefined()
 * ```
 */
export function getSeedContact(locale: CodeEnum) {
  const contact = typedSeedData.singleTypes.contact[locale]

  const {
    documentId: _documentId,
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    publishedAt: _publishedAt,
    locale: _locale,
    localizations: _localizations,
    ...rest
  } = contact

  return rest
}

/**
 * Get a specific currency by code
 * @param code - The currency code (CurrencyCode.USD, CurrencyCode.EUR, CurrencyCode.GBP, etc.)
 * @returns Strongly-typed Currency object or undefined
 *
 * @example
 * ```typescript
 * const usd = getSeedCurrency(CurrencyCode.USD)
 * expect(usd?.symbol).toBe('$')
 * ```
 */
export function getSeedCurrency(code: string): Currency | undefined {
  const currencies = getSeedCurrencies()
  return currencies.find(c => c.code === code)
}

/**
 * Get a specific product by slug
 * @param locale - The locale to search in
 * @param slug - The product slug
 * @returns Strongly-typed Product object or undefined
 *
 * @example
 * ```typescript
 * const product = getSeedProduct(CodeEnum.EN, 'premium-wireless-earbuds')
 * expect(product?.title).toBe('Premium Wireless Earbuds')
 * ```
 */
export function getSeedProduct(locale: CodeEnum, slug: string): Product | undefined {
  const products = getSeedProducts(locale)
  return products.find(p => p.slug === slug)
}
