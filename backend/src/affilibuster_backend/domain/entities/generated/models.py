# Copyright (c) 2026 Affilibuster by Ronen Druker.

from __future__ import annotations

from enum import StrEnum
from typing import Any, Literal
from uuid import UUID

from pydantic import AnyUrl, AwareDatetime, BaseModel, ConfigDict, EmailStr, Field, RootModel, SecretStr


class Status(StrEnum):
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


class CurrencyCode(StrEnum):
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


class Code(StrEnum):
    EN = "en"
    IT = "it"
    HE = "he"


class Direction(StrEnum):
    LTR = "ltr"
    RTL = "rtl"


class Language(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    code: Code = Field(..., examples=["it"])
    display_name: str = Field(..., alias="displayName", examples=["Italian"])
    native_name: str = Field(..., alias="nativeName", examples=["Italiano"])
    flag: str = Field(..., examples=["🇮🇹"])
    """
    Flag emoji for the language (e.g. 🇬🇧, 🇮🇹, 🇮🇱)
    """
    direction: Direction = Field(..., examples=["ltr"])
    url_prefix: str = Field(..., alias="urlPrefix", examples=["/it"])
    default_currency: CurrencyCode = Field(..., alias="defaultCurrency")
    locale_code: str = Field(..., alias="localeCode", examples=["it-IT"])
    is_default: bool = Field(..., alias="isDefault", examples=[False])


class DetectedLanguage1(StrEnum):
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
        None, alias="suggestedUrl", examples=["https://thegreenbrother.com/it/products/eco-bottle"]
    )


class DetectedLanguage2(StrEnum):
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


class ElementsSeoMetadataEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    meta_title: str | None = Field(None, alias="metaTitle")
    """
    A string field
    """
    meta_description: str | None = Field(None, alias="metaDescription")
    """
    A string field
    """
    meta_keywords: Any | None = Field(None, alias="metaKeywords")
    """
    A JSON field
    """
    id: int | None = None
    """
    Component instance ID
    """


