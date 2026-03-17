// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Content API Module
 *
 * Provides high-level helper functions for fetching CMS content from the backend API.
 * All functions use the strongly-typed apiRequest() from the core client module.
 *
 * Content types include:
 * - Single types: Homepage, About, Contact, Navigation, Footer, Privacy, Terms, Errors, FAQ, AuthPage, Blog, Profile
 * - Collection types: Products, ProductCategories, BlogPosts, Authors, Currencies
 * - Upload types: Files
 *
 * All functions handle errors gracefully by returning null on failure and logging errors.
 */

import { apiRequest, createApiRequest } from '@/lib/core/client'

import type {
  AboutGetAboutData,
  AboutGetAboutResponses,
  ApiContributorContributorDocument,
  AuthPageGetAuthPageData,
  AuthPageGetAuthPageResponses,
  BlogGetBlogData,
  BlogGetBlogResponses,
  BlogPostGetBlogPostsBySlugData,
  BlogPostGetBlogPostsBySlugResponses,
  BlogPostGetBlogPostsData,
  BlogPostGetBlogPostsResponses,
  ContactUsGetContactUsData,
  ContactUsGetContactUsResponses,
  ContributorGetContributorsBySlugData,
  ContributorGetContributorsBySlugResponses,
  ContributorGetContributorsData,
  ContributorGetContributorsResponses,
  CookiePolicyGetCookiePolicyData,
  CookiePolicyGetCookiePolicyResponses,
  CurrencyGetCurrenciesData,
  CurrencyGetCurrenciesResponses,
  Error404GetError404Data,
  Error404GetError404Responses,
  Error410GetError410Data,
  Error410GetError410Responses,
  FaqGetFaqData,
  FaqGetFaqResponses,
  FooterGetFooterData,
  FooterGetFooterResponses,
  HomepageGetHomepageData,
  HomepageGetHomepageResponses,
  NavigationGetNavigationData,
  NavigationGetNavigationResponses,
  PrivacyGetPrivacyData,
  PrivacyGetPrivacyResponses,
  ProductCategoriesPageGetProductCategoriesPageData,
  ProductCategoriesPageGetProductCategoriesPageResponses,
  ProductCategoryGetProductCategoriesBySlugData,
  ProductCategoryGetProductCategoriesBySlugResponses,
  ProductCategoryGetProductCategoriesData,
  ProductCategoryGetProductCategoriesResponses,
  ProductGetProductsBySlugData,
  ProductGetProductsBySlugResponses,
  ProductGetProductsData,
  ProductGetProductsResponses,
  ProfileGetProfileData,
  ProfileGetProfileResponses,
  TermGetTermData,
  TermGetTermResponses,
  UploadGetUploadFilesByIdData,
  UploadGetUploadFilesByIdResponses,
  UploadGetUploadFilesData,
  UploadGetUploadFilesResponses,
} from '@/lib/generated/types.gen'

/**
 * Content single-type operations
 */

/**
 * Get homepage content
 * @param locale - Optional locale code (e.g., LanguageCode.EN, LanguageCode.IT, LanguageCode.HE) to fetch localized content
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
 * Get about page content
 * @param locale - Optional locale code (e.g., LanguageCode.EN, LanguageCode.IT, LanguageCode.HE) to fetch localized content
 * @param params - Additional query parameters (excluding locale and customPopulate)
 * @returns The about page content data or null if the request fails
 */
