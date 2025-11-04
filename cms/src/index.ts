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
import * as fs from 'fs'
import { seedDatabase } from './seed'

interface BootstrapContext {
  strapi: Core.Strapi
}

interface LocaleData {
  code: string
  name: string
}

/**
 * Create missing i18n locales in the database
 * Checks for existing locales and only creates missing ones (idempotent)
 */
async function createMissingLocales(strapi: Core.Strapi): Promise<void> {
  try {
    console.log('📍 Checking for missing i18n locales...')

    // Get existing locales from the database
    const existingLocales = await strapi.plugin('i18n').service('locales').find()

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
      const existing = existingLocales.find((loc: LocaleData) => loc.code === required.code)
      return existing && existing.name !== required.name
    })

    if (missingLocales.length === 0 && localesToUpdate.length === 0) {
      console.log('   ✅ All required locales exist with correct names')
      return
    }

    // Create missing locales using createMany (workaround for create() bug)
    if (missingLocales.length > 0) {
      console.log(`   Creating ${missingLocales.length} missing locale(s)...`)
      await strapi.query('plugin::i18n.locale').createMany({ data: missingLocales })
      console.log(`   ✅ Successfully created locales: ${missingLocales.map(l => l.code).join(', ')}`)
    }

    // Update locales with incorrect names
    if (localesToUpdate.length > 0) {
      console.log(`   Updating ${localesToUpdate.length} locale name(s)...`)
      for (const locale of localesToUpdate) {
        const existing = existingLocales.find((loc: LocaleData) => loc.code === locale.code)
        if (existing) {
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
 * Seed the database with initial content using Strapi's internal APIs
 * Populates: currencies, products, and single types (navigation, footer, etc.) in 3 locales
 * Note: The standalone HTTP-based version remains at cms/scripts/seed.ts for manual use
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
 * Generate API token for backend authentication
 * Checks for existing valid token first, only creates new one if needed
 * Creates a token with full-access permissions for backend service
 */
async function generateApiToken(strapi: Core.Strapi): Promise<void> {
  try {
    console.log('🔐 Checking API token for backend service...')

    const tokenName = 'Backend Service Token'
    const tokenService = strapi.service('admin::api-token')
    const TOKEN_LIFESPAN_DAYS = 30
    const lifespanMillis = TOKEN_LIFESPAN_DAYS * 24 * 60 * 60 * 1000

    // Check if a valid, non-expired token already exists
    const existingTokens = await strapi.query('admin::api-token').findMany({
      where: { name: tokenName },
    })

    if (existingTokens && existingTokens.length > 0) {
      const existingToken = existingTokens[0]
      const now = new Date()

      // Check if token is still valid (not expired)
      const isExpired = existingToken.expiresAt && new Date(existingToken.expiresAt) < now
      const isValid = existingToken.type === 'full-access' && !isExpired

      if (isValid) {
        console.log(`✅ Valid API token already exists (ID: ${existingToken.id})`)
        if (existingToken.expiresAt) {
          const expiresAt = new Date(existingToken.expiresAt)
          const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          console.log(`   Expires in ${daysRemaining} days (${expiresAt.toISOString()})`)
        }
        console.log('   Skipping token generation - using existing token\n')
        return
      }

      // Token is invalid or expired - delete it
      console.log(`   Found ${isExpired ? 'expired' : 'invalid'} token (ID: ${existingToken.id}), deleting...`)
      await strapi.query('admin::api-token').delete({ where: { id: existingToken.id } })
      console.log(`   🗑️  Deleted old token`)
    }

    console.log('📝 Generating new API token using Strapi service...')
    console.log(`   Token will expire in ${TOKEN_LIFESPAN_DAYS} days`)

    // Create token using Strapi's service (handles salting and hashing automatically)
    const result = await tokenService.create({
      name: tokenName,
      description: 'Auto-generated token for backend service authentication',
      type: 'full-access',
      lifespan: lifespanMillis,
    })

    // Extract the actual token from the accessKey property
    const tokenString = result.accessKey

    if (!tokenString) {
      throw new Error('Token service did not return accessKey')
    }

    console.log('   ✅ Generated token (length: ' + tokenString.length + ' chars)')
    if (result.expiresAt) {
      console.log('   📅 Expires at:', result.expiresAt)
    }

    // Update .env file with new token if it exists
    const envPath = '/app/.env'

    console.log(`   🔍 Checking for .env file at: ${envPath}`)
    console.log(`   📁 File exists: ${fs.existsSync(envPath)}`)

    try {
      if (fs.existsSync(envPath)) {
        console.log('   📝 Reading .env file...')
        let envContent = fs.readFileSync(envPath, 'utf-8')

        // Check if STRAPI_API_TOKEN already exists and replace it, or add it
        const tokenPattern = /^STRAPI_API_TOKEN=.*/m
        if (tokenPattern.test(envContent)) {
          console.log('   🔄 Replacing existing STRAPI_API_TOKEN...')
          envContent = envContent.replace(tokenPattern, `STRAPI_API_TOKEN=${tokenString}`)
        } else {
          console.log('   ➕ Adding STRAPI_API_TOKEN to .env...')
          // Append token to end of file with newline if needed
          if (!envContent.endsWith('\n')) {
            envContent += '\n'
          }
          envContent += `STRAPI_API_TOKEN=${tokenString}\n`
        }

        console.log('   💾 Writing updated .env file...')
        fs.writeFileSync(envPath, envContent, 'utf-8')
        console.log('   ✅ Updated .env file with new token')
      } else {
        console.log('   ⚠️  .env file not found at /app/.env')
      }
    } catch (envError: unknown) {
      const envErrorMsg = envError instanceof Error ? envError.message : String(envError)
      console.warn(`   ⚠️  Could not update .env file: ${envErrorMsg}`)
    }

    console.log(`✅ API token created (length: ${tokenString.length})`)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`⚠️  Failed to create API token: ${message}`)

    throw error
  }
}

// noinspection JSUnusedGlobalSymbols
/**
 * Bootstrap function that runs on Strapi startup
 */
export default {
  /**
   * Strapi bootstrap lifecycle event
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
