// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * API Client Wrapper for Affilibuster Frontend
 *
 * This module provides a convenient abstraction layer over the auto-generated SDK,
 * handling session authentication and providing a clean API interface for components.
 *
 * The wrapper functions maintain backward compatibility with component code while
 * using the auto-generated SDK functions from @hey-api/openapi-ts.
 */

import { createClient, createConfig } from './generated/client'
import {
  currencyGetCurrencies,
  getUserPreferences,
  updateUserPreferences,
  homepageGetHomepage,
  aboutGetAbout,
  contactGetContact,
  productGetProducts,
  navigationGetNavigation,
  footerGetFooter,
  privacyGetPrivacy,
  productPageGetProductPage,
  error404GetError404,
  error410GetError410,
  getLanguages,
} from './generated/sdk.gen'

// Create a client instance configured for the API
// NOTE: baseUrl comes from NEXT_PUBLIC_API_URL env var, which must match OpenAPI servers config (/v1)
// Falls back to first server in OpenAPI spec if not set
const config: Parameters<typeof createConfig>[0] = {}
if (process.env.NEXT_PUBLIC_API_URL) {
  config.baseUrl = process.env.NEXT_PUBLIC_API_URL
}

const apiClient = createClient(createConfig(config))

/**
 * Get session ID from localStorage or generate a new one
 */
function getSessionId(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  let sessionId = localStorage.getItem('affilibuster_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('affilibuster_session_id', sessionId)
  }
  return sessionId
}

/**
 * Currencies API wrapper
 */
export const currenciesAPI = {
  async getAll() {
    const response = await currencyGetCurrencies({
      client: apiClient,
      headers: {
        'X-Session-Id': getSessionId(),
      },
    })
    // Extract data from the response (status code 200)
    const data = response[200]?.data
    return data || null
  },
}

/**
 * User Preferences API wrapper
 */
export const preferencesAPI = {
  async get() {
    const response = await getUserPreferences({
      client: apiClient,
      headers: {
        'X-Session-Id': getSessionId(),
      },
    })
    const data = response[200]?.data
    return data || null
  },

  async update(data: Record<string, unknown>) {
    const response = await updateUserPreferences({
      client: apiClient,
      headers: {
        'X-Session-Id': getSessionId(),
      },
      body: data,
    })
    const responseData = response[200]?.data
    return responseData || null
  },
}

/**
 * Content API wrapper - Maps to single-type and collection endpoints
 */
export const contentAPI = {
  /**
   * Get single type content (e.g., homepage, about, contact)
   */
  async getSingleType(lang: string, typeName: string) {
    try {
      // Map type names to SDK functions
      switch (typeName.toLowerCase()) {
        case 'homepage':
          return await homepageGetHomepage({
            client: apiClient,
            headers: {
              'X-Session-Id': getSessionId(),
            },
          })
        case 'about':
          return await aboutGetAbout({
            client: apiClient,
            headers: {
              'X-Session-Id': getSessionId(),
            },
          })
        case 'contact':
          return await contactGetContact({
            client: apiClient,
            headers: {
              'X-Session-Id': getSessionId(),
            },
          })
        case 'product-page':
          return await productPageGetProductPage({
            client: apiClient,
            headers: {
              'X-Session-Id': getSessionId(),
            },
          })
        case 'navigation':
          return await navigationGetNavigation({
            client: apiClient,
            headers: {
              'X-Session-Id': getSessionId(),
            },
          })
        case 'footer':
          return await footerGetFooter({
            client: apiClient,
            headers: {
              'X-Session-Id': getSessionId(),
            },
          })
        case 'privacy':
          return await privacyGetPrivacy({
            client: apiClient,
            headers: {
              'X-Session-Id': getSessionId(),
            },
          })
        case 'error-404':
          return await error404GetError404({
            client: apiClient,
            headers: {
              'X-Session-Id': getSessionId(),
            },
          })
        case 'error-410':
          return await error410GetError410({
            client: apiClient,
            headers: {
              'X-Session-Id': getSessionId(),
            },
          })
        default:
          return null
      }
    } catch (error) {
      console.error(`Failed to fetch single type ${typeName}:`, error)
      return null
    }
  },

  /**
   * Get all products (collection type)
   */
  async list(lang?: string, page?: number, pageSize?: number) {
    try {
      const response = await productGetProducts({
        client: apiClient,
        headers: {
          'X-Session-Id': getSessionId(),
        },
        query: {
          'pagination[page]': page,
          'pagination[pageSize]': pageSize,
        },
      })
      const data = response[200]?.data
      return data || null
    } catch (error) {
      console.error('Failed to fetch products:', error)
      return null
    }
  },

  /**
   * Get a single product by slug (from products list)
   */
  async get(lang: string, slug: string) {
    try {
      const response = await productGetProducts({
        client: apiClient,
        headers: {
          'X-Session-Id': getSessionId(),
        },
      })
      const data = response[200]?.data
      // Filter for the specific product by slug if needed
      return data || null
    } catch (error) {
      console.error(`Failed to fetch product ${slug}:`, error)
      return null
    }
  },

  /**
   * Alias for get() for backward compatibility
   */
  async getBySlug(lang: string, slug: string) {
    return this.get(lang, slug)
  },
}

/**
 * Languages API wrapper
 */
export const languagesAPI = {
  async getAll() {
    const response = await getLanguages({
      client: apiClient,
      headers: {
        'X-Session-Id': getSessionId(),
      },
    })
    const data = response[200]?.data
    return data || null
  },
}

/**
 * Export the API client for direct use in hooks/tests
 */
export { apiClient }