export async function getAbout(
  locale?: NonNullable<AboutGetAboutData['query']>['locale'],
  params?: Omit<NonNullable<AboutGetAboutData['query']>, 'locale' | 'customPopulate'>
): Promise<AboutGetAboutResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<AboutGetAboutData>('/about', {
      query: {
        ...(locale !== undefined && { locale }),
        customPopulate: 'nested',
        ...params,
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
 * Get contact us page content
 * @param locale - Optional locale code (e.g., LanguageCode.EN, LanguageCode.IT, LanguageCode.HE) to fetch localized content
 * @param params - Additional query parameters (excluding locale and customPopulate)
 * @returns The contact us page content data or null if the request fails
 */
export async function getContactUs(
  locale?: NonNullable<ContactUsGetContactUsData['query']>['locale'],
  params?: Omit<NonNullable<ContactUsGetContactUsData['query']>, 'locale' | 'customPopulate'>
): Promise<ContactUsGetContactUsResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<ContactUsGetContactUsData>('/contact-us', {
      query: {
        ...(locale !== undefined && { locale }),
        customPopulate: 'nested',
        ...params,
      },
    })
    const response = await apiRequest<ContactUsGetContactUsResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch contact us page:', error)
    return null
  }
}

/**
 * Get cookie policy page content
 * @param locale - Optional locale code (e.g., LanguageCode.EN, LanguageCode.IT, LanguageCode.HE) to fetch localized content
 * @param params - Additional query parameters (excluding locale and customPopulate)
 * @returns The cookie policy page content data or null if the request fails
 */
export async function getCookiePolicy(
  locale?: NonNullable<CookiePolicyGetCookiePolicyData['query']>['locale'],
  params?: Omit<NonNullable<CookiePolicyGetCookiePolicyData['query']>, 'locale' | 'customPopulate'>
): Promise<CookiePolicyGetCookiePolicyResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<CookiePolicyGetCookiePolicyData>('/cookie-policy', {
      query: {
        ...(locale !== undefined && { locale }),
        customPopulate: 'nested',
        ...params,
      },
    })
    const response = await apiRequest<CookiePolicyGetCookiePolicyResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch cookie policy:', error)
    return null
  }
}

/**
 * Get auth page content
 * @param locale - Optional locale code (e.g., LanguageCode.EN, LanguageCode.IT, LanguageCode.HE) to fetch localized content
 * @param params - Additional query parameters (excluding locale and customPopulate)
 * @returns The auth page content data or null if the request fails
 */
export async function getAuthPage(
  locale?: NonNullable<AuthPageGetAuthPageData['query']>['locale'],
  params?: Omit<NonNullable<AuthPageGetAuthPageData['query']>, 'locale' | 'customPopulate'>
): Promise<AuthPageGetAuthPageResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<AuthPageGetAuthPageData>('/auth-page', {
      query: {
        ...(locale !== undefined && { locale }),
        customPopulate: 'nested',
        ...params,
      },
    })
    const response = await apiRequest<AuthPageGetAuthPageResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch auth page:', error)
    return null
  }
}

/**
 * Get blog page content
 * @param locale - Optional locale code (e.g., LanguageCode.EN, LanguageCode.IT, LanguageCode.HE) to fetch localized content
 * @param params - Additional query parameters (excluding locale and customPopulate)
 * @returns The blog page content data or null if the request fails
 */
export async function getBlog(
  locale?: NonNullable<BlogGetBlogData['query']>['locale'],
  params?: Omit<NonNullable<BlogGetBlogData['query']>, 'locale' | 'customPopulate'>
): Promise<BlogGetBlogResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<BlogGetBlogData>('/blog', {
      query: {
        ...(locale !== undefined && { locale }),
        customPopulate: 'nested',
        ...params,
      },
    })
    const response = await apiRequest<BlogGetBlogResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch blog page:', error)
    return null
  }
}

/**
 * Get product categories page content
 * @param locale - Optional locale code (e.g., LanguageCode.EN, LanguageCode.IT, LanguageCode.HE) to fetch localized content
 * @param params - Additional query parameters (excluding locale and customPopulate)
 * @returns The product categories page content data or null if the request fails
 */
export async function getProductCategoriesPage(
  locale?: NonNullable<ProductCategoriesPageGetProductCategoriesPageData['query']>['locale'],
  params?: Omit<NonNullable<ProductCategoriesPageGetProductCategoriesPageData['query']>, 'locale' | 'customPopulate'>
): Promise<ProductCategoriesPageGetProductCategoriesPageResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<ProductCategoriesPageGetProductCategoriesPageData>('/product-categories-page', {
      query: {
        ...(locale !== undefined && { locale }),
        customPopulate: 'nested',
        ...params,
      },
    })
    const response = await apiRequest<ProductCategoriesPageGetProductCategoriesPageResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch product categories page:', error)
    return null
  }
}

