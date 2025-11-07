// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Custom Next.js API Client
 *
 * Replaces the @hey-api/openapi-ts SDK while using only the generated types.
 * Provides type-safe API operations with proper session management and error handling.
 * Compatible with SSG, Server Components, Client Components, Route Handlers, and Middleware.
 */

import type {
  AboutGetAboutData,
  AboutGetAboutResponses,
  ContactGetContactData,
  ContactGetContactResponses,
  Currency,
  CurrencyGetCurrenciesResponses,
  DetectedLanguage,
  DetectLanguageData,
  DetectLanguageResponses,
  Error404GetError404Data,
  Error404GetError404Responses,
  Error410GetError410Data,
  Error410GetError410Responses,
  FooterGetFooterData,
  FooterGetFooterResponses,
  GetLanguagesResponses,
  GetUserPreferencesResponses,
  HomepageGetHomepageData,
  HomepageGetHomepageResponses,
  Language,
  NavigationGetNavigationData,
  NavigationGetNavigationResponses,
  PrivacyGetPrivacyData,
  PrivacyGetPrivacyResponses,
  ProductGetProductsData,
  ProductGetProductsResponses,
  ProductPageGetProductPageData,
  ProductPageGetProductPageResponses,
  TermGetTermData,
  TermGetTermResponses,
  UpdatePreferences,
  UpdateUserPreferencesData,
  UpdateUserPreferencesResponses,
  UserPreferences,
} from './generated/types.gen'
import { ApiError, type ApiRequest, type ApiResponse } from './api-types'

/**
 * Additional options for API requests (method, extra headers).
 *
 * Used alongside the typed ApiRequest parameter.
 */
interface ApiRequestAdditionalOptions {
  /**
   * HTTP method (GET, POST, PUT, etc.)
   */
  method?: string
  /**
   * Additional custom headers to merge with request headers
   */
  headers?: Record<string, string>
}

/**
 * Get base URL for API requests
 * Respects NEXT_PUBLIC_API_URL environment variable
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use NEXT_PUBLIC_API_URL
    return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/v1'
  }
  // Server-side: browser accessible
  /* istanbul ignore next -- SSR code path, tested in production during build/SSR */
  return process.env.NEXT_SERVER_SIDE_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/v1'
}

/**
 * Get session ID from localStorage (client-side only)
 * Returns empty string during SSR/build time
 */
function getSessionId(): string {
  /* istanbul ignore next -- SSR code path, tested in production during build/SSR */
  if (typeof window === 'undefined') {
    return ''
  }

  let sessionId = localStorage.getItem('affilibuster_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now().toString()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem('affilibuster_session_id', sessionId)
  }
  return sessionId
}

/**
 * Serialize query parameters into a query string
 */
function serializeQuery(query?: Record<string, unknown>): string {
  if (!query || Object.keys(query).length === 0) {
    return ''
  }

  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Handle arrays - append each item as separate parameter
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item !== undefined && item !== null) {
            params.append(key, String(item))
          }
        })
      } else if (typeof value === 'object') {
        // Handle objects (non-arrays) - JSON stringify
        params.append(key, JSON.stringify(value))
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        params.append(key, value.toString())
      } else if (typeof value === 'string') {
        params.append(key, value)
      }
      // Skip other types (e.g., symbols, functions) as they shouldn't be in query params
    }
  })

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Make a strongly-typed API request.
 *
 * This function follows the backend repository pattern with:
 * - Strong typing via ApiRequest and ApiResponse constraints
 * - Automatic serialization of query params, request body, and headers
 * - Automatic deserialization of JSON responses
 * - Centralized error handling with ApiError
 *
 * Serialization/deserialization is completely hidden from the caller.
 * Callers instantiate typed request objects and receive typed responses.
 *
 * NOTE: This function is exported primarily for testing purposes. Application
 * code should use the higher-level helper functions (getHomepage, getAbout, etc.)
 * which provide a more ergonomic API.
 *
 * @template T - The expected response type (must extend ApiResponse)
 * @param endpoint - API endpoint path (e.g., '/homepage', '/products')
 * @param request - Typed request data with body/query/headers (ApiRequest instance)
 * @param options - Additional options (method, extra headers)
 * @returns Typed response data
 * @throws {ApiError} When the request fails or response status is not ok
 *
 * @example
 * ```typescript
 * // GET request with query params
 * const request: HomepageGetHomepageData = {
 *   query: { locale: 'en', populate: '*' },
 *   body: undefined,
 *   path: undefined,
 *   url: '/homepage'
 * }
 * const response = await apiRequest<HomepageGetHomepageResponses[200]>('/homepage', request)
 *
 * // POST request with body
 * const request: UpdateUserPreferencesData = {
 *   body: { selectedCurrency: 'EUR' },
 *   headers: { 'X-Session-Id': sessionId },
 *   query: undefined,
 *   path: undefined,
 *   url: '/user/preferences'
 * }
 * const result = await apiRequest<UpdateUserPreferencesResponses[200]>(
 *   '/user/preferences',
 *   request,
 *   { method: 'PUT' }
 * )
 * ```
 */
