// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * API Types generated from OpenAPI contract
 * Source: specs/001-core-platform-setup/contracts/api-v1.yaml
 */

export type LanguageCode = 'en' | 'it' | 'he'
export type CurrencyCode = 'USD' | 'EUR' | 'ILS' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY'
export type Direction = 'ltr' | 'rtl'
export type ContentType = 'page' | 'product' | 'article'
export type ContentStatus = 'draft' | 'published' | 'archived'

/**
 * Language configuration
 */
export interface Language {
  code: LanguageCode
  displayName: string
  nativeName: string
  direction: Direction
  urlPrefix: string
  defaultCurrency: CurrencyCode
  localeCode: string
  isDefault: boolean
  isActive: boolean
  sortOrder: number
}

/**
 * Detected language from request
 */
export interface DetectedLanguage {
  detected: LanguageCode
  preferred: LanguageCode
  urlLanguage?: LanguageCode
  browserLanguages: LanguageCode[]
  fallback: LanguageCode
}

/**
 * Currency configuration
 */
export interface Currency {
  code: CurrencyCode
  symbol: string
  symbolPosition: 'before' | 'after'
  decimalSeparator: string
  thousandsSeparator: string
  decimalPlaces: number
  displayName: string
}

/**
 * Currency conversion result
 */
export interface ConvertedCurrency {
  amount: number
  fromCurrency: CurrencyCode
  toCurrency: CurrencyCode
  rate: number
  convertedAmount: number
  timestamp: string
}

/**
 * Full content response
 */
export interface ContentResponse {
  id: string
  type: ContentType
  slug: string
  language: LanguageCode
  title: string
  content: string
  excerpt?: string
  seo: SEOMetadata
  urls: URLData
  status: ContentStatus
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

/**
 * SEO metadata
 */
export interface SEOMetadata {
  title: string
  description: string
  keywords: string[]
  ogImage?: string
  canonicalUrl: string
}

/**
 * URL data for content
 */
export interface URLData {
  canonical: string
  alternates: Record<LanguageCode, string>
  current: string
  languagePrefix: string
}

/**
 * Content list response with pagination
 */
export interface ContentListResponse {
  data: ContentSummary[]
  pagination: Pagination
}

/**
 * Content summary for list views
 */
export interface ContentSummary {
  id: string
  type: ContentType
  slug: string
  language: LanguageCode
  title: string
  excerpt?: string
  status: ContentStatus
  publishedAt?: string
  updatedAt: string
}

/**
 * Pagination metadata
 */
export interface Pagination {
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrevious: boolean
}

/**
 * User preferences
 */
export interface UserPreferences {
  language: LanguageCode
  currency: CurrencyCode
  consentGiven: boolean
  consentTimestamp?: string
  sessionId: string
  createdAt: string
  updatedAt: string
}

/**
 * Update preferences request
 */
export interface UpdatePreferences {
  language?: LanguageCode
  currency?: CurrencyCode
  consentGiven?: boolean
}

/**
 * Error response
 */
export interface ErrorResponse {
  error: string
  message: string
  code?: string
  details?: Record<string, unknown>
  timestamp: string
}