/**
 * Get profile page content
 * @param locale - Optional locale code (e.g., LanguageCode.EN, LanguageCode.IT, LanguageCode.HE) to fetch localized content
 * @param params - Additional query parameters (excluding locale and customPopulate)
 * @returns The profile page content data or null if the request fails
 */
export async function getProfile(
  locale?: NonNullable<ProfileGetProfileData['query']>['locale'],
  params?: Omit<NonNullable<ProfileGetProfileData['query']>, 'locale' | 'customPopulate'>
): Promise<ProfileGetProfileResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<ProfileGetProfileData>('/profile', {
      query: {
        ...(locale !== undefined && { locale }),
        customPopulate: 'nested',
        ...params,
      },
    })
    const response = await apiRequest<ProfileGetProfileResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch profile page:', error)
    return null
  }
}

/**
 * Get navigation menu content
 *
 * Uses auto-generated deep populate configuration from populate.gen.ts.
 * The populate structure is generated at build-time by analyzing TypeScript types.
 * @param locale - Optional locale code (e.g., LanguageCode.EN, LanguageCode.IT, LanguageCode.HE) to fetch localized content
 * @param params - Additional query parameters (excluding locale and customPopulate)
 * @returns The navigation menu content data or null if the request fails
 */
export async function getNavigation(
  locale?: NonNullable<NavigationGetNavigationData['query']>['locale'],
  params?: Omit<NonNullable<NavigationGetNavigationData['query']>, 'locale' | 'customPopulate'>
): Promise<NavigationGetNavigationResponses[200]['data'] | null> {
  try {
    const query = {
      ...(locale && { locale }),
      customPopulate: 'nested',
      ...params,
    }

    const request = createApiRequest<NavigationGetNavigationData>('/navigation', { query })
    const response = await apiRequest<NavigationGetNavigationResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch navigation:', error)
    return null
  }
}

/**
 * Get footer content
 * @param locale - Optional locale code (e.g., LanguageCode.EN, LanguageCode.IT, LanguageCode.HE) to fetch localized content
 * @param params - Additional query parameters (excluding locale and customPopulate)
 * @returns The footer content data or null if the request fails
 */
export async function getFooter(
  locale?: NonNullable<FooterGetFooterData['query']>['locale'],
  params?: Omit<NonNullable<FooterGetFooterData['query']>, 'locale' | 'customPopulate'>
): Promise<FooterGetFooterResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<FooterGetFooterData>('/footer', {
      query: {
        ...(locale !== undefined && { locale }),
        customPopulate: 'nested',
        ...params,
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
 * Get privacy page content
 * @param locale - Optional locale code (e.g., LanguageCode.EN, LanguageCode.IT, LanguageCode.HE) to fetch localized content
 * @param params - Additional query parameters (excluding locale and customPopulate)
 * @returns The privacy page content data or null if the request fails
 */
export async function getPrivacy(
  locale?: NonNullable<PrivacyGetPrivacyData['query']>['locale'],
  params?: Omit<NonNullable<PrivacyGetPrivacyData['query']>, 'locale' | 'customPopulate'>
): Promise<PrivacyGetPrivacyResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<PrivacyGetPrivacyData>('/privacy', {
      query: {
        ...(locale !== undefined && { locale }),
        customPopulate: 'nested',
        ...params,
      },
    })
    const response = await apiRequest<PrivacyGetPrivacyResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch privacy:', error)
    return null
  }
}

/**
 * Get terms of service content
 * @param locale - Optional locale code (e.g., LanguageCode.EN, LanguageCode.IT, LanguageCode.HE) to fetch localized content
 * @param params - Additional query parameters (excluding locale and customPopulate)
 * @returns The terms of service content data or null if the request fails
 */
export async function getTerm(
  locale?: NonNullable<TermGetTermData['query']>['locale'],
  params?: Omit<NonNullable<TermGetTermData['query']>, 'locale' | 'customPopulate'>
): Promise<TermGetTermResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<TermGetTermData>('/term', {
      query: {
        ...(locale !== undefined && { locale }),
        customPopulate: 'nested',
        ...params,
      },
    })
    const response = await apiRequest<TermGetTermResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch term:', error)
    return null
  }
}