export async function apiRequest<T extends ApiResponse>(
  endpoint: string,
  request?: ApiRequest,
  options?: ApiRequestAdditionalOptions
): Promise<T> {
  const baseUrl = getBaseUrl()

  // Extract query params from request and serialize (hidden from caller)
  const queryParams = request && 'query' in request ? (request as { query?: Record<string, unknown> }).query : undefined
  const url = `${baseUrl}${endpoint}${serializeQuery(queryParams)}`

  // Build headers: start with defaults, add request headers, add session ID, merge additional headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Add headers from request (hidden extraction)
  if (request && 'headers' in request) {
    Object.assign(headers, (request as { headers: Record<string, string> }).headers)
  }

  // Add session ID for client-side requests
  const sessionId = getSessionId()
  if (sessionId) {
    headers['X-Session-Id'] = sessionId
  }

  // Merge additional headers from options
  if (options?.headers) {
    Object.assign(headers, options.headers)
  }

  const fetchOptions: RequestInit = {
    method: options?.method ?? 'GET',
    headers,
  }

  // Extract and serialize request body to JSON (hidden from caller)
  if (request && 'body' in request) {
    fetchOptions.body = JSON.stringify((request as { body: unknown }).body)
  }

  // Execute request
  const response = await fetch(url, fetchOptions)

  // Handle errors
  if (!response.ok) {
    throw new ApiError(`API request failed: ${response.statusText}`, response.status, response)
  }

  // Deserialize JSON response (hidden from caller)
  const data: unknown = await response.json()
  return data as T
}

/**
 * Language operations
 */

/**
 * Get all supported languages.
 *
 * @returns Array of supported language configurations, or empty array on error
 *
 * @example
 * ```typescript
 * const languages = await getLanguages()
 * languages.forEach(lang => console.log(lang.displayName))
 * ```
 */
export async function getLanguages(): Promise<Language[]> {
  try {
    return await apiRequest<GetLanguagesResponses[200]>('/languages')
  } catch (error) {
    console.error('Failed to fetch languages:', error)
    return []
  }
}

/**
 * Detect user's preferred language from browser headers.
 *
 * Uses Accept-Language header, User-Agent, and optional country code
 * to determine the best language match for the user.
 *
 * @param acceptLanguage - Browser's Accept-Language header value
 * @param userAgent - Optional browser User-Agent string
 * @param countryCode - Optional ISO country code from IP geolocation
 * @returns Detected language with confidence score, or null on error
 *
 * @example
 * ```typescript
 * const detected = await detectLanguage('it-IT,it;q=0.9,en;q=0.8')
 * if (detected && detected.shouldPrompt) {
 *   // Show language switch prompt
 * }
 * ```
 */
export async function detectLanguage(
  acceptLanguage: string,
  userAgent?: string,
  countryCode?: string
): Promise<DetectedLanguage | null> {
  try {
    const request: DetectLanguageData = {
      body: {
        acceptLanguage,
        ...(userAgent !== undefined && { userAgent }),
        ...(countryCode !== undefined && { countryCode }),
      },
      url: '/languages/detect',
    }
    return await apiRequest<DetectLanguageResponses[200]>('/languages/detect', request, { method: 'POST' })
  } catch (error) {
    console.error('Failed to detect language:', error)
    return null
  }
}

/**
 * Preferences operations
 */

/**
 * Get user preferences by session ID
 */
