// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Custom Next.js API Client
 *
 * Replaces the @hey-api/openapi-ts SDK while using only the generated types.
 * Provides type-safe API operations with proper session management and error handling.
 * Compatible with SSG, Server Components, Client Components, Route Handlers, and Middleware.
 */

import type {
  AboutGetAboutResponses,
  ContactGetContactResponses,
  Currency,
  CurrencyGetCurrenciesResponses,
  DetectedLanguage,
  DetectLanguageResponses,
  Error404GetError404Responses,
  Error410GetError410Responses,
  FooterGetFooterResponses,
  GetLanguagesResponses,
  GetUserPreferencesResponses,
  HomepageGetHomepageResponses,
  Language,
  NavigationGetNavigationResponses,
  PrivacyGetPrivacyResponses,
  ProductGetProductsResponses,
  ProductPageGetProductPageResponses,
  TermGetTermResponses,
  UpdatePreferences,
  UpdateUserPreferencesResponses,
  UserPreferences,
} from './generated/types.gen'

/**
 * Options for API requests
 */
interface RequestOptions {
  method?: string
  headers?: Record<string, string>
  body?: unknown
  query?: Record<string, unknown>
}

/**
 * Get base URL for API requests
 * Respects NEXT_PUBLIC_API_URL environment variable
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use NEXT_PUBLIC_API_URL
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1'
  }
  // Server-side: browser accessible
  return process.env.NEXT_SERVER_SIDE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1'
}

/**
 * Get session ID from localStorage (client-side only)
 * Returns empty string during SSR/build time
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
 * Serialize query parameters into a query string
 */
function serializeQuery(query?: Record<string, unknown>): string {
  if (!query || Object.keys(query).length === 0) {
    return ''
  }

  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  })

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Make a type-safe API request
 */
async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}${endpoint}${serializeQuery(options.query)}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Add session ID for client-side requests
  const sessionId = getSessionId()
  if (sessionId) {
    headers['X-Session-Id'] = sessionId
  }

  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers,
  }

  if (options.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, fetchOptions)

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data as T
}

/**
 * Language operations
 */

/**
 * Get all supported languages
 */
export async function getLanguages(): Promise<Language[]> {
  return await apiRequest<GetLanguagesResponses[200]>('/languages', {})
}

/**
 * Detect user's preferred language
 */
export async function detectLanguage(
  acceptLanguage: string,
  userAgent?: string,
  countryCode?: string
): Promise<DetectedLanguage> {
  return await apiRequest<DetectLanguageResponses[200]>('/languages/detect', {
    method: 'POST',
    body: {
      acceptLanguage,
      userAgent,
      countryCode,
    },
  })
}

/**
 * Preferences operations
 */

/**
 * Get user preferences by session ID
 */
export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    return await apiRequest<GetUserPreferencesResponses[200]>('/user/preferences', {})
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
    return await apiRequest<UpdateUserPreferencesResponses[200]>('/user/preferences', {
      method: 'PUT',
      body: data,
    })
  } catch (error) {
    console.error('Failed to update user preferences:', error)
    return null
  }
}

/**
 * Currency operations
 */

/**
 * Get all active currencies
 */
export async function getCurrencies(): Promise<Currency[]> {
  const response = await apiRequest<CurrencyGetCurrenciesResponses[200]>('/currencies', {})
  return response.data
}

/**
 * Content single-type operations
 */

/**
 * Get homepage content
 */
export async function getHomepage() {
  try {
    const response = await apiRequest<HomepageGetHomepageResponses[200]>('/homepage', {})
    return response.data
  } catch (error) {
    console.error('Failed to fetch homepage:', error)
    return null
  }
}

/**
 * Get about page content
 */
export async function getAbout() {
  try {
    const response = await apiRequest<AboutGetAboutResponses[200]>('/about', {})
    return response.data
  } catch (error) {
    console.error('Failed to fetch about page:', error)
    return null
  }
}

/**
 * Get contact page content
 */
export async function getContact() {
  try {
    const response = await apiRequest<ContactGetContactResponses[200]>('/contact', {})
    return response.data
  } catch (error) {
    console.error('Failed to fetch contact page:', error)
    return null
  }
}

/**
 * Get product page content
 */
export async function getProductPage() {
  try {
    const response = await apiRequest<ProductPageGetProductPageResponses[200]>('/product-page', {})
    return response.data
  } catch (error) {
    console.error('Failed to fetch product page:', error)
    return null
  }
}

/**
 * Get navigation menu content
 */
export async function getNavigation() {
  try {
    const response = await apiRequest<NavigationGetNavigationResponses[200]>('/navigation', {})
    return response.data
  } catch (error) {
    console.error('Failed to fetch navigation:', error)
    return null
  }
}

/**
 * Get footer content
 */
export async function getFooter() {
  try {
    const response = await apiRequest<FooterGetFooterResponses[200]>('/footer', {})
    return response.data
  } catch (error) {
    console.error('Failed to fetch footer:', error)
    return null
  }
}

/**
 * Get privacy page content
 */
export async function getPrivacy() {
  try {
    const response = await apiRequest<PrivacyGetPrivacyResponses[200]>('/privacy', {})
    return response.data
  } catch (error) {
    console.error('Failed to fetch privacy:', error)
    return null
  }
}

/**
 * Get 404 error page content
 */
export async function getError404() {
  try {
    const response = await apiRequest<Error404GetError404Responses[200]>('/error-404', {})
    return response.data
  } catch (error) {
    console.error('Failed to fetch 404 error page:', error)
    return null
  }
}

/**
 * Get 410 error page content
 */
export async function getError410() {
  try {
    const response = await apiRequest<Error410GetError410Responses[200]>('/error-410', {})
    return response.data
  } catch (error) {
    console.error('Failed to fetch 410 error page:', error)
    return null
  }
}

/**
 * Get terms of service content
 */
export async function getTerm() {
  try {
    const response = await apiRequest<TermGetTermResponses[200]>('/term', {})
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
 */
export async function getProducts(query?: Record<string, unknown>): Promise<ProductGetProductsResponses[200] | null> {
  try {
    return await apiRequest<ProductGetProductsResponses[200]>('/products', {
      query,
    })
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return null
  }
}
