# Copyright (c) 2025 Affilibuster by Ronen Druker.

from __future__ import annotations

from enum import Enum
from typing import Any, Literal, Union
from uuid import UUID

from pydantic import AnyUrl, AwareDatetime, BaseModel, ConfigDict, EmailStr, Field, RootModel, SecretStr


class Status(Enum):
    ACTIVE = "active"
    LOCKED = "locked"
    DELETED = "deleted"


class User(BaseModel):
    """
    User account information
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    id: UUID = Field(..., examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    Universally Unique Identifier (UUID) in standard 8-4-4-4-12 hexadecimal format, supporting versions 1-8.
    """
    email: EmailStr = Field(..., examples=["user@example.com"])
    """
    RFC 5321 compliant email address. Validated for correct format including domain and TLD requirements.
    """
    display_name: str = Field(..., alias="displayName", examples=["John Doe"])
    email_verified: bool = Field(..., alias="emailVerified", examples=[False])
    status: Status = Field(..., examples=["active"])
    created_at: AwareDatetime = Field(..., alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: AwareDatetime = Field(..., alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    last_login_at: AwareDatetime | None = Field(None, alias="lastLoginAt", examples=["2025-11-10T09:15:00Z"])


class UserProfile(BaseModel):
    """
    User profile information (without password)
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    id: UUID = Field(..., examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    Universally Unique Identifier (UUID) in standard 8-4-4-4-12 hexadecimal format, supporting versions 1-8.
    """
    email: EmailStr = Field(..., examples=["user@example.com"])
    """
    RFC 5321 compliant email address. Validated for correct format including domain and TLD requirements.
    """
    display_name: str = Field(..., examples=["John Doe"])
    email_verified: bool = Field(..., examples=[True])
    created_at: AwareDatetime = Field(..., examples=["2025-11-02T14:30:00Z"])
    last_login_at: AwareDatetime | None = Field(None, examples=["2025-11-10T09:15:00Z"])


class RegisterResponse(BaseModel):
    """
    Response after successful registration
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    success: bool = Field(..., examples=[True])
    user: User
    verification_token: str | None = Field(None, alias="verificationToken", examples=["abc123def456"])
    """
    Email verification token (only in test/dev)
    """
    message: str = Field(..., examples=["Registration successful. Please check your email for verification."])


class LoginResponse(BaseModel):
    """
    Response after successful login
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    success: bool = Field(..., examples=[True])
    user: User
    session_token: str = Field(..., alias="sessionToken", examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."])
    """
    Session token (also set in HTTP-only cookie)
    """
    message: str | None = Field(None, examples=["Login successful"])


class RefreshResponse(BaseModel):
    """
    Response after successful token refresh
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    success: bool = Field(..., examples=[True])
    session_token: str = Field(..., alias="sessionToken", examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."])
    """
    New access token (also set in HTTP-only cookie)
    """
    expires_at: AwareDatetime = Field(..., alias="expiresAt", examples=["2025-11-15T10:00:00Z"])
    user: User


class CurrencyCode(Enum):
    """
    ISO 4217 currency codes
    """

    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"
    ILS = "ILS"
    CAD = "CAD"
    AUD = "AUD"
    JPY = "JPY"
    CNY = "CNY"


class Code(Enum):
    EN = "en"
    IT = "it"
    HE = "he"


class Direction(Enum):
    LTR = "ltr"
    RTL = "rtl"


class Language(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    code: Code = Field(..., examples=["it"])
    display_name: str = Field(..., alias="displayName", examples=["Italian"])
    native_name: str = Field(..., alias="nativeName", examples=["Italiano"])
    direction: Direction = Field(..., examples=["ltr"])
    url_prefix: str = Field(..., alias="urlPrefix", examples=["/it"])
    default_currency: CurrencyCode = Field(..., alias="defaultCurrency")
    locale_code: str = Field(..., alias="localeCode", examples=["it-IT"])
    is_default: bool = Field(..., alias="isDefault", examples=[False])


class DetectedLanguage1(Enum):
    EN = "en"
    IT = "it"
    HE = "he"


class DetectedLanguage(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    detected_language: DetectedLanguage1 = Field(..., alias="detectedLanguage", examples=["it"])
    confidence: float = Field(..., examples=[0.95], ge=0.0, le=1.0)
    should_prompt: bool = Field(..., alias="shouldPrompt", examples=[True])
    """
    Whether to show language switch prompt
    """
    suggested_url: AnyUrl | None = Field(
        None, alias="suggestedUrl", examples=["https://affilibuster.com/it/products/eco-bottle"]
    )


class DetectedLanguage2(Enum):
    EN = "en"
    IT = "it"
    HE = "he"


class UserPreferences(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    id: UUID = Field(..., examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    Universally Unique Identifier (UUID) in standard 8-4-4-4-12 hexadecimal format, supporting versions 1-8.
    """
    session_id: str = Field(..., alias="sessionId", examples=["sess-abc123"])
    user_id: str | None = Field(None, alias="userId", examples=["user-789xyz"])
    """
    User ID for logged-in users (takes precedence over sessionId)
    """
    selected_currency: CurrencyCode = Field(..., alias="selectedCurrency")
    dismissed_language_prompt: bool = Field(..., alias="dismissedLanguagePrompt", examples=[True])
    detected_language: DetectedLanguage2 | None = Field(None, alias="detectedLanguage", examples=["it"])
    created_at: AwareDatetime | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: AwareDatetime | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    expires_at: AwareDatetime | None = Field(None, alias="expiresAt", examples=["2025-11-03T15:30:00Z"])


class UpdatePreferences(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    selected_currency: CurrencyCode | None = Field(None, alias="selectedCurrency")
    dismissed_language_prompt: bool | None = Field(None, alias="dismissedLanguagePrompt", examples=[True])
    detected_language: DetectedLanguage2 | None = Field(None, alias="detectedLanguage", examples=["it"])


class RedirectCheckResponse(BaseModel):
    """
    Response from redirect check endpoint
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    found: bool = Field(..., examples=[True])
    """
    Whether a redirect was found for the given source URL
    """
    target_url: str | None = Field(None, alias="targetUrl", examples=["/new-page"])
    """
    The target URL to redirect to (null if no redirect found)
    """
    status_code: int | None = Field(None, alias="statusCode", examples=[301])
    """
    HTTP status code for the redirect (301 or 302, null if no redirect found)
    """


class Error(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    error: str = Field(..., examples=["Not Found"])
    message: str = Field(..., examples=["Content with slug 'invalid-slug' not found for language 'it'"])
    code: str = Field(..., examples=["CONTENT_NOT_FOUND"])
    timestamp: AwareDatetime


class SEOMetadata(BaseModel):
    """
    SEO metadata for content
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    title: str | None = Field(None, examples=["Eco Bottle | Affilibuster"])
    description: str | None = Field(None, examples=["Buy sustainable reusable bottles"])
    keywords: list[str] | None = Field(None, examples=[["bottle", "eco", "sustainable"]])
    canonical_url: str | None = Field(
        None, alias="canonicalUrl", examples=["https://affilibuster.com/products/eco-bottle"]
    )


class URLData(BaseModel):
    """
    URL information with alternates
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    path: str = Field(..., examples=["/products/eco-bottle"])
    language_prefix: str = Field(..., alias="languagePrefix", examples=[""])
    current: str = Field(..., examples=["https://affilibuster.com/products/eco-bottle"])
    canonical: str = Field(..., examples=["https://affilibuster.com/products/eco-bottle"])
    alternates: dict[str, str] = Field(
        ...,
        examples=[
            {
                "x-default": "https://affilibuster.com/products/eco-bottle",
                "it": "https://affilibuster.com/it/prodotti/bottiglia-ecologica",
                "he": "https://affilibuster.com/he/products/eco-bottle",
            }
        ],
    )


class Type(Enum):
    PAGE = "page"
    PRODUCT = "product"
    ARTICLE = "article"


class ContentSummary(BaseModel):
    """
    Brief content summary for list views
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    id: UUID = Field(..., examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    Universally Unique Identifier (UUID) in standard 8-4-4-4-12 hexadecimal format, supporting versions 1-8.
    """
    type: Type = Field(..., examples=["product"])
    language: str = Field(..., examples=["en"])
    title: str = Field(..., examples=["Eco Bottle"])
    slug: str = Field(..., examples=["eco-bottle"])
    excerpt: str | None = Field(None, examples=["Sustainable stainless steel bottle"])
    url: str = Field(..., examples=["https://affilibuster.com/products/eco-bottle"])
    status: str = Field(..., examples=["published"])
    updated_at: AwareDatetime = Field(..., alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: AwareDatetime | None = Field(None, alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """


class Pagination(BaseModel):
    """
    Pagination metadata
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    page: int = Field(..., examples=[1])
    page_size: int = Field(..., alias="pageSize", examples=[20])
    total_items: int = Field(..., alias="totalItems", examples=[150])
    total_pages: int = Field(..., alias="totalPages", examples=[8])
    has_next: bool = Field(..., alias="hasNext", examples=[True])
    has_previous: bool = Field(..., alias="hasPrevious", examples=[False])


class ContentResponse(BaseModel):
    """
    Full content response with all details
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    id: UUID = Field(..., examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    Universally Unique Identifier (UUID) in standard 8-4-4-4-12 hexadecimal format, supporting versions 1-8.
    """
    type: Type = Field(..., examples=["product"])
    language: str = Field(..., examples=["en"])
    title: str = Field(..., examples=["Eco Bottle"])
    slug: str = Field(..., examples=["eco-bottle"])
    content: str = Field(..., examples=["<p>Reusable water bottle...</p>"])
    excerpt: str | None = Field(None, examples=["Sustainable stainless steel bottle"])
    seo: SEOMetadata
    urls: URLData
    status: str = Field(..., examples=["published"])
    fallback_used: bool | None = Field(None, alias="fallbackUsed", examples=[False])
    created_at: AwareDatetime = Field(..., alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: AwareDatetime = Field(..., alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: AwareDatetime | None = Field(None, alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    translations: dict[str, str] | None = Field(
        None,
        examples=[
            {
                "it": "https://affilibuster.com/it/prodotti/bottiglia-ecologica",
                "he": "https://affilibuster.com/he/products/eco-bottle",
            }
        ],
    )


class ContentListResponse(BaseModel):
    """
    Paginated content list response
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    data: list[ContentSummary]
    pagination: Pagination


class SymbolPosition(Enum):
    """
    Whether symbol appears before or after amount
    """

    BEFORE = "before"
    AFTER = "after"


class Currency(BaseModel):
    """
    Currency configuration and metadata
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    document_id: UUID = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    """
    Internal ID
    """
    code: str = Field(..., examples=["USD"], max_length=3, min_length=3)
    """
    ISO 4217 currency code (e.g., USD, EUR, ILS)
    """
    name: str = Field(..., examples=["US Dollar"])
    """
    Full currency name
    """
    symbol: str = Field(..., examples=["$"])
    """
    Currency symbol
    """
    display_name: str = Field(..., alias="displayName", examples=["USD ($)"])
    """
    Display name for UI
    """
    decimal_places: int = Field(..., alias="decimalPlaces", ge=0, le=8)
    """
    Number of decimal places for amounts
    """
    symbol_position: SymbolPosition = Field(..., alias="symbolPosition")
    """
    Whether symbol appears before or after amount
    """
    thousands_separator: str = Field(..., alias="thousandsSeparator")
    """
    Thousands separator character
    """
    decimal_separator: str = Field(..., alias="decimalSeparator")
    """
    Decimal separator character
    """
    exchange_rate: float = Field(..., alias="exchangeRate")
    """
    Exchange rate relative to base currency
    """
    sort_order: int = Field(..., alias="sortOrder")
    """
    Display order in currency lists
    """
    is_active: bool = Field(..., alias="isActive")
    """
    Whether currency is currently available
    """
    created_at: AwareDatetime | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: AwareDatetime | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: AwareDatetime = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """


class Navigation(BaseModel):
    """
    Navigation menu configuration
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    brand_name: str | None = Field(None, alias="brandName", examples=["Affilibuster"])
    home_label: str | None = Field(None, alias="homeLabel", examples=["Home"])
    products_label: str | None = Field(None, alias="productsLabel", examples=["Products"])
    about_label: str | None = Field(None, alias="aboutLabel", examples=["About"])
    contact_label: str | None = Field(None, alias="contactLabel", examples=["Contact"])
    language_selector_label: str | None = Field(None, alias="languageSelectorLabel", examples=["Language"])
    currency_selector_label: str | None = Field(None, alias="currencySelectorLabel", examples=["Currency"])
    theme_selector_label: str | None = Field(None, alias="themeSelectorLabel", examples=["Theme"])
    theme_light_label: str | None = Field(None, alias="themeLightLabel", examples=["Light"])
    theme_dark_label: str | None = Field(None, alias="themeDarkLabel", examples=["Dark"])
    theme_system_label: str | None = Field(None, alias="themeSystemLabel", examples=["System"])
    mobile_menu_label: str | None = Field(None, alias="mobileMenuLabel", examples=["Menu"])
    mobile_menu_close_label: str | None = Field(None, alias="mobileMenuCloseLabel", examples=["Close"])
    twitter_label: str | None = Field(None, alias="twitterLabel", examples=["Twitter"])
    facebook_label: str | None = Field(None, alias="facebookLabel", examples=["Facebook"])
    currency_selector_aria_label: str | None = Field(
        None, alias="currencySelectorAriaLabel", examples=["Select currency"]
    )
    language_selector_aria_label: str | None = Field(
        None, alias="languageSelectorAriaLabel", examples=["Select language"]
    )
    theme_selector_aria_label: str | None = Field(None, alias="themeSelectorAriaLabel", examples=["Select theme"])
    browse_products_button: str | None = Field(None, alias="browseProductsButton", examples=["Browse Products"])
    prompt_title_template: str | None = Field(None, alias="promptTitleTemplate", examples=["Language Preference"])
    prompt_message_template: str | None = Field(
        None, alias="promptMessageTemplate", examples=["Would you like to switch to {language}?"]
    )
    yes_button_template: str | None = Field(None, alias="yesButtonTemplate", examples=[True])
    no_button_text: str | None = Field(None, alias="noButtonText", examples=[False])


class Footer(BaseModel):
    """
    Footer content and links
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    brand_description: str | None = Field(
        None, alias="brandDescription", examples=["High-quality sustainable products for modern living"]
    )
    quick_links_title: str | None = Field(None, alias="quickLinksTitle", examples=["Quick Links"])
    privacy_policy_label: str | None = Field(None, alias="privacyPolicyLabel", examples=["Privacy Policy"])
    terms_of_service_label: str | None = Field(None, alias="termsOfServiceLabel", examples=["Terms of Service"])
    contact_label: str | None = Field(None, alias="contactLabel", examples=["Contact"])
    about_us_label: str | None = Field(None, alias="aboutUsLabel", examples=["About Us"])
    newsletter_title: str | None = Field(None, alias="newsletterTitle", examples=["Newsletter"])
    newsletter_description: str | None = Field(
        None, alias="newsletterDescription", examples=["Subscribe to get updates"]
    )
    subscribe_button: str | None = Field(None, alias="subscribeButton", examples=["Subscribe"])
    email_placeholder: str | None = Field(None, alias="emailPlaceholder", examples=["your@email.com"])
    copyright_text: str | None = Field(None, alias="copyrightText", examples=["Affilibuster. All rights reserved."])
    footer_tagline: str | None = Field(None, alias="footerTagline", examples=["Sustainable living starts here"])
    twitter_aria_label: str | None = Field(None, alias="twitterAriaLabel", examples=["Follow us on Twitter"])
    facebook_aria_label: str | None = Field(None, alias="facebookAriaLabel", examples=["Follow us on Facebook"])


class AuthVerifyEmailPostRequest(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    token: str = Field(..., examples=["abc123def456"])
    """
    Email verification token
    """


class AuthRefreshPostRequest(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    session_token: str = Field(..., alias="sessionToken", examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."])
    """
    Session token to refresh
    """


class AuthLogoutPostRequest(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    session_token: str = Field(..., alias="sessionToken", examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."])
    """
    Session token to invalidate
    """


class AuthResendVerificationPostRequest(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    user_id: UUID = Field(..., alias="userId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    Universally Unique Identifier (UUID) in standard 8-4-4-4-12 hexadecimal format, supporting versions 1-8.
    """


class RootResponse(BaseModel):
    """
    API root endpoint response
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    message: str = Field(..., examples=["Affilibuster API v1.0.0"])
    status: str = Field(..., examples=["running"])


class HealthResponse(BaseModel):
    """
    Health check endpoint response
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    status: str = Field(..., examples=["healthy"])


class UiFeatureItemEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    title: str
    """
    A string field
    """
    description: str
    """
    A text field
    """
    id: int | None = None
    """
    Component ID
    """


class ApiAboutAboutDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    hero_title: str = Field(..., alias="heroTitle")
    """
    A string field
    """
    hero_subtitle: str | None = Field(None, alias="heroSubtitle")
    """
    A text field
    """
    mission_title: str | None = Field(None, alias="missionTitle")
    """
    A string field
    """
    mission_content: str | None = Field(None, alias="missionContent")
    """
    A richtext field
    """
    features_title: str | None = Field(None, alias="featuresTitle")
    """
    A string field
    """
    tech_stack_title: str | None = Field(None, alias="techStackTitle")
    """
    A string field
    """
    tech_stack_description: str | None = Field(None, alias="techStackDescription")
    """
    A richtext field
    """
    cta_title: str | None = Field(None, alias="ctaTitle")
    """
    A string field
    """
    cta_text: str | None = Field(None, alias="ctaText")
    """
    A richtext field
    """
    content: str
    """
    A richtext field
    """
    meta_title: str | None = Field(None, alias="metaTitle")
    """
    A string field
    """
    meta_description: str | None = Field(None, alias="metaDescription")
    """
    A text field
    """
    meta_keywords: Any | None = Field(None, alias="metaKeywords")
    """
    A JSON field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    features_list: list[UiFeatureItemEntry] | None = Field(None, alias="featuresList")
    """
    A component field
    """
    localizations: list[ApiAboutAboutDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class UiContactCardEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    title: str
    """
    A string field
    """
    description: str
    """
    A text field
    """
    email: EmailStr = Field(..., examples=["user@example.com"])
    """
    RFC 5321 compliant email address. Validated for correct format including domain and TLD requirements.
    """
    id: int | None = None
    """
    Component ID
    """


class ApiContactContactDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    hero_title: str = Field(..., alias="heroTitle")
    """
    A string field
    """
    hero_subtitle: str | None = Field(None, alias="heroSubtitle")
    """
    A text field
    """
    response_time_title: str | None = Field(None, alias="responseTimeTitle")
    """
    A string field
    """
    response_time_text: str | None = Field(None, alias="responseTimeText")
    """
    A richtext field
    """
    office_hours_title: str | None = Field(None, alias="officeHoursTitle")
    """
    A string field
    """
    office_hours_text: str | None = Field(None, alias="officeHoursText")
    """
    A richtext field
    """
    general_inquiries_email: EmailStr | None = Field(None, alias="generalInquiriesEmail", examples=["user@example.com"])
    """
    RFC 5321 compliant email address. Validated for correct format including domain and TLD requirements.
    """
    support_email: EmailStr | None = Field(None, alias="supportEmail", examples=["user@example.com"])
    """
    RFC 5321 compliant email address. Validated for correct format including domain and TLD requirements.
    """
    business_email: EmailStr | None = Field(None, alias="businessEmail", examples=["user@example.com"])
    """
    RFC 5321 compliant email address. Validated for correct format including domain and TLD requirements.
    """
    privacy_email: EmailStr | None = Field(None, alias="privacyEmail", examples=["user@example.com"])
    """
    RFC 5321 compliant email address. Validated for correct format including domain and TLD requirements.
    """
    response_time_message: str | None = Field(None, alias="responseTimeMessage")
    """
    A text field
    """
    office_hours_message: str | None = Field(None, alias="officeHoursMessage")
    """
    A text field
    """
    content: str | None = None
    """
    A richtext field
    """
    meta_title: str | None = Field(None, alias="metaTitle")
    """
    A string field
    """
    meta_description: str | None = Field(None, alias="metaDescription")
    """
    A text field
    """
    meta_keywords: Any | None = Field(None, alias="metaKeywords")
    """
    A JSON field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    contact_cards: list[UiContactCardEntry] | None = Field(None, alias="contactCards")
    """
    A component field
    """
    localizations: list[ApiContactContactDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ApiError404Error404Document(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    title: str
    """
    A string field
    """
    subtitle: str
    """
    A string field
    """
    message: str
    """
    A text field
    """
    cta_text: str = Field(..., alias="ctaText")
    """
    A string field
    """
    secondary_cta_text: str = Field(..., alias="secondaryCtaText")
    """
    A string field
    """
    content: str | None = None
    """
    A richtext field
    """
    meta_title: str | None = Field(None, alias="metaTitle")
    """
    A string field
    """
    meta_description: str | None = Field(None, alias="metaDescription")
    """
    A text field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    localizations: list[ApiError404Error404Document] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ApiError410Error410Document(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    title: str
    """
    A string field
    """
    subtitle: str
    """
    A string field
    """
    message: str
    """
    A text field
    """
    cta_text: str = Field(..., alias="ctaText")
    """
    A string field
    """
    support_contact_message: str | None = Field(None, alias="supportContactMessage")
    """
    A string field
    """
    content: str | None = None
    """
    A richtext field
    """
    meta_title: str | None = Field(None, alias="metaTitle")
    """
    A string field
    """
    meta_description: str | None = Field(None, alias="metaDescription")
    """
    A text field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    localizations: list[ApiError410Error410Document] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ApiFooterFooterDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    brand_description: str = Field(..., alias="brandDescription")
    """
    A richtext field
    """
    quick_links_title: str = Field(..., alias="quickLinksTitle")
    """
    A string field
    """
    newsletter_title: str = Field(..., alias="newsletterTitle")
    """
    A string field
    """
    newsletter_description: str = Field(..., alias="newsletterDescription")
    """
    A text field
    """
    subscribe_button: str = Field(..., alias="subscribeButton")
    """
    A string field
    """
    email_placeholder: str = Field(..., alias="emailPlaceholder")
    """
    A string field
    """
    copyright_text: str = Field(..., alias="copyrightText")
    """
    A string field
    """
    footer_tagline: str = Field(..., alias="footerTagline")
    """
    A string field
    """
    privacy_policy_label: str | None = Field(None, alias="privacyPolicyLabel")
    """
    A string field
    """
    terms_of_service_label: str | None = Field(None, alias="termsOfServiceLabel")
    """
    A string field
    """
    contact_label: str | None = Field(None, alias="contactLabel")
    """
    A string field
    """
    about_us_label: str | None = Field(None, alias="aboutUsLabel")
    """
    A string field
    """
    twitter_aria_label: str | None = Field(None, alias="twitterAriaLabel")
    """
    A string field
    """
    facebook_aria_label: str | None = Field(None, alias="facebookAriaLabel")
    """
    A string field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    localizations: list[ApiFooterFooterDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class UiFeatureCardEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    title: str
    """
    A string field
    """
    description: str
    """
    A text field
    """
    link_url: str | None = Field(None, alias="linkUrl")
    """
    A string field
    """
    id: int | None = None
    """
    Component ID
    """


class UiTrustCardEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    title: str
    """
    A string field
    """
    description: str
    """
    A text field
    """
    id: int | None = None
    """
    Component ID
    """


class ApiHomepageHomepageDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    hero_title: str = Field(..., alias="heroTitle")
    """
    A string field
    """
    hero_subtitle: str = Field(..., alias="heroSubtitle")
    """
    A text field
    """
    hero_content: str | None = Field(None, alias="heroContent")
    """
    A richtext field
    """
    featured_products_title: str | None = Field(None, alias="featuredProductsTitle")
    """
    A string field
    """
    featured_products_description: str | None = Field(None, alias="featuredProductsDescription")
    """
    A text field
    """
    testimonials_title: str | None = Field(None, alias="testimonialsTitle")
    """
    A string field
    """
    testimonials_text: str | None = Field(None, alias="testimonialsText")
    """
    A text field
    """
    why_choose_us_title: str | None = Field(None, alias="whyChooseUsTitle")
    """
    A string field
    """
    featured_section_title: str | None = Field(None, alias="featuredSectionTitle")
    """
    A string field
    """
    featured_section_subtitle: str | None = Field(None, alias="featuredSectionSubtitle")
    """
    A string field
    """
    see_all_products_text: str | None = Field(None, alias="seeAllProductsText")
    """
    A string field
    """
    featured_badge_text: str = Field(..., alias="featuredBadgeText")
    """
    A string field
    """
    view_details_button_text: str = Field(..., alias="viewDetailsButtonText")
    """
    A string field
    """
    testimonial_author: str | None = Field(None, alias="testimonialAuthor")
    """
    A string field
    """
    testimonial_role: str | None = Field(None, alias="testimonialRole")
    """
    A string field
    """
    meta_title: str | None = Field(None, alias="metaTitle")
    """
    A string field
    """
    meta_description: str | None = Field(None, alias="metaDescription")
    """
    A text field
    """
    meta_keywords: Any | None = Field(None, alias="metaKeywords")
    """
    A JSON field
    """
    showing_products_template: str | None = Field(None, alias="showingProductsTemplate")
    """
    A string field
    """
    all_products_label: str | None = Field(None, alias="allProductsLabel")
    """
    A string field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    feature_cards: list[UiFeatureCardEntry] | None = Field(None, alias="featureCards")
    """
    A component field
    """
    trust_cards: list[UiTrustCardEntry] | None = Field(None, alias="trustCards")
    """
    A component field
    """
    localizations: list[ApiHomepageHomepageDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ApiNavigationNavigationDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    brand_name: str = Field(..., alias="brandName")
    """
    A string field
    """
    home_label: str = Field(..., alias="homeLabel")
    """
    A string field
    """
    products_label: str = Field(..., alias="productsLabel")
    """
    A string field
    """
    about_label: str = Field(..., alias="aboutLabel")
    """
    A string field
    """
    contact_label: str = Field(..., alias="contactLabel")
    """
    A string field
    """
    language_selector_label: str | None = Field(None, alias="languageSelectorLabel")
    """
    A string field
    """
    currency_selector_label: str | None = Field(None, alias="currencySelectorLabel")
    """
    A string field
    """
    theme_selector_label: str | None = Field(None, alias="themeSelectorLabel")
    """
    A string field
    """
    theme_light_label: str | None = Field(None, alias="themeLightLabel")
    """
    A string field
    """
    theme_dark_label: str | None = Field(None, alias="themeDarkLabel")
    """
    A string field
    """
    theme_system_label: str | None = Field(None, alias="themeSystemLabel")
    """
    A string field
    """
    mobile_menu_label: str | None = Field(None, alias="mobileMenuLabel")
    """
    A string field
    """
    twitter_label: str | None = Field(None, alias="twitterLabel")
    """
    A string field
    """
    facebook_label: str | None = Field(None, alias="facebookLabel")
    """
    A string field
    """
    browse_products_button: str | None = Field(None, alias="browseProductsButton")
    """
    A string field
    """
    prompt_title_template: str | None = Field(None, alias="promptTitleTemplate")
    """
    A string field
    """
    prompt_message_template: str | None = Field(None, alias="promptMessageTemplate")
    """
    A text field
    """
    yes_button_template: str | None = Field(None, alias="yesButtonTemplate")
    """
    A string field
    """
    no_button_text: str | None = Field(None, alias="noButtonText")
    """
    A string field
    """
    mobile_menu_close_label: str | None = Field(None, alias="mobileMenuCloseLabel")
    """
    A string field
    """
    currency_selector_aria_label: str | None = Field(None, alias="currencySelectorAriaLabel")
    """
    A string field
    """
    language_selector_aria_label: str | None = Field(None, alias="languageSelectorAriaLabel")
    """
    A string field
    """
    theme_selector_aria_label: str | None = Field(None, alias="themeSelectorAriaLabel")
    """
    A string field
    """
    available_in_other_languages_label: str | None = Field(None, alias="availableInOtherLanguagesLabel")
    """
    A string field
    """
    mobile_menu_close_aria_label: str | None = Field(None, alias="mobileMenuCloseAriaLabel")
    """
    A string field
    """
    site_title: str | None = Field(None, alias="siteTitle")
    """
    A string field
    """
    site_description: str | None = Field(None, alias="siteDescription")
    """
    A text field
    """
    site_keywords: Any | None = Field(None, alias="siteKeywords")
    """
    A JSON field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    localizations: list[ApiNavigationNavigationDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ApiPrivacyPrivacyDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    title: str
    """
    A string field
    """
    last_updated: str | None = Field(None, alias="lastUpdated")
    """
    A datetime field
    """
    content: str
    """
    A richtext field
    """
    meta_title: str | None = Field(None, alias="metaTitle")
    """
    A string field
    """
    meta_description: str | None = Field(None, alias="metaDescription")
    """
    A text field
    """
    meta_keywords: Any | None = Field(None, alias="metaKeywords")
    """
    A JSON field
    """
    last_updated_label: str | None = Field(None, alias="lastUpdatedLabel")
    """
    A string field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    localizations: list[ApiPrivacyPrivacyDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class Currency1(Enum):
    """
    An enum field
    """

    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"
    ILS = "ILS"
    CAD = "CAD"
    AUD = "AUD"
    JPY = "JPY"
    CNY = "CNY"


class TranslationStatus(Enum):
    """
    An enum field
    """

    COMPLETE = "complete"
    PARTIAL = "partial"
    MISSING = "missing"
    PENDING = "pending"


class ApiProductProductDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    title: str
    """
    A string field
    """
    slug: str
    """
    A UID field
    """
    description: str | None = None
    """
    A text field
    """
    content: str
    """
    A richtext field
    """
    excerpt: str | None = None
    """
    A text field
    """
    meta_title: str | None = Field(None, alias="metaTitle")
    """
    A string field
    """
    meta_description: str | None = Field(None, alias="metaDescription")
    """
    A text field
    """
    meta_keywords: Any | None = Field(None, alias="metaKeywords")
    """
    A JSON field
    """
    affiliate_url: str | None = Field(None, alias="affiliateUrl")
    """
    A string field
    """
    price: float | None = None
    """
    A decimal field
    """
    currency: Currency1
    """
    An enum field
    """
    featured: bool
    """
    A boolean field
    """
    category: str | None = None
    """
    A string field
    """
    translation_status: TranslationStatus = Field(..., alias="translationStatus")
    """
    An enum field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    localizations: list[ApiProductProductDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ApiProductPageProductPageDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    title: str
    """
    A string field
    """
    subtitle: str | None = None
    """
    A text field
    """
    description: str | None = None
    """
    A richtext field
    """
    items_per_page: int = Field(..., alias="itemsPerPage", ge=-9007199254740991, le=9007199254740991)
    """
    An integer field
    """
    previous_button: str | None = Field(None, alias="previousButton")
    """
    A string field
    """
    next_button: str | None = Field(None, alias="nextButton")
    """
    A string field
    """
    no_products_message: str | None = Field(None, alias="noProductsMessage")
    """
    A string field
    """
    showing_text: str = Field(..., alias="showingText")
    """
    A string field
    """
    page_text: str = Field(..., alias="pageText")
    """
    A string field
    """
    meta_title: str | None = Field(None, alias="metaTitle")
    """
    A string field
    """
    meta_description: str | None = Field(None, alias="metaDescription")
    """
    A text field
    """
    meta_keywords: Any | None = Field(None, alias="metaKeywords")
    """
    A JSON field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    localizations: list[ApiProductPageProductPageDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ApiSystemMessageSystemMessageDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    unknown_error_message: str | None = Field(None, alias="unknownErrorMessage")
    """
    A string field
    """
    network_error_message: str | None = Field(None, alias="networkErrorMessage")
    """
    A string field
    """
    unexpected_error_message: str | None = Field(None, alias="unexpectedErrorMessage")
    """
    A string field
    """
    translation_not_available_title: str | None = Field(None, alias="translationNotAvailableTitle")
    """
    A string field
    """
    translation_not_available_message: str | None = Field(None, alias="translationNotAvailableMessage")
    """
    A text field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    localizations: list[ApiSystemMessageSystemMessageDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ApiTermTermDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    title: str
    """
    A string field
    """
    last_updated: str | None = Field(None, alias="lastUpdated")
    """
    A datetime field
    """
    content: str
    """
    A richtext field
    """
    meta_title: str | None = Field(None, alias="metaTitle")
    """
    A string field
    """
    meta_description: str | None = Field(None, alias="metaDescription")
    """
    A text field
    """
    meta_keywords: Any | None = Field(None, alias="metaKeywords")
    """
    A JSON field
    """
    last_updated_label: str | None = Field(None, alias="lastUpdatedLabel")
    """
    A string field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    localizations: list[ApiTermTermDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class AuthRegisterPostRequest(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    email: EmailStr = Field(..., examples=["user@example.com"])
    password: SecretStr = Field(..., examples=["SecurePassword123!"], min_length=8)
    display_name: str = Field(..., alias="displayName", examples=["John Doe"], max_length=100, min_length=1)


class AuthLoginPostRequest(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    email: EmailStr = Field(..., examples=["user@example.com"])
    password: SecretStr = Field(..., examples=["SecurePassword123!"])
    remember_me: bool | None = Field(False, alias="rememberMe", examples=[False])


class AuthLogoutPostResponse(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    success: bool | None = Field(None, examples=[True])
    message: str | None = Field(None, examples=["Logged out successfully"])


class AuthVerifyEmailPostResponse(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    success: bool | None = Field(None, examples=[True])
    message: str | None = Field(None, examples=["Email verified successfully"])


class AuthResendVerificationPostResponse(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    success: bool | None = Field(None, examples=[True])
    message: str | None = Field(None, examples=["Verification email sent"])


class AuthForgotPasswordPostRequest(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    email: EmailStr = Field(..., examples=["user@example.com"])


class AuthForgotPasswordPostResponse(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    success: bool | None = Field(None, examples=[True])
    message: str | None = Field(None, examples=["If email exists, password reset link has been sent"])


class AuthResetPasswordPostRequest(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    token: str = Field(..., examples=["xyz789abc123"])
    new_password: SecretStr = Field(..., alias="newPassword", examples=["NewSecurePassword123!"], min_length=8)


class AuthResetPasswordPostResponse(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    success: bool | None = Field(None, examples=[True])
    message: str | None = Field(None, examples=["Password reset successfully"])


class AuthProfilePatchRequest(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    display_name: str = Field(..., alias="displayName", examples=["Jane Smith"], max_length=100, min_length=1)


class AuthProfileChangePasswordPostRequest(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    current_password: SecretStr = Field(..., alias="currentPassword", examples=["OldPassword123!"])
    new_password: SecretStr = Field(..., alias="newPassword", examples=["NewPassword123!"], min_length=8)


class AuthProfileChangePasswordPostResponse(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    message: str | None = Field(None, examples=["Password changed successfully. Please log in again."])


class LanguagesGetResponse(RootModel[list[Language]]):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    root: list[Language]


class LanguagesDetectPostRequest(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    accept_language: str = Field(..., alias="acceptLanguage", examples=["it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7"])
    user_agent: str | None = Field(None, alias="userAgent", examples=["Mozilla/5.0 ..."])
    country_code: str | None = Field(None, alias="countryCode", examples=["IT"])
    """
    Optional ISO 3166-1 alpha-2 country code from IP geolocation
    """


class V1RedirectsCheckGetParametersQuery(BaseModel):
    source_url: str = Field(..., examples=["/old-page"])


class FieldModel(Enum):
    ENTRY_TITLE = "entryTitle"
    HERO_TITLE = "heroTitle"
    HERO_SUBTITLE = "heroSubtitle"
    MISSION_TITLE = "missionTitle"
    MISSION_CONTENT = "missionContent"
    FEATURES_TITLE = "featuresTitle"
    TECH_STACK_TITLE = "techStackTitle"
    TECH_STACK_DESCRIPTION = "techStackDescription"
    CTA_TITLE = "ctaTitle"
    CTA_TEXT = "ctaText"
    CONTENT = "content"
    META_TITLE = "metaTitle"
    META_DESCRIPTION = "metaDescription"
    META_KEYWORDS = "metaKeywords"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Populate(Enum):
    """
    Populate a single relation, component, file, or dynamic zone
    """

    FEATURES_LIST = "featuresList"
    LOCALIZATIONS = "localizations"


class PopulateEnum(Enum):
    FEATURES_LIST = "featuresList"
    LOCALIZATIONS = "localizations"


class Status1(Enum):
    """
    Fetch documents based on their status. Default to "published" if not specified.
    """

    DRAFT = "draft"
    PUBLISHED = "published"


class AboutGetParametersQuery(BaseModel):
    fields: list[FieldModel] | None = Field(None, examples=[["entryTitle", "heroTitle", "heroSubtitle"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    populate: str | Populate | list[PopulateEnum] | None = Field(None, examples=["*"])
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    locale: str | None = Field(None, examples=["en"])
    """
    Select a locale
    """
    status: Status1 | None = Field(None, examples=["published"])
    """
    Fetch documents based on their status. Default to "published" if not specified.
    """


class Data(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    hero_title: str = Field(..., alias="heroTitle")
    """
    A string field
    """
    hero_subtitle: str | None = Field(None, alias="heroSubtitle")
    """
    A text field
    """
    mission_title: str | None = Field(None, alias="missionTitle")
    """
    A string field
    """
    mission_content: str | None = Field(None, alias="missionContent")
    """
    A richtext field
    """
    features_title: str | None = Field(None, alias="featuresTitle")
    """
    A string field
    """
    tech_stack_title: str | None = Field(None, alias="techStackTitle")
    """
    A string field
    """
    tech_stack_description: str | None = Field(None, alias="techStackDescription")
    """
    A richtext field
    """
    cta_title: str | None = Field(None, alias="ctaTitle")
    """
    A string field
    """
    cta_text: str | None = Field(None, alias="ctaText")
    """
    A richtext field
    """
    content: str
    """
    A richtext field
    """
    meta_title: str | None = Field(None, alias="metaTitle")
    """
    A string field
    """
    meta_description: str | None = Field(None, alias="metaDescription")
    """
    A text field
    """
    meta_keywords: Any | None = Field(None, alias="metaKeywords")
    """
    A JSON field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    features_list: list[UiFeatureItemEntry] | None = Field(None, alias="featuresList")
    """
    A component field
    """
    localizations: list[ApiAboutAboutDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class AboutGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field1(Enum):
    ENTRY_TITLE = "entryTitle"
    HERO_TITLE = "heroTitle"
    HERO_SUBTITLE = "heroSubtitle"
    RESPONSE_TIME_TITLE = "responseTimeTitle"
    RESPONSE_TIME_TEXT = "responseTimeText"
    OFFICE_HOURS_TITLE = "officeHoursTitle"
    OFFICE_HOURS_TEXT = "officeHoursText"
    GENERAL_INQUIRIES_EMAIL = "generalInquiriesEmail"
    SUPPORT_EMAIL = "supportEmail"
    BUSINESS_EMAIL = "businessEmail"
    PRIVACY_EMAIL = "privacyEmail"
    RESPONSE_TIME_MESSAGE = "responseTimeMessage"
    OFFICE_HOURS_MESSAGE = "officeHoursMessage"
    CONTENT = "content"
    META_TITLE = "metaTitle"
    META_DESCRIPTION = "metaDescription"
    META_KEYWORDS = "metaKeywords"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Populate1(Enum):
    """
    Populate a single relation, component, file, or dynamic zone
    """

    CONTACT_CARDS = "contactCards"
    LOCALIZATIONS = "localizations"


class PopulateEnum1(Enum):
    CONTACT_CARDS = "contactCards"
    LOCALIZATIONS = "localizations"


class ContactGetParametersQuery(BaseModel):
    fields: list[Field1] | None = Field(None, examples=[["entryTitle", "heroTitle", "heroSubtitle"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    populate: str | Populate1 | list[PopulateEnum1] | None = Field(None, examples=["*"])
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    locale: str | None = Field(None, examples=["en"])
    """
    Select a locale
    """
    status: Status1 | None = Field(None, examples=["published"])
    """
    Fetch documents based on their status. Default to "published" if not specified.
    """


class Data1(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    hero_title: str = Field(..., alias="heroTitle")
    """
    A string field
    """
    hero_subtitle: str | None = Field(None, alias="heroSubtitle")
    """
    A text field
    """
    response_time_title: str | None = Field(None, alias="responseTimeTitle")
    """
    A string field
    """
    response_time_text: str | None = Field(None, alias="responseTimeText")
    """
    A richtext field
    """
    office_hours_title: str | None = Field(None, alias="officeHoursTitle")
    """
    A string field
    """
    office_hours_text: str | None = Field(None, alias="officeHoursText")
    """
    A richtext field
    """
    general_inquiries_email: EmailStr | None = Field(None, alias="generalInquiriesEmail", examples=["user@example.com"])
    """
    RFC 5321 compliant email address. Validated for correct format including domain and TLD requirements.
    """
    support_email: EmailStr | None = Field(None, alias="supportEmail", examples=["user@example.com"])
    """
    RFC 5321 compliant email address. Validated for correct format including domain and TLD requirements.
    """
    business_email: EmailStr | None = Field(None, alias="businessEmail", examples=["user@example.com"])
    """
    RFC 5321 compliant email address. Validated for correct format including domain and TLD requirements.
    """
    privacy_email: EmailStr | None = Field(None, alias="privacyEmail", examples=["user@example.com"])
    """
    RFC 5321 compliant email address. Validated for correct format including domain and TLD requirements.
    """
    response_time_message: str | None = Field(None, alias="responseTimeMessage")
    """
    A text field
    """
    office_hours_message: str | None = Field(None, alias="officeHoursMessage")
    """
    A text field
    """
    content: str | None = None
    """
    A richtext field
    """
    meta_title: str | None = Field(None, alias="metaTitle")
    """
    A string field
    """
    meta_description: str | None = Field(None, alias="metaDescription")
    """
    A text field
    """
    meta_keywords: Any | None = Field(None, alias="metaKeywords")
    """
    A JSON field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    contact_cards: list[UiContactCardEntry] | None = Field(None, alias="contactCards")
    """
    A component field
    """
    localizations: list[ApiContactContactDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ContactGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data1
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field2(Enum):
    CODE = "code"
    NAME = "name"
    SYMBOL = "symbol"
    DISPLAY_NAME = "displayName"
    DECIMAL_PLACES = "decimalPlaces"
    SYMBOL_POSITION = "symbolPosition"
    THOUSANDS_SEPARATOR = "thousandsSeparator"
    DECIMAL_SEPARATOR = "decimalSeparator"
    EXCHANGE_RATE = "exchangeRate"
    SORT_ORDER = "sortOrder"
    IS_ACTIVE = "isActive"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"


class Pagination11(BaseModel):
    """
    Page-based pagination
    """

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    page: int = Field(..., gt=0, le=9007199254740991)
    """
    Page number (1-based)
    """
    page_size: int = Field(..., alias="pageSize", gt=0, le=9007199254740991)
    """
    Number of entries per page
    """


class Pagination12(BaseModel):
    """
    Offset-based pagination
    """

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    start: int = Field(..., ge=0, le=9007199254740991)
    """
    Number of entries to skip
    """
    limit: int = Field(..., gt=0, le=9007199254740991)
    """
    Maximum number of entries to return
    """


class Pagination13(BaseModel):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    with_count: bool | None = Field(None, alias="withCount")
    """
    Include total count in response
    """


class Pagination14(Pagination11, Pagination13):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination15(Pagination12, Pagination13):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination1(RootModel[Union[Pagination14, Pagination15]]):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    root: Pagination14 | Pagination15
    """
    Pagination parameters
    """


class Sort(Enum):
    """
    Sort the result
    """

    CODE = "code"
    NAME = "name"
    SYMBOL = "symbol"
    DISPLAY_NAME = "displayName"
    DECIMAL_PLACES = "decimalPlaces"
    SYMBOL_POSITION = "symbolPosition"
    THOUSANDS_SEPARATOR = "thousandsSeparator"
    DECIMAL_SEPARATOR = "decimalSeparator"
    EXCHANGE_RATE = "exchangeRate"
    SORT_ORDER = "sortOrder"
    IS_ACTIVE = "isActive"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"


class SortEnum(Enum):
    CODE = "code"
    NAME = "name"
    SYMBOL = "symbol"
    DISPLAY_NAME = "displayName"
    DECIMAL_PLACES = "decimalPlaces"
    SYMBOL_POSITION = "symbolPosition"
    THOUSANDS_SEPARATOR = "thousandsSeparator"
    DECIMAL_SEPARATOR = "decimalSeparator"
    EXCHANGE_RATE = "exchangeRate"
    SORT_ORDER = "sortOrder"
    IS_ACTIVE = "isActive"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"


class Sort1(Enum):
    ASC = "asc"
    DESC = "desc"


class CurrenciesGetParametersQuery(BaseModel):
    fields: list[Field2] | None = Field(None, examples=[["code", "name", "symbol"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    field_q: str | None = Field(None, alias="_q", examples=["search terms"])
    pagination: Pagination1 | None = None
    """
    Pagination parameters
    """
    sort: Sort | list[SortEnum] | dict[str, Sort1] | list[dict[str, Sort1]] | None = Field(None, examples=["code"])
    """
    Sort the result
    """
    populate: str | None = Field(None, examples=["*"])
    status: Status1 | None = Field(None, examples=["published"])
    """
    Fetch documents based on their status. Default to "published" if not specified.
    """


class SymbolPosition1(Enum):
    """
    An enum field
    """

    BEFORE = "before"
    AFTER = "after"


class Datum(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    code: str = Field(..., max_length=3, min_length=3)
    """
    A string field
    """
    name: str
    """
    A string field
    """
    symbol: str
    """
    A string field
    """
    display_name: str = Field(..., alias="displayName")
    """
    A string field
    """
    decimal_places: int = Field(..., alias="decimalPlaces", ge=0, le=8)
    """
    An integer field
    """
    symbol_position: SymbolPosition1 = Field(..., alias="symbolPosition")
    """
    An enum field
    """
    thousands_separator: str = Field(..., alias="thousandsSeparator")
    """
    A string field
    """
    decimal_separator: str = Field(..., alias="decimalSeparator")
    """
    A string field
    """
    exchange_rate: float = Field(..., alias="exchangeRate")
    """
    A decimal field
    """
    sort_order: int = Field(..., alias="sortOrder", ge=-9007199254740991, le=9007199254740991)
    """
    An integer field
    """
    is_active: bool = Field(..., alias="isActive")
    """
    A boolean field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """


class CurrenciesGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: list[Datum]
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Sort3(Enum):
    """
    Sort the result
    """

    CODE = "code"
    NAME = "name"
    SYMBOL = "symbol"
    DISPLAY_NAME = "displayName"
    DECIMAL_PLACES = "decimalPlaces"
    SYMBOL_POSITION = "symbolPosition"
    THOUSANDS_SEPARATOR = "thousandsSeparator"
    DECIMAL_SEPARATOR = "decimalSeparator"
    EXCHANGE_RATE = "exchangeRate"
    SORT_ORDER = "sortOrder"
    IS_ACTIVE = "isActive"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"


class Sort4(Enum):
    ASC = "asc"
    DESC = "desc"


class CurrenciesIdGetParametersQuery(BaseModel):
    fields: list[Field2] | None = Field(None, examples=[["code", "name", "symbol"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    populate: str | None = Field(None, examples=["*"])
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    sort: Sort3 | list[SortEnum] | dict[str, Sort4] | list[dict[str, Sort4]] | None = Field(None, examples=["code"])
    """
    Sort the result
    """
    status: Status1 | None = Field(None, examples=["published"])
    """
    Fetch documents based on their status. Default to "published" if not specified.
    """


class Data2(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    code: str = Field(..., max_length=3, min_length=3)
    """
    A string field
    """
    name: str
    """
    A string field
    """
    symbol: str
    """
    A string field
    """
    display_name: str = Field(..., alias="displayName")
    """
    A string field
    """
    decimal_places: int = Field(..., alias="decimalPlaces", ge=0, le=8)
    """
    An integer field
    """
    symbol_position: SymbolPosition1 = Field(..., alias="symbolPosition")
    """
    An enum field
    """
    thousands_separator: str = Field(..., alias="thousandsSeparator")
    """
    A string field
    """
    decimal_separator: str = Field(..., alias="decimalSeparator")
    """
    A string field
    """
    exchange_rate: float = Field(..., alias="exchangeRate")
    """
    A decimal field
    """
    sort_order: int = Field(..., alias="sortOrder", ge=-9007199254740991, le=9007199254740991)
    """
    An integer field
    """
    is_active: bool = Field(..., alias="isActive")
    """
    A boolean field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """


class CurrenciesIdGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data2
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field4(Enum):
    ENTRY_TITLE = "entryTitle"
    TITLE = "title"
    SUBTITLE = "subtitle"
    MESSAGE = "message"
    CTA_TEXT = "ctaText"
    SECONDARY_CTA_TEXT = "secondaryCtaText"
    CONTENT = "content"
    META_TITLE = "metaTitle"
    META_DESCRIPTION = "metaDescription"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Populate2(Enum):
    """
    Populate a single relation, component, file, or dynamic zone
    """

    LOCALIZATIONS = "localizations"


class PopulateEnum2(Enum):
    LOCALIZATIONS = "localizations"


class Error404GetParametersQuery(BaseModel):
    fields: list[Field4] | None = Field(None, examples=[["entryTitle", "title", "subtitle"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    populate: str | Populate2 | list[PopulateEnum2] | None = Field(None, examples=["*"])
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    locale: str | None = Field(None, examples=["en"])
    """
    Select a locale
    """
    status: Status1 | None = Field(None, examples=["published"])
    """
    Fetch documents based on their status. Default to "published" if not specified.
    """


class Data3(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    title: str
    """
    A string field
    """
    subtitle: str
    """
    A string field
    """
    message: str
    """
    A text field
    """
    cta_text: str = Field(..., alias="ctaText")
    """
    A string field
    """
    secondary_cta_text: str = Field(..., alias="secondaryCtaText")
    """
    A string field
    """
    content: str | None = None
    """
    A richtext field
    """
    meta_title: str | None = Field(None, alias="metaTitle")
    """
    A string field
    """
    meta_description: str | None = Field(None, alias="metaDescription")
    """
    A text field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    localizations: list[ApiError404Error404Document] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class Error404GetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data3
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field5(Enum):
    ENTRY_TITLE = "entryTitle"
    TITLE = "title"
    SUBTITLE = "subtitle"
    MESSAGE = "message"
    CTA_TEXT = "ctaText"
    SUPPORT_CONTACT_MESSAGE = "supportContactMessage"
    CONTENT = "content"
    META_TITLE = "metaTitle"
    META_DESCRIPTION = "metaDescription"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Error410GetParametersQuery(BaseModel):
    fields: list[Field5] | None = Field(None, examples=[["entryTitle", "title", "subtitle"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    populate: str | Populate2 | list[PopulateEnum2] | None = Field(None, examples=["*"])
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    locale: str | None = Field(None, examples=["en"])
    """
    Select a locale
    """
    status: Status1 | None = Field(None, examples=["published"])
    """
    Fetch documents based on their status. Default to "published" if not specified.
    """


class Data4(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    title: str
    """
    A string field
    """
    subtitle: str
    """
    A string field
    """
    message: str
    """
    A text field
    """
    cta_text: str = Field(..., alias="ctaText")
    """
    A string field
    """
    support_contact_message: str | None = Field(None, alias="supportContactMessage")
    """
    A string field
    """
    content: str | None = None
    """
    A richtext field
    """
    meta_title: str | None = Field(None, alias="metaTitle")
    """
    A string field
    """
    meta_description: str | None = Field(None, alias="metaDescription")
    """
    A text field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    localizations: list[ApiError410Error410Document] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class Error410GetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data4
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field6(Enum):
    ENTRY_TITLE = "entryTitle"
    BRAND_DESCRIPTION = "brandDescription"
    QUICK_LINKS_TITLE = "quickLinksTitle"
    NEWSLETTER_TITLE = "newsletterTitle"
    NEWSLETTER_DESCRIPTION = "newsletterDescription"
    SUBSCRIBE_BUTTON = "subscribeButton"
    EMAIL_PLACEHOLDER = "emailPlaceholder"
    COPYRIGHT_TEXT = "copyrightText"
    FOOTER_TAGLINE = "footerTagline"
    PRIVACY_POLICY_LABEL = "privacyPolicyLabel"
    TERMS_OF_SERVICE_LABEL = "termsOfServiceLabel"
    CONTACT_LABEL = "contactLabel"
    ABOUT_US_LABEL = "aboutUsLabel"
    TWITTER_ARIA_LABEL = "twitterAriaLabel"
    FACEBOOK_ARIA_LABEL = "facebookAriaLabel"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class FooterGetParametersQuery(BaseModel):
    fields: list[Field6] | None = Field(None, examples=[["entryTitle", "brandDescription", "quickLinksTitle"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    populate: str | Populate2 | list[PopulateEnum2] | None = Field(None, examples=["*"])
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    locale: str | None = Field(None, examples=["en"])
    """
    Select a locale
    """
    status: Status1 | None = Field(None, examples=["published"])
    """
    Fetch documents based on their status. Default to "published" if not specified.
    """


class Data5(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    brand_description: str = Field(..., alias="brandDescription")
    """
    A richtext field
    """
    quick_links_title: str = Field(..., alias="quickLinksTitle")
    """
    A string field
    """
    newsletter_title: str = Field(..., alias="newsletterTitle")
    """
    A string field
    """
    newsletter_description: str = Field(..., alias="newsletterDescription")
    """
    A text field
    """
    subscribe_button: str = Field(..., alias="subscribeButton")
    """
    A string field
    """
    email_placeholder: str = Field(..., alias="emailPlaceholder")
    """
    A string field
    """
    copyright_text: str = Field(..., alias="copyrightText")
    """
    A string field
    """
    footer_tagline: str = Field(..., alias="footerTagline")
    """
    A string field
    """
    privacy_policy_label: str | None = Field(None, alias="privacyPolicyLabel")
    """
    A string field
    """
    terms_of_service_label: str | None = Field(None, alias="termsOfServiceLabel")
    """
    A string field
    """
    contact_label: str | None = Field(None, alias="contactLabel")
    """
    A string field
    """
    about_us_label: str | None = Field(None, alias="aboutUsLabel")
    """
    A string field
    """
    twitter_aria_label: str | None = Field(None, alias="twitterAriaLabel")
    """
    A string field
    """
    facebook_aria_label: str | None = Field(None, alias="facebookAriaLabel")
    """
    A string field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    localizations: list[ApiFooterFooterDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class FooterGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data5
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field7(Enum):
    ENTRY_TITLE = "entryTitle"
    HERO_TITLE = "heroTitle"
    HERO_SUBTITLE = "heroSubtitle"
    HERO_CONTENT = "heroContent"
    FEATURED_PRODUCTS_TITLE = "featuredProductsTitle"
    FEATURED_PRODUCTS_DESCRIPTION = "featuredProductsDescription"
    TESTIMONIALS_TITLE = "testimonialsTitle"
    TESTIMONIALS_TEXT = "testimonialsText"
    WHY_CHOOSE_US_TITLE = "whyChooseUsTitle"
    FEATURED_SECTION_TITLE = "featuredSectionTitle"
    FEATURED_SECTION_SUBTITLE = "featuredSectionSubtitle"
    SEE_ALL_PRODUCTS_TEXT = "seeAllProductsText"
    FEATURED_BADGE_TEXT = "featuredBadgeText"
    VIEW_DETAILS_BUTTON_TEXT = "viewDetailsButtonText"
    TESTIMONIAL_AUTHOR = "testimonialAuthor"
    TESTIMONIAL_ROLE = "testimonialRole"
    META_TITLE = "metaTitle"
    META_DESCRIPTION = "metaDescription"
    META_KEYWORDS = "metaKeywords"
    SHOWING_PRODUCTS_TEMPLATE = "showingProductsTemplate"
    ALL_PRODUCTS_LABEL = "allProductsLabel"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Populate5(Enum):
    """
    Populate a single relation, component, file, or dynamic zone
    """

    FEATURE_CARDS = "featureCards"
    TRUST_CARDS = "trustCards"
    LOCALIZATIONS = "localizations"


class PopulateEnum5(Enum):
    FEATURE_CARDS = "featureCards"
    TRUST_CARDS = "trustCards"
    LOCALIZATIONS = "localizations"


class HomepageGetParametersQuery(BaseModel):
    fields: list[Field7] | None = Field(None, examples=[["entryTitle", "heroTitle", "heroSubtitle"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    populate: str | Populate5 | list[PopulateEnum5] | None = Field(None, examples=["*"])
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    locale: str | None = Field(None, examples=["en"])
    """
    Select a locale
    """
    status: Status1 | None = Field(None, examples=["published"])
    """
    Fetch documents based on their status. Default to "published" if not specified.
    """


class Data6(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    hero_title: str = Field(..., alias="heroTitle")
    """
    A string field
    """
    hero_subtitle: str = Field(..., alias="heroSubtitle")
    """
    A text field
    """
    hero_content: str | None = Field(None, alias="heroContent")
    """
    A richtext field
    """
    featured_products_title: str | None = Field(None, alias="featuredProductsTitle")
    """
    A string field
    """
    featured_products_description: str | None = Field(None, alias="featuredProductsDescription")
    """
    A text field
    """
    testimonials_title: str | None = Field(None, alias="testimonialsTitle")
    """
    A string field
    """
    testimonials_text: str | None = Field(None, alias="testimonialsText")
    """
    A text field
    """
    why_choose_us_title: str | None = Field(None, alias="whyChooseUsTitle")
    """
    A string field
    """
    featured_section_title: str | None = Field(None, alias="featuredSectionTitle")
    """
    A string field
    """
    featured_section_subtitle: str | None = Field(None, alias="featuredSectionSubtitle")
    """
    A string field
    """
    see_all_products_text: str | None = Field(None, alias="seeAllProductsText")
    """
    A string field
    """
    featured_badge_text: str = Field(..., alias="featuredBadgeText")
    """
    A string field
    """
    view_details_button_text: str = Field(..., alias="viewDetailsButtonText")
    """
    A string field
    """
    testimonial_author: str | None = Field(None, alias="testimonialAuthor")
    """
    A string field
    """
    testimonial_role: str | None = Field(None, alias="testimonialRole")
    """
    A string field
    """
    meta_title: str | None = Field(None, alias="metaTitle")
    """
    A string field
    """
    meta_description: str | None = Field(None, alias="metaDescription")
    """
    A text field
    """
    meta_keywords: Any | None = Field(None, alias="metaKeywords")
    """
    A JSON field
    """
    showing_products_template: str | None = Field(None, alias="showingProductsTemplate")
    """
    A string field
    """
    all_products_label: str | None = Field(None, alias="allProductsLabel")
    """
    A string field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    feature_cards: list[UiFeatureCardEntry] | None = Field(None, alias="featureCards")
    """
    A component field
    """
    trust_cards: list[UiTrustCardEntry] | None = Field(None, alias="trustCards")
    """
    A component field
    """
    localizations: list[ApiHomepageHomepageDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class HomepageGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data6
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field8(Enum):
    ENTRY_TITLE = "entryTitle"
    BRAND_NAME = "brandName"
    HOME_LABEL = "homeLabel"
    PRODUCTS_LABEL = "productsLabel"
    ABOUT_LABEL = "aboutLabel"
    CONTACT_LABEL = "contactLabel"
    LANGUAGE_SELECTOR_LABEL = "languageSelectorLabel"
    CURRENCY_SELECTOR_LABEL = "currencySelectorLabel"
    THEME_SELECTOR_LABEL = "themeSelectorLabel"
    THEME_LIGHT_LABEL = "themeLightLabel"
    THEME_DARK_LABEL = "themeDarkLabel"
    THEME_SYSTEM_LABEL = "themeSystemLabel"
    MOBILE_MENU_LABEL = "mobileMenuLabel"
    TWITTER_LABEL = "twitterLabel"
    FACEBOOK_LABEL = "facebookLabel"
    BROWSE_PRODUCTS_BUTTON = "browseProductsButton"
    PROMPT_TITLE_TEMPLATE = "promptTitleTemplate"
    PROMPT_MESSAGE_TEMPLATE = "promptMessageTemplate"
    YES_BUTTON_TEMPLATE = "yesButtonTemplate"
    NO_BUTTON_TEXT = "noButtonText"
    MOBILE_MENU_CLOSE_LABEL = "mobileMenuCloseLabel"
    CURRENCY_SELECTOR_ARIA_LABEL = "currencySelectorAriaLabel"
    LANGUAGE_SELECTOR_ARIA_LABEL = "languageSelectorAriaLabel"
    THEME_SELECTOR_ARIA_LABEL = "themeSelectorAriaLabel"
    AVAILABLE_IN_OTHER_LANGUAGES_LABEL = "availableInOtherLanguagesLabel"
    MOBILE_MENU_CLOSE_ARIA_LABEL = "mobileMenuCloseAriaLabel"
    SITE_TITLE = "siteTitle"
    SITE_DESCRIPTION = "siteDescription"
    SITE_KEYWORDS = "siteKeywords"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Populate6(Enum):
    """
    Populate a single relation, component, file, or dynamic zone
    """

    LOCALIZATIONS = "localizations"


class PopulateEnum6(Enum):
    LOCALIZATIONS = "localizations"


class NavigationGetParametersQuery(BaseModel):
    fields: list[Field8] | None = Field(None, examples=[["entryTitle", "brandName", "homeLabel"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    populate: str | Populate6 | list[PopulateEnum6] | None = Field(None, examples=["*"])
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    locale: str | None = Field(None, examples=["en"])
    """
    Select a locale
    """
    status: Status1 | None = Field(None, examples=["published"])
    """
    Fetch documents based on their status. Default to "published" if not specified.
    """


class Data7(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    brand_name: str = Field(..., alias="brandName")
    """
    A string field
    """
    home_label: str = Field(..., alias="homeLabel")
    """
    A string field
    """
    products_label: str = Field(..., alias="productsLabel")
    """
    A string field
    """
    about_label: str = Field(..., alias="aboutLabel")
    """
    A string field
    """
    contact_label: str = Field(..., alias="contactLabel")
    """
    A string field
    """
    language_selector_label: str | None = Field(None, alias="languageSelectorLabel")
    """
    A string field
    """
    currency_selector_label: str | None = Field(None, alias="currencySelectorLabel")
    """
    A string field
    """
    theme_selector_label: str | None = Field(None, alias="themeSelectorLabel")
    """
    A string field
    """
    theme_light_label: str | None = Field(None, alias="themeLightLabel")
    """
    A string field
    """
    theme_dark_label: str | None = Field(None, alias="themeDarkLabel")
    """
    A string field
    """
    theme_system_label: str | None = Field(None, alias="themeSystemLabel")
    """
    A string field
    """
    mobile_menu_label: str | None = Field(None, alias="mobileMenuLabel")
    """
    A string field
    """
    twitter_label: str | None = Field(None, alias="twitterLabel")
    """
    A string field
    """
    facebook_label: str | None = Field(None, alias="facebookLabel")
    """
    A string field
    """
    browse_products_button: str | None = Field(None, alias="browseProductsButton")
    """
    A string field
    """
    prompt_title_template: str | None = Field(None, alias="promptTitleTemplate")
    """
    A string field
    """
    prompt_message_template: str | None = Field(None, alias="promptMessageTemplate")
    """
    A text field
    """
    yes_button_template: str | None = Field(None, alias="yesButtonTemplate")
    """
    A string field
    """
    no_button_text: str | None = Field(None, alias="noButtonText")
    """
    A string field
    """
    mobile_menu_close_label: str | None = Field(None, alias="mobileMenuCloseLabel")
    """
    A string field
    """
    currency_selector_aria_label: str | None = Field(None, alias="currencySelectorAriaLabel")
    """
    A string field
    """
    language_selector_aria_label: str | None = Field(None, alias="languageSelectorAriaLabel")
    """
    A string field
    """
    theme_selector_aria_label: str | None = Field(None, alias="themeSelectorAriaLabel")
    """
    A string field
    """
    available_in_other_languages_label: str | None = Field(None, alias="availableInOtherLanguagesLabel")
    """
    A string field
    """
    mobile_menu_close_aria_label: str | None = Field(None, alias="mobileMenuCloseAriaLabel")
    """
    A string field
    """
    site_title: str | None = Field(None, alias="siteTitle")
    """
    A string field
    """
    site_description: str | None = Field(None, alias="siteDescription")
    """
    A text field
    """
    site_keywords: Any | None = Field(None, alias="siteKeywords")
    """
    A JSON field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    localizations: list[ApiNavigationNavigationDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class NavigationGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data7
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field9(Enum):
    ENTRY_TITLE = "entryTitle"
    TITLE = "title"
    LAST_UPDATED = "lastUpdated"
    CONTENT = "content"
    META_TITLE = "metaTitle"
    META_DESCRIPTION = "metaDescription"
    META_KEYWORDS = "metaKeywords"
    LAST_UPDATED_LABEL = "lastUpdatedLabel"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class PrivacyGetParametersQuery(BaseModel):
    fields: list[Field9] | None = Field(None, examples=[["entryTitle", "title", "lastUpdated"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    populate: str | Populate6 | list[PopulateEnum6] | None = Field(None, examples=["*"])
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    locale: str | None = Field(None, examples=["en"])
    """
    Select a locale
    """
    status: Status1 | None = Field(None, examples=["published"])
    """
    Fetch documents based on their status. Default to "published" if not specified.
    """


class Data8(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    title: str
    """
    A string field
    """
    last_updated: str | None = Field(None, alias="lastUpdated")
    """
    A datetime field
    """
    content: str
    """
    A richtext field
    """
    meta_title: str | None = Field(None, alias="metaTitle")
    """
    A string field
    """
    meta_description: str | None = Field(None, alias="metaDescription")
    """
    A text field
    """
    meta_keywords: Any | None = Field(None, alias="metaKeywords")
    """
    A JSON field
    """
    last_updated_label: str | None = Field(None, alias="lastUpdatedLabel")
    """
    A string field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    localizations: list[ApiPrivacyPrivacyDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class PrivacyGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data8
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field10(Enum):
    TITLE = "title"
    SLUG = "slug"
    DESCRIPTION = "description"
    CONTENT = "content"
    EXCERPT = "excerpt"
    META_TITLE = "metaTitle"
    META_DESCRIPTION = "metaDescription"
    META_KEYWORDS = "metaKeywords"
    AFFILIATE_URL = "affiliateUrl"
    PRICE = "price"
    CURRENCY = "currency"
    FEATURED = "featured"
    CATEGORY = "category"
    TRANSLATION_STATUS = "translationStatus"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Pagination21(BaseModel):
    """
    Page-based pagination
    """

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    page: int = Field(..., gt=0, le=9007199254740991)
    """
    Page number (1-based)
    """
    page_size: int = Field(..., alias="pageSize", gt=0, le=9007199254740991)
    """
    Number of entries per page
    """


class Pagination22(BaseModel):
    """
    Offset-based pagination
    """

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    start: int = Field(..., ge=0, le=9007199254740991)
    """
    Number of entries to skip
    """
    limit: int = Field(..., gt=0, le=9007199254740991)
    """
    Maximum number of entries to return
    """


class Pagination23(BaseModel):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    with_count: bool | None = Field(None, alias="withCount")
    """
    Include total count in response
    """


class Pagination24(Pagination21, Pagination23):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination25(Pagination22, Pagination23):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination2(RootModel[Union[Pagination24, Pagination25]]):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    root: Pagination24 | Pagination25
    """
    Pagination parameters
    """


class Sort6(Enum):
    """
    Sort the result
    """

    TITLE = "title"
    SLUG = "slug"
    DESCRIPTION = "description"
    CONTENT = "content"
    EXCERPT = "excerpt"
    META_TITLE = "metaTitle"
    META_DESCRIPTION = "metaDescription"
    META_KEYWORDS = "metaKeywords"
    AFFILIATE_URL = "affiliateUrl"
    PRICE = "price"
    CURRENCY = "currency"
    FEATURED = "featured"
    CATEGORY = "category"
    TRANSLATION_STATUS = "translationStatus"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class SortEnum2(Enum):
    TITLE = "title"
    SLUG = "slug"
    DESCRIPTION = "description"
    CONTENT = "content"
    EXCERPT = "excerpt"
    META_TITLE = "metaTitle"
    META_DESCRIPTION = "metaDescription"
    META_KEYWORDS = "metaKeywords"
    AFFILIATE_URL = "affiliateUrl"
    PRICE = "price"
    CURRENCY = "currency"
    FEATURED = "featured"
    CATEGORY = "category"
    TRANSLATION_STATUS = "translationStatus"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort7(Enum):
    ASC = "asc"
    DESC = "desc"


class ProductsGetParametersQuery(BaseModel):
    fields: list[Field10] | None = Field(None, examples=[["title", "slug", "description"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    field_q: str | None = Field(None, alias="_q", examples=["search terms"])
    pagination: Pagination2 | None = None
    """
    Pagination parameters
    """
    sort: Sort6 | list[SortEnum2] | dict[str, Sort7] | list[dict[str, Sort7]] | None = Field(None, examples=["title"])
    """
    Sort the result
    """
    populate: str | Populate6 | list[PopulateEnum6] | None = Field(None, examples=["*"])
    locale: str | None = Field(None, examples=["en"])
    """
    Select a locale
    """
    status: Status1 | None = Field(None, examples=["published"])
    """
    Fetch documents based on their status. Default to "published" if not specified.
    """


class Datum1(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    title: str
    """
    A string field
    """
    slug: str
    """
    A UID field
    """
    description: str | None = None
    """
    A text field
    """
    content: str
    """
    A richtext field
    """
    excerpt: str | None = None
    """
    A text field
    """
    meta_title: str | None = Field(None, alias="metaTitle")
    """
    A string field
    """
    meta_description: str | None = Field(None, alias="metaDescription")
    """
    A text field
    """
    meta_keywords: Any | None = Field(None, alias="metaKeywords")
    """
    A JSON field
    """
    affiliate_url: str | None = Field(None, alias="affiliateUrl")
    """
    A string field
    """
    price: float | None = None
    """
    A decimal field
    """
    currency: Currency1
    """
    An enum field
    """
    featured: bool
    """
    A boolean field
    """
    category: str | None = None
    """
    A string field
    """
    translation_status: TranslationStatus = Field(..., alias="translationStatus")
    """
    An enum field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    localizations: list[ApiProductProductDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ProductsGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: list[Datum1]
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Sort9(Enum):
    """
    Sort the result
    """

    TITLE = "title"
    SLUG = "slug"
    DESCRIPTION = "description"
    CONTENT = "content"
    EXCERPT = "excerpt"
    META_TITLE = "metaTitle"
    META_DESCRIPTION = "metaDescription"
    META_KEYWORDS = "metaKeywords"
    AFFILIATE_URL = "affiliateUrl"
    PRICE = "price"
    CURRENCY = "currency"
    FEATURED = "featured"
    CATEGORY = "category"
    TRANSLATION_STATUS = "translationStatus"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort10(Enum):
    ASC = "asc"
    DESC = "desc"


class ProductsIdGetParametersQuery(BaseModel):
    fields: list[Field10] | None = Field(None, examples=[["title", "slug", "description"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    populate: str | Populate6 | list[PopulateEnum6] | None = Field(None, examples=["*"])
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    sort: Sort9 | list[SortEnum2] | dict[str, Sort10] | list[dict[str, Sort10]] | None = Field(None, examples=["title"])
    """
    Sort the result
    """
    locale: str | None = Field(None, examples=["en"])
    """
    Select a locale
    """
    status: Status1 | None = Field(None, examples=["published"])
    """
    Fetch documents based on their status. Default to "published" if not specified.
    """


class Data9(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    title: str
    """
    A string field
    """
    slug: str
    """
    A UID field
    """
    description: str | None = None
    """
    A text field
    """
    content: str
    """
    A richtext field
    """
    excerpt: str | None = None
    """
    A text field
    """
    meta_title: str | None = Field(None, alias="metaTitle")
    """
    A string field
    """
    meta_description: str | None = Field(None, alias="metaDescription")
    """
    A text field
    """
    meta_keywords: Any | None = Field(None, alias="metaKeywords")
    """
    A JSON field
    """
    affiliate_url: str | None = Field(None, alias="affiliateUrl")
    """
    A string field
    """
    price: float | None = None
    """
    A decimal field
    """
    currency: Currency1
    """
    An enum field
    """
    featured: bool
    """
    A boolean field
    """
    category: str | None = None
    """
    A string field
    """
    translation_status: TranslationStatus = Field(..., alias="translationStatus")
    """
    An enum field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    localizations: list[ApiProductProductDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ProductsIdGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data9
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field12(Enum):
    ENTRY_TITLE = "entryTitle"
    TITLE = "title"
    SUBTITLE = "subtitle"
    DESCRIPTION = "description"
    ITEMS_PER_PAGE = "itemsPerPage"
    PREVIOUS_BUTTON = "previousButton"
    NEXT_BUTTON = "nextButton"
    NO_PRODUCTS_MESSAGE = "noProductsMessage"
    SHOWING_TEXT = "showingText"
    PAGE_TEXT = "pageText"
    META_TITLE = "metaTitle"
    META_DESCRIPTION = "metaDescription"
    META_KEYWORDS = "metaKeywords"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class ProductPageGetParametersQuery(BaseModel):
    fields: list[Field12] | None = Field(None, examples=[["entryTitle", "title", "subtitle"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    populate: str | Populate6 | list[PopulateEnum6] | None = Field(None, examples=["*"])
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    locale: str | None = Field(None, examples=["en"])
    """
    Select a locale
    """
    status: Status1 | None = Field(None, examples=["published"])
    """
    Fetch documents based on their status. Default to "published" if not specified.
    """


class Data10(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    title: str
    """
    A string field
    """
    subtitle: str | None = None
    """
    A text field
    """
    description: str | None = None
    """
    A richtext field
    """
    items_per_page: int = Field(..., alias="itemsPerPage", ge=-9007199254740991, le=9007199254740991)
    """
    An integer field
    """
    previous_button: str | None = Field(None, alias="previousButton")
    """
    A string field
    """
    next_button: str | None = Field(None, alias="nextButton")
    """
    A string field
    """
    no_products_message: str | None = Field(None, alias="noProductsMessage")
    """
    A string field
    """
    showing_text: str = Field(..., alias="showingText")
    """
    A string field
    """
    page_text: str = Field(..., alias="pageText")
    """
    A string field
    """
    meta_title: str | None = Field(None, alias="metaTitle")
    """
    A string field
    """
    meta_description: str | None = Field(None, alias="metaDescription")
    """
    A text field
    """
    meta_keywords: Any | None = Field(None, alias="metaKeywords")
    """
    A JSON field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    localizations: list[ApiProductPageProductPageDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ProductPageGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data10
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field13(Enum):
    ENTRY_TITLE = "entryTitle"
    UNKNOWN_ERROR_MESSAGE = "unknownErrorMessage"
    NETWORK_ERROR_MESSAGE = "networkErrorMessage"
    UNEXPECTED_ERROR_MESSAGE = "unexpectedErrorMessage"
    TRANSLATION_NOT_AVAILABLE_TITLE = "translationNotAvailableTitle"
    TRANSLATION_NOT_AVAILABLE_MESSAGE = "translationNotAvailableMessage"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class SystemMessageGetParametersQuery(BaseModel):
    fields: list[Field13] | None = Field(None, examples=[["entryTitle", "unknownErrorMessage", "networkErrorMessage"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    populate: str | Populate6 | list[PopulateEnum6] | None = Field(None, examples=["*"])
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    locale: str | None = Field(None, examples=["en"])
    """
    Select a locale
    """
    status: Status1 | None = Field(None, examples=["published"])
    """
    Fetch documents based on their status. Default to "published" if not specified.
    """


class Data11(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    unknown_error_message: str | None = Field(None, alias="unknownErrorMessage")
    """
    A string field
    """
    network_error_message: str | None = Field(None, alias="networkErrorMessage")
    """
    A string field
    """
    unexpected_error_message: str | None = Field(None, alias="unexpectedErrorMessage")
    """
    A string field
    """
    translation_not_available_title: str | None = Field(None, alias="translationNotAvailableTitle")
    """
    A string field
    """
    translation_not_available_message: str | None = Field(None, alias="translationNotAvailableMessage")
    """
    A text field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    localizations: list[ApiSystemMessageSystemMessageDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class SystemMessageGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data11
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field14(Enum):
    ENTRY_TITLE = "entryTitle"
    TITLE = "title"
    LAST_UPDATED = "lastUpdated"
    CONTENT = "content"
    META_TITLE = "metaTitle"
    META_DESCRIPTION = "metaDescription"
    META_KEYWORDS = "metaKeywords"
    LAST_UPDATED_LABEL = "lastUpdatedLabel"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class TermGetParametersQuery(BaseModel):
    fields: list[Field14] | None = Field(None, examples=[["entryTitle", "title", "lastUpdated"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    populate: str | Populate6 | list[PopulateEnum6] | None = Field(None, examples=["*"])
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    locale: str | None = Field(None, examples=["en"])
    """
    Select a locale
    """
    status: Status1 | None = Field(None, examples=["published"])
    """
    Fetch documents based on their status. Default to "published" if not specified.
    """


class Data12(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: float
    entry_title: str = Field(..., alias="entryTitle")
    """
    A string field
    """
    title: str
    """
    A string field
    """
    last_updated: str | None = Field(None, alias="lastUpdated")
    """
    A datetime field
    """
    content: str
    """
    A richtext field
    """
    meta_title: str | None = Field(None, alias="metaTitle")
    """
    A string field
    """
    meta_description: str | None = Field(None, alias="metaDescription")
    """
    A text field
    """
    meta_keywords: Any | None = Field(None, alias="metaKeywords")
    """
    A JSON field
    """
    last_updated_label: str | None = Field(None, alias="lastUpdatedLabel")
    """
    A string field
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    locale: str | None = Field(None, examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    localizations: list[ApiTermTermDocument] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class TermGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data12
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Attributes(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    type: Literal["media"]
    configurable: Literal[False] = False
    private: bool | None = None
    plugin_options: dict[str, Any] | None = Field(None, alias="pluginOptions")
    multiple: bool
    required: bool | None = None
    allowed_types: list[str] | None = Field(None, alias="allowedTypes")


class Attributes1(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    type: Literal["relation"]
    configurable: Literal[False] = False
    private: bool | None = None
    plugin_options: dict[str, Any] | None = Field(None, alias="pluginOptions")
    relation: str
    target: str
    target_attribute: str | None = Field(..., alias="targetAttribute")
    auto_populate: bool | None = Field(None, alias="autoPopulate")
    mapped_by: str | None = Field(None, alias="mappedBy")
    inversed_by: str | None = Field(None, alias="inversedBy")


class Attributes2(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    type: Literal["component"]
    configurable: Literal[False] = False
    private: bool | None = None
    plugin_options: dict[str, Any] | None = Field(None, alias="pluginOptions")
    component: str
    repeatable: bool
    required: bool | None = None
    min: float | None = None
    max: float | None = None


class Attributes3(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    type: Literal["dynamiczone"]
    configurable: Literal[False] = False
    private: bool | None = None
    plugin_options: dict[str, Any] | None = Field(None, alias="pluginOptions")
    components: list[str]
    required: bool | None = None
    min: float | None = None
    max: float | None = None


class Attributes4(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    type: Literal["uid"]
    configurable: Literal[False] = False
    private: bool | None = None
    plugin_options: dict[str, Any] | None = Field(None, alias="pluginOptions")
    target_field: str | None = Field(None, alias="targetField")


class Attributes5(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    type: str
    required: bool | None = None
    unique: bool | None = None
    default: Any | None = None
    min: float | str | None = None
    max: float | str | None = None
    min_length: float | None = Field(None, alias="minLength")
    max_length: float | None = Field(None, alias="maxLength")
    enum: list[str] | None = None
    regex: str | None = None
    private: bool | None = None
    configurable: bool | None = None
    plugin_options: dict[str, Any] | None = Field(None, alias="pluginOptions")


class Schema(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    display_name: str = Field(..., alias="displayName")
    description: str
    icon: str | None = None
    connection: str | None = None
    collection_name: str | None = Field(None, alias="collectionName")
    attributes: dict[str, Attributes | Attributes1 | Attributes2 | Attributes3 | Attributes4 | Attributes5]
    plugin_options: dict[str, Any] | None = Field(None, alias="pluginOptions")


class Datum2(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    uid: str
    category: str
    api_id: str = Field(..., alias="apiId")
    schema_: Schema = Field(..., alias="schema")


class ComponentsGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: list[Datum2]
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Attributes6(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    type: Literal["media"]
    configurable: Literal[False] = False
    private: bool | None = None
    plugin_options: dict[str, Any] | None = Field(None, alias="pluginOptions")
    multiple: bool
    required: bool | None = None
    allowed_types: list[str] | None = Field(None, alias="allowedTypes")


class Attributes7(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    type: Literal["relation"]
    configurable: Literal[False] = False
    private: bool | None = None
    plugin_options: dict[str, Any] | None = Field(None, alias="pluginOptions")
    relation: str
    target: str
    target_attribute: str | None = Field(..., alias="targetAttribute")
    auto_populate: bool | None = Field(None, alias="autoPopulate")
    mapped_by: str | None = Field(None, alias="mappedBy")
    inversed_by: str | None = Field(None, alias="inversedBy")


class Attributes8(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    type: Literal["component"]
    configurable: Literal[False] = False
    private: bool | None = None
    plugin_options: dict[str, Any] | None = Field(None, alias="pluginOptions")
    component: str
    repeatable: bool
    required: bool | None = None
    min: float | None = None
    max: float | None = None


class Attributes9(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    type: Literal["dynamiczone"]
    configurable: Literal[False] = False
    private: bool | None = None
    plugin_options: dict[str, Any] | None = Field(None, alias="pluginOptions")
    components: list[str]
    required: bool | None = None
    min: float | None = None
    max: float | None = None


class Attributes10(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    type: Literal["uid"]
    configurable: Literal[False] = False
    private: bool | None = None
    plugin_options: dict[str, Any] | None = Field(None, alias="pluginOptions")
    target_field: str | None = Field(None, alias="targetField")


class Attributes11(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    type: str
    required: bool | None = None
    unique: bool | None = None
    default: Any | None = None
    min: float | str | None = None
    max: float | str | None = None
    min_length: float | None = Field(None, alias="minLength")
    max_length: float | None = Field(None, alias="maxLength")
    enum: list[str] | None = None
    regex: str | None = None
    private: bool | None = None
    configurable: bool | None = None
    plugin_options: dict[str, Any] | None = Field(None, alias="pluginOptions")


class Schema1(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    display_name: str = Field(..., alias="displayName")
    description: str
    icon: str | None = None
    connection: str | None = None
    collection_name: str | None = Field(None, alias="collectionName")
    attributes: dict[str, Attributes6 | Attributes7 | Attributes8 | Attributes9 | Attributes10 | Attributes11]
    plugin_options: dict[str, Any] | None = Field(None, alias="pluginOptions")


class Data13(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    uid: str
    category: str
    api_id: str = Field(..., alias="apiId")
    schema_: Schema1 = Field(..., alias="schema")


class ComponentsUidGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data13
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Pagination31(BaseModel):
    """
    Page-based pagination
    """

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    page: int = Field(..., gt=0, le=9007199254740991)
    """
    Page number (1-based)
    """
    page_size: int = Field(..., alias="pageSize", gt=0, le=9007199254740991)
    """
    Number of entries per page
    """


class Pagination32(BaseModel):
    """
    Offset-based pagination
    """

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    start: int = Field(..., ge=0, le=9007199254740991)
    """
    Number of entries to skip
    """
    limit: int = Field(..., gt=0, le=9007199254740991)
    """
    Maximum number of entries to return
    """


class Pagination33(BaseModel):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    with_count: bool | None = Field(None, alias="withCount")
    """
    Include total count in response
    """


class Pagination34(Pagination31, Pagination33):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination35(Pagination32, Pagination33):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination3(RootModel[Union[Pagination34, Pagination35]]):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )
    root: Pagination34 | Pagination35
    """
    Pagination parameters
    """


class FilesGetParametersQuery(BaseModel):
    fields: str | list[str] | None = None
    """
    Select specific fields to return in the response
    """
    populate: str | list[str] | dict[str, Any] | None = Field(None, examples=["*"])
    """
    Specify which relations to populate in the response
    """
    sort: str | list[str] | dict[str, Sort10] | list[dict[str, Sort10]] | None = None
    """
    Sort the results by specified fields
    """
    pagination: Pagination3 | None = None
    """
    Pagination parameters
    """
    filters: dict[str, Any] | None = None
    """
    Apply filters to the query
    """


class FilesGetResponseItem(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    id: int = Field(..., gt=0, le=9007199254740991)
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    name: str
    alternative_text: str | None = Field(None, alias="alternativeText")
    caption: str | None = None
    width: int | None = Field(None, ge=-9007199254740991, le=9007199254740991)
    height: int | None = Field(None, ge=-9007199254740991, le=9007199254740991)
    formats: dict[str, Any] | None = None
    hash: str
    ext: str | None = None
    mime: str
    size: float
    url: str
    preview_url: str | None = Field(None, alias="previewUrl")
    folder: float | None = None
    folder_path: str = Field(..., alias="folderPath")
    provider: str
    provider_metadata: dict[str, Any] | None = None
    created_at: str = Field(..., alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str = Field(..., alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    created_by: float | None = Field(None, alias="createdBy")
    updated_by: float | None = Field(None, alias="updatedBy")


class FilesGetResponse(RootModel[list[FilesGetResponseItem]]):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    root: list[FilesGetResponseItem]


class FilesIdGetParametersQuery(BaseModel):
    fields: str | list[str] | None = None
    """
    Select specific fields to return in the response
    """
    populate: str | list[str] | dict[str, Any] | None = Field(None, examples=["*"])
    """
    Specify which relations to populate in the response
    """


class FilesIdGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    id: int = Field(..., gt=0, le=9007199254740991)
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    name: str
    alternative_text: str | None = Field(None, alias="alternativeText")
    caption: str | None = None
    width: int | None = Field(None, ge=-9007199254740991, le=9007199254740991)
    height: int | None = Field(None, ge=-9007199254740991, le=9007199254740991)
    formats: dict[str, Any] | None = None
    hash: str
    ext: str | None = None
    mime: str
    size: float
    url: str
    preview_url: str | None = Field(None, alias="previewUrl")
    folder: float | None = None
    folder_path: str = Field(..., alias="folderPath")
    provider: str
    provider_metadata: dict[str, Any] | None = None
    created_at: str = Field(..., alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str = Field(..., alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    created_by: float | None = Field(None, alias="createdBy")
    updated_by: float | None = Field(None, alias="updatedBy")


class LocalesGetResponseItem(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    id: int = Field(..., gt=0, le=9007199254740991)
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    name: str
    code: str = Field(..., max_length=2, min_length=2)
    created_at: str = Field(..., alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str = Field(..., alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str | None = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    is_default: bool = Field(..., alias="isDefault")


class LocalesGetResponse(RootModel[list[LocalesGetResponseItem]]):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    root: list[LocalesGetResponseItem]


ApiAboutAboutDocument.model_rebuild()
ApiContactContactDocument.model_rebuild()
ApiError404Error404Document.model_rebuild()
ApiError410Error410Document.model_rebuild()
ApiFooterFooterDocument.model_rebuild()
ApiHomepageHomepageDocument.model_rebuild()
ApiNavigationNavigationDocument.model_rebuild()
ApiPrivacyPrivacyDocument.model_rebuild()
ApiProductProductDocument.model_rebuild()
ApiProductPageProductPageDocument.model_rebuild()
ApiSystemMessageSystemMessageDocument.model_rebuild()
ApiTermTermDocument.model_rebuild()
