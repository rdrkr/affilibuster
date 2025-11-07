// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * CMS Database Seeding (Internal API Version)
 * Populates Strapi single types and collections with content in 3 languages (en, it, he)
 * Uses Strapi's internal APIs for direct database access during bootstrap
 *
 * Data is loaded from data/seed-data.json for single source of truth
 */

import type { Core } from '@strapi/types'
import * as fs from 'fs'

/**
 * TypeScript interfaces for seed data structure
 */

/** Currency type */
type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'ILS' | 'CAD' | 'AUD' | 'JPY' | 'CNY'
type SymbolPosition = 'before' | 'after'

/** Localized content base structure */
interface LocalizedContent {
  documentId: string
  id: number
  entryTitle: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  locale: string
  localizations: unknown[]
}

/** Product data structure */
interface ProductData {
  title: string
  description: string
  content: string
  excerpt: string
  affiliateUrl: string
  price: number
  currency: CurrencyCode
  category: string
  featured: boolean
}

/** Currency data structure */
interface CurrencyData {
  code: CurrencyCode
  name: string
  symbol: string
  decimalPlaces: number
  symbolPosition: SymbolPosition
  thousandsSeparator: string
  decimalSeparator: string
  exchangeRate: number
  sortOrder: number
}

/** Seed data structure */
interface SeedDataStructure {
  singleTypes: {
    navigation: {
      en: LocalizedContent & Record<string, unknown>
      it: LocalizedContent & Record<string, unknown>
      he: LocalizedContent & Record<string, unknown>
    }
    homepage: {
      en: LocalizedContent & Record<string, unknown>
      it: LocalizedContent & Record<string, unknown>
      he: LocalizedContent & Record<string, unknown>
    }
    about: {
      en: LocalizedContent & Record<string, unknown>
      it: LocalizedContent & Record<string, unknown>
      he: LocalizedContent & Record<string, unknown>
    }
    contact: {
      en: LocalizedContent & Record<string, unknown>
      it: LocalizedContent & Record<string, unknown>
      he: LocalizedContent & Record<string, unknown>
    }
    productPage: {
      en: LocalizedContent & Record<string, unknown>
      it: LocalizedContent & Record<string, unknown>
      he: LocalizedContent & Record<string, unknown>
    }
    footer: {
      en: LocalizedContent & Record<string, unknown>
      it: LocalizedContent & Record<string, unknown>
      he: LocalizedContent & Record<string, unknown>
    }
    privacy: {
      en: LocalizedContent & Record<string, unknown>
      it: LocalizedContent & Record<string, unknown>
      he: LocalizedContent & Record<string, unknown>
    }
    term: {
      en: LocalizedContent & Record<string, unknown>
      it: LocalizedContent & Record<string, unknown>
      he: LocalizedContent & Record<string, unknown>
    }
    error404: {
      en: LocalizedContent & Record<string, unknown>
      it: LocalizedContent & Record<string, unknown>
      he: LocalizedContent & Record<string, unknown>
    }
    error410: {
      en: LocalizedContent & Record<string, unknown>
      it: LocalizedContent & Record<string, unknown>
      he: LocalizedContent & Record<string, unknown>
    }
    systemMessage: {
      en: LocalizedContent & Record<string, unknown>
      it: LocalizedContent & Record<string, unknown>
      he: LocalizedContent & Record<string, unknown>
    }
  }
  collections: {
    products: {
      en: ProductData[]
      it: ProductData[]
      he: ProductData[]
    }
    currencies: CurrencyData[]
  }
}

/**
 * Get the seed data file path.
 *
 * Checks for seed data in Docker volume mount location first (/data/seed-data.json),
 * falls back to relative path for local development.
 *
 * @returns Absolute path to seed-data.json file
 */
const getSeedDataPath = () => {
  return fs.existsSync('/data/seed-data.json') ? '/data/seed-data.json' : '../data/seed-data.json'
}

const seedData: SeedDataStructure = JSON.parse(fs.readFileSync(getSeedDataPath(), 'utf-8')) as SeedDataStructure

/**
 * Seed script state tracking
 */
interface SeedState {
  successCount: number
  failureCount: number
}

/**
 * Database document with documentId (return type from Strapi queries)
 */
interface DocumentResult {
  documentId: string
  [key: string]: unknown
}

