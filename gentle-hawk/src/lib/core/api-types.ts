// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * GentleHawk API Types
 *
 * Defines GentleHawk-specific ApiRequest and ApiResponse union types.
 * These constrain the generic shared client to only the endpoints
 * this frontend actually uses.
 *
 * Re-exports shared ApiError from the frontend package.
 */

export { ApiError } from '@affilibuster/frontend/lib/core/api-types'

import type { RecordConsentData } from '@/lib/consent/types'
import type {
  ConsentCategoryGetConsentCategoriesData,
  ConsentCategoryGetConsentCategoriesResponses,
  ConsentGetConsentData,
  ConsentGetConsentResponses,
  Error404GetError404Data,
  Error404GetError404Responses,
  FooterGetFooterData,
  FooterGetFooterResponses,
  GetLanguagesData,
  GetLanguagesResponses,
  HomepageGetHomepageData,
  HomepageGetHomepageResponses,
  NavigationGetNavigationData,
  NavigationGetNavigationResponses,
  RecordConsentResponse,
  ThemeGetThemesByIdData,
  ThemeGetThemesByIdResponses,
  ThemeGetThemesData,
  ThemeGetThemesResponses,
} from '@/lib/generated/types.gen'

/**
 * Union of all API request types used by GentleHawk.
 * Includes types needed by shared `@affilibuster/frontend` modules
 * (consent, themes) in addition to GentleHawk-specific endpoints.
 */
export type ApiRequest =
  | HomepageGetHomepageData
  | NavigationGetNavigationData
  | FooterGetFooterData
  | GetLanguagesData
  | Error404GetError404Data
  | ConsentGetConsentData
  | ConsentCategoryGetConsentCategoriesData
  | RecordConsentData
  | ThemeGetThemesData
  | ThemeGetThemesByIdData

/**
 * Union of all API response types used by GentleHawk.
 * Corresponds to the ApiRequest union above.
 */
export type ApiResponse =
  | HomepageGetHomepageResponses[200]
  | NavigationGetNavigationResponses[200]
  | FooterGetFooterResponses[200]
  | GetLanguagesResponses[200]
  | Error404GetError404Responses[200]
  | ConsentGetConsentResponses[200]
  | ConsentCategoryGetConsentCategoriesResponses[200]
  | RecordConsentResponse
  | ThemeGetThemesResponses[200]
  | ThemeGetThemesByIdResponses[200]