/**
 * Get 404 error page content
 * @param locale - Optional locale code (e.g., LanguageCode.EN, LanguageCode.IT, LanguageCode.HE) to fetch localized content
 * @param params - Additional query parameters (excluding locale and customPopulate)
 * @returns The 404 error page content data or null if the request fails
 */
export async function getError404(
  locale?: NonNullable<Error404GetError404Data['query']>['locale'],
  params?: Omit<NonNullable<Error404GetError404Data['query']>, 'locale' | 'customPopulate'>
): Promise<Error404GetError404Responses[200]['data'] | null> {
  try {
    const request = createApiRequest<Error404GetError404Data>('/error-404', {
      query: {
        ...(locale !== undefined && { locale }),
        customPopulate: 'nested',
        ...params,
      },
    })
    const response = await apiRequest<Error404GetError404Responses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch 404 error page:', error)
    return null
  }
}

/**
 * Get 410 error page content
 * @param locale - Optional locale code (e.g., LanguageCode.EN, LanguageCode.IT, LanguageCode.HE) to fetch localized content
 * @param params - Additional query parameters (excluding locale and customPopulate)
 * @returns The 410 error page content data or null if the request fails
 */
export async function getError410(
  locale?: NonNullable<Error410GetError410Data['query']>['locale'],
  params?: Omit<NonNullable<Error410GetError410Data['query']>, 'locale' | 'customPopulate'>
): Promise<Error410GetError410Responses[200]['data'] | null> {
  try {
    const request = createApiRequest<Error410GetError410Data>('/error-410', {
      query: {
        ...(locale !== undefined && { locale }),
        customPopulate: 'nested',
        ...params,
      },
    })
    const response = await apiRequest<Error410GetError410Responses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch 410 error page:', error)
    return null
  }
}

/**
 * Get FAQ page content
 * @param locale - Optional locale code (e.g., LanguageCode.EN, LanguageCode.IT, LanguageCode.HE) to fetch localized content
 * @param params - Additional query parameters (excluding locale and customPopulate)
 * @returns The FAQ page content data or null if the request fails
 */
export async function getFaq(
  locale?: NonNullable<FaqGetFaqData['query']>['locale'],
  params?: Omit<NonNullable<FaqGetFaqData['query']>, 'locale' | 'customPopulate'>
): Promise<FaqGetFaqResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<FaqGetFaqData>('/faq', {
      query: {
        ...(locale !== undefined && { locale }),
        customPopulate: 'nested',
        ...params,
      },
    })
    const response = await apiRequest<FaqGetFaqResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch FAQ page:', error)
    return null
  }
}

/**
 * Content collection operations
 */

/**
 * Get products (collection type)
 * @param query - Optional query parameters including locale, filters, pagination, sort, and populate
 * @returns The products data or null if the request fails
 */
export async function getProducts(
  query?: Omit<NonNullable<ProductGetProductsData['query']>, 'customPopulate'>
): Promise<ProductGetProductsResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<ProductGetProductsData>('/products', {
      query: {
        ...query,
        customPopulate: 'nested',
      },
    })
    const response = await apiRequest<ProductGetProductsResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return null
  }
}

/**
 * Get single product by Slug
 * @param slug - Product slug
 * @param query - Optional query parameters including locale and populate
 * @returns The product data or null if the request fails
 */