/**
 * Generate URL-friendly slug from title.
 *
 * Converts title to lowercase, replaces non-alphanumeric characters with hyphens,
 * and removes leading/trailing hyphens.
 *
 * @param title - Original title text
 * @returns URL-friendly slug (e.g., "My Product" becomes "my-product")
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Create or update a product (collection type) - idempotent operation.
 *
 * Checks if product exists by slug, title, and locale. Updates if exists, creates if not.
 * All products are automatically published after creation/update.
 *
 * @param strapi - Strapi core instance for accessing document services
 * @param title - Product title
 * @param locale - Locale code (en, it, he)
 * @param description - Short product description
 * @param content - Full product content/details
 * @param excerpt - Brief excerpt for listings
 * @param affiliateUrl - Affiliate link URL
 * @param price - Product price as decimal number
 * @param currency - Currency code (USD, EUR, GBP, etc.)
 * @param category - Product category
 * @param featured - Whether product is featured
 * @param state - Seeding state tracker for success/failure counts
 */
async function updateProduct(
  strapi: Core.Strapi,
  title: string,
  locale: string,
  description: string,
  content: string,
  excerpt: string,
  affiliateUrl: string,
  price: number,
  currency: 'USD' | 'EUR' | 'GBP' | 'ILS' | 'CAD' | 'AUD' | 'JPY' | 'CNY',
  category: string,
  featured: boolean,
  state: SeedState
): Promise<void> {
  try {
    const slug = generateSlug(title)

    const data = {
      title,
      slug,
      description,
      content,
      excerpt,
      affiliateUrl,
      price,
      currency,
      category,
      featured,
      translationStatus: 'complete' as const,
    }

    // Check if product already exists with this slug and locale
    const existing = (await strapi.db.query('api::product.product').findOne({
      where: { locale, slug, title },
    })) as DocumentResult | null

    if (existing !== null) {
      // Update existing product and publish
      await strapi.documents('api::product.product').update({
        documentId: existing.documentId,
        locale,
        title,
        slug,
        description,
        content,
        excerpt,
        affiliateUrl,
        price,
        currency,
        category,
        featured,
        translationStatus: 'complete' as const,
        status: 'published',
      })
    } else {
      // Create new product and publish
      await strapi.documents('api::product.product').create({
        locale,
        data,
        status: 'published',
      })
    }

    console.log(`✅ Created/updated product '${title}' for locale: ${locale}`)
    state.successCount++
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.log(`❌ Failed to create/update product '${title}' for locale ${locale}: ${message}`)
    state.failureCount++
    throw error
  }
}

/**
 * Create or update a currency (collection type) - idempotent operation.
 *
 * Checks if currency exists by code. Updates if exists, creates if not.
 * All currencies are automatically published and marked as active after creation/update.
 *
 * @param strapi - Strapi core instance for accessing document services
 * @param code - ISO currency code (USD, EUR, etc.)
 * @param name - Full currency name
 * @param symbol - Currency symbol ($, €, etc.)
 * @param decimalPlaces - Number of decimal places for display
 * @param symbolPosition - Position of symbol relative to amount (before/after)
 * @param thousandsSep - Thousands separator character
 * @param decimalSep - Decimal separator character
 * @param exchangeRate - Exchange rate relative to base currency
 * @param sortOrder - Display order in currency lists
 * @param state - Seeding state tracker for success/failure counts
 */
async function updateCurrency(
  strapi: Core.Strapi,
  code: string,
  name: string,
  symbol: string,
  decimalPlaces: number,
  symbolPosition: 'before' | 'after',
  thousandsSep: string,
  decimalSep: string,
  exchangeRate: number,
  sortOrder: number,
  state: SeedState
): Promise<void> {
  try {
    const data = {
      code,
      name,
      displayName: name,
      symbol,
      decimalPlaces,
      symbolPosition,
      thousandsSeparator: thousandsSep,
      decimalSeparator: decimalSep,
      exchangeRate,
      sortOrder,
      isActive: true,
    }

    // Check if currency already exists with this code
    const existing = (await strapi.db.query('api::currency.currency').findOne({
      where: { code },
    })) as DocumentResult | null

    if (existing !== null) {
      // Update existing currency and publish
      await strapi.documents('api::currency.currency').update({
        documentId: existing.documentId,
        code,
        name,
        displayName: name,
        symbol,
        decimalPlaces,
        symbolPosition,
        thousandsSeparator: thousandsSep,
        decimalSeparator: decimalSep,
        exchangeRate,
        sortOrder,
        isActive: true,
        status: 'published',
      })
    } else {
      // Create new currency and publish
      await strapi.documents('api::currency.currency').create({
        data,
        status: 'published',
      })
    }

    console.log(`✅ Created/updated currency '${code}'`)
    state.successCount++
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.log(`❌ Failed to create/update currency '${code}': ${message}`)
    state.failureCount++
    throw error
  }
}

/**
 * Single type UID union - all valid single type identifiers
 */
