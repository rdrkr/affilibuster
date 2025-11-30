// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * CMS Bootstrap Lifecycle
 * Runs on Strapi startup to:
 * - Create missing i18n locales (Italian, Hebrew)
 * - Generate full-access API token for backend authentication
 * - Configure permissions and default access
 *
 * Reference: T131 (Configure Strapi i18n plugin)
 */

import type { Core } from '@strapi/types'

interface BootstrapContext {
  strapi: Core.Strapi
}

interface LocaleData {
  id?: number
  code: string
  name: string
}

interface ApiConfig {
  id: number
  documentId: string
  key: string
  value: string
  description?: string
}

interface ApiToken {
  id: number
  name: string
  description?: string
  type: string
  accessKey: string
  lifespan: number | null
}

/**
 * Create missing i18n locales in the database.
 *
 * Checks for existing locales and only creates missing ones (idempotent).
 * Supports English, Italian, and Hebrew locales matching the platform configuration.
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
 * Create full-access API token for backend authentication.
 *
 * Creates a permanent full-access API token named "Backend API" if it doesn't exist.
 * The backend reads this token from the database to authenticate with Strapi CMS.
 * @param strapi - Strapi core instance for accessing services
 */
async function createBackendApiToken(strapi: Core.Strapi): Promise<void> {
  try {
    console.log('🔑 Checking for backend API token...')

    // Check if plaintext token exists in api_config
    const existingConfig = (await strapi.query('api::api-config.api-config').findOne({
      where: { key: 'strapi_api_token' },
    })) as ApiConfig | null

    if (existingConfig) {
      console.log('   ✅ Backend API token already exists')
      return
    }

    // Check if API token exists in Strapi (without plaintext in api_config)
    const existingTokens = (await strapi
      .query('admin::api-token')
      .findMany({ where: { name: 'Backend API', type: 'full-access' } })) as ApiToken[]

    // If token exists but not in api_config, delete and recreate to get plaintext
    if (existingTokens.length > 0) {
      console.log('   🔄 Recreating backend API token to capture plaintext...')
      for (const token of existingTokens) {
        await strapi.query('admin::api-token').delete({ where: { id: token.id } })
      }
    }

    console.log('   Creating new backend API token...')

    // Use Strapi's API token service to properly create the token with encryption
    const tokenService = strapi.service('admin::api-token') as {
      create: (data: Partial<ApiToken> & { permissions: unknown[] }) => Promise<ApiToken>
    }
    const token = await tokenService.create({
      name: 'Backend API',
      description: 'Full-access token for backend API authentication',
      type: 'full-access',
      lifespan: null, // Never expires
      permissions: [],
    })

    const plaintextToken = token.accessKey
    console.log('   ✅ Backend API token created successfully')

    // Store the plaintext token in api_config for backend to read
    // NOTE: Strapi stores a HASHED version in strapi_api_tokens.access_key,
    // but we need the PLAINTEXT version for API calls
    await strapi.query('api::api-config.api-config').create({
      data: {
        key: 'strapi_api_token',
        value: plaintextToken,
        description: 'Backend API authentication token (plaintext)',
      },
    })
    console.log('   ✅ Stored plaintext token in api_config for backend')
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`   ❌ Failed to create backend API token: ${message}`)
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
   * - Creating full-access API token for backend authentication
   * - Seeding database with initial content
   * @param root0 - Bootstrap context object
   * @param root0.strapi - Strapi core instance
   */
  async bootstrap({ strapi }: BootstrapContext): Promise<void> {
    console.log('🚀 Running Strapi bootstrap...')

    try {
      await createMissingLocales(strapi)
      await createBackendApiToken(strapi)

      console.log('✅ Bootstrap completed successfully')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`❌ Bootstrap error: ${message}`)

      throw error
    }
  },
}
