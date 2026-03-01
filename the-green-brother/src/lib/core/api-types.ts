// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * API Request and Response Union Types
 *
 * These union types provide strong typing for all API operations,
 * matching the backend's CMSRequest/CMSResponse pattern.
 *
 * Note: `@typescript-eslint/no-redundant-type-constituents` is disabled for this file
 * because the large union types cause stack overflow in the rule.
 *
 * When adding new endpoints:
 * 1. Import the new *Data and *Responses types from generated/types.gen
 * 2. Add them to the appropriate union type below
 * 3. The apiRequest function will automatically support them
 */

import type {
    AboutGetAboutData,
    AboutGetAboutResponses,
    AuthPageGetAuthPageData,
    AuthPageGetAuthPageResponses,
    BlogGetBlogData,
    BlogGetBlogResponses,
    BlogPostGetBlogPostsBySlugData,
    BlogPostGetBlogPostsBySlugResponses,
    BlogPostGetBlogPostsData,
    BlogPostGetBlogPostsResponses,
    BlogPostTagGetBlogPostTagsByIdData,
    BlogPostTagGetBlogPostTagsByIdResponses,
    BlogPostTagGetBlogPostTagsData,
    BlogPostTagGetBlogPostTagsResponses,
    ChangePasswordData,
    ChangePasswordResponses,
    CheckRedirectData,
    CheckRedirectResponses,
    DeleteAccountData,
    DeleteAccountResponses,
    ExportUserDataData,
    ExportUserDataResponses,
    ConsentCategoryGetConsentCategoriesByIdData,
    ConsentCategoryGetConsentCategoriesByIdResponses,
    ConsentCategoryGetConsentCategoriesData,
    ConsentCategoryGetConsentCategoriesResponses,
    ConsentGetConsentData,
    ConsentGetConsentResponses,
    ContactUsGetContactUsData,
    ContactUsGetContactUsResponses,
    CookiePolicyGetCookiePolicyData,
    CookiePolicyGetCookiePolicyResponses,
    ContributorGetContributorsBySlugData,
    ContributorGetContributorsBySlugResponses,
    ContributorGetContributorsData,
    ContributorGetContributorsResponses,
    CurrencyGetCurrenciesByIdData,
    CurrencyGetCurrenciesByIdResponses,
    CurrencyGetCurrenciesData,
    CurrencyGetCurrenciesResponses,
    DetectLanguageData,
    DetectLanguageResponses,
    Error404GetError404Data,
    Error404GetError404Responses,
    Error410GetError410Data,
    Error410GetError410Responses,
    FaqGetFaqData,
    FaqGetFaqResponses,
    FeatureFlagGetFeatureFlagsByIdData,
    FeatureFlagGetFeatureFlagsByIdResponses,
    FeatureFlagGetFeatureFlagsData,
    FeatureFlagGetFeatureFlagsResponses,
    FooterGetFooterData,
    FooterGetFooterResponses,
    ForgotPasswordData,
    ForgotPasswordResponses,
    GetLanguagesData,
    GetLanguagesResponses,
    GetUserPreferencesData,
    GetUserPreferencesResponses,
    GetUserProfileData,
    GetUserProfileResponses,
    HealthCheckData,
    HealthCheckResponses,
    HomepageGetHomepageData,
    HomepageGetHomepageResponses,
    LoginUserData,
    LoginUserResponses,
    LogoutUserData,
    LogoutUserResponses,
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
    ProductTagGetProductTagsByIdData,
    ProductTagGetProductTagsByIdResponses,
    ProductTagGetProductTagsData,
    ProductTagGetProductTagsResponses,
    ProfileGetProfileData,
    ProfileGetProfileResponses,
    RefreshTokenData,
    RefreshTokenResponses,
    RegisterUserData,
    RegisterUserResponses,
    ResendVerificationData,
    ResendVerificationResponses,
    ResetPasswordData,
    ResetPasswordResponses,

    TermGetTermData,
    TermGetTermResponses,
    ThemeGetThemesByIdData,
    ThemeGetThemesByIdResponses,
    ThemeGetThemesData,
    ThemeGetThemesResponses,
    UpdateUserPreferencesData,
    UpdateUserProfileData,
    UploadGetFilesByIdData,
    UploadGetFilesByIdResponses,
    UploadGetFilesData,
    UploadGetFilesResponses,
    VerifyEmailData,
    VerifyEmailResponses
} from '@/lib/generated/types.gen'

import type { RecordConsentData } from '@/lib/consent/types'
import type { SubscribeNewsletterData, UnsubscribeNewsletterData } from '@/lib/newsletter/types'
import type {
  NewsletterSubscribeResponse,
  NewsletterUnsubscribeResponse,
  RecordConsentResponse,
} from '@/lib/generated/types.gen'

/**
 * Union type of all API request data types.
 *
 * Each type is a generated *Data type with properties: body, query, headers, path, url.
 * Callers instantiate these types and pass them to apiRequest for type-safe requests.
 */