type SingleTypeUID =
  | 'api::navigation.navigation'
  | 'api::footer.footer'
  | 'api::homepage.homepage'
  | 'api::about.about'
  | 'api::contact.contact'
  | 'api::privacy.privacy'
  | 'api::term.term'
  | 'api::product-page.product-page'
  | 'api::error-404.error-404'
  | 'api::error-410.error-410'
  | 'api::system-message.system-message'

/**
 * Create or update a single type with locale-specific data - type-safe version.
 *
 * For single types, checks if document exists for the given locale.
 * Creates new document if missing. Filters out system-generated fields before creation.
 * All single types are automatically published after creation.
 *
 * @param strapi - Strapi core instance for accessing document services
 * @param uid - Strapi content type UID (e.g., 'api::homepage.homepage')
 * @param locale - Locale code (en, it, he)
 * @param data - Content data including entryTitle and locale-specific fields
 * @param state - Seeding state tracker for success/failure counts
 */
async function updateSingleType(
  strapi: Core.Strapi,
  uid: SingleTypeUID,
  locale: string,
  data: Record<string, unknown> & { entryTitle: string },
  state: SeedState
): Promise<void> {
  try {
    // Check if single type document exists for this locale
    const existing = (await strapi.db.query(uid).findOne({
      where: { locale },
    })) as DocumentResult | null

    if (existing === null) {
      // Filter out system-generated fields before passing to Strapi.
      // Strapi auto-generates: id, documentId, createdAt, updatedAt, publishedAt
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, documentId, createdAt, updatedAt, publishedAt, locale: _, localizations, ...cleanData } = data

      // Create new document for this locale and publish
      await strapi.documents(uid).create({
        locale,
        data: cleanData,
        status: 'published',
      })
    }

    console.log(`✅ Updated ${uid} for locale: ${locale}`)
    state.successCount++
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.log(`❌ Failed to update ${uid} for locale ${locale}: ${message}`)
    state.failureCount++
    throw error
  }
}

/**
 * Main seed function - populates database with initial content.
 *
 * Loads data from data/seed-data.json and populates all single types and collections
 * across all supported locales (en, it, he). Operations are idempotent - safe to run multiple times.
 *
 * Populates:
 * - Single types: navigation, footer, homepage, about, contact, privacy, terms, product-page, error pages
 * - Collections: products (in all locales), currencies
 *
 * @param strapi - Strapi core instance for accessing document and database services
 * @throws Error if seeding encounters failures
 */