class Localization(BaseModel):
    """
    Simplified localization reference as returned by Strapi (scalar fields only, no components)
    """

    model_config = ConfigDict(
        extra="allow",
        populate_by_name=True,
    )
    id: float
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    locale: str = Field(..., examples=["en"])
    """
    The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.
    """
    created_at: str | None = Field(None, alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was first created in the CMS.
    """
    updated_at: str | None = Field(None, alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])
    """
    Timestamp when this entry was last modified.
    """
    published_at: str | None = Field(None, alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """


class ApiAuthPageAuthPageDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    login_title: str | None = Field(None, alias="loginTitle")
    """
    A string field
    """
    login_subtitle: str | None = Field(None, alias="loginSubtitle")
    """
    A text field
    """
    signup_title: str | None = Field(None, alias="signupTitle")
    """
    A string field
    """
    signup_subtitle: str | None = Field(None, alias="signupSubtitle")
    """
    A text field
    """
    email_label: str | None = Field(None, alias="emailLabel")
    """
    A string field
    """
    email_placeholder: str | None = Field(None, alias="emailPlaceholder")
    """
    A string field
    """
    password_label: str | None = Field(None, alias="passwordLabel")
    """
    A string field
    """
    password_placeholder: str | None = Field(None, alias="passwordPlaceholder")
    """
    A string field
    """
    name_label: str | None = Field(None, alias="nameLabel")
    """
    A string field
    """
    name_placeholder: str | None = Field(None, alias="namePlaceholder")
    """
    A string field
    """
    login_button: str | None = Field(None, alias="loginButton")
    """
    A string field
    """
    signup_button: str | None = Field(None, alias="signupButton")
    """
    A string field
    """
    forgot_password_link: str | None = Field(None, alias="forgotPasswordLink")
    """
    A string field
    """
    no_account_text: str | None = Field(None, alias="noAccountText")
    """
    A string field
    """
    signup_link_text: str | None = Field(None, alias="signupLinkText")
    """
    A string field
    """
    have_account_text: str | None = Field(None, alias="haveAccountText")
    """
    A string field
    """
    login_link_text: str | None = Field(None, alias="loginLinkText")
    """
    A string field
    """
    or_divider_text: str | None = Field(None, alias="orDividerText")
    """
    A string field
    """
    google_button: str | None = Field(None, alias="googleButton")
    """
    A string field
    """
    apple_button: str | None = Field(None, alias="appleButton")
    """
    A string field
    """
    terms_checkbox_text: str | None = Field(None, alias="termsCheckboxText")
    """
    A string field
    """
    terms_link_text: str | None = Field(None, alias="termsLinkText")
    """
    A string field
    """
    privacy_link_text: str | None = Field(None, alias="privacyLinkText")
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
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class IconPosition(StrEnum):
    """
    An enum field
    """

    BEFORE_TEXT = "before_text"
    AFTER_TEXT = "after_text"


class ElementsLabelEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    icon: str | None = None
    """
    A string field
    """
    icon_position: IconPosition | None = Field("before_text", alias="iconPosition")
    """
    An enum field
    """
    text: str
    """
    A text field
    """
    aria_description: str = Field(..., alias="ariaDescription")
    """
    A string field
    """
    id: int | None = None
    """
    Component instance ID
    """


class Alignment(StrEnum):
    """
    An enum field
    """

    CENTER_ = "center"
    LANGUAGE_DIRECTION = "language-direction"


class ElementsHeaderEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    alignment: Alignment | None = "language-direction"
    """
    An enum field
    """
    promote_header_icon: bool | None = Field(False, alias="promoteHeaderIcon")
    """
    A boolean field
    """
    header: ElementsLabelEntry | None = Field(default_factory=ElementsLabelEntry)
    """
    A component field
    """
    subheader: ElementsLabelEntry | None = Field(default_factory=ElementsLabelEntry)
    """
    A component field
    """
    id: int | None = None
    """
    Component instance ID
    """


class ApiBlogPostTagBlogPostTagDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    tag_id: str = Field(..., alias="tagId")
    """
    A UID field
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
    tag: ElementsLabelEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ElementsTextBlockEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    content: str | None = None
    """
    A richtext field
    """
    header: ElementsHeaderEntry | None = Field(default_factory=ElementsHeaderEntry)
    """
    A component field
    """
    id: int | None = None
    """
    Component instance ID
    """


class PluginUploadFileDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    name: str
    """
    A string field
    """
    alternative_text: str | None = Field(None, alias="alternativeText")
    """
    A text field
    """
    caption: str | None = None
    """
    A text field
    """
    focal_point: Any | None = Field(None, alias="focalPoint")
    """
    A JSON field
    """
    width: int | None = Field(None, ge=-9007199254740991, le=9007199254740991)
    """
    An integer field
    """
    height: int | None = Field(None, ge=-9007199254740991, le=9007199254740991)
    """
    An integer field
    """
    formats: Any | None = None
    """
    A JSON field
    """
    hash: str
    """
    A string field
    """
    ext: str | None = None
    """
    A string field
    """
    mime: str
    """
    A string field
    """
    size: float
    """
    A decimal field
    """
    url: str
    """
    A text field
    """
    preview_url: str | None = Field(None, alias="previewUrl")
    """
    A text field
    """
    provider: str
    """
    A string field
    """
    provider_metadata: Any | None = None
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
    related: Any | None = None


class ApiContributorRoleContributorRoleDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    role_id: str = Field(..., alias="roleId")
    """
    A UID field
    """
    name: str
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
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ApiContributorContributorDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    slug: str
    """
    A UID field
    """
    first_name: str = Field(..., alias="firstName")
    """
    A string field
    """
    last_name: str | None = Field(None, alias="lastName")
    """
    A string field
    """
    bio: str
    """
    A richtext field
    """
    email: EmailStr | None = Field(None, examples=["user@example.com"])
    """
    RFC 5321 compliant email address. Validated for correct format including domain and TLD requirements.
    """
    website: str | None = None
    """
    A string field
    """
    twitter: str | None = None
    """
    A string field
    """
    linkedin: str | None = None
    """
    A string field
    """
    github: str | None = None
    """
    A string field
    """
    instagram: str | None = None
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
    profile_picture: PluginUploadFileDocument | None = Field(
        default_factory=PluginUploadFileDocument, alias="profilePicture"
    )
    """
    A media field
    """
    roles: list[ApiContributorRoleContributorRoleDocument]
    """
    A relational field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ApiBlogPostBlogPostDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    slug: str
    """
    A UID field
    """
    read_time_in_minutes: int | None = Field(5, alias="readTimeInMinutes", ge=-9007199254740991, le=9007199254740991)
    """
    An integer field
    """
    published_date: str = Field(..., alias="publishedDate")
    """
    A datetime field
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
    content: ElementsTextBlockEntry
    """
    A component field
    """
    featured_image: PluginUploadFileDocument = Field(..., alias="featuredImage")
    """
    A media field
    """
    author: ApiContributorContributorDocument
    """
    A relational field
    """
    tags: list[ApiBlogPostTagBlogPostTagDocument]
    """
    A relational field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ElementsButtonEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    url: str
    """
    A string field
    """
    open_in_new_tab: bool | None = Field(False, alias="openInNewTab")
    """
    A boolean field
    """
    label: ElementsLabelEntry | None = Field(default_factory=ElementsLabelEntry)
    """
    A component field
    """
    id: int | None = None
    """
    Component instance ID
    """


class CallToActionsPaginationCtaEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    items_per_page: int = Field(..., alias="itemsPerPage", ge=-9007199254740991, le=9007199254740991)
    """
    An integer field
    """
    previous_button: ElementsButtonEntry = Field(..., alias="previousButton")
    """
    A component field
    """
    next_button: ElementsButtonEntry = Field(..., alias="nextButton")
    """
    A component field
    """
    no_items_found: ElementsHeaderEntry = Field(..., alias="noItemsFound")
    """
    A component field
    """
    id: int | None = None
    """
    Component instance ID
    """


class ApiBlogBlogDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
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
    header: ElementsHeaderEntry
    """
    A component field
    """
    tag_filters: list[ApiBlogPostTagBlogPostTagDocument] | None = Field(None, alias="tagFilters")
    """
    A relational field
    """
    featured_blog_posts: list[ApiBlogPostBlogPostDocument] | None = Field(None, alias="featuredBlogPosts")
    """
    A relational field
    """
    pagination: CallToActionsPaginationCtaEntry
    """
    A component field
    """
    read_article_label: ElementsLabelEntry = Field(..., alias="readArticleLabel")
    """
    A component field
    """
    read_time_minutes_label: ElementsLabelEntry = Field(..., alias="readTimeMinutesLabel")
    """
    A component field
    """
    about_author_header: ElementsHeaderEntry = Field(..., alias="aboutAuthorHeader")
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ApiContactUsContactUsDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    title: str | None = None
    """
    A string field
    """
    subtitle: str | None = None
    """
    A text field
    """
    contact_tab_label: str | None = Field(None, alias="contactTabLabel")
    """
    A string field
    """
    faq_tab_label: str | None = Field(None, alias="faqTabLabel")
    """
    A string field
    """
    name_label: str | None = Field(None, alias="nameLabel")
    """
    A string field
    """
    name_placeholder: str | None = Field(None, alias="namePlaceholder")
    """
    A string field
    """
    email_label: str | None = Field(None, alias="emailLabel")
    """
    A string field
    """
    email_placeholder: str | None = Field(None, alias="emailPlaceholder")
    """
    A string field
    """
    message_label: str | None = Field(None, alias="messageLabel")
    """
    A string field
    """
    message_placeholder: str | None = Field(None, alias="messagePlaceholder")
    """
    A string field
    """
    submit_button: str | None = Field(None, alias="submitButton")
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
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class SymbolPosition(StrEnum):
    """
    An enum field
    """

    BEFORE = "before"
    AFTER = "after"


class ApiCurrencyCurrencyDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
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
    decimal_places: int | None = Field(2, alias="decimalPlaces", ge=0, le=8)
    """
    An integer field
    """
    symbol_position: SymbolPosition | None = Field("before", alias="symbolPosition")
    """
    An enum field
    """
    thousands_separator: str | None = Field(",", alias="thousandsSeparator")
    """
    A string field
    """
    decimal_separator: str | None = Field(".", alias="decimalSeparator")
    """
    A string field
    """
    exchange_rate: float | None = Field(1, alias="exchangeRate")
    """
    A decimal field
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
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
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
    id: str | float
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
    content: ElementsTextBlockEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
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
    id: str | float
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
    content: ElementsTextBlockEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ApiFaqFaqDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
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
    contact_prompt: str | None = Field("Didn't find what you're looking for?", alias="contactPrompt")
    """
    A string field
    """
    contact_button_text: str | None = Field("Contact Us", alias="contactButtonText")
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
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class Columns1(ElementsTextBlockEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["elements.text-block"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections16(ElementsTextBlockEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["elements.text-block"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class ApiProductCategoryProductCategoryDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    slug: str
    """
    A UID field
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
    content: ElementsLabelEntry
    """
    A component field
    """
    image: PluginUploadFileDocument
    """
    A media field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class MenusSearchMenuEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    menu_button: ElementsButtonEntry = Field(..., alias="menuButton")
    """
    A component field
    """
    text_box_placeholder_label: ElementsLabelEntry = Field(..., alias="textBoxPlaceholderLabel")
    """
    A component field
    """
    recent_searches_label: ElementsLabelEntry = Field(..., alias="recentSearchesLabel")
    """
    A component field
    """
    now_trending_label: ElementsLabelEntry = Field(..., alias="nowTrendingLabel")
    """
    A component field
    """
    view_all_results_button: ElementsButtonEntry = Field(..., alias="viewAllResultsButton")
    """
    A component field
    """
    id: int | None = None
    """
    Component instance ID
    """


class ApiThemeThemeDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    theme_id: str = Field(..., alias="themeId")
    """
    A UID field
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
    content: ElementsLabelEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class MenusLanguageSelectorEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    menu_button: ElementsButtonEntry = Field(..., alias="menuButton")
    """
    A component field
    """
    id: int | None = None
    """
    Component instance ID
    """


class MenusMobileMenuEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    open_button: ElementsButtonEntry = Field(..., alias="openButton")
    """
    A component field
    """
    close_button: ElementsButtonEntry = Field(..., alias="closeButton")
    """
    A component field
    """
    id: int | None = None
    """
    Component instance ID
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
    id: str | float
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
    content: ElementsTextBlockEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ElementsPriceEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    amount: float
    """
    A decimal field
    """
    currency: ApiCurrencyCurrencyDocument
    """
    A relational field
    """
    id: int | None = None
    """
    Component instance ID
    """


class ApiProductCertificateProductCertificateDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    certificate_id: str = Field(..., alias="certificateId")
    """
    A UID field
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
    certificate: ElementsLabelEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ApiProductTagProductTagDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    tag_id: str = Field(..., alias="tagId")
    """
    A UID field
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
    tag: ElementsLabelEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class Description1(ElementsTextBlockEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["elements.text-block"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class FiltersTagFilterEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    header: ElementsHeaderEntry
    """
    A component field
    """
    all_label: ElementsLabelEntry = Field(..., alias="allLabel")
    """
    A component field
    """
    id: int | None = None
    """
    Component instance ID
    """


class FiltersPriceRangeFilterEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    header: ElementsHeaderEntry
    """
    A component field
    """
    id: int | None = None
    """
    Component instance ID
    """


class SortersProductsSorterEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    header: ElementsHeaderEntry
    """
    A component field
    """
    best_sellers: ElementsLabelEntry = Field(..., alias="bestSellers")
    """
    A component field
    """
    new_arrivals: ElementsLabelEntry = Field(..., alias="newArrivals")
    """
    A component field
    """
    price_high_to_low: ElementsLabelEntry = Field(..., alias="priceHighToLow")
    """
    A component field
    """
    price_low_to_high: ElementsLabelEntry = Field(..., alias="priceLowToHigh")
    """
    A component field
    """
    id: int | None = None
    """
    Component instance ID
    """


class ApiProfileProfileDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    profile_title: str | None = Field(None, alias="profileTitle")
    """
    A string field
    """
    edit_profile_title: str | None = Field(None, alias="editProfileTitle")
    """
    A string field
    """
    wishlist_title: str | None = Field(None, alias="wishlistTitle")
    """
    A string field
    """
    wishlist_empty_message: str | None = Field(None, alias="wishlistEmptyMessage")
    """
    A text field
    """
    currency_title: str | None = Field(None, alias="currencyTitle")
    """
    A string field
    """
    currency_description: str | None = Field(None, alias="currencyDescription")
    """
    A text field
    """
    delete_account_title: str | None = Field(None, alias="deleteAccountTitle")
    """
    A string field
    """
    delete_account_warning: str | None = Field(None, alias="deleteAccountWarning")
    """
    A text field
    """
    save_button: str | None = Field(None, alias="saveButton")
    """
    A string field
    """
    cancel_button: str | None = Field(None, alias="cancelButton")
    """
    A string field
    """
    delete_button: str | None = Field(None, alias="deleteButton")
    """
    A string field
    """
    confirm_button: str | None = Field(None, alias="confirmButton")
    """
    A string field
    """
    logout_button: str | None = Field(None, alias="logoutButton")
    """
    A string field
    """
    name_label: str | None = Field(None, alias="nameLabel")
    """
    A string field
    """
    email_label: str | None = Field(None, alias="emailLabel")
    """
    A string field
    """
    password_label: str | None = Field(None, alias="passwordLabel")
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
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
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
    id: str | float
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
    content: ElementsTextBlockEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class SectionsBlogTeaserEntry(BaseModel):
    """
    Section displaying blog post previews in grid
    """

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    id: int
    """
    Component instance ID
    """
    header: ElementsHeaderEntry
    """
    A component field
    """
    blog_posts: list[ApiBlogPostBlogPostDocument] = Field(..., alias="blogPosts")
    """
    A relational field
    """
    view_all_button: ElementsButtonEntry = Field(..., alias="viewAllButton")
    """
    A component field
    """


class HeaderAlignment(StrEnum):
    """
    An enumeration field
    """

    CENTER_ = "center"
    LANGUAGE_DIRECTION = "language-direction"


class SectionsBrandFeaturesSectionEntry(BaseModel):
    """
    Brand Features Section
    """

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    id: int
    """
    Component instance ID
    """
    show_header: bool = Field(..., alias="showHeader")
    """
    A boolean field
    """
    header_icon: str | None = Field(None, alias="headerIcon")
    """
    A string field
    """
    header_text: str | None = Field(None, alias="headerText")
    """
    A string field
    """
    header_aria_description: str | None = Field(None, alias="headerAriaDescription")
    """
    A string field
    """
    subheader_icon: str | None = Field(None, alias="subheaderIcon")
    """
    A string field
    """
    subheader_text: str | None = Field(None, alias="subheaderText")
    """
    A string field
    """
    subheader_aria_description: str | None = Field(None, alias="subheaderAriaDescription")
    """
    A string field
    """
    header_alignment: HeaderAlignment | None = Field(None, alias="headerAlignment")
    """
    An enumeration field
    """
    learn_more_button_icon: str | None = Field(None, alias="learnMoreButtonIcon")
    """
    A string field
    """
    learn_more_button_text: str | None = Field(None, alias="learnMoreButtonText")
    """
    A string field
    """
    learn_more_button_url: str | None = Field(None, alias="learnMoreButtonUrl")
    """
    A string field
    """
    learn_more_button_open_in_new_tab: bool | None = Field(None, alias="learnMoreButtonOpenInNewTab")
    """
    A boolean field
    """
    learn_more_button_aria_description: str | None = Field(None, alias="learnMoreButtonAriaDescription")
    """
    A string field
    """
    features: list[ElementsHeaderEntry]
    """
    A repeatable component field
    """


class SectionsCategoryGridEntry(BaseModel):
    """
    Grid of product categories with icons
    """

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    id: int
    """
    Component instance ID
    """
    header: ElementsHeaderEntry
    """
    A component field
    """
    categories: list[ApiProductCategoryProductCategoryDocument]
    """
    A relational field
    """


class Variant(StrEnum):
    """
    An enumeration field
    """

    TEXT_ABOVE_BACKGROUND = "text-above-background"
    TEXT_OVER_BACKGROUND = "text-over-background"
    TEXT_BELOW_BACKGROUND = "text-below-background"


class SectionsHeroEntry(BaseModel):
    """
    Hero banner with title, subtitle, CTA, and background image
    """

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    id: int
    """
    Component instance ID
    """
    header: ElementsHeaderEntry
    """
    A component field
    """
    explore_button: ElementsButtonEntry | None = Field(default_factory=ElementsButtonEntry, alias="exploreButton")
    """
    A component field
    """
    image: PluginUploadFileDocument
    """
    A media field
    """
    variant: Variant
    """
    An enumeration field
    """


class SectionsTeamGridEntry(BaseModel):
    """
    Grid layout for team members
    """

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    id: int
    """
    Component instance ID
    """
    header: ElementsHeaderEntry
    """
    A component field
    """


class CallToActionsNewsletterSignupCtaEntry(BaseModel):
    """
    Newsletter Signup CTA
    """

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    id: int
    """
    Component instance ID
    """
    title: str
    """
    A string field
    """
    description: str
    """
    A string field
    """
    email_placeholder: ElementsLabelEntry = Field(..., alias="emailPlaceholder")
    """
    A component field
    """
    submit_button: ElementsButtonEntry = Field(..., alias="submitButton")
    """
    A component field
    """


class MarkersEndHorizontalLayoutMarkerEntry(BaseModel):
    """
    End Horizontal Layout Marker
    """

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    id: int
    """
    Component instance ID
    """


class MarkersStartHorizontalLayoutMarkerEntry(BaseModel):
    """
    Start Horizontal Layout Marker
    """

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    id: int
    """
    Component instance ID
    """


class FieldModel(StrEnum):
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Status1(StrEnum):
    """
    Fetch documents based on their status. Default to "published" if not specified.
    """

    DRAFT = "draft"
    PUBLISHED = "published"


class AboutGetParametersQuery(BaseModel):
    fields: list[FieldModel] | None = Field(None, examples=[["createdAt", "updatedAt", "publishedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Sections23(SectionsHeroEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.hero"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections24(SectionsTeamGridEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.team-grid"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections25(MarkersStartHorizontalLayoutMarkerEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["markers.start-horizontal-layout-marker"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections26(MarkersEndHorizontalLayoutMarkerEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["markers.end-horizontal-layout-marker"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections27(ElementsTextBlockEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["elements.text-block"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections28(SectionsBrandFeaturesSectionEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.brand-features-section"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections30(SectionsCategoryGridEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.category-grid"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections31(SectionsBlogTeaserEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.blog-teaser"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections32(CallToActionsNewsletterSignupCtaEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["call-to-actions.newsletter-signup-cta"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Field1(StrEnum):
    LOGIN_TITLE = "loginTitle"
    LOGIN_SUBTITLE = "loginSubtitle"
    SIGNUP_TITLE = "signupTitle"
    SIGNUP_SUBTITLE = "signupSubtitle"
    EMAIL_LABEL = "emailLabel"
    EMAIL_PLACEHOLDER = "emailPlaceholder"
    PASSWORD_LABEL = "passwordLabel"
    PASSWORD_PLACEHOLDER = "passwordPlaceholder"
    NAME_LABEL = "nameLabel"
    NAME_PLACEHOLDER = "namePlaceholder"
    LOGIN_BUTTON = "loginButton"
    SIGNUP_BUTTON = "signupButton"
    FORGOT_PASSWORD_LINK = "forgotPasswordLink"
    NO_ACCOUNT_TEXT = "noAccountText"
    SIGNUP_LINK_TEXT = "signupLinkText"
    HAVE_ACCOUNT_TEXT = "haveAccountText"
    LOGIN_LINK_TEXT = "loginLinkText"
    OR_DIVIDER_TEXT = "orDividerText"
    GOOGLE_BUTTON = "googleButton"
    APPLE_BUTTON = "appleButton"
    TERMS_CHECKBOX_TEXT = "termsCheckboxText"
    TERMS_LINK_TEXT = "termsLinkText"
    PRIVACY_LINK_TEXT = "privacyLinkText"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class AuthPageGetParametersQuery(BaseModel):
    fields: list[Field1] | None = Field(None, examples=[["loginTitle", "loginSubtitle", "signupTitle"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data1(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    login_title: str | None = Field(None, alias="loginTitle")
    """
    A string field
    """
    login_subtitle: str | None = Field(None, alias="loginSubtitle")
    """
    A text field
    """
    signup_title: str | None = Field(None, alias="signupTitle")
    """
    A string field
    """
    signup_subtitle: str | None = Field(None, alias="signupSubtitle")
    """
    A text field
    """
    email_label: str | None = Field(None, alias="emailLabel")
    """
    A string field
    """
    email_placeholder: str | None = Field(None, alias="emailPlaceholder")
    """
    A string field
    """
    password_label: str | None = Field(None, alias="passwordLabel")
    """
    A string field
    """
    password_placeholder: str | None = Field(None, alias="passwordPlaceholder")
    """
    A string field
    """
    name_label: str | None = Field(None, alias="nameLabel")
    """
    A string field
    """
    name_placeholder: str | None = Field(None, alias="namePlaceholder")
    """
    A string field
    """
    login_button: str | None = Field(None, alias="loginButton")
    """
    A string field
    """
    signup_button: str | None = Field(None, alias="signupButton")
    """
    A string field
    """
    forgot_password_link: str | None = Field(None, alias="forgotPasswordLink")
    """
    A string field
    """
    no_account_text: str | None = Field(None, alias="noAccountText")
    """
    A string field
    """
    signup_link_text: str | None = Field(None, alias="signupLinkText")
    """
    A string field
    """
    have_account_text: str | None = Field(None, alias="haveAccountText")
    """
    A string field
    """
    login_link_text: str | None = Field(None, alias="loginLinkText")
    """
    A string field
    """
    or_divider_text: str | None = Field(None, alias="orDividerText")
    """
    A string field
    """
    google_button: str | None = Field(None, alias="googleButton")
    """
    A string field
    """
    apple_button: str | None = Field(None, alias="appleButton")
    """
    A string field
    """
    terms_checkbox_text: str | None = Field(None, alias="termsCheckboxText")
    """
    A string field
    """
    terms_link_text: str | None = Field(None, alias="termsLinkText")
    """
    A string field
    """
    privacy_link_text: str | None = Field(None, alias="privacyLinkText")
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
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class AuthPageGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data1
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


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


class AuthRegisterPostRequest(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    email: EmailStr = Field(..., examples=["user@example.com"])
    password: SecretStr = Field(..., examples=["SecurePassword123!"], min_length=8)
    display_name: str = Field(..., alias="displayName", examples=["John Doe"], max_length=100, min_length=1)


class AuthResendVerificationPostResponse(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    success: bool | None = Field(None, examples=[True])
    message: str | None = Field(None, examples=["Verification email sent"])


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


class AuthVerifyEmailPostResponse(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    success: bool | None = Field(None, examples=[True])
    message: str | None = Field(None, examples=["Email verified successfully"])


class Field2(StrEnum):
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class BlogGetParametersQuery(BaseModel):
    fields: list[Field2] | None = Field(None, examples=[["createdAt", "updatedAt", "publishedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data2(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
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
    header: ElementsHeaderEntry
    """
    A component field
    """
    tag_filters: list[ApiBlogPostTagBlogPostTagDocument] | None = Field(None, alias="tagFilters")
    """
    A relational field
    """
    featured_blog_posts: list[ApiBlogPostBlogPostDocument] | None = Field(None, alias="featuredBlogPosts")
    """
    A relational field
    """
    pagination: CallToActionsPaginationCtaEntry
    """
    A component field
    """
    read_article_label: ElementsLabelEntry = Field(..., alias="readArticleLabel")
    """
    A component field
    """
    read_time_minutes_label: ElementsLabelEntry = Field(..., alias="readTimeMinutesLabel")
    """
    A component field
    """
    about_author_header: ElementsHeaderEntry = Field(..., alias="aboutAuthorHeader")
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class BlogGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data2
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field3(StrEnum):
    TAG_ID = "tagId"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Pagination1(BaseModel):
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


class Pagination2(BaseModel):
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


class Pagination3(BaseModel):
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


class Pagination4(Pagination1, Pagination3):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination5(Pagination2, Pagination3):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination(RootModel[Pagination4 | Pagination5]):
    """
    Pagination parameters
    """

    root: Pagination4 | Pagination5
    """
    Pagination parameters
    """


class Sort(StrEnum):
    """
    Sort the result
    """

    TAG_ID = "tagId"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class SortEnum(StrEnum):
    TAG_ID = "tagId"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort1(StrEnum):
    ASC = "asc"
    DESC = "desc"


class BlogPostTagsGetParametersQuery(BaseModel):
    fields: list[Field3] | None = Field(None, examples=[["tagId", "createdAt", "updatedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    field_q: str | None = Field(None, alias="_q", examples=["search terms"])
    pagination: Pagination | None = Field(default_factory=Pagination)
    """
    Pagination parameters
    """
    sort: Sort | list[SortEnum] | dict[str, Sort1] | list[dict[str, Sort1]] | None = Field(None, examples=["tagId"])
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Datum(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    tag_id: str = Field(..., alias="tagId")
    """
    A UID field
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
    tag: ElementsLabelEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class BlogPostTagsGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: list[Datum]
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Sort3(StrEnum):
    """
    Sort the result
    """

    TAG_ID = "tagId"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort4(StrEnum):
    ASC = "asc"
    DESC = "desc"


class BlogPostTagsIdGetParametersQuery(BaseModel):
    fields: list[Field3] | None = Field(None, examples=[["tagId", "createdAt", "updatedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    sort: Sort3 | list[SortEnum] | dict[str, Sort4] | list[dict[str, Sort4]] | None = Field(None, examples=["tagId"])
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data3(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    tag_id: str = Field(..., alias="tagId")
    """
    A UID field
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
    tag: ElementsLabelEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class BlogPostTagsIdGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data3
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field5(StrEnum):
    SLUG = "slug"
    READ_TIME_IN_MINUTES = "readTimeInMinutes"
    PUBLISHED_DATE = "publishedDate"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Pagination61(BaseModel):
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


class Pagination62(BaseModel):
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


class Pagination63(BaseModel):
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


class Pagination64(Pagination61, Pagination63):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination65(Pagination62, Pagination63):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination6(RootModel[Pagination64 | Pagination65]):
    """
    Pagination parameters
    """

    root: Pagination64 | Pagination65
    """
    Pagination parameters
    """


class Sort6(StrEnum):
    """
    Sort the result
    """

    SLUG = "slug"
    READ_TIME_IN_MINUTES = "readTimeInMinutes"
    PUBLISHED_DATE = "publishedDate"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class SortEnum2(StrEnum):
    SLUG = "slug"
    READ_TIME_IN_MINUTES = "readTimeInMinutes"
    PUBLISHED_DATE = "publishedDate"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort7(StrEnum):
    ASC = "asc"
    DESC = "desc"


class BlogPostsGetParametersQuery(BaseModel):
    fields: list[Field5] | None = Field(None, examples=[["slug", "readTimeInMinutes", "publishedDate"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    field_q: str | None = Field(None, alias="_q", examples=["search terms"])
    pagination: Pagination6 | None = Field(default_factory=Pagination6)
    """
    Pagination parameters
    """
    sort: Sort6 | list[SortEnum2] | dict[str, Sort7] | list[dict[str, Sort7]] | None = Field(None, examples=["slug"])
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Datum1(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    slug: str
    """
    A UID field
    """
    read_time_in_minutes: int | None = Field(5, alias="readTimeInMinutes", ge=-9007199254740991, le=9007199254740991)
    """
    An integer field
    """
    published_date: str = Field(..., alias="publishedDate")
    """
    A datetime field
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
    content: ElementsTextBlockEntry
    """
    A component field
    """
    featured_image: PluginUploadFileDocument = Field(..., alias="featuredImage")
    """
    A media field
    """
    author: ApiContributorContributorDocument
    """
    A relational field
    """
    tags: list[ApiBlogPostTagBlogPostTagDocument]
    """
    A relational field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class BlogPostsGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: list[Datum1]
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Sort9(StrEnum):
    """
    Sort the result
    """

    SLUG = "slug"
    READ_TIME_IN_MINUTES = "readTimeInMinutes"
    PUBLISHED_DATE = "publishedDate"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort10(StrEnum):
    ASC = "asc"
    DESC = "desc"


class BlogPostsSlugSlugGetParametersQuery(BaseModel):
    fields: list[Field5] | None = Field(None, examples=[["slug", "readTimeInMinutes", "publishedDate"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    sort: Sort9 | list[SortEnum2] | dict[str, Sort10] | list[dict[str, Sort10]] | None = Field(None, examples=["slug"])
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data4(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    slug: str
    """
    A UID field
    """
    read_time_in_minutes: int | None = Field(5, alias="readTimeInMinutes", ge=-9007199254740991, le=9007199254740991)
    """
    An integer field
    """
    published_date: str = Field(..., alias="publishedDate")
    """
    A datetime field
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
    content: ElementsTextBlockEntry
    """
    A component field
    """
    featured_image: PluginUploadFileDocument = Field(..., alias="featuredImage")
    """
    A media field
    """
    author: ApiContributorContributorDocument
    """
    A relational field
    """
    tags: list[ApiBlogPostTagBlogPostTagDocument]
    """
    A relational field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class BlogPostsSlugSlugGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data4
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Sort12(StrEnum):
    """
    Sort the result
    """

    SLUG = "slug"
    READ_TIME_IN_MINUTES = "readTimeInMinutes"
    PUBLISHED_DATE = "publishedDate"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort13(StrEnum):
    ASC = "asc"
    DESC = "desc"


class BlogPostsIdGetParametersQuery(BaseModel):
    fields: list[Field5] | None = Field(None, examples=[["slug", "readTimeInMinutes", "publishedDate"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    sort: Sort12 | list[SortEnum2] | dict[str, Sort13] | list[dict[str, Sort13]] | None = Field(None, examples=["slug"])
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data5(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    slug: str
    """
    A UID field
    """
    read_time_in_minutes: int | None = Field(5, alias="readTimeInMinutes", ge=-9007199254740991, le=9007199254740991)
    """
    An integer field
    """
    published_date: str = Field(..., alias="publishedDate")
    """
    A datetime field
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
    content: ElementsTextBlockEntry
    """
    A component field
    """
    featured_image: PluginUploadFileDocument = Field(..., alias="featuredImage")
    """
    A media field
    """
    author: ApiContributorContributorDocument
    """
    A relational field
    """
    tags: list[ApiBlogPostTagBlogPostTagDocument]
    """
    A relational field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class BlogPostsIdGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data5
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field8(StrEnum):
    TITLE_ = "title"
    SUBTITLE = "subtitle"
    CONTACT_TAB_LABEL = "contactTabLabel"
    FAQ_TAB_LABEL = "faqTabLabel"
    NAME_LABEL = "nameLabel"
    NAME_PLACEHOLDER = "namePlaceholder"
    EMAIL_LABEL = "emailLabel"
    EMAIL_PLACEHOLDER = "emailPlaceholder"
    MESSAGE_LABEL = "messageLabel"
    MESSAGE_PLACEHOLDER = "messagePlaceholder"
    SUBMIT_BUTTON = "submitButton"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class ContactUsGetParametersQuery(BaseModel):
    fields: list[Field8] | None = Field(None, examples=[["title", "subtitle", "contactTabLabel"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data6(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    title: str | None = None
    """
    A string field
    """
    subtitle: str | None = None
    """
    A text field
    """
    contact_tab_label: str | None = Field(None, alias="contactTabLabel")
    """
    A string field
    """
    faq_tab_label: str | None = Field(None, alias="faqTabLabel")
    """
    A string field
    """
    name_label: str | None = Field(None, alias="nameLabel")
    """
    A string field
    """
    name_placeholder: str | None = Field(None, alias="namePlaceholder")
    """
    A string field
    """
    email_label: str | None = Field(None, alias="emailLabel")
    """
    A string field
    """
    email_placeholder: str | None = Field(None, alias="emailPlaceholder")
    """
    A string field
    """
    message_label: str | None = Field(None, alias="messageLabel")
    """
    A string field
    """
    message_placeholder: str | None = Field(None, alias="messagePlaceholder")
    """
    A string field
    """
    submit_button: str | None = Field(None, alias="submitButton")
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
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ContactUsGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data6
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field9(StrEnum):
    ROLE_ID = "roleId"
    NAME = "name"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Pagination71(BaseModel):
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


class Pagination72(BaseModel):
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


class Pagination73(BaseModel):
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


class Pagination74(Pagination71, Pagination73):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination75(Pagination72, Pagination73):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination7(RootModel[Pagination74 | Pagination75]):
    """
    Pagination parameters
    """

    root: Pagination74 | Pagination75
    """
    Pagination parameters
    """


class Sort15(StrEnum):
    """
    Sort the result
    """

    ROLE_ID = "roleId"
    NAME = "name"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class SortEnum5(StrEnum):
    ROLE_ID = "roleId"
    NAME = "name"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort16(StrEnum):
    ASC = "asc"
    DESC = "desc"


class ContributorRolesGetParametersQuery(BaseModel):
    fields: list[Field9] | None = Field(None, examples=[["roleId", "name", "createdAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    field_q: str | None = Field(None, alias="_q", examples=["search terms"])
    pagination: Pagination7 | None = Field(default_factory=Pagination7)
    """
    Pagination parameters
    """
    sort: Sort15 | list[SortEnum5] | dict[str, Sort16] | list[dict[str, Sort16]] | None = Field(
        None, examples=["roleId"]
    )
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Datum2(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    role_id: str = Field(..., alias="roleId")
    """
    A UID field
    """
    name: str
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
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ContributorRolesGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: list[Datum2]
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Sort18(StrEnum):
    """
    Sort the result
    """

    ROLE_ID = "roleId"
    NAME = "name"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort19(StrEnum):
    ASC = "asc"
    DESC = "desc"


class ContributorRolesIdGetParametersQuery(BaseModel):
    fields: list[Field9] | None = Field(None, examples=[["roleId", "name", "createdAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    sort: Sort18 | list[SortEnum5] | dict[str, Sort19] | list[dict[str, Sort19]] | None = Field(
        None, examples=["roleId"]
    )
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data7(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    role_id: str = Field(..., alias="roleId")
    """
    A UID field
    """
    name: str
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
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ContributorRolesIdGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data7
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field11(StrEnum):
    SLUG = "slug"
    FIRST_NAME = "firstName"
    LAST_NAME = "lastName"
    BIO = "bio"
    EMAIL = "email"
    WEBSITE = "website"
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    GITHUB = "github"
    INSTAGRAM = "instagram"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Pagination81(BaseModel):
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


class Pagination82(BaseModel):
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


class Pagination83(BaseModel):
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


class Pagination84(Pagination81, Pagination83):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination85(Pagination82, Pagination83):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination8(RootModel[Pagination84 | Pagination85]):
    """
    Pagination parameters
    """

    root: Pagination84 | Pagination85
    """
    Pagination parameters
    """


class Sort21(StrEnum):
    """
    Sort the result
    """

    SLUG = "slug"
    FIRST_NAME = "firstName"
    LAST_NAME = "lastName"
    BIO = "bio"
    EMAIL = "email"
    WEBSITE = "website"
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    GITHUB = "github"
    INSTAGRAM = "instagram"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class SortEnum7(StrEnum):
    SLUG = "slug"
    FIRST_NAME = "firstName"
    LAST_NAME = "lastName"
    BIO = "bio"
    EMAIL = "email"
    WEBSITE = "website"
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    GITHUB = "github"
    INSTAGRAM = "instagram"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort22(StrEnum):
    ASC = "asc"
    DESC = "desc"


class ContributorsGetParametersQuery(BaseModel):
    fields: list[Field11] | None = Field(None, examples=[["slug", "firstName", "lastName"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    field_q: str | None = Field(None, alias="_q", examples=["search terms"])
    pagination: Pagination8 | None = Field(default_factory=Pagination8)
    """
    Pagination parameters
    """
    sort: Sort21 | list[SortEnum7] | dict[str, Sort22] | list[dict[str, Sort22]] | None = Field(None, examples=["slug"])
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Datum3(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    slug: str
    """
    A UID field
    """
    first_name: str = Field(..., alias="firstName")
    """
    A string field
    """
    last_name: str | None = Field(None, alias="lastName")
    """
    A string field
    """
    bio: str
    """
    A richtext field
    """
    email: EmailStr | None = Field(None, examples=["user@example.com"])
    """
    RFC 5321 compliant email address. Validated for correct format including domain and TLD requirements.
    """
    website: str | None = None
    """
    A string field
    """
    twitter: str | None = None
    """
    A string field
    """
    linkedin: str | None = None
    """
    A string field
    """
    github: str | None = None
    """
    A string field
    """
    instagram: str | None = None
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
    profile_picture: PluginUploadFileDocument | None = Field(
        default_factory=PluginUploadFileDocument, alias="profilePicture"
    )
    """
    A media field
    """
    roles: list[ApiContributorRoleContributorRoleDocument]
    """
    A relational field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ContributorsGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: list[Datum3]
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Sort24(StrEnum):
    """
    Sort the result
    """

    SLUG = "slug"
    FIRST_NAME = "firstName"
    LAST_NAME = "lastName"
    BIO = "bio"
    EMAIL = "email"
    WEBSITE = "website"
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    GITHUB = "github"
    INSTAGRAM = "instagram"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort25(StrEnum):
    ASC = "asc"
    DESC = "desc"


class ContributorsSlugSlugGetParametersQuery(BaseModel):
    fields: list[Field11] | None = Field(None, examples=[["slug", "firstName", "lastName"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    sort: Sort24 | list[SortEnum7] | dict[str, Sort25] | list[dict[str, Sort25]] | None = Field(None, examples=["slug"])
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data8(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    slug: str
    """
    A UID field
    """
    first_name: str = Field(..., alias="firstName")
    """
    A string field
    """
    last_name: str | None = Field(None, alias="lastName")
    """
    A string field
    """
    bio: str
    """
    A richtext field
    """
    email: EmailStr | None = Field(None, examples=["user@example.com"])
    """
    RFC 5321 compliant email address. Validated for correct format including domain and TLD requirements.
    """
    website: str | None = None
    """
    A string field
    """
    twitter: str | None = None
    """
    A string field
    """
    linkedin: str | None = None
    """
    A string field
    """
    github: str | None = None
    """
    A string field
    """
    instagram: str | None = None
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
    profile_picture: PluginUploadFileDocument | None = Field(
        default_factory=PluginUploadFileDocument, alias="profilePicture"
    )
    """
    A media field
    """
    roles: list[ApiContributorRoleContributorRoleDocument]
    """
    A relational field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ContributorsSlugSlugGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data8
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Sort27(StrEnum):
    """
    Sort the result
    """

    SLUG = "slug"
    FIRST_NAME = "firstName"
    LAST_NAME = "lastName"
    BIO = "bio"
    EMAIL = "email"
    WEBSITE = "website"
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    GITHUB = "github"
    INSTAGRAM = "instagram"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort28(StrEnum):
    ASC = "asc"
    DESC = "desc"


class ContributorsIdGetParametersQuery(BaseModel):
    fields: list[Field11] | None = Field(None, examples=[["slug", "firstName", "lastName"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    sort: Sort27 | list[SortEnum7] | dict[str, Sort28] | list[dict[str, Sort28]] | None = Field(None, examples=["slug"])
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data9(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    slug: str
    """
    A UID field
    """
    first_name: str = Field(..., alias="firstName")
    """
    A string field
    """
    last_name: str | None = Field(None, alias="lastName")
    """
    A string field
    """
    bio: str
    """
    A richtext field
    """
    email: EmailStr | None = Field(None, examples=["user@example.com"])
    """
    RFC 5321 compliant email address. Validated for correct format including domain and TLD requirements.
    """
    website: str | None = None
    """
    A string field
    """
    twitter: str | None = None
    """
    A string field
    """
    linkedin: str | None = None
    """
    A string field
    """
    github: str | None = None
    """
    A string field
    """
    instagram: str | None = None
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
    profile_picture: PluginUploadFileDocument | None = Field(
        default_factory=PluginUploadFileDocument, alias="profilePicture"
    )
    """
    A media field
    """
    roles: list[ApiContributorRoleContributorRoleDocument]
    """
    A relational field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ContributorsIdGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data9
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field14(StrEnum):
    CODE = "code"
    NAME = "name"
    SYMBOL = "symbol"
    DECIMAL_PLACES = "decimalPlaces"
    SYMBOL_POSITION = "symbolPosition"
    THOUSANDS_SEPARATOR = "thousandsSeparator"
    DECIMAL_SEPARATOR = "decimalSeparator"
    EXCHANGE_RATE = "exchangeRate"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Pagination91(BaseModel):
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


class Pagination92(BaseModel):
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


class Pagination93(BaseModel):
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


class Pagination94(Pagination91, Pagination93):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination95(Pagination92, Pagination93):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination9(RootModel[Pagination94 | Pagination95]):
    """
    Pagination parameters
    """

    root: Pagination94 | Pagination95
    """
    Pagination parameters
    """


class Sort30(StrEnum):
    """
    Sort the result
    """

    CODE = "code"
    NAME = "name"
    SYMBOL = "symbol"
    DECIMAL_PLACES = "decimalPlaces"
    SYMBOL_POSITION = "symbolPosition"
    THOUSANDS_SEPARATOR = "thousandsSeparator"
    DECIMAL_SEPARATOR = "decimalSeparator"
    EXCHANGE_RATE = "exchangeRate"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class SortEnum10(StrEnum):
    CODE = "code"
    NAME = "name"
    SYMBOL = "symbol"
    DECIMAL_PLACES = "decimalPlaces"
    SYMBOL_POSITION = "symbolPosition"
    THOUSANDS_SEPARATOR = "thousandsSeparator"
    DECIMAL_SEPARATOR = "decimalSeparator"
    EXCHANGE_RATE = "exchangeRate"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort31(StrEnum):
    ASC = "asc"
    DESC = "desc"


class CurrenciesGetParametersQuery(BaseModel):
    fields: list[Field14] | None = Field(None, examples=[["code", "name", "symbol"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    field_q: str | None = Field(None, alias="_q", examples=["search terms"])
    pagination: Pagination9 | None = Field(default_factory=Pagination9)
    """
    Pagination parameters
    """
    sort: Sort30 | list[SortEnum10] | dict[str, Sort31] | list[dict[str, Sort31]] | None = Field(
        None, examples=["code"]
    )
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Datum4(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
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
    decimal_places: int | None = Field(2, alias="decimalPlaces", ge=0, le=8)
    """
    An integer field
    """
    symbol_position: SymbolPosition | None = Field("before", alias="symbolPosition")
    """
    An enum field
    """
    thousands_separator: str | None = Field(",", alias="thousandsSeparator")
    """
    A string field
    """
    decimal_separator: str | None = Field(".", alias="decimalSeparator")
    """
    A string field
    """
    exchange_rate: float | None = Field(1, alias="exchangeRate")
    """
    A decimal field
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
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class CurrenciesGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: list[Datum4]
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Sort33(StrEnum):
    """
    Sort the result
    """

    CODE = "code"
    NAME = "name"
    SYMBOL = "symbol"
    DECIMAL_PLACES = "decimalPlaces"
    SYMBOL_POSITION = "symbolPosition"
    THOUSANDS_SEPARATOR = "thousandsSeparator"
    DECIMAL_SEPARATOR = "decimalSeparator"
    EXCHANGE_RATE = "exchangeRate"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort34(StrEnum):
    ASC = "asc"
    DESC = "desc"


class CurrenciesIdGetParametersQuery(BaseModel):
    fields: list[Field14] | None = Field(None, examples=[["code", "name", "symbol"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    sort: Sort33 | list[SortEnum10] | dict[str, Sort34] | list[dict[str, Sort34]] | None = Field(
        None, examples=["code"]
    )
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data10(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
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
    decimal_places: int | None = Field(2, alias="decimalPlaces", ge=0, le=8)
    """
    An integer field
    """
    symbol_position: SymbolPosition | None = Field("before", alias="symbolPosition")
    """
    An enum field
    """
    thousands_separator: str | None = Field(",", alias="thousandsSeparator")
    """
    A string field
    """
    decimal_separator: str | None = Field(".", alias="decimalSeparator")
    """
    A string field
    """
    exchange_rate: float | None = Field(1, alias="exchangeRate")
    """
    A decimal field
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
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class CurrenciesIdGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data10
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field16(StrEnum):
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Error404GetParametersQuery(BaseModel):
    fields: list[Field16] | None = Field(None, examples=[["createdAt", "updatedAt", "publishedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data11(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
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
    content: ElementsTextBlockEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class Error404GetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data11
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Error410GetParametersQuery(BaseModel):
    fields: list[Field16] | None = Field(None, examples=[["createdAt", "updatedAt", "publishedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data12(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
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
    content: ElementsTextBlockEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class Error410GetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data12
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field18(StrEnum):
    TITLE_ = "title"
    SUBTITLE = "subtitle"
    DESCRIPTION = "description"
    CONTACT_PROMPT = "contactPrompt"
    CONTACT_BUTTON_TEXT = "contactButtonText"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class FaqGetParametersQuery(BaseModel):
    fields: list[Field18] | None = Field(None, examples=[["title", "subtitle", "description"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data13(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
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
    contact_prompt: str | None = Field("Didn't find what you're looking for?", alias="contactPrompt")
    """
    A string field
    """
    contact_button_text: str | None = Field("Contact Us", alias="contactButtonText")
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
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class FaqGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data13
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field19(StrEnum):
    KEY = "key"
    NAME = "name"
    DESCRIPTION = "description"
    DEVELOPMENT_ENABLED = "developmentEnabled"
    PRODUCTION_ENABLED = "productionEnabled"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"


class Pagination101(BaseModel):
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


class Pagination102(BaseModel):
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


class Pagination103(BaseModel):
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


class Pagination104(Pagination101, Pagination103):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination105(Pagination102, Pagination103):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination10(RootModel[Pagination104 | Pagination105]):
    """
    Pagination parameters
    """

    root: Pagination104 | Pagination105
    """
    Pagination parameters
    """


class Sort36(StrEnum):
    """
    Sort the result
    """

    KEY = "key"
    NAME = "name"
    DESCRIPTION = "description"
    DEVELOPMENT_ENABLED = "developmentEnabled"
    PRODUCTION_ENABLED = "productionEnabled"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"


class SortEnum12(StrEnum):
    KEY = "key"
    NAME = "name"
    DESCRIPTION = "description"
    DEVELOPMENT_ENABLED = "developmentEnabled"
    PRODUCTION_ENABLED = "productionEnabled"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"


class Sort37(StrEnum):
    ASC = "asc"
    DESC = "desc"


class FeatureFlagsGetParametersQuery(BaseModel):
    fields: list[Field19] | None = Field(None, examples=[["key", "name", "description"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    field_q: str | None = Field(None, alias="_q", examples=["search terms"])
    pagination: Pagination10 | None = Field(default_factory=Pagination10)
    """
    Pagination parameters
    """
    sort: Sort36 | list[SortEnum12] | dict[str, Sort37] | list[dict[str, Sort37]] | None = Field(None, examples=["key"])
    """
    Sort the result
    """
    status: Status1 | None = Field(None, examples=["published"])
    """
    Fetch documents based on their status. Default to "published" if not specified.
    """
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Datum5(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    key: str
    """
    A string field
    """
    name: str
    """
    A string field
    """
    description: str | None = None
    """
    A string field
    """
    development_enabled: bool | None = Field(True, alias="developmentEnabled")
    """
    A boolean field
    """
    production_enabled: bool | None = Field(False, alias="productionEnabled")
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


class FeatureFlagsGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: list[Datum5]
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Sort39(StrEnum):
    """
    Sort the result
    """

    KEY = "key"
    NAME = "name"
    DESCRIPTION = "description"
    DEVELOPMENT_ENABLED = "developmentEnabled"
    PRODUCTION_ENABLED = "productionEnabled"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"


class Sort40(StrEnum):
    ASC = "asc"
    DESC = "desc"


class FeatureFlagsIdGetParametersQuery(BaseModel):
    fields: list[Field19] | None = Field(None, examples=[["key", "name", "description"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    sort: Sort39 | list[SortEnum12] | dict[str, Sort40] | list[dict[str, Sort40]] | None = Field(None, examples=["key"])
    """
    Sort the result
    """
    status: Status1 | None = Field(None, examples=["published"])
    """
    Fetch documents based on their status. Default to "published" if not specified.
    """
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data14(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    key: str
    """
    A string field
    """
    name: str
    """
    A string field
    """
    description: str | None = None
    """
    A string field
    """
    development_enabled: bool | None = Field(True, alias="developmentEnabled")
    """
    A boolean field
    """
    production_enabled: bool | None = Field(False, alias="productionEnabled")
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


class FeatureFlagsIdGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data14
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Pagination111(BaseModel):
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


class Pagination112(BaseModel):
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


class Pagination113(BaseModel):
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


class Pagination114(Pagination111, Pagination113):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination115(Pagination112, Pagination113):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination11(RootModel[Pagination114 | Pagination115]):
    """
    Pagination parameters
    """

    root: Pagination114 | Pagination115
    """
    Pagination parameters
    """


class FilesGetParametersQuery(BaseModel):
    fields: str | list[str] | None = None
    """
    Select specific fields to return in the response
    """
    sort: str | list[str] | dict[str, Sort40] | list[dict[str, Sort40]] | None = None
    """
    Sort the results by specified fields
    """
    pagination: Pagination11 | None = Field(default_factory=Pagination11)
    """
    Pagination parameters
    """
    filters: dict[str, Any] | None = None
    """
    Apply filters to the query
    """
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


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
    folder_path: str | None = Field(None, alias="folderPath")
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
    published_at: AwareDatetime | None = Field(None, alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    is_url_signed: bool | None = Field(None, alias="isUrlSigned")
    """
    Whether the file URL is signed (for private files)
    """


class FilesGetResponse(RootModel[list[FilesGetResponseItem]]):
    root: list[FilesGetResponseItem]


class FilesIdGetParametersQuery(BaseModel):
    fields: str | list[str] | None = None
    """
    Select specific fields to return in the response
    """
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


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
    folder_path: str | None = Field(None, alias="folderPath")
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
    published_at: AwareDatetime | None = Field(None, alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])
    """
    Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.
    """
    is_url_signed: bool | None = Field(None, alias="isUrlSigned")
    """
    Whether the file URL is signed (for private files)
    """


class Field21(StrEnum):
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class FooterGetParametersQuery(BaseModel):
    fields: list[Field21] | None = Field(None, examples=[["createdAt", "updatedAt", "publishedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Columns7(CallToActionsNewsletterSignupCtaEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["call-to-actions.newsletter-signup-cta"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Columns8(MarkersStartHorizontalLayoutMarkerEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["markers.start-horizontal-layout-marker"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Columns9(MarkersEndHorizontalLayoutMarkerEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["markers.end-horizontal-layout-marker"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Columns5(RootModel[Columns1 | Columns7 | Columns8 | Columns9]):
    root: Columns1 | Columns7 | Columns8 | Columns9 = Field(..., discriminator="field__component")


class Data15(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
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
    columns: list[Columns5]
    """
    A dynamic zone field
    """
    copyrights_label: ElementsLabelEntry = Field(..., alias="copyrightsLabel")
    """
    A component field
    """
    quick_links: list[ElementsButtonEntry] = Field(..., alias="quickLinks")
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class FooterGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data15
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class HomepageGetParametersQuery(BaseModel):
    fields: list[Field21] | None = Field(None, examples=[["createdAt", "updatedAt", "publishedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Sections34(SectionsHeroEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.hero"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections35(SectionsTeamGridEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.team-grid"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections36(MarkersStartHorizontalLayoutMarkerEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["markers.start-horizontal-layout-marker"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections37(MarkersEndHorizontalLayoutMarkerEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["markers.end-horizontal-layout-marker"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections38(ElementsTextBlockEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["elements.text-block"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections39(SectionsBrandFeaturesSectionEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.brand-features-section"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections41(SectionsCategoryGridEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.category-grid"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections42(SectionsBlogTeaserEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.blog-teaser"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections43(CallToActionsNewsletterSignupCtaEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["call-to-actions.newsletter-signup-cta"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class LanguagesGetResponse(RootModel[list[Language]]):
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


class Field23(StrEnum):
    SITE_TITLE = "siteTitle"
    SITE_DESCRIPTION = "siteDescription"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class NavigationGetParametersQuery(BaseModel):
    fields: list[Field23] | None = Field(None, examples=[["siteTitle", "siteDescription", "createdAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Field24(StrEnum):
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class PrivacyGetParametersQuery(BaseModel):
    fields: list[Field24] | None = Field(None, examples=[["createdAt", "updatedAt", "publishedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data18(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
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
    content: ElementsTextBlockEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class PrivacyGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data18
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field25(StrEnum):
    SLUG = "slug"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Pagination121(BaseModel):
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


class Pagination122(BaseModel):
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


class Pagination123(BaseModel):
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


class Pagination124(Pagination121, Pagination123):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination125(Pagination122, Pagination123):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination12(RootModel[Pagination124 | Pagination125]):
    """
    Pagination parameters
    """

    root: Pagination124 | Pagination125
    """
    Pagination parameters
    """


class Sort44(StrEnum):
    """
    Sort the result
    """

    SLUG = "slug"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class SortEnum14(StrEnum):
    SLUG = "slug"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort45(StrEnum):
    ASC = "asc"
    DESC = "desc"


class ProductCategoriesGetParametersQuery(BaseModel):
    fields: list[Field25] | None = Field(None, examples=[["slug", "createdAt", "updatedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    field_q: str | None = Field(None, alias="_q", examples=["search terms"])
    pagination: Pagination12 | None = Field(default_factory=Pagination12)
    """
    Pagination parameters
    """
    sort: Sort44 | list[SortEnum14] | dict[str, Sort45] | list[dict[str, Sort45]] | None = Field(
        None, examples=["slug"]
    )
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Datum6(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    slug: str
    """
    A UID field
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
    content: ElementsLabelEntry
    """
    A component field
    """
    image: PluginUploadFileDocument
    """
    A media field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ProductCategoriesGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: list[Datum6]
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field26(StrEnum):
    BY_SELLER_TEXT = "bySellerText"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class ProductCategoriesPageGetParametersQuery(BaseModel):
    fields: list[Field26] | None = Field(None, examples=[["bySellerText", "createdAt", "updatedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Field27(StrEnum):
    SLUG = "slug"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort47(StrEnum):
    """
    Sort the result
    """

    SLUG = "slug"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort48(StrEnum):
    ASC = "asc"
    DESC = "desc"


class ProductCategoriesSlugSlugGetParametersQuery(BaseModel):
    fields: list[Field27] | None = Field(None, examples=[["slug", "createdAt", "updatedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    sort: Sort47 | list[SortEnum14] | dict[str, Sort48] | list[dict[str, Sort48]] | None = Field(
        None, examples=["slug"]
    )
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data20(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    slug: str
    """
    A UID field
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
    content: ElementsLabelEntry
    """
    A component field
    """
    image: PluginUploadFileDocument
    """
    A media field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ProductCategoriesSlugSlugGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data20
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Sort50(StrEnum):
    """
    Sort the result
    """

    SLUG = "slug"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort51(StrEnum):
    ASC = "asc"
    DESC = "desc"


class ProductCategoriesIdGetParametersQuery(BaseModel):
    fields: list[Field27] | None = Field(None, examples=[["slug", "createdAt", "updatedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    sort: Sort50 | list[SortEnum14] | dict[str, Sort51] | list[dict[str, Sort51]] | None = Field(
        None, examples=["slug"]
    )
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data21(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    slug: str
    """
    A UID field
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
    content: ElementsLabelEntry
    """
    A component field
    """
    image: PluginUploadFileDocument
    """
    A media field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ProductCategoriesIdGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data21
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field29(StrEnum):
    CERTIFICATE_ID = "certificateId"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Pagination131(BaseModel):
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


class Pagination132(BaseModel):
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


class Pagination133(BaseModel):
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


class Pagination134(Pagination131, Pagination133):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination135(Pagination132, Pagination133):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination13(RootModel[Pagination134 | Pagination135]):
    """
    Pagination parameters
    """

    root: Pagination134 | Pagination135
    """
    Pagination parameters
    """


class Sort53(StrEnum):
    """
    Sort the result
    """

    CERTIFICATE_ID = "certificateId"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class SortEnum17(StrEnum):
    CERTIFICATE_ID = "certificateId"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort54(StrEnum):
    ASC = "asc"
    DESC = "desc"


class ProductCertificatesGetParametersQuery(BaseModel):
    fields: list[Field29] | None = Field(None, examples=[["certificateId", "createdAt", "updatedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    field_q: str | None = Field(None, alias="_q", examples=["search terms"])
    pagination: Pagination13 | None = Field(default_factory=Pagination13)
    """
    Pagination parameters
    """
    sort: Sort53 | list[SortEnum17] | dict[str, Sort54] | list[dict[str, Sort54]] | None = Field(
        None, examples=["certificateId"]
    )
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Datum7(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    certificate_id: str = Field(..., alias="certificateId")
    """
    A UID field
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
    certificate: ElementsLabelEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ProductCertificatesGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: list[Datum7]
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Sort56(StrEnum):
    """
    Sort the result
    """

    CERTIFICATE_ID = "certificateId"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort57(StrEnum):
    ASC = "asc"
    DESC = "desc"


class ProductCertificatesIdGetParametersQuery(BaseModel):
    fields: list[Field29] | None = Field(None, examples=[["certificateId", "createdAt", "updatedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    sort: Sort56 | list[SortEnum17] | dict[str, Sort57] | list[dict[str, Sort57]] | None = Field(
        None, examples=["certificateId"]
    )
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data22(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    certificate_id: str = Field(..., alias="certificateId")
    """
    A UID field
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
    certificate: ElementsLabelEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ProductCertificatesIdGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data22
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field31(StrEnum):
    TAG_ID = "tagId"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Pagination141(BaseModel):
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


class Pagination142(BaseModel):
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


class Pagination143(BaseModel):
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


class Pagination144(Pagination141, Pagination143):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination145(Pagination142, Pagination143):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination14(RootModel[Pagination144 | Pagination145]):
    """
    Pagination parameters
    """

    root: Pagination144 | Pagination145
    """
    Pagination parameters
    """


class Sort59(StrEnum):
    """
    Sort the result
    """

    TAG_ID = "tagId"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class SortEnum19(StrEnum):
    TAG_ID = "tagId"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort60(StrEnum):
    ASC = "asc"
    DESC = "desc"


class ProductTagsGetParametersQuery(BaseModel):
    fields: list[Field31] | None = Field(None, examples=[["tagId", "createdAt", "updatedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    field_q: str | None = Field(None, alias="_q", examples=["search terms"])
    pagination: Pagination14 | None = Field(default_factory=Pagination14)
    """
    Pagination parameters
    """
    sort: Sort59 | list[SortEnum19] | dict[str, Sort60] | list[dict[str, Sort60]] | None = Field(
        None, examples=["tagId"]
    )
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Datum8(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    tag_id: str = Field(..., alias="tagId")
    """
    A UID field
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
    tag: ElementsLabelEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ProductTagsGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: list[Datum8]
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Sort62(StrEnum):
    """
    Sort the result
    """

    TAG_ID = "tagId"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort63(StrEnum):
    ASC = "asc"
    DESC = "desc"


class ProductTagsIdGetParametersQuery(BaseModel):
    fields: list[Field31] | None = Field(None, examples=[["tagId", "createdAt", "updatedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    sort: Sort62 | list[SortEnum19] | dict[str, Sort63] | list[dict[str, Sort63]] | None = Field(
        None, examples=["tagId"]
    )
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data23(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    tag_id: str = Field(..., alias="tagId")
    """
    A UID field
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
    tag: ElementsLabelEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ProductTagsIdGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data23
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field33(StrEnum):
    SLUG = "slug"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Pagination151(BaseModel):
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


class Pagination152(BaseModel):
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


class Pagination153(BaseModel):
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


class Pagination154(Pagination151, Pagination153):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination155(Pagination152, Pagination153):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination15(RootModel[Pagination154 | Pagination155]):
    """
    Pagination parameters
    """

    root: Pagination154 | Pagination155
    """
    Pagination parameters
    """


class Sort65(StrEnum):
    """
    Sort the result
    """

    SLUG = "slug"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class SortEnum21(StrEnum):
    SLUG = "slug"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort66(StrEnum):
    ASC = "asc"
    DESC = "desc"


class ProductsGetParametersQuery(BaseModel):
    fields: list[Field33] | None = Field(None, examples=[["slug", "createdAt", "updatedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    field_q: str | None = Field(None, alias="_q", examples=["search terms"])
    pagination: Pagination15 | None = Field(default_factory=Pagination15)
    """
    Pagination parameters
    """
    sort: Sort65 | list[SortEnum21] | dict[str, Sort66] | list[dict[str, Sort66]] | None = Field(
        None, examples=["slug"]
    )
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Description6(MarkersStartHorizontalLayoutMarkerEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["markers.start-horizontal-layout-marker"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Description7(MarkersEndHorizontalLayoutMarkerEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["markers.end-horizontal-layout-marker"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Description4(RootModel[Description1 | Description6 | Description7]):
    root: Description1 | Description6 | Description7 = Field(..., discriminator="field__component")


class Datum9(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    slug: str
    """
    A UID field
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
    seller: ApiContributorContributorDocument
    """
    A relational field
    """
    header: ElementsHeaderEntry
    """
    A component field
    """
    images: list[PluginUploadFileDocument]
    """
    A media field
    """
    prices: list[ElementsPriceEntry] = Field(..., min_length=1)
    """
    A component field
    """
    category: ApiProductCategoryProductCategoryDocument
    """
    A relational field
    """
    certificates: list[ApiProductCertificateProductCertificateDocument] | None = None
    """
    A relational field
    """
    tags: list[ApiProductTagProductTagDocument] | None = None
    """
    A relational field
    """
    affiliate_button: ElementsButtonEntry = Field(..., alias="affiliateButton")
    """
    A component field
    """
    disclaimer_label: ElementsLabelEntry = Field(..., alias="disclaimerLabel")
    """
    A component field
    """
    view_details_label: ElementsLabelEntry = Field(..., alias="viewDetailsLabel")
    """
    A component field
    """
    description: list[Description4]
    """
    A dynamic zone field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ProductsGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: list[Datum9]
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Sort68(StrEnum):
    """
    Sort the result
    """

    SLUG = "slug"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort69(StrEnum):
    ASC = "asc"
    DESC = "desc"


class ProductsSlugSlugGetParametersQuery(BaseModel):
    fields: list[Field33] | None = Field(None, examples=[["slug", "createdAt", "updatedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    sort: Sort68 | list[SortEnum21] | dict[str, Sort69] | list[dict[str, Sort69]] | None = Field(
        None, examples=["slug"]
    )
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Description9(ElementsTextBlockEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["elements.text-block"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Description10(MarkersStartHorizontalLayoutMarkerEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["markers.start-horizontal-layout-marker"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Description11(MarkersEndHorizontalLayoutMarkerEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["markers.end-horizontal-layout-marker"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Description8(RootModel[Description9 | Description10 | Description11]):
    root: Description9 | Description10 | Description11 = Field(..., discriminator="field__component")


class Data24(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    slug: str
    """
    A UID field
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
    seller: ApiContributorContributorDocument
    """
    A relational field
    """
    header: ElementsHeaderEntry
    """
    A component field
    """
    images: list[PluginUploadFileDocument]
    """
    A media field
    """
    prices: list[ElementsPriceEntry] = Field(..., min_length=1)
    """
    A component field
    """
    category: ApiProductCategoryProductCategoryDocument
    """
    A relational field
    """
    certificates: list[ApiProductCertificateProductCertificateDocument] | None = None
    """
    A relational field
    """
    tags: list[ApiProductTagProductTagDocument] | None = None
    """
    A relational field
    """
    affiliate_button: ElementsButtonEntry = Field(..., alias="affiliateButton")
    """
    A component field
    """
    disclaimer_label: ElementsLabelEntry = Field(..., alias="disclaimerLabel")
    """
    A component field
    """
    view_details_label: ElementsLabelEntry = Field(..., alias="viewDetailsLabel")
    """
    A component field
    """
    description: list[Description8]
    """
    A dynamic zone field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ProductsSlugSlugGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data24
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Sort71(StrEnum):
    """
    Sort the result
    """

    SLUG = "slug"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort72(StrEnum):
    ASC = "asc"
    DESC = "desc"


class ProductsIdGetParametersQuery(BaseModel):
    fields: list[Field33] | None = Field(None, examples=[["slug", "createdAt", "updatedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    sort: Sort71 | list[SortEnum21] | dict[str, Sort72] | list[dict[str, Sort72]] | None = Field(
        None, examples=["slug"]
    )
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Description13(ElementsTextBlockEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["elements.text-block"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Description14(MarkersStartHorizontalLayoutMarkerEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["markers.start-horizontal-layout-marker"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Description15(MarkersEndHorizontalLayoutMarkerEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["markers.end-horizontal-layout-marker"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Description12(RootModel[Description13 | Description14 | Description15]):
    root: Description13 | Description14 | Description15 = Field(..., discriminator="field__component")


class Data25(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    slug: str
    """
    A UID field
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
    seller: ApiContributorContributorDocument
    """
    A relational field
    """
    header: ElementsHeaderEntry
    """
    A component field
    """
    images: list[PluginUploadFileDocument]
    """
    A media field
    """
    prices: list[ElementsPriceEntry] = Field(..., min_length=1)
    """
    A component field
    """
    category: ApiProductCategoryProductCategoryDocument
    """
    A relational field
    """
    certificates: list[ApiProductCertificateProductCertificateDocument] | None = None
    """
    A relational field
    """
    tags: list[ApiProductTagProductTagDocument] | None = None
    """
    A relational field
    """
    affiliate_button: ElementsButtonEntry = Field(..., alias="affiliateButton")
    """
    A component field
    """
    disclaimer_label: ElementsLabelEntry = Field(..., alias="disclaimerLabel")
    """
    A component field
    """
    view_details_label: ElementsLabelEntry = Field(..., alias="viewDetailsLabel")
    """
    A component field
    """
    description: list[Description12]
    """
    A dynamic zone field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ProductsIdGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data25
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field36(StrEnum):
    PROFILE_TITLE = "profileTitle"
    EDIT_PROFILE_TITLE = "editProfileTitle"
    WISHLIST_TITLE = "wishlistTitle"
    WISHLIST_EMPTY_MESSAGE = "wishlistEmptyMessage"
    CURRENCY_TITLE = "currencyTitle"
    CURRENCY_DESCRIPTION = "currencyDescription"
    DELETE_ACCOUNT_TITLE = "deleteAccountTitle"
    DELETE_ACCOUNT_WARNING = "deleteAccountWarning"
    SAVE_BUTTON = "saveButton"
    CANCEL_BUTTON = "cancelButton"
    DELETE_BUTTON = "deleteButton"
    CONFIRM_BUTTON = "confirmButton"
    LOGOUT_BUTTON = "logoutButton"
    NAME_LABEL = "nameLabel"
    EMAIL_LABEL = "emailLabel"
    PASSWORD_LABEL = "passwordLabel"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class ProfileGetParametersQuery(BaseModel):
    fields: list[Field36] | None = Field(None, examples=[["profileTitle", "editProfileTitle", "wishlistTitle"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data26(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    profile_title: str | None = Field(None, alias="profileTitle")
    """
    A string field
    """
    edit_profile_title: str | None = Field(None, alias="editProfileTitle")
    """
    A string field
    """
    wishlist_title: str | None = Field(None, alias="wishlistTitle")
    """
    A string field
    """
    wishlist_empty_message: str | None = Field(None, alias="wishlistEmptyMessage")
    """
    A text field
    """
    currency_title: str | None = Field(None, alias="currencyTitle")
    """
    A string field
    """
    currency_description: str | None = Field(None, alias="currencyDescription")
    """
    A text field
    """
    delete_account_title: str | None = Field(None, alias="deleteAccountTitle")
    """
    A string field
    """
    delete_account_warning: str | None = Field(None, alias="deleteAccountWarning")
    """
    A text field
    """
    save_button: str | None = Field(None, alias="saveButton")
    """
    A string field
    """
    cancel_button: str | None = Field(None, alias="cancelButton")
    """
    A string field
    """
    delete_button: str | None = Field(None, alias="deleteButton")
    """
    A string field
    """
    confirm_button: str | None = Field(None, alias="confirmButton")
    """
    A string field
    """
    logout_button: str | None = Field(None, alias="logoutButton")
    """
    A string field
    """
    name_label: str | None = Field(None, alias="nameLabel")
    """
    A string field
    """
    email_label: str | None = Field(None, alias="emailLabel")
    """
    A string field
    """
    password_label: str | None = Field(None, alias="passwordLabel")
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
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ProfileGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data26
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class RedirectsCheckGetParametersQuery(BaseModel):
    source_url: str = Field(..., examples=["/old-page"])


class Field37(StrEnum):
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class TermGetParametersQuery(BaseModel):
    fields: list[Field37] | None = Field(None, examples=[["createdAt", "updatedAt", "publishedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data27(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
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
    content: ElementsTextBlockEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class TermGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data27
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Field38(StrEnum):
    THEME_ID = "themeId"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Pagination161(BaseModel):
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


class Pagination162(BaseModel):
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


class Pagination163(BaseModel):
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


class Pagination164(Pagination161, Pagination163):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination165(Pagination162, Pagination163):
    """
    Pagination parameters
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Pagination16(RootModel[Pagination164 | Pagination165]):
    """
    Pagination parameters
    """

    root: Pagination164 | Pagination165
    """
    Pagination parameters
    """


class Sort74(StrEnum):
    """
    Sort the result
    """

    THEME_ID = "themeId"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class SortEnum24(StrEnum):
    THEME_ID = "themeId"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort75(StrEnum):
    ASC = "asc"
    DESC = "desc"


class ThemesGetParametersQuery(BaseModel):
    fields: list[Field38] | None = Field(None, examples=[["themeId", "createdAt", "updatedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    field_q: str | None = Field(None, alias="_q", examples=["search terms"])
    pagination: Pagination16 | None = Field(default_factory=Pagination16)
    """
    Pagination parameters
    """
    sort: Sort74 | list[SortEnum24] | dict[str, Sort75] | list[dict[str, Sort75]] | None = Field(
        None, examples=["themeId"]
    )
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Datum10(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    theme_id: str = Field(..., alias="themeId")
    """
    A UID field
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
    content: ElementsLabelEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ThemesGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: list[Datum10]
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Sort77(StrEnum):
    """
    Sort the result
    """

    THEME_ID = "themeId"
    CREATED_AT = "createdAt"
    UPDATED_AT = "updatedAt"
    PUBLISHED_AT = "publishedAt"
    LOCALE = "locale"


class Sort78(StrEnum):
    ASC = "asc"
    DESC = "desc"


class ThemesIdGetParametersQuery(BaseModel):
    fields: list[Field38] | None = Field(None, examples=[["themeId", "createdAt", "updatedAt"]])
    """
    The fields to return, this doesn't include populatable fields like relations, components, files, or dynamic zones
    """
    filters: dict[str, Any] | None = None
    """
    Filters to apply to the query
    """
    sort: Sort77 | list[SortEnum24] | dict[str, Sort78] | list[dict[str, Sort78]] | None = Field(
        None, examples=["themeId"]
    )
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
    custom_populate: str = Field(..., alias="customPopulate")
    custom_depth: int | None = Field(None, alias="customDepth")
    custom_ignored: list[str] | None = Field(None, alias="customIgnored")


class Data28(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    theme_id: str = Field(..., alias="themeId")
    """
    A UID field
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
    content: ElementsLabelEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ThemesIdGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data28
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Sections1(SectionsHeroEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.hero"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections2(SectionsTeamGridEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.team-grid"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections3(MarkersStartHorizontalLayoutMarkerEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["markers.start-horizontal-layout-marker"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections4(MarkersEndHorizontalLayoutMarkerEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["markers.end-horizontal-layout-marker"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections5(ElementsTextBlockEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["elements.text-block"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections6(SectionsBrandFeaturesSectionEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.brand-features-section"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections8(SectionsCategoryGridEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.category-grid"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections9(SectionsBlogTeaserEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.blog-teaser"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections10(CallToActionsNewsletterSignupCtaEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["call-to-actions.newsletter-signup-cta"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Columns2(CallToActionsNewsletterSignupCtaEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["call-to-actions.newsletter-signup-cta"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Columns3(MarkersStartHorizontalLayoutMarkerEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["markers.start-horizontal-layout-marker"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Columns4(MarkersEndHorizontalLayoutMarkerEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["markers.end-horizontal-layout-marker"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Columns(RootModel[Columns1 | Columns2 | Columns3 | Columns4]):
    root: Columns1 | Columns2 | Columns3 | Columns4 = Field(..., discriminator="field__component")


class ApiFooterFooterDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
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
    columns: list[Columns]
    """
    A dynamic zone field
    """
    copyrights_label: ElementsLabelEntry = Field(..., alias="copyrightsLabel")
    """
    A component field
    """
    quick_links: list[ElementsButtonEntry] = Field(..., alias="quickLinks")
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class Sections12(SectionsHeroEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.hero"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections13(SectionsTeamGridEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.team-grid"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections14(MarkersStartHorizontalLayoutMarkerEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["markers.start-horizontal-layout-marker"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections15(MarkersEndHorizontalLayoutMarkerEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["markers.end-horizontal-layout-marker"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections17(SectionsBrandFeaturesSectionEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.brand-features-section"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections19(SectionsCategoryGridEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.category-grid"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections20(SectionsBlogTeaserEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.blog-teaser"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections21(CallToActionsNewsletterSignupCtaEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["call-to-actions.newsletter-signup-cta"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class MenusProductCategoriesSelectorEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    menu_button: ElementsButtonEntry = Field(..., alias="menuButton")
    """
    A component field
    """
    product_categories: list[ApiProductCategoryProductCategoryDocument] | None = Field(None, alias="productCategories")
    """
    A relational field
    """
    id: int | None = None
    """
    Component instance ID
    """


class MenusThemeSelectorEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    menu_button: ElementsButtonEntry = Field(..., alias="menuButton")
    """
    A component field
    """
    themes: list[ApiThemeThemeDocument]
    """
    A relational field
    """
    id: int | None = None
    """
    Component instance ID
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
    id: str | float
    site_title: str | None = Field("TheGreenBrother", alias="siteTitle")
    """
    A string field
    """
    site_description: str = Field(..., alias="siteDescription")
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
    brand_button: ElementsButtonEntry = Field(..., alias="brandButton")
    """
    A component field
    """
    home_button: ElementsButtonEntry = Field(..., alias="homeButton")
    """
    A component field
    """
    products_menu: MenusProductCategoriesSelectorEntry = Field(..., alias="productsMenu")
    """
    A component field
    """
    blog_button: ElementsButtonEntry = Field(..., alias="blogButton")
    """
    A component field
    """
    about_button: ElementsButtonEntry = Field(..., alias="aboutButton")
    """
    A component field
    """
    search_menu: MenusSearchMenuEntry = Field(..., alias="searchMenu")
    """
    A component field
    """
    theme_menu: MenusThemeSelectorEntry = Field(..., alias="themeMenu")
    """
    A component field
    """
    language_menu: MenusLanguageSelectorEntry = Field(..., alias="languageMenu")
    """
    A component field
    """
    login_button: ElementsButtonEntry = Field(..., alias="loginButton")
    """
    A component field
    """
    mobile_menu_button: MenusMobileMenuEntry = Field(..., alias="mobileMenuButton")
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class Description2(MarkersStartHorizontalLayoutMarkerEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["markers.start-horizontal-layout-marker"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Description3(MarkersEndHorizontalLayoutMarkerEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["markers.end-horizontal-layout-marker"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Description(RootModel[Description1 | Description2 | Description3]):
    root: Description1 | Description2 | Description3 = Field(..., discriminator="field__component")


class ApiProductProductDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    slug: str
    """
    A UID field
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
    seller: ApiContributorContributorDocument
    """
    A relational field
    """
    header: ElementsHeaderEntry
    """
    A component field
    """
    images: list[PluginUploadFileDocument]
    """
    A media field
    """
    prices: list[ElementsPriceEntry] = Field(..., min_length=1)
    """
    A component field
    """
    category: ApiProductCategoryProductCategoryDocument
    """
    A relational field
    """
    certificates: list[ApiProductCertificateProductCertificateDocument] | None = None
    """
    A relational field
    """
    tags: list[ApiProductTagProductTagDocument] | None = None
    """
    A relational field
    """
    affiliate_button: ElementsButtonEntry = Field(..., alias="affiliateButton")
    """
    A component field
    """
    disclaimer_label: ElementsLabelEntry = Field(..., alias="disclaimerLabel")
    """
    A component field
    """
    view_details_label: ElementsLabelEntry = Field(..., alias="viewDetailsLabel")
    """
    A component field
    """
    description: list[Description]
    """
    A dynamic zone field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class FiltersProductsFilterEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    header: ElementsHeaderEntry
    """
    A component field
    """
    tag_filter: FiltersTagFilterEntry = Field(..., alias="tagFilter")
    """
    A component field
    """
    price_range_filter: FiltersPriceRangeFilterEntry = Field(..., alias="priceRangeFilter")
    """
    A component field
    """
    id: int | None = None
    """
    Component instance ID
    """


class ApiProductCategoriesPageProductCategoriesPageDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    by_seller_text: str = Field(..., alias="bySellerText")
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
    header: ElementsHeaderEntry
    """
    A component field
    """
    products_filter: FiltersProductsFilterEntry = Field(..., alias="productsFilter")
    """
    A component field
    """
    products_sorter: SortersProductsSorterEntry = Field(..., alias="productsSorter")
    """
    A component field
    """
    certificates_section_header: ElementsHeaderEntry = Field(..., alias="certificatesSectionHeader")
    """
    A component field
    """
    related_products_section_header: ElementsHeaderEntry = Field(..., alias="relatedProductsSectionHeader")
    """
    A component field
    """
    pagination: CallToActionsPaginationCtaEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class SectionsFeaturedProductsEntry(BaseModel):
    """
    Section displaying featured products with header and view all link
    """

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    id: int
    """
    Component instance ID
    """
    header: ElementsHeaderEntry
    """
    A component field
    """
    products: list[ApiProductProductDocument]
    """
    A relational field
    """
    view_all_button: ElementsButtonEntry = Field(..., alias="viewAllButton")
    """
    A component field
    """


class Sections29(SectionsFeaturedProductsEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.featured-products"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections22(
    RootModel[
        Sections23
        | Sections24
        | Sections25
        | Sections26
        | Sections27
        | Sections28
        | Sections29
        | Sections30
        | Sections31
        | Sections32
    ]
):
    root: (
        Sections23
        | Sections24
        | Sections25
        | Sections26
        | Sections27
        | Sections28
        | Sections29
        | Sections30
        | Sections31
        | Sections32
    ) = Field(..., discriminator="field__component")


class Data(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
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
    sections: list[Sections22]
    """
    A dynamic zone field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
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


class Sections40(SectionsFeaturedProductsEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.featured-products"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections33(
    RootModel[
        Sections34
        | Sections35
        | Sections36
        | Sections37
        | Sections38
        | Sections39
        | Sections40
        | Sections41
        | Sections42
        | Sections43
    ]
):
    root: (
        Sections34
        | Sections35
        | Sections36
        | Sections37
        | Sections38
        | Sections39
        | Sections40
        | Sections41
        | Sections42
        | Sections43
    ) = Field(..., discriminator="field__component")


class Data16(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
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
    sections: list[Sections33]
    """
    A dynamic zone field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class HomepageGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data16
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Data17(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    site_title: str | None = Field("TheGreenBrother", alias="siteTitle")
    """
    A string field
    """
    site_description: str = Field(..., alias="siteDescription")
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
    brand_button: ElementsButtonEntry = Field(..., alias="brandButton")
    """
    A component field
    """
    home_button: ElementsButtonEntry = Field(..., alias="homeButton")
    """
    A component field
    """
    products_menu: MenusProductCategoriesSelectorEntry = Field(..., alias="productsMenu")
    """
    A component field
    """
    blog_button: ElementsButtonEntry = Field(..., alias="blogButton")
    """
    A component field
    """
    about_button: ElementsButtonEntry = Field(..., alias="aboutButton")
    """
    A component field
    """
    search_menu: MenusSearchMenuEntry = Field(..., alias="searchMenu")
    """
    A component field
    """
    theme_menu: MenusThemeSelectorEntry = Field(..., alias="themeMenu")
    """
    A component field
    """
    language_menu: MenusLanguageSelectorEntry = Field(..., alias="languageMenu")
    """
    A component field
    """
    login_button: ElementsButtonEntry = Field(..., alias="loginButton")
    """
    A component field
    """
    mobile_menu_button: MenusMobileMenuEntry = Field(..., alias="mobileMenuButton")
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class NavigationGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data17
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Data19(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
    by_seller_text: str = Field(..., alias="bySellerText")
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
    header: ElementsHeaderEntry
    """
    A component field
    """
    products_filter: FiltersProductsFilterEntry = Field(..., alias="productsFilter")
    """
    A component field
    """
    products_sorter: SortersProductsSorterEntry = Field(..., alias="productsSorter")
    """
    A component field
    """
    certificates_section_header: ElementsHeaderEntry = Field(..., alias="certificatesSectionHeader")
    """
    A component field
    """
    related_products_section_header: ElementsHeaderEntry = Field(..., alias="relatedProductsSectionHeader")
    """
    A component field
    """
    pagination: CallToActionsPaginationCtaEntry
    """
    A component field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class ProductCategoriesPageGetResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    data: Data19
    meta: dict[str, Any] | None = None
    """
    Metadata object containing pagination and other response metadata
    """


class Sections7(SectionsFeaturedProductsEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.featured-products"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections(
    RootModel[
        Sections1
        | Sections2
        | Sections3
        | Sections4
        | Sections5
        | Sections6
        | Sections7
        | Sections8
        | Sections9
        | Sections10
    ]
):
    root: (
        Sections1
        | Sections2
        | Sections3
        | Sections4
        | Sections5
        | Sections6
        | Sections7
        | Sections8
        | Sections9
        | Sections10
    ) = Field(..., discriminator="field__component")


class ApiAboutAboutDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
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
    sections: list[Sections]
    """
    A dynamic zone field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """


class Sections18(SectionsFeaturedProductsEntry):
    model_config = ConfigDict(
        populate_by_name=True,
    )
    field__component: Literal["sections.featured-products"] = Field(..., alias="__component")
    """
    Component type discriminator
    """


class Sections11(
    RootModel[
        Sections12
        | Sections13
        | Sections14
        | Sections15
        | Sections16
        | Sections17
        | Sections18
        | Sections19
        | Sections20
        | Sections21
    ]
):
    root: (
        Sections12
        | Sections13
        | Sections14
        | Sections15
        | Sections16
        | Sections17
        | Sections18
        | Sections19
        | Sections20
        | Sections21
    ) = Field(..., discriminator="field__component")


class ApiHomepageHomepageDocument(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )
    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])
    """
    The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.
    """
    id: str | float
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
    sections: list[Sections11]
    """
    A dynamic zone field
    """
    seo_metadata: ElementsSeoMetadataEntry = Field(..., alias="seoMetadata")
    """
    A component field
    """
    localizations: list[Localization] | None = None
    """
    Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.
    """
