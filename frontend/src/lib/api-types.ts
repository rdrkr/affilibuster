// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * API Request and Response Union Types
 *
 * These union types provide strong typing for all API operations,
 * matching the backend's CMSRequest/CMSResponse pattern.
 *
 * When adding new endpoints:
 * 1. Import the new *Data and *Responses types from generated/types.gen
 * 2. Add them to the appropriate union type below
 * 3. The apiRequest function will automatically support them
 */

import type {
  AboutGetAboutData,
  AboutGetAboutResponses,
  ContactGetContactData,
  ContactGetContactResponses,
  CurrencyGetCurrenciesData,
  CurrencyGetCurrenciesResponses,
  DetectLanguageData,
  DetectLanguageResponses,
  Error404GetError404Data,
  Error404GetError404Responses,
  Error410GetError410Data,
  Error410GetError410Responses,
  FooterGetFooterData,
  FooterGetFooterResponses,
  GetLanguagesData,
  GetLanguagesResponses,
  GetUserPreferencesData,
  GetUserPreferencesResponses,
  HomepageGetHomepageData,
  HomepageGetHomepageResponses,
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
  UpdateUserPreferencesData,
} from './generated/types.gen'

/**
 * Union type of all API request data types.
 *
 * Each type is a generated *Data type with properties: body, query, headers, path, url.
 * Callers instantiate these types and pass them to apiRequest for type-safe requests.
 */
export type ApiRequest =
  // Language operations
  | GetLanguagesData
  | DetectLanguageData
  // Preferences operations
  | GetUserPreferencesData
  | UpdateUserPreferencesData
  // Currency operations
  | CurrencyGetCurrenciesData
  // Content single-type operations (query params for locale/populate)
  | AboutGetAboutData
  | ContactGetContactData
  | Error404GetError404Data
  | Error410GetError410Data
  | FooterGetFooterData
  | HomepageGetHomepageData
  | NavigationGetNavigationData
  | PrivacyGetPrivacyData
  | ProductPageGetProductPageData
  | TermGetTermData
  // Content collection operations (query params for filters/pagination/sort)
  | ProductGetProductsData

/**
 * Union type of all API response types.
 *
 * These are the actual response body types (the 200 status values from *Responses types).
 * Used for type-safe response deserialization.
 */
export type ApiResponse =
  // Language operations
  | GetLanguagesResponses[200]
  | DetectLanguageResponses[200]
  // Preferences operations
  | GetUserPreferencesResponses[200]
  // Note: UpdateUserPreferencesResponses[200] is identical to GetUserPreferencesResponses[200] (both return UserPreferences)
  // Currency operations
  | CurrencyGetCurrenciesResponses[200]
  // Content single-type operations
  | AboutGetAboutResponses[200]
  | ContactGetContactResponses[200]
  | Error404GetError404Responses[200]
  | Error410GetError410Responses[200]
  | FooterGetFooterResponses[200]
  | HomepageGetHomepageResponses[200]
  | NavigationGetNavigationResponses[200]
  | PrivacyGetPrivacyResponses[200]
  | ProductPageGetProductPageResponses[200]
  | TermGetTermResponses[200]
  // Content collection operations
  | ProductGetProductsResponses[200]

/**
 * Custom error class for API request failures.
 *
 * Thrown by apiRequest when:
 * - Network request fails
 * - Response status is not ok (!response.ok)
 * - Response parsing fails
 */
export class ApiError extends Error {
  /**
   * HTTP status code (if available)
   */
  public readonly status: number | undefined

  /**
   * Original error response (if available)
   */
  public readonly response: Response | undefined

  /**
   * Creates a new API error
   *
   * @param message - Error message
   * @param status - HTTP status code
   * @param response - Original fetch Response object
   */
  constructor(message: string, status?: number, response?: Response) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.response = response
  }
}
