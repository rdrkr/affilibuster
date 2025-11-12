// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Content API Module
 *
 * Provides high-level helper functions for fetching CMS content from the backend API.
 * All functions use the strongly-typed apiRequest() from the core client module.
 *
 * Content types include:
 * - Single types: Homepage, About, Contact, Navigation, Footer, Privacy, Terms, Errors
 * - Collection types: Products
 *
 * All functions handle errors gracefully by returning null on failure and logging errors.
 */

import type {
  AboutGetAboutData,
  AboutGetAboutResponses,
  ContactGetContactData,
  ContactGetContactResponses,
  Error404GetError404Data,
  Error404GetError404Responses,
  Error410GetError410Data,
  Error410GetError410Responses,
  FooterGetFooterData,
  FooterGetFooterResponses,
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
} from '@/lib/generated/types.gen'
import { apiRequest, createApiRequest } from '@/lib/core/client'

/**
 * Content single-type operations
 */

/**
 * Get homepage content
 *
 * @param locale - Optional locale code (e.g., 'en', 'it', 'he') to fetch localized content
 * @param populate - Optional populate parameter for relations/components. Can be '*', a single field, or an array of specific fields
 * @returns The homepage content data or null if the request fails
 */
export async function getHomepage(
  locale?: NonNullable<HomepageGetHomepageData['query']>['locale'],
  populate?: NonNullable<HomepageGetHomepageData['query']>['populate']
): Promise<HomepageGetHomepageResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<HomepageGetHomepageData>('/homepage', {
      query: {
        ...(locale !== undefined && { locale }),
        ...(populate !== undefined && { populate }),
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
 * Get about page content
 *
 * @param locale - Optional locale code (e.g., 'en', 'it', 'he') to fetch localized content
 * @param populate - Optional populate parameter for relations/components. Can be '*', a single field, or an array of specific fields
 * @returns The about page content data or null if the request fails
 */
export async function getAbout(
  locale?: NonNullable<AboutGetAboutData['query']>['locale'],
  populate?: NonNullable<AboutGetAboutData['query']>['populate']
): Promise<AboutGetAboutResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<AboutGetAboutData>('/about', {
      query: {
        ...(locale !== undefined && { locale }),
        ...(populate !== undefined && { populate }),
      },
    })
    const response = await apiRequest<AboutGetAboutResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch about page:', error)
    return null
  }
}

/**
 * Get contact page content
 *
 * @param locale - Optional locale code (e.g., 'en', 'it', 'he') to fetch localized content
 * @param populate - Optional populate parameter for relations/components. Can be '*', a single field, or an array of specific fields
 * @returns The contact page content data or null if the request fails
 */
export async function getContact(
  locale?: NonNullable<ContactGetContactData['query']>['locale'],
  populate?: NonNullable<ContactGetContactData['query']>['populate']
): Promise<ContactGetContactResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<ContactGetContactData>('/contact', {
      query: {
        ...(locale !== undefined && { locale }),
        ...(populate !== undefined && { populate }),
      },
    })
    const response = await apiRequest<ContactGetContactResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch contact page:', error)
    return null
  }
}

/**
 * Get product page content
 *
 * @param locale - Optional locale code (e.g., 'en', 'it', 'he') to fetch localized content
 * @returns The product page content data or null if the request fails
 */
export async function getProductPage(
  locale?: NonNullable<ProductPageGetProductPageData['query']>['locale']
): Promise<ProductPageGetProductPageResponses[200]['data'] | null> {
  try {
    const request = locale
      ? createApiRequest<ProductPageGetProductPageData>('/product-page', { query: { locale } })
      : createApiRequest<ProductPageGetProductPageData>('/product-page', {})
    const response = await apiRequest<ProductPageGetProductPageResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch product page:', error)
    return null
  }
}

/**
 * Get navigation menu content
 *
 * @param locale - Optional locale code (e.g., 'en', 'it', 'he') to fetch localized content
 * @returns The navigation menu content data or null if the request fails
 */