export async function getProductBySlug(
  slug: string,
  query?: Omit<NonNullable<ProductGetProductsBySlugData['query']>, 'customPopulate'>
): Promise<ProductGetProductsBySlugResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<ProductGetProductsBySlugData>(`/products/slug/${slug}`, {
      path: { slug: slug },
      query: {
        ...query,
        customPopulate: 'nested',
      },
    })
    const response = await apiRequest<ProductGetProductsBySlugResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch product ${slug}:`, error)
    return null
  }
}

/**
 * Get product categories (collection type)
 * @param query - Optional query parameters including locale, filters, pagination, sort, and populate
 * @returns The product categories data or null if the request fails
 */
export async function getProductCategories(
  query?: Omit<NonNullable<ProductCategoryGetProductCategoriesData['query']>, 'customPopulate'>
): Promise<ProductCategoryGetProductCategoriesResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<ProductCategoryGetProductCategoriesData>('/product-categories', {
      query: {
        ...query,
        customPopulate: 'nested',
      },
    })
    const response = await apiRequest<ProductCategoryGetProductCategoriesResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch product categories:', error)
    return null
  }
}

/**
 * Get single product category by Slug
 * @param slug - Product category slug
 * @param query - Optional query parameters including locale and populate
 * @returns The product category data or null if the request fails
 */
export async function getProductCategoryBySlug(
  slug: string,
  query?: Omit<NonNullable<ProductCategoryGetProductCategoriesBySlugData['query']>, 'customPopulate'>
): Promise<ProductCategoryGetProductCategoriesBySlugResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<ProductCategoryGetProductCategoriesBySlugData>(
      `/product-categories/slug/${slug}`,
      {
        path: { slug: slug },
        query: {
          ...query,
          customPopulate: 'nested',
        },
      }
    )
    const response = await apiRequest<ProductCategoryGetProductCategoriesBySlugResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch product category ${slug}:`, error)
    return null
  }
}

/**
 * Get blog posts (collection type)
 * @param query - Optional query parameters including locale, filters, pagination, sort, and populate
 * @returns The blog posts data or null if the request fails
 */
export async function getBlogPosts(
  query?: Omit<NonNullable<BlogPostGetBlogPostsData['query']>, 'customPopulate'>
): Promise<BlogPostGetBlogPostsResponses[200] | null> {
  try {
    const request = createApiRequest<BlogPostGetBlogPostsData>('/blog-posts', {
      query: {
        ...query,
        customPopulate: 'nested',
      },
    })
    return await apiRequest<BlogPostGetBlogPostsResponses[200]>(request)
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    return null
  }
}

/**
 * Get single blog post by Slug
 * @param slug - Blog post slug
 * @param query - Optional query parameters including locale and populate
 * @returns The blog post data or null if the request fails
 */
