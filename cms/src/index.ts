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
import crypto from 'crypto'
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

    // Identify missing locales
    const missingLocales = requiredLocales.filter(locale => !existingCodes.includes(locale.code))

    if (missingLocales.length === 0) {
      console.log('   ✅ All required locales already exist')
      return
    }

    // Create missing locales using createMany (workaround for create() bug)
    console.log(`   Creating ${missingLocales.length} missing locale(s)...`)

    await strapi.query('plugin::i18n.locale').createMany({ data: missingLocales })

    console.log(`   ✅ Successfully created locales: ${missingLocales.map(l => l.code).join(', ')}`)
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

    // Check if a token with this name already exists
    const existingToken = await strapi.query('admin::api-token').findOne({
      where: { name: tokenName },
    })

    if (existingToken) {
      // Verify it's full-access type
      if (existingToken.type === 'full-access') {
        console.log(`✅ Valid API token already exists (ID: ${existingToken.id})`)
        console.log('   Skipping token generation - using existing token\n')
        return
      } else {
        console.log(`⚠️  Existing token found but is not full-access (type: ${existingToken.type})`)
        console.log('   Deleting old token and creating new full-access token...')
        await strapi.query('admin::api-token').delete({ where: { id: existingToken.id } })
      }
    }

    console.log('📝 Generating new API token...')

    // Generate a secure random token (32 bytes = 256 bits of entropy, encoded as hex)
    const tokenString = crypto.randomBytes(32).toString('hex')

    // Hash the token for storage (security: never store plain tokens)
    const hashedToken = crypto.createHash('sha256').update(tokenString).digest('hex')

    // Create token in database
    const token = await strapi.query('admin::api-token').create({
      data: {
        name: tokenName,
        description: 'Auto-generated token for backend service authentication',
        type: 'full-access',
        token: hashedToken,
        createdAt: new Date().toISOString(),
      },
    })

    // Update .env file with new token if it exists
    let envUpdated = false
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
        envUpdated = true
        console.log('   ✅ Updated .env file with new token')
      } else {
        console.log('   ⚠️  .env file not found at /app/.env')
      }
    } catch (envError: unknown) {
      const envErrorMsg = envError instanceof Error ? envError.message : String(envError)
      console.warn(`   ⚠️  Could not update .env file: ${envErrorMsg}`)
    }

    // Display token with setup instructions (wider box to fit 64-char token)
    console.log('')
    console.log('╔═════════════════════════════════════════════════════════════════════════════╗')
    console.log('║                       API TOKEN GENERATED SUCCESSFULLY                      ║')
    console.log('╠═════════════════════════════════════════════════════════════════════════════╣')
    console.log('║                                                                             ║')
    console.log('║  Token Name: Backend Service Token                                          ║')
    console.log('║  Type: Full Access                                                          ║')
    console.log('║  ID: ' + String(token.id).padEnd(71) + '║')
    console.log('║                                                                             ║')
    console.log('╠═════════════════════════════════════════════════════════════════════════════╣')
    console.log('║                                                                             ║')
    console.log('║  Token: ' + tokenString.padEnd(68) + '║')
    console.log('║                                                                             ║')
    if (envUpdated) {
      console.log('║  [v] Automatically saved to .env file                                       ║')
    } else {
      console.log('║  [!] Manual .env update required (see instructions below)                   ║')
    }
    console.log('║                                                                             ║')
    console.log('╠═════════════════════════════════════════════════════════════════════════════╣')
    console.log('║  NEXT STEPS:                                                                ║')
    console.log('║                                                                             ║')
    if (envUpdated) {
      console.log('║  1. Restart your services to apply the new token:                           ║')
      console.log('║     docker-compose restart                                                  ║')
    } else {
      console.log('║  1. Copy the token above (entire hex string)                                 ║')
      console.log('║  2. Update your .env file:                                                   ║')
      console.log('║     STRAPI_API_TOKEN=' + tokenString.padEnd(54) + '║')
      console.log('║  3. Restart your services:                                                   ║')
      console.log('║     docker-compose restart                                                   ║')
    }
    console.log('║                                                                             ║')
    console.log('║  Backend will automatically use this token for Strapi authentication        ║')
    console.log('║                                                                             ║')
    console.log('╚═════════════════════════════════════════════════════════════════════════════╝')
    console.log('')

    console.log(`✅ API token created (ID: ${token.id})`)
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