export async function getNavigation(
  locale?: NonNullable<NavigationGetNavigationData['query']>['locale']
): Promise<NavigationGetNavigationResponses[200]['data'] | null> {
  try {
    const request = locale
      ? createApiRequest<NavigationGetNavigationData>('/navigation', { query: { locale } })
      : createApiRequest<NavigationGetNavigationData>('/navigation', {})
    const response = await apiRequest<NavigationGetNavigationResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch navigation:', error)
    return null
  }
}

/**
 * Get footer content
 *
 * @param locale - Optional locale code (e.g., 'en', 'it', 'he') to fetch localized content
 * @returns The footer content data or null if the request fails
 */
export async function getFooter(
  locale?: NonNullable<FooterGetFooterData['query']>['locale']
): Promise<FooterGetFooterResponses[200]['data'] | null> {
  try {
    const request = locale
      ? createApiRequest<FooterGetFooterData>('/footer', { query: { locale } })
      : createApiRequest<FooterGetFooterData>('/footer', {})
    const response = await apiRequest<FooterGetFooterResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch footer:', error)
    return null
  }
}

/**
 * Get privacy page content
 *
 * @param locale - Optional locale code (e.g., 'en', 'it', 'he') to fetch localized content
 * @returns The privacy page content data or null if the request fails
 */
export async function getPrivacy(
  locale?: NonNullable<PrivacyGetPrivacyData['query']>['locale']
): Promise<PrivacyGetPrivacyResponses[200]['data'] | null> {
  try {
    const request = locale
      ? createApiRequest<PrivacyGetPrivacyData>('/privacy', { query: { locale } })
      : createApiRequest<PrivacyGetPrivacyData>('/privacy', {})
    const response = await apiRequest<PrivacyGetPrivacyResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch privacy:', error)
    return null
  }
}

/**
 * Get 404 error page content
 *
 * @param locale - Optional locale code (e.g., 'en', 'it', 'he') to fetch localized content
 * @returns The 404 error page content data or null if the request fails
 */
export async function getError404(
  locale?: NonNullable<Error404GetError404Data['query']>['locale']
): Promise<Error404GetError404Responses[200]['data'] | null> {
  try {
    const request = locale
      ? createApiRequest<Error404GetError404Data>('/error-404', { query: { locale } })
      : createApiRequest<Error404GetError404Data>('/error-404', {})
    const response = await apiRequest<Error404GetError404Responses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch 404 error page:', error)
    return null
  }
}

/**
 * Get 410 error page content
 *
 * @param locale - Optional locale code (e.g., 'en', 'it', 'he') to fetch localized content
 * @returns The 410 error page content data or null if the request fails
 */
export async function getError410(
  locale?: NonNullable<Error410GetError410Data['query']>['locale']
): Promise<Error410GetError410Responses[200]['data'] | null> {
  try {
    const request = locale
      ? createApiRequest<Error410GetError410Data>('/error-410', { query: { locale } })
      : createApiRequest<Error410GetError410Data>('/error-410', {})
    const response = await apiRequest<Error410GetError410Responses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch 410 error page:', error)
    return null
  }
}

/**
 * Get terms of service content
 *
 * @param locale - Optional locale code (e.g., 'en', 'it', 'he') to fetch localized content
 * @returns The terms of service content data or null if the request fails
 */
export async function getTerm(
  locale?: NonNullable<TermGetTermData['query']>['locale']
): Promise<TermGetTermResponses[200]['data'] | null> {
  try {
    const request = locale
      ? createApiRequest<TermGetTermData>('/term', { query: { locale } })
      : createApiRequest<TermGetTermData>('/term', {})
    const response = await apiRequest<TermGetTermResponses[200]>(request)
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
 *
 * @param query - Optional query parameters including locale, filters, pagination, sort, and populate
 * @returns The products data or null if the request fails
 */
export async function getProducts(
  query?: NonNullable<ProductGetProductsData['query']>
): Promise<ProductGetProductsResponses[200] | null> {
  try {
    const request = query
      ? createApiRequest<ProductGetProductsData>('/products', { query })
      : createApiRequest<ProductGetProductsData>('/products', {})
    return await apiRequest<ProductGetProductsResponses[200]>(request)
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return null
  }
}
