// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Content API Module
 *
 * Provides high-level helper functions for fetching CMS content from the backend API.
 * GentleHawk uses a minimal subset of the content types — homepage, navigation, footer, and error pages.
 */

import { apiRequest, createApiRequest } from '@/lib/core/client'

import type {
  Error404GetError404Data,
  Error404GetError404Responses,
  FooterGetFooterData,
  FooterGetFooterResponses,
  HomepageGetHomepageData,
  HomepageGetHomepageResponses,
  NavigationGetNavigationData,
  NavigationGetNavigationResponses,
} from '@/lib/generated/types.gen'

/**
 * Get homepage content from CMS.
 * @param locale - Optional locale code to fetch localized content
 * @param params - Additional query parameters (excluding locale and customPopulate)
 * @returns The homepage content data or null if the request fails
 */
export async function getHomepage(
  locale?: NonNullable<HomepageGetHomepageData['query']>['locale'],
  params?: Omit<NonNullable<HomepageGetHomepageData['query']>, 'locale' | 'customPopulate'>
): Promise<HomepageGetHomepageResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<HomepageGetHomepageData>('/homepage', {
      query: {
        ...(locale !== undefined && { locale }),
        customPopulate: 'nested',
        ...params,
      },
    })
    const response = await apiRequest<HomepageGetHomepageResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch homepage:', error)
    return null
  }
}

/**
 * Get navigation content from CMS.
 * @param locale - Optional locale code to fetch localized navigation
 * @returns The navigation content data or null if the request fails
 */
export async function getNavigation(
  locale?: NonNullable<NavigationGetNavigationData['query']>['locale']
): Promise<NavigationGetNavigationResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<NavigationGetNavigationData>('/navigation', {
      query: {
        ...(locale !== undefined && { locale }),
        customPopulate: 'nested',
      },
    })
    const response = await apiRequest<NavigationGetNavigationResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch navigation:', error)
    return null
  }
}

/**
 * Get footer content from CMS.
 * @param locale - Optional locale code to fetch localized footer
 * @returns The footer content data or null if the request fails
 */
export async function getFooter(
  locale?: NonNullable<FooterGetFooterData['query']>['locale']
): Promise<FooterGetFooterResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<FooterGetFooterData>('/footer', {
      query: {
        ...(locale !== undefined && { locale }),
        customPopulate: 'nested',
      },
    })
    const response = await apiRequest<FooterGetFooterResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch footer:', error)
    return null
  }
}

/**
 * Get 404 error page content from CMS.
 * @param locale - Optional locale code to fetch localized error page
 * @returns The 404 error page data or null if the request fails
 */
export async function getError404(
  locale?: NonNullable<Error404GetError404Data['query']>['locale']
): Promise<Error404GetError404Responses[200]['data'] | null> {
  try {
    const request = createApiRequest<Error404GetError404Data>('/error-404', {
      query: {
        ...(locale !== undefined && { locale }),
        customPopulate: 'nested',
      },
    })
    const response = await apiRequest<Error404GetError404Responses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch 404 page:', error)
    return null
  }
}
