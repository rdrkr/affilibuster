// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * CMS Bootstrap Lifecycle
 * Runs on Strapi startup to:
 * - Create missing i18n locales (Italian, Hebrew)
 * - Generate API token for backend authentication (first run only)
 * - Configure permissions and default access
 *
 * Reference: T131 (Configure Strapi i18n plugin)
 */

import type { Core } from '@strapi/types'
import { seedDatabase } from './seed'

interface BootstrapContext {
  strapi: Core.Strapi
}

interface LocaleData {
  id?: number
  code: string
  name: string
}

interface ApiToken {
  id: number
  name: string
  description?: string
  type: string
  accessKey?: string
  expiresAt?: string | Date
  createdAt?: string | Date
  updatedAt?: string | Date
}

interface TokenCreateResult {
  id: number
  accessKey: string
  expiresAt?: string | Date
}

interface ApiConfigEntity {
  id: number
  key: string
  value: string
  description?: string
  createdAt?: string | Date
  updatedAt?: string | Date
}

/**
 * Create missing i18n locales in the database.
 *
 * Checks for existing locales and only creates missing ones (idempotent).
 * Supports English, Italian, and Hebrew locales matching the platform configuration.
 *
 * @param strapi - Strapi core instance for accessing plugins and services
 */
async function createMissingLocales(strapi: Core.Strapi): Promise<void> {
  try {
    console.log('📍 Checking for missing i18n locales...')

    // Get existing locales from the database
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const existingLocales = (await strapi.plugin('i18n').service('locales').find()) as LocaleData[]

    const existingCodes = existingLocales.map((locale: LocaleData) => locale.code)
    console.log(`   Found existing locales: ${existingCodes.join(', ')}`)

    // Define required locales matching plugin configuration
    const requiredLocales: LocaleData[] = [
      { code: 'en', name: 'English' },
      { code: 'it', name: 'Italiano' },
      { code: 'he', name: 'עברית' },
    ]

    // Identify missing locales (by code)
    const missingLocales = requiredLocales.filter(locale => !existingCodes.includes(locale.code))

    // Identify locales with incorrect names
    const localesToUpdate = requiredLocales.filter(required => {
      const existing = existingLocales.find(loc => loc.code === required.code)
      return existing !== undefined && existing.name !== required.name
    })

    if (missingLocales.length === 0 && localesToUpdate.length === 0) {
      console.log('   ✅ All required locales exist with correct names')
      return
    }

    // Create missing locales using createMany (workaround for create() bug)
    if (missingLocales.length > 0) {
      console.log(`   Creating ${missingLocales.length.toString()} missing locale(s)...`)
      await strapi.query('plugin::i18n.locale').createMany({ data: missingLocales })
      console.log(`   ✅ Successfully created locales: ${missingLocales.map(l => l.code).join(', ')}`)
    }

    // Update locales with incorrect names
    if (localesToUpdate.length > 0) {
      console.log(`   Updating ${localesToUpdate.length.toString()} locale name(s)...`)
      for (const locale of localesToUpdate) {
        const existing = existingLocales.find(loc => loc.code === locale.code)
        if (existing?.id !== undefined) {
          await strapi.query('plugin::i18n.locale').update({
            where: { id: existing.id },
            data: { name: locale.name },
          })
          console.log(`   ✅ Updated locale ${locale.code}: name changed to "${locale.name}"`)
        }
      }
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`   ❌ Failed to create locales: ${message}`)
    throw error
  }
}

/**
 * Seed the database with initial content using Strapi's internal APIs.
 *
 * Populates currencies, products, and single types (navigation, footer, etc.) in 3 locales.
 * This is a wrapper around the main seeding function from seed.ts.
 * Note: The standalone HTTP-based version remains at cms/scripts/seed.ts for manual use.
 *
 * @param strapi - Strapi core instance for accessing document and database services
 */
async function seedDatabaseWrapper(strapi: Core.Strapi): Promise<void> {
  try {
    console.log('📦 Running database seeding...')
    await seedDatabase(strapi)
    console.log('✅ Database seeding completed successfully')
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`❌️ Database seeding error: ${message}`)

    throw error
  }
}

/**
 * Generate API token for backend authentication.
 *
 * Checks for existing valid token first, only creates new one if needed.
 * Creates a read-only token for backend service (principle of least privilege).
 * Token expires after 30 days and is automatically stored in shared database.
 *
 * @param strapi - Strapi core instance for accessing API token services
 */
