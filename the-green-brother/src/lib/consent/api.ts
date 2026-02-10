// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Consent API Module
 *
 * Provides functions for fetching consent page content and categories
 * from the CMS, and recording consent decisions for GDPR compliance.
 */

import { apiRequest, createApiRequest, getBaseUrl, getSessionId } from '@/lib/core/client'
import type {
  ConsentCategoryGetConsentCategoriesData,
  ConsentCategoryGetConsentCategoriesResponses,
  ConsentGetConsentData,
  ConsentGetConsentResponses,
  RecordConsentRequest,
  RecordConsentResponse,
} from '@/lib/generated/types.gen'

/**
 * Fetch consent page content from the CMS.
 *
 * Returns the consent banner text, buttons (accept all, reject all, settings, save),
 * and other CMS-managed content for the cookie consent UI.
 * @param locale - The locale code for localized content (e.g., 'en', 'it', 'he')
 * @returns The consent page data or null if the request fails
 */
export async function getConsentPage(locale: string): Promise<ConsentGetConsentResponses[200] | null> {
  try {
    const request = createApiRequest<ConsentGetConsentData>('/consent', {
      query: {
        locale,
        customPopulate: 'nested',
      },
    })
    return await apiRequest<ConsentGetConsentResponses[200]>(request)
  } catch (error) {
    console.error('Failed to fetch consent page:', error)
    return null
  }
}

/**
 * Fetch consent categories from the CMS.
 *
 * Returns the list of consent category definitions (e.g., necessary, analytics,
 * marketing) with their descriptions, UIDs, and required flags.
 * @param locale - The locale code for localized content (e.g., 'en', 'it', 'he')
 * @returns The consent categories data or null if the request fails
 */
export async function getConsentCategories(
  locale: string
): Promise<ConsentCategoryGetConsentCategoriesResponses[200] | null> {
  try {
    const request = createApiRequest<ConsentCategoryGetConsentCategoriesData>('/consent-categories', {
      query: {
        locale,
        customPopulate: 'nested',
      },
    })
    return await apiRequest<ConsentCategoryGetConsentCategoriesResponses[200]>(request)
  } catch (error) {
    console.error('Failed to fetch consent categories:', error)
    return null
  }
}

/**
 * Record a consent decision for GDPR audit trail.
 *
 * Posts the user's consent choices (accept all, reject all, custom) to the backend
 * for immutable storage. Includes session ID for correlation.
 * @param body - The consent record request containing action, categories, and type
 * @returns The recorded consent response or null if the request fails
 */
export async function recordConsent(body: RecordConsentRequest): Promise<RecordConsentResponse | null> {
  try {
    const baseUrl = getBaseUrl()
    const sessionId = getSessionId()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (sessionId) {
      headers['X-Session-Id'] = sessionId
    }

    const response = await fetch(`${baseUrl}/consent`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Failed to record consent: ${response.statusText}`)
    }

    return (await response.json()) as RecordConsentResponse
  } catch (error) {
    console.error('Failed to record consent:', error)
    return null
  }
}
