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
