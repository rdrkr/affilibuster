// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unified API Client Barrel File
 *
 * Re-exports all feature-specific API functions and core utilities from their respective modules.
 * This provides a convenient single import point while maintaining proper module separation.
 *
 * Feature modules:
 * - Content API: getHomepage, getAbout, getContact, getProductPage, getNavigation, getFooter, getPrivacy, getError404, getError410, getTerm, getProducts
 * - Language API: getLanguages, detectLanguage
 * - Preferences API: getUserPreferences, updateUserPreferences
 * - Currency API: getCurrencies
 *
 * Core utilities:
 * - apiRequest, getBaseUrl, getSessionId, ApiError
 */

// Core API infrastructure
export { apiRequest, getBaseUrl, getSessionId, ApiError } from './core/client'

// Content API
export {
  getHomepage,
  getAbout,
  getContact,
  getProductPage,
  getNavigation,
  getFooter,
  getPrivacy,
  getError404,
  getError410,
  getTerm,
  getProducts,
} from './content/api'

// Language API
export { getLanguages, detectLanguage } from './language/api'

// Preferences API
export { getUserPreferences, updateUserPreferences } from './preferences/api'

// Currency API
export { getCurrencies } from './currency/api'