export async function getBlogPostBySlug(
  slug: string,
  query?: Omit<NonNullable<BlogPostGetBlogPostsBySlugData['query']>, 'customPopulate'>
): Promise<BlogPostGetBlogPostsBySlugResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<BlogPostGetBlogPostsBySlugData>(`/blog-posts/slug/${slug}`, {
      path: { slug },
      query: {
        ...query,
        customPopulate: 'nested',
      },
    })
    const response = await apiRequest<BlogPostGetBlogPostsBySlugResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch blog post ${slug}:`, error)
    return null
  }
}

/**
 * Get contributors (collection type)
 * @param locale - Optional locale code (e.g., LanguageCode.EN, LanguageCode.IT, LanguageCode.HE) to fetch localized content
 * @param query - Optional query parameters including locale, filters, pagination, sort, and populate
 * @returns The contributors data or null if the request fails
 */
export async function getContributors(
  locale?: NonNullable<ContributorGetContributorsData['query']>['locale'],
  query?: Omit<NonNullable<ContributorGetContributorsData['query']>, 'customPopulate'>
): Promise<ContributorGetContributorsResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<ContributorGetContributorsData>('/contributors', {
      query: {
        ...(locale !== undefined && { locale }),
        ...query,
        customPopulate: 'nested',
      },
    })
    return (await apiRequest<ContributorGetContributorsResponses[200]>(request)).data
  } catch (error) {
    console.error('Failed to fetch contributors:', error)
    return null
  }
}
/**
 * Get team members (collection type)
 * @param locale - Optional locale code (e.g., LanguageCode.EN, LanguageCode.IT, LanguageCode.HE) to fetch localized content
 * @param query - Optional query parameters including locale, filters, pagination, sort, and populate
 * @returns The team members data or null if the request fails
 */
export async function getTeamMembers(
  locale?: NonNullable<ContributorGetContributorsData['query']>['locale'],
  query?: Omit<NonNullable<ContributorGetContributorsData['query']>, 'customPopulate'>
): Promise<ApiContributorContributorDocument[]> {
  const contributorRolesToExclude = ['author', 'seller']

  const contributors = await getContributors(locale, {
    filters: {
      roles: {
        roleId: { $nei: contributorRolesToExclude[0] },
      },
    },
    ...query,
  })

  return (
    contributors
      ?.map(contributor => ({
        ...contributor,
        roles: contributor.roles.filter(role => !contributorRolesToExclude.includes(role.roleId)),
      }))
      .filter(contributor => contributor.roles.length > 0) ?? []
  )
}

/**
 * Get single contributor by Slug
 * @param slug - Contributor slug
 * @param query - Optional query parameters including locale and populate
 * @returns The contributor data or null if the request fails
 */
export async function getContributorBySlug(
  slug: string,
  query?: Omit<NonNullable<ContributorGetContributorsBySlugData['query']>, 'customPopulate'>
): Promise<ContributorGetContributorsBySlugResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<ContributorGetContributorsBySlugData>(`/contributors/slug/${slug}`, {
      path: { slug: slug },
      query: {
        ...query,
        customPopulate: 'nested',
      },
    })
    const response = await apiRequest<ContributorGetContributorsBySlugResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch contributor ${slug}:`, error)
    return null
  }
}

/**
 * Upload operations
 */

/**
 * Get uploaded files (media library)
 * @param query - Optional query parameters including pagination
 * @returns The files data or null if the request fails
 */
export async function getFiles(
  query?: Omit<NonNullable<UploadGetUploadFilesData['query']>, 'customPopulate'>
): Promise<UploadGetUploadFilesResponses[200] | null> {
  try {
    const request = createApiRequest<UploadGetUploadFilesData>('/files', {
      query: {
        ...query,
        customPopulate: 'nested',
      },
    })
    return await apiRequest<UploadGetUploadFilesResponses[200]>(request)
  } catch (error) {
    console.error('Failed to fetch files:', error)
    return null
  }
}

/**
 * Get single file by ID
 * @param id - File document ID (numeric)
 * @returns The file data or null if the request fails
 */
export async function getFileById(id: number): Promise<UploadGetUploadFilesByIdResponses[200] | null> {
  try {
    const request: UploadGetUploadFilesByIdData = createApiRequest<UploadGetUploadFilesByIdData>(
      `/files/${String(id)}`,
      {
        path: { id },
        query: { customPopulate: 'nested' },
      }
    )
    return await apiRequest<UploadGetUploadFilesByIdResponses[200]>(request)
  } catch (error) {
    console.error(`Failed to fetch file ${String(id)}:`, error)
    return null
  }
}

/**
 * Get configured currencies
 * @param locale - Optional locale code
 * @param query - Optional query parameters
 * @returns The currencies data or null if the request fails
 */
export async function getCurrencies(
  locale?: NonNullable<CurrencyGetCurrenciesData['query']>['locale'],
  query?: Omit<NonNullable<CurrencyGetCurrenciesData['query']>, 'customPopulate'>
): Promise<CurrencyGetCurrenciesResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<CurrencyGetCurrenciesData>('/currencies', {
      query: {
        ...(locale !== undefined && { locale }),
        ...query,
        customPopulate: 'nested',
      },
    })
    const response = await apiRequest<CurrencyGetCurrenciesResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch currencies:', error)
    return null
  }
}