export async function seedDatabase(strapi: Core.Strapi): Promise<void> {
  const state: SeedState = {
    successCount: 0,
    failureCount: 0,
  }

  console.log('🚀 Starting CMS population from seed-data.json...\\n')

  // Navigation single type
  console.log('📝 Populating navigation...')
  await updateSingleType(
    strapi,
    'api::navigation.navigation',
    'en',
    seedData.singleTypes.navigation.en as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::navigation.navigation',
    'it',
    seedData.singleTypes.navigation.it as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::navigation.navigation',
    'he',
    seedData.singleTypes.navigation.he as Record<string, unknown> & { entryTitle: string },
    state
  )

  console.log('')

  // Footer single type
  console.log('📝 Populating footer...')
  await updateSingleType(
    strapi,
    'api::footer.footer',
    'en',
    seedData.singleTypes.footer.en as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::footer.footer',
    'it',
    seedData.singleTypes.footer.it as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::footer.footer',
    'he',
    seedData.singleTypes.footer.he as Record<string, unknown> & { entryTitle: string },
    state
  )

  console.log('')

  // Homepage single type
  console.log('📝 Populating homepage...')
  await updateSingleType(
    strapi,
    'api::homepage.homepage',
    'en',
    seedData.singleTypes.homepage.en as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::homepage.homepage',
    'it',
    seedData.singleTypes.homepage.it as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::homepage.homepage',
    'he',
    seedData.singleTypes.homepage.he as Record<string, unknown> & { entryTitle: string },
    state
  )

  console.log('')

  // About single type
  console.log('📝 Populating about...')
  await updateSingleType(
    strapi,
    'api::about.about',
    'en',
    seedData.singleTypes.about.en as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::about.about',
    'it',
    seedData.singleTypes.about.it as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::about.about',
    'he',
    seedData.singleTypes.about.he as Record<string, unknown> & { entryTitle: string },
    state
  )

  console.log('')

  // Contact single type
  console.log('📝 Populating contact...')
  await updateSingleType(
    strapi,
    'api::contact.contact',
    'en',
    seedData.singleTypes.contact.en as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::contact.contact',
    'it',
    seedData.singleTypes.contact.it as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::contact.contact',
    'he',
    seedData.singleTypes.contact.he as Record<string, unknown> & { entryTitle: string },
    state
  )

  console.log('')

  // Privacy single type
  console.log('📝 Populating privacy...')
  await updateSingleType(
    strapi,
    'api::privacy.privacy',
    'en',
    seedData.singleTypes.privacy.en as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::privacy.privacy',
    'it',
    seedData.singleTypes.privacy.it as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::privacy.privacy',
    'he',
    seedData.singleTypes.privacy.he as Record<string, unknown> & { entryTitle: string },
    state
  )

  console.log('')

  // Term single type (terms of service)
  console.log('📝 Populating term...')
  await updateSingleType(
    strapi,
    'api::term.term',
    'en',
    seedData.singleTypes.term.en as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::term.term',
    'it',
    seedData.singleTypes.term.it as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::term.term',
    'he',
    seedData.singleTypes.term.he as Record<string, unknown> & { entryTitle: string },
    state
  )

  console.log('')

  // Product page single type
  console.log('📝 Populating product-page...')
  await updateSingleType(
    strapi,
    'api::product-page.product-page',
    'en',
    seedData.singleTypes.productPage.en as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::product-page.product-page',
    'it',
    seedData.singleTypes.productPage.it as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::product-page.product-page',
    'he',
    seedData.singleTypes.productPage.he as Record<string, unknown> & { entryTitle: string },
    state
  )

  console.log('')

  // Error 404 single type
  console.log('📝 Populating error-404...')
  await updateSingleType(
    strapi,
    'api::error-404.error-404',
    'en',
    seedData.singleTypes.error404.en as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::error-404.error-404',
    'it',
    seedData.singleTypes.error404.it as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::error-404.error-404',
    'he',
    seedData.singleTypes.error404.he as Record<string, unknown> & { entryTitle: string },
    state
  )

  console.log('')

  // Error 410 single type
  console.log('📝 Populating error-410...')
  await updateSingleType(
    strapi,
    'api::error-410.error-410',
    'en',
    seedData.singleTypes.error410.en as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::error-410.error-410',
    'it',
    seedData.singleTypes.error410.it as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::error-410.error-410',
    'he',
    seedData.singleTypes.error410.he as Record<string, unknown> & { entryTitle: string },
    state
  )

  console.log('')

  // System messages single type
  console.log('📝 Populating system-message...')
  await updateSingleType(
    strapi,
    'api::system-message.system-message',
    'en',
    seedData.singleTypes.systemMessage.en as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::system-message.system-message',
    'it',
    seedData.singleTypes.systemMessage.it as Record<string, unknown> & { entryTitle: string },
    state
  )
  await updateSingleType(
    strapi,
    'api::system-message.system-message',
    'he',
    seedData.singleTypes.systemMessage.he as Record<string, unknown> & { entryTitle: string },
    state
  )

  console.log('')

  // Products
  console.log('📝 Populating products...')

  // English products
  for (const product of seedData.collections.products.en) {
    await updateProduct(
      strapi,
      product.title,
      'en',
      product.description,
      product.content,
      product.excerpt,
      product.affiliateUrl,
      product.price,
      product.currency as 'USD' | 'EUR' | 'GBP' | 'ILS' | 'CAD' | 'AUD' | 'JPY' | 'CNY',
      product.category,
      product.featured,
      state
    )
  }

  // Italian products
  for (const product of seedData.collections.products.it) {
    await updateProduct(
      strapi,
      product.title,
      'it',
      product.description,
      product.content,
      product.excerpt,
      product.affiliateUrl,
      product.price,
      product.currency as 'USD' | 'EUR' | 'GBP' | 'ILS' | 'CAD' | 'AUD' | 'JPY' | 'CNY',
      product.category,
      product.featured,
      state
    )
  }

  // Currencies
  console.log('')
  console.log('📝 Populating system metadata (currencies)...')

  for (const currency of seedData.collections.currencies) {
    await updateCurrency(
      strapi,
      currency.code,
      currency.name,
      currency.symbol,
      currency.decimalPlaces,
      currency.symbolPosition as 'before' | 'after',
      currency.thousandsSeparator,
      currency.decimalSeparator,
      currency.exchangeRate,
      currency.sortOrder,
      state
    )
  }

  console.log('')

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Population Summary:')
  console.log(`   ✅ Success: ${state.successCount.toString()}`)
  console.log(`   ❌ Failed:  ${state.failureCount.toString()}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')

  if (state.failureCount === 0) {
    console.log('🎉 All types populated successfully!')
  } else {
    console.log('⚠️  Some types failed to populate. Check logs above for details.')
    throw Error('Population script encountered errors.')
  }
}
