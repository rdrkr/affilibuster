// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Centralized Type Exports
 *
 * Re-exports and derives commonly used types from generated OpenAPI types
 * for convenient importing across the application.
 */

// Re-export common types from generated types
export type {
  Language,
  DetectedLanguage,
  UserPreferences,
  UpdatePreferences,
  SeoMetadata,
  UrlData,
  ContentSummary,
  Pagination,
  ContentResponse,
  ContentListResponse,
  UiFeatureItemEntry,
  UiFeatureCardEntry,
  UiTrustCardEntry,
  UiContactCardEntry,
} from './generated/types.gen'

// Import enums from generated types
import { CodeEnum, DirectionEnum, TypeEnum, CurrencyCode as CurrencyCodeEnum } from './generated/types.gen'

/**
 * Language code enum - alias for OpenAPI generated CodeEnum.
 * Use this enum for type-safe language code operations.
 *
 * @example
 * ```typescript
 * const code = LanguageCode.EN
 * ```
 */
export const LanguageCode = CodeEnum

/**
 * Language code type for type annotations.
 */
export type LanguageCode = CodeEnum

/**
 * Text direction enum - alias for OpenAPI generated DirectionEnum.
 * Use this enum for type-safe direction operations.
 *
 * @example
 * ```typescript
 * const direction = Direction.LTR
 * ```
 */
export const Direction = DirectionEnum

/**
 * Direction type for type annotations.
 */
export type Direction = DirectionEnum

/**
 * Content type enum - alias for OpenAPI generated TypeEnum.
 * Use this enum for type-safe content type operations.
 *
 * @example
 * ```typescript
 * const type = ContentType.PRODUCT
 * ```
 */
export const ContentType = TypeEnum

/**
 * Content type for type annotations.
 */
export type ContentType = TypeEnum

/**
 * Currency code enum - alias for OpenAPI generated CurrencyCode.
 * Use this enum for type-safe currency operations.
 *
 * @example
 * ```typescript
 * const currency = CurrencyCode.USD
 * ```
 */
export const CurrencyCode = CurrencyCodeEnum

/**
 * Currency code type for type annotations.
 */
export type CurrencyCode = CurrencyCodeEnum

/**
 * Array of all supported language codes.
 * Derived from LanguageCode enum using Object.values().
 * This is the single source of truth for language validation.
 */
export const SUPPORTED_LANGUAGE_CODES = Object.values(LanguageCode)

/**
 * Default language code used as fallback.
 */
export const DEFAULT_LANGUAGE_CODE = LanguageCode.EN

/**
 * Map of language codes to their text direction.
 * Hebrew is right-to-left, all others are left-to-right.
 */
export const LANGUAGE_DIRECTION_MAP: Record<LanguageCode, Direction> = {
  [LanguageCode.EN]: Direction.LTR,
  [LanguageCode.IT]: Direction.LTR,
  [LanguageCode.HE]: Direction.RTL,
} as const

/**
 * Check if a string is a valid language code.
 *
 * @param value - The value to check
 * @returns True if the value is a valid language code
 *
 * @example
 * ```typescript
 * if (isLanguageCode('en')) {
 *   // value is typed as LanguageCode
 * }
 * ```
 */
export function isLanguageCode(value: string): value is LanguageCode {
  return SUPPORTED_LANGUAGE_CODES.includes(value as LanguageCode)
}

/**
 * Get the text direction for a language code.
 *
 * @param code - The language code
 * @returns The text direction
 *
 * @example
 * ```typescript
 * const direction = getDirectionForLanguage(LanguageCode.HE) // Direction.RTL
 * ```
 */
export function getDirectionForLanguage(code: LanguageCode): Direction {
  return LANGUAGE_DIRECTION_MAP[code]
}

// Extract Currency type from CurrencyGetCurrenciesResponses
// The Currency type is the element type of the data array in the 200 response
import type { CurrencyGetCurrenciesResponses, ProductGetProductsResponses } from './generated/types.gen'

/**
 * Currency type - extracted from API response array
 */
export type Currency = CurrencyGetCurrenciesResponses[200]['data'][number]

/**
 * Product type - extracted from ProductGetProductsResponses array
 * Represents a single product item from the API
 */
export type Product = ProductGetProductsResponses[200]['data'][number]

// Extract Navigation type from response
export type { ApiNavigationNavigationDocument } from './generated/types.gen'

import type { ApiNavigationNavigationDocument } from './generated/types.gen'

/**
 * Navigation type - the actual navigation content structure
 * This represents the navigation content from the CMS
 */
export type Navigation = Omit<
  ApiNavigationNavigationDocument,
  'documentId' | 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'locale' | 'localizations'
>

// Extract Footer type from response
export type { ApiFooterFooterDocument } from './generated/types.gen'

import type { ApiFooterFooterDocument } from './generated/types.gen'

/**
 * Footer type - the actual footer content structure
 * This represents the footer content from the CMS
 */
export type Footer = Omit<
  ApiFooterFooterDocument,
  'documentId' | 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'locale' | 'localizations'
>

// Export response types for API operations
export type {
  GetLanguagesResponses,
  DetectLanguageResponses,
  GetUserPreferencesResponses,
  UpdateUserPreferencesResponses,
  CurrencyGetCurrenciesResponses,
  HomepageGetHomepageResponses,
  AboutGetAboutResponses,
  ContactGetContactResponses,
  ProductPageGetProductPageResponses,
  NavigationGetNavigationResponses,
  FooterGetFooterResponses,
  PrivacyGetPrivacyResponses,
  TermGetTermResponses,
  Error404GetError404Responses,
  Error410GetError410Responses,
  ProductGetProductsResponses,
} from './generated/types.gen'
