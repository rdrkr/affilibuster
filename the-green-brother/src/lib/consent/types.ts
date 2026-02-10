// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Consent Types Module
 *
 * Re-exports generated types used by the consent feature for convenience.
 */

export type {
  ConsentAction,
  ConsentCategories,
  ConsentCategoryGetConsentCategoriesResponses,
  ConsentGetConsentResponses,
  ConsentType,
  RecordConsentRequest,
  RecordConsentResponse,
} from '@/lib/generated/types.gen'

/** Cookie name used to store consent preferences. */
export const CONSENT_COOKIE_NAME = 'cc_consent'

/** Cookie expiry in days (1 year). */
export const CONSENT_COOKIE_EXPIRY_DAYS = 365

/**
 * Shape of the consent cookie value stored in the browser.
 */
export interface ConsentCookieValue {
  /** Accepted category UIDs (e.g., ['necessary', 'analytics']). */
  categories: string[]
  /** Timestamp of when consent was given (ISO 8601). */
  timestamp: string
  /** Consent version from CMS. */
  version: string
}
