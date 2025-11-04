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
 * Get the seed data file path
 */
const getSeedDataPath = () => {
  return fs.existsSync('/data/seed-data.json') ? '/data/seed-data.json' : '../data/seed-data.json'
}

const seedData = JSON.parse(fs.readFileSync(getSeedDataPath(), 'utf-8'))

/**
 * Seed script state tracking
 */
interface SeedState {
  successCount: number
  failureCount: number
}

/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Create or update a product (collection type) - idempotent
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
    const existing = await strapi.db.query('api::product.product').findOne({
      where: { locale, slug, title },
    })

    if (existing) {
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
 * Create or update a currency (collection type) - idempotent
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
    const existing = await strapi.db.query('api::currency.currency').findOne({
      where: { code },
    })

    if (existing) {
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
 * Update single type with locale data - type-safe version
 * For single types, we check if document exists and create/update accordingly
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
    const existing = await strapi.db.query(uid).findOne({
      where: { locale },
    })

    if (!existing) {
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
 * Main seed function - populates database with initial content
 * Data is loaded from data/seed-data.json
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
  console.log(`   ✅ Success: ${state.successCount}`)
  console.log(`   ❌ Failed:  ${state.failureCount}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')

  if (state.failureCount === 0) {
    console.log('🎉 All types populated successfully!')
  } else {
    console.log('⚠️  Some types failed to populate. Check logs above for details.')
    throw Error('Population script encountered errors.')
  }
}