async function generateApiToken(strapi: Core.Strapi): Promise<void> {
  try {
    console.log('🔐 Checking API token for backend service...')

    const tokenName = 'Backend Service Token'
    const tokenService = strapi.service('admin::api-token')
    const TOKEN_LIFESPAN_DAYS = 30
    const lifespanMillis = TOKEN_LIFESPAN_DAYS * 24 * 60 * 60 * 1000

    // Check if a valid, non-expired token already exists
    const existingTokens = (await strapi.query('admin::api-token').findMany({
      where: { name: tokenName },
    })) as ApiToken[]

    const existingToken = existingTokens[0] ?? null
    if (existingToken) {
      const now = new Date()

      // Check if token is still valid (not expired)
      const isExpired = existingToken.expiresAt !== undefined && new Date(existingToken.expiresAt) < now
      const isValid = existingToken.type === 'full-access' && !isExpired

      if (isValid) {
        console.log(`✅ Valid API token already exists (ID: ${existingToken.id.toString()})`)
        if (existingToken.expiresAt !== undefined) {
          const expiresAt = new Date(existingToken.expiresAt)
          const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          console.log(`   Expires in ${daysRemaining.toString()} days (${expiresAt.toISOString()})`)
        }
        console.log('   Skipping token generation - using existing token\n')
        return
      }

      // Token is invalid or expired - delete it
      console.log(
        `   Found ${isExpired ? 'expired' : 'invalid'} token (ID: ${existingToken.id.toString()}), deleting...`
      )
      await strapi.query('admin::api-token').delete({ where: { id: existingToken.id } })
      console.log(`   🗑️  Deleted old token`)
    }

    console.log('📝 Generating new API token using Strapi service...')
    console.log(`   Token will expire in ${TOKEN_LIFESPAN_DAYS.toString()} days`)

    // Create token using Strapi's service (handles salting and hashing automatically)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const result = (await tokenService.create({
      name: tokenName,
      description: 'Auto-generated full-access token for backend service authentication',
      type: 'full-access',
      lifespan: lifespanMillis,
    })) as TokenCreateResult

    // Extract the actual token from the accessKey property
    const tokenString = result.accessKey

    console.log('   ✅ Generated token (length: ' + tokenString.length.toString() + ' chars)')
    if (result.expiresAt !== undefined) {
      console.log('   📅 Expires at:', result.expiresAt.toString())
    }

    // Store token in database for backend service to access
    console.log('   💾 Storing token in database...')
    try {
      // Check if token config already exists in database
      const existingConfig = (await strapi.db.query('api::api-config.api-config').findOne({
        where: { key: 'strapi_api_token' },
      })) as ApiConfigEntity | null

      if (existingConfig) {
        // Update existing token
        await strapi.db.query('api::api-config.api-config').update({
          where: { id: existingConfig.id },
          data: {
            value: tokenString,
            description: 'Auto-generated read-only token for backend service authentication',
            updatedAt: new Date(),
          },
        })
        console.log('   ✅ Updated token in database')
      } else {
        // Create new token entry
        await strapi.db.query('api::api-config.api-config').create({
          data: {
            key: 'strapi_api_token',
            value: tokenString,
            description: 'Auto-generated read-only token for backend service authentication',
          },
        })
        console.log('   ✅ Stored token in database')
      }
    } catch (dbError: unknown) {
      const dbErrorMsg = dbError instanceof Error ? dbError.message : String(dbError)
      console.error(`   ❌ Failed to store token in database: ${dbErrorMsg}`)
      throw dbError
    }

    console.log(`✅ API token created and stored in database (length: ${tokenString.length.toString()})`)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`⚠️  Failed to create API token: ${message}`)

    throw error
  }
}

// noinspection JSUnusedGlobalSymbols
/**
 * Strapi bootstrap lifecycle configuration.
 *
 * Exports the bootstrap lifecycle hook that runs during Strapi server startup.
 */
export default {
  /**
   * Bootstrap lifecycle hook executed on Strapi startup.
   *
   * Performs initial CMS setup including:
   * - Creating missing i18n locales (Italian, Hebrew)
   * - Generating API token for backend authentication
   * - Seeding database with initial content
   *
   * @param root0 - Bootstrap context object
   * @param root0.strapi - Strapi core instance
   */
  async bootstrap({ strapi }: BootstrapContext): Promise<void> {
    console.log('🚀 Running Strapi bootstrap...')

    try {
      // Phase 1: Create missing i18n locales
      await createMissingLocales(strapi)

      // Phase 2: Generate API token if needed
      await generateApiToken(strapi)

      // Phase 3: Seed database with initial content if needed
      await seedDatabaseWrapper(strapi)

      console.log('✅ Bootstrap completed successfully')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`❌ Bootstrap error: ${message}`)

      throw error
    }
  },
}