export type ApiRequest =
  // Content single-type operations (query params for locale/populate)
  | AboutGetAboutData
  | AuthPageGetAuthPageData
  | BlogGetBlogData
  | ConsentGetConsentData
  | ContactUsGetContactUsData
  | CookiePolicyGetCookiePolicyData
  | Error404GetError404Data
  | Error410GetError410Data
  | FaqGetFaqData
  | FooterGetFooterData
  | HomepageGetHomepageData
  | NavigationGetNavigationData
  | PrivacyGetPrivacyData
  | ProductCategoriesPageGetProductCategoriesPageData
  | ProfileGetProfileData
  | TermGetTermData
  // Content collection operations (query params for filters/pagination/sort)
  | ConsentCategoryGetConsentCategoriesData
  | ConsentCategoryGetConsentCategoriesByIdData
  | ContributorGetContributorsData
  | ContributorGetContributorsBySlugData
  | BlogPostGetBlogPostsData
  | BlogPostGetBlogPostsBySlugData
  | BlogPostTagGetBlogPostTagsData
  | BlogPostTagGetBlogPostTagsByIdData
  | CurrencyGetCurrenciesData
  | CurrencyGetCurrenciesByIdData
  | ProductCategoryGetProductCategoriesData
  | ProductCategoryGetProductCategoriesBySlugData
  | ProductGetProductsData
  | ProductGetProductsBySlugData
  | ProductTagGetProductTagsData
  | ProductTagGetProductTagsByIdData

  | ThemeGetThemesData
  | ThemeGetThemesByIdData
  // Feature flag operations
  | FeatureFlagGetFeatureFlagsData
  | FeatureFlagGetFeatureFlagsByIdData
  // Upload operations
  | UploadGetFilesData
  | UploadGetFilesByIdData
  // Language operations
  | DetectLanguageData
  | GetLanguagesData
  // Auth operations
  | ChangePasswordData
  | DeleteAccountData
  | ExportUserDataData
  | ForgotPasswordData
  | GetUserProfileData
  | LoginUserData
  | LogoutUserData
  | RefreshTokenData
  | RegisterUserData
  | ResendVerificationData
  | ResetPasswordData
  | UpdateUserProfileData
  | VerifyEmailData
  // User preferences operations
  | GetUserPreferencesData
  | UpdateUserPreferencesData
  // Health check operations
  | HealthCheckData
  // Redirect operations
  | CheckRedirectData
  // Consent operations
  | RecordConsentData
  // Newsletter operations
  | SubscribeNewsletterData
  | UnsubscribeNewsletterData

/**
 * Union type of all API response types.
 *
 * These are the actual response body types (the 200 status values from *Responses types).
 * Used for type-safe response deserialization.
 */
export type ApiResponse =
  // Content single-type operations
  | AboutGetAboutResponses[200]
  | AuthPageGetAuthPageResponses[200]
  | BlogGetBlogResponses[200]
  | ConsentGetConsentResponses[200]
  | ContactUsGetContactUsResponses[200]
  | CookiePolicyGetCookiePolicyResponses[200]
  | Error404GetError404Responses[200]
  | Error410GetError410Responses[200]
  | FaqGetFaqResponses[200]
  | FooterGetFooterResponses[200]
  | HomepageGetHomepageResponses[200]
  | NavigationGetNavigationResponses[200]
  | PrivacyGetPrivacyResponses[200]
  | ProductCategoriesPageGetProductCategoriesPageResponses[200]
  | ProfileGetProfileResponses[200]
  | TermGetTermResponses[200]
  // Content collection operations
  | ConsentCategoryGetConsentCategoriesResponses[200]
  | ConsentCategoryGetConsentCategoriesByIdResponses[200]
  | ContributorGetContributorsResponses[200]
  | ContributorGetContributorsBySlugResponses[200]
  | BlogPostGetBlogPostsResponses[200]
  | BlogPostGetBlogPostsBySlugResponses[200]
  | BlogPostTagGetBlogPostTagsResponses[200]
  | BlogPostTagGetBlogPostTagsByIdResponses[200]
  | CurrencyGetCurrenciesResponses[200]
  | CurrencyGetCurrenciesByIdResponses[200]
  | ProductCategoryGetProductCategoriesResponses[200]
  | ProductCategoryGetProductCategoriesBySlugResponses[200]
  | ProductGetProductsResponses[200]
  | ProductGetProductsBySlugResponses[200]
  | ProductTagGetProductTagsResponses[200]
  | ProductTagGetProductTagsByIdResponses[200]

  | ThemeGetThemesResponses[200]
  | ThemeGetThemesByIdResponses[200]
  // Feature flag operations
  | FeatureFlagGetFeatureFlagsResponses[200]
  | FeatureFlagGetFeatureFlagsByIdResponses[200]
  // Upload operations
  | UploadGetFilesResponses[200]
  | UploadGetFilesByIdResponses[200]
  // Language operations
  | DetectLanguageResponses[200]
  | GetLanguagesResponses[200]
  // Auth operations (200 or 201 for register)
  | ChangePasswordResponses[200]
  | DeleteAccountResponses[200]
  | ExportUserDataResponses[200]
  | ForgotPasswordResponses[200]
  | GetUserProfileResponses[200]
  | LoginUserResponses[200]
  | LogoutUserResponses[200]
  | RefreshTokenResponses[200]
  | RegisterUserResponses[201]
  | ResendVerificationResponses[200]
  | ResetPasswordResponses[200]
  | VerifyEmailResponses[200]
  // User preferences operations
  | GetUserPreferencesResponses[200]

  // Health check operations
  | HealthCheckResponses[200]
  // Redirect operations
  | CheckRedirectResponses[200]
  // Consent operations
  | RecordConsentResponse
  // Newsletter operations
  | NewsletterSubscribeResponse
  | NewsletterUnsubscribeResponse

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