export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    return await apiRequest<GetUserPreferencesResponses[200]>('/user/preferences')
  } catch (error) {
    console.error('Failed to fetch user preferences:', error)
    return null
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(data: Partial<UpdatePreferences>): Promise<UserPreferences | null> {
  try {
    const sessionId = getSessionId()
    const request = {
      body: data,
      headers: {
        'X-Session-Id': sessionId,
      },
      url: '/user/preferences',
    } as UpdateUserPreferencesData
    return await apiRequest<UpdateUserPreferencesResponses[200]>('/user/preferences', request, { method: 'PUT' })
  } catch (error) {
    console.error('Failed to update user preferences:', error)
    return null
  }
}

/**
 * Currency operations
 */

/**
 * Get all active currencies.
 *
 * @returns Array of currency configurations, or empty array on error
 *
 * @example
 * ```typescript
 * const currencies = await getCurrencies()
 * currencies.forEach(curr => console.log(`${curr.code}: ${curr.symbol}`))
 * ```
 */
export async function getCurrencies(): Promise<Currency[]> {
  try {
    const response = await apiRequest<CurrencyGetCurrenciesResponses[200]>('/currencies')
    return response.data
  } catch (error) {
    console.error('Failed to fetch currencies:', error)
    return []
  }
}

/**
 * Content single-type operations
 */

/**
 * Get homepage content
 *
 * @param locale - Optional locale code (e.g., 'en', 'it', 'he') to fetch localized content
 * @param populate - Optional populate parameter for relations/components. Can be '*', a single field, or an array of specific fields
 * @returns The homepage content data or null if the request fails
 */
export async function getHomepage(
  locale?: NonNullable<HomepageGetHomepageData['query']>['locale'],
  populate?: NonNullable<HomepageGetHomepageData['query']>['populate']
): Promise<HomepageGetHomepageResponses[200]['data'] | null> {
  try {
    const request: HomepageGetHomepageData = {
      query: {
        ...(locale !== undefined && { locale }),
        ...(populate !== undefined && { populate }),
      },
      url: '/homepage',
    }
    const response = await apiRequest<HomepageGetHomepageResponses[200]>('/homepage', request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch homepage:', error)
    return null
  }
}

/**
 * Get about page content
 *
 * @param locale - Optional locale code (e.g., 'en', 'it', 'he') to fetch localized content
 * @param populate - Optional populate parameter for relations/components. Can be '*', a single field, or an array of specific fields
 * @returns The about page content data or null if the request fails
 */
export async function getAbout(
  locale?: NonNullable<AboutGetAboutData['query']>['locale'],
  populate?: NonNullable<AboutGetAboutData['query']>['populate']
): Promise<AboutGetAboutResponses[200]['data'] | null> {
  try {
    const request: AboutGetAboutData = {
      query: {
        ...(locale !== undefined && { locale }),
        ...(populate !== undefined && { populate }),
      },
      url: '/about',
    }
    const response = await apiRequest<AboutGetAboutResponses[200]>('/about', request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch about page:', error)
    return null
  }
}

/**
 * Get contact page content
 *
 * @param locale - Optional locale code (e.g., 'en', 'it', 'he') to fetch localized content
 * @param populate - Optional populate parameter for relations/components. Can be '*', a single field, or an array of specific fields
 * @returns The contact page content data or null if the request fails
 */
export async function getContact(
  locale?: NonNullable<ContactGetContactData['query']>['locale'],
  populate?: NonNullable<ContactGetContactData['query']>['populate']
): Promise<ContactGetContactResponses[200]['data'] | null> {
  try {
    const request: ContactGetContactData = {
      query: {
        ...(locale !== undefined && { locale }),
        ...(populate !== undefined && { populate }),
      },
      url: '/contact',
    }
    const response = await apiRequest<ContactGetContactResponses[200]>('/contact', request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch contact page:', error)
    return null
  }
}

/**
 * Get product page content
 *
 * @param locale - Optional locale code (e.g., 'en', 'it', 'he') to fetch localized content
 * @returns The product page content data or null if the request fails
 */
export async function getProductPage(
  locale?: NonNullable<ProductPageGetProductPageData['query']>['locale']
): Promise<ProductPageGetProductPageResponses[200]['data'] | null> {
  try {
    const request: ProductPageGetProductPageData = locale
      ? { query: { locale }, url: '/product-page' }
      : { url: '/product-page' }
    const response = await apiRequest<ProductPageGetProductPageResponses[200]>('/product-page', request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch product page:', error)
    return null
  }
}

/**
 * Get navigation menu content
 *
 * @param locale - Optional locale code (e.g., 'en', 'it', 'he') to fetch localized content
 * @returns The navigation menu content data or null if the request fails
 */
export async function getNavigation(
  locale?: NonNullable<NavigationGetNavigationData['query']>['locale']
): Promise<NavigationGetNavigationResponses[200]['data'] | null> {
  try {
    const request: NavigationGetNavigationData = locale
      ? { query: { locale }, url: '/navigation' }
      : { url: '/navigation' }
    const response = await apiRequest<NavigationGetNavigationResponses[200]>('/navigation', request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch navigation:', error)
    return null
  }
}

/**
 * Get footer content
 *
 * @param locale - Optional locale code (e.g., 'en', 'it', 'he') to fetch localized content
 * @returns The footer content data or null if the request fails
 */
export async function getFooter(
  locale?: NonNullable<FooterGetFooterData['query']>['locale']
): Promise<FooterGetFooterResponses[200]['data'] | null> {
  try {
    const request: FooterGetFooterData = locale ? { query: { locale }, url: '/footer' } : { url: '/footer' }
    const response = await apiRequest<FooterGetFooterResponses[200]>('/footer', request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch footer:', error)
    return null
  }
}

/**
 * Get privacy page content
 *
 * @param locale - Optional locale code (e.g., 'en', 'it', 'he') to fetch localized content
 * @returns The privacy page content data or null if the request fails
 */
export async function getPrivacy(
  locale?: NonNullable<PrivacyGetPrivacyData['query']>['locale']
): Promise<PrivacyGetPrivacyResponses[200]['data'] | null> {
  try {
    const request: PrivacyGetPrivacyData = locale ? { query: { locale }, url: '/privacy' } : { url: '/privacy' }
    const response = await apiRequest<PrivacyGetPrivacyResponses[200]>('/privacy', request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch privacy:', error)
    return null
  }
}

/**
 * Get 404 error page content
 *
 * @param locale - Optional locale code (e.g., 'en', 'it', 'he') to fetch localized content
 * @returns The 404 error page content data or null if the request fails
 */
export async function getError404(
  locale?: NonNullable<Error404GetError404Data['query']>['locale']
): Promise<Error404GetError404Responses[200]['data'] | null> {
  try {
    const request: Error404GetError404Data = locale ? { query: { locale }, url: '/error-404' } : { url: '/error-404' }
    const response = await apiRequest<Error404GetError404Responses[200]>('/error-404', request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch 404 error page:', error)
    return null
  }
}

/**
 * Get 410 error page content
 *
 * @param locale - Optional locale code (e.g., 'en', 'it', 'he') to fetch localized content
 * @returns The 410 error page content data or null if the request fails
 */
export async function getError410(
  locale?: NonNullable<Error410GetError410Data['query']>['locale']
): Promise<Error410GetError410Responses[200]['data'] | null> {
  try {
    const request: Error410GetError410Data = locale ? { query: { locale }, url: '/error-410' } : { url: '/error-410' }
    const response = await apiRequest<Error410GetError410Responses[200]>('/error-410', request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch 410 error page:', error)
    return null
  }
}

/**
 * Get terms of service content
 *
 * @param locale - Optional locale code (e.g., 'en', 'it', 'he') to fetch localized content
 * @returns The terms of service content data or null if the request fails
 */
export async function getTerm(
  locale?: NonNullable<TermGetTermData['query']>['locale']
): Promise<TermGetTermResponses[200]['data'] | null> {
  try {
    const request: TermGetTermData = locale ? { query: { locale }, url: '/term' } : { url: '/term' }
    const response = await apiRequest<TermGetTermResponses[200]>('/term', request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch term:', error)
    return null
  }
}

/**
 * Content collection operations
 */

/**
 * Get products (collection type)
 *
 * @param query - Optional query parameters including locale, filters, pagination, sort, and populate
 * @returns The products data or null if the request fails
 */
export async function getProducts(
  query?: NonNullable<ProductGetProductsData['query']>
): Promise<ProductGetProductsResponses[200] | null> {
  try {
    const request: ProductGetProductsData = query ? { query, url: '/products' } : { url: '/products' }
    return await apiRequest<ProductGetProductsResponses[200]>('/products', request)
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return null
  }
}
