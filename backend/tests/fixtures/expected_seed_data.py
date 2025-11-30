# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Expected Seed Data for Integration Tests.

This module loads seed data from multiple sources:
- Backend redirects: data/backend-seed.jsonl (JSONL format - one JSON object per line)
- CMS content types: data/entities/entities_00001.jsonl (JSONL format - Strapi exported entities)

IMPORTANT: Data is loaded at module import time.
When seed files are updated, tests will automatically use the new data.

All data is validated using Pydantic models generated from OpenAPI specs,
ensuring exact match with API response structures.

Reference: backend/scripts/seed.py (uses backend-seed.jsonl for redirects)
"""

import json
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field

from affilibuster_backend.domain.entities.generated.models import (
    ApiAboutAboutDocument,
    ApiAuthorAuthorDocument,
    ApiAuthPageAuthPageDocument,
    ApiBlogBlogDocument,
    ApiBlogPostBlogPostDocument,
    ApiContactUsContactUsDocument,
    ApiCurrencyCurrencyDocument,
    ApiError404Error404Document,
    ApiError410Error410Document,
    ApiFaqFaqDocument,
    ApiFooterFooterDocument,
    ApiHomepageHomepageDocument,
    ApiNavigationNavigationDocument,
    ApiPrivacyPrivacyDocument,
    ApiProductCategoriesPageProductCategoriesPageDocument,
    ApiProductCategoryProductCategoryDocument,
    ApiProductProductDocument,
    ApiProfileProfileDocument,
    ApiTermTermDocument,
)
from affilibuster_backend.domain.entities.url_redirect import URLRedirect


class StrapiExportWrapper(BaseModel):
    """
    Wrapper for Strapi's export format.

    Strapi exports entities as: {"type": "api::content.content", "id": 1, "data": {...}}
    This wrapper allows us to deserialize and extract the typed data field.
    """

    type: str = Field(description="Strapi entity type (e.g., 'api::product.product')")
    id: int = Field(description="Strapi entity ID")
    data: dict[str, Any] = Field(description="Entity data payload")


class LocaleData(BaseModel):
    """
    i18n locale structure from Strapi plugin.

    Locales are stored as plugin::i18n.locale entities.
    """

    code: str = Field(description="Locale code (e.g., 'en', 'it', 'he')")
    name: str = Field(description="Locale display name (e.g., 'English', 'Italiano', 'עברית')")


def get_entities_path() -> Path:
    """
    Get the entities file path for Strapi exported content.

    Returns:
        Path: Path to entities_00001.jsonl, checking /data/entities first,
              then falling back to ../data/entities

    """
    docker_path = Path("/data/entities/entities_00001.jsonl")
    local_path = Path(__file__).parent.parent.parent.parent / "data" / "entities" / "entities_00001.jsonl"

    return docker_path if docker_path.exists() else local_path


def get_backend_seed_data_path() -> Path:
    """
    Get the backend seed data file path for URL redirects.

    Returns:
        Path: Path to backend-seed.jsonl, checking /data first, then ../data

    """
    docker_path = Path("/data/backend-seed.jsonl")
    local_path = Path(__file__).parent.parent.parent.parent / "data" / "backend-seed.jsonl"

    return docker_path if docker_path.exists() else local_path


def _should_skip_entity_type(entity_type: str) -> bool:
    """Check if entity type should be skipped."""
    return entity_type.startswith("admin::") or (
        entity_type.startswith("plugin::") and entity_type != "plugin::i18n.locale"
    )


def deserialize_entity[T: BaseModel](
    json_line: str,
    model_class: type[T],
    strip_fields: list[str] | None = None,
    default_fields: dict[str, Any] | None = None,
) -> tuple[str, str | None, T | None]:
    """
    Deserialize a Strapi entity from JSONL using Pydantic model validation.

    Args:
        json_line: Raw JSONL line containing Strapi export wrapper
        model_class: Pydantic model class to deserialize into
        strip_fields: Optional list of field names to remove before validation
                      (needed for models with extra="forbid" that have Strapi-added fields)
        default_fields: Optional dict of field names to default values to add if missing
                       (needed when DB export doesn't include populated relations marked required)

    Returns:
        Tuple of (entity_type, locale, validated_model)
        Returns (entity_type, locale, None) if validation fails or entity is unpublished

    """
    try:
        # Deserialize wrapper to access structure
        wrapper = StrapiExportWrapper.model_validate_json(json_line)

        # Skip system entities (except i18n locales which we need)
        if _should_skip_entity_type(wrapper.type):
            return (wrapper.type, None, None)

        # Extract locale
        locale = wrapper.data.get("locale")

        # Merge top-level ID into data (Strapi stores ID separately)
        wrapper.data["id"] = wrapper.id

        # Only process published entities (plugin entities like i18n.locale don't have publishedAt)
        if wrapper.type.startswith("api::") and not wrapper.data.get("publishedAt"):
            return (wrapper.type, locale, None)

        # Strip unwanted fields if specified (e.g., locale:null for Currency)
        if strip_fields:
            for field in strip_fields:
                wrapper.data.pop(field, None)

        # Add default values for missing required fields if specified
        # (e.g., images=[] for products when relations not populated in DB export)
        if default_fields:
            for field, default_value in default_fields.items():
                if field not in wrapper.data:
                    wrapper.data[field] = default_value

        # Deserialize using Pydantic model validation
        entity = model_class.model_validate(wrapper.data)
    except (json.JSONDecodeError, KeyError, ValueError):
        # Skip invalid or malformed entities
        return ("", None, None)
    else:
        return (wrapper.type, locale, entity)


def load_entities_from_jsonl() -> dict[str, dict[str | None, list[BaseModel]]]:
    """
    Load all entities from JSONL file using Pydantic model validation.

    Returns:
        Dict mapping entity type -> (locale or None) -> list of validated Pydantic models

    """
    entities_path = get_entities_path()
    entities: dict[str, dict[str | None, list[BaseModel]]] = {}

    # Map entity types to their Pydantic model classes and special handling
    # Note: Strip fields are needed when seed data (exported from Strapi DB) contains
    # internal/private fields that are NOT returned in actual API responses
    # Default fields are needed when DB export doesn't include required relations
    entity_type_map: dict[str, tuple[type[BaseModel], list[str] | None, dict[str, Any] | None]] = {
        "api::about.about": (ApiAboutAboutDocument, ["entryTitle"], None),  # Strip Strapi-internal field
        "api::auth-page.auth-page": (ApiAuthPageAuthPageDocument, ["entryTitle"], None),
        "api::author.author": (ApiAuthorAuthorDocument, None, None),  # Collection type - no entryTitle
        "api::blog.blog": (ApiBlogBlogDocument, ["entryTitle"], None),
        "api::blog-post.blog-post": (ApiBlogPostBlogPostDocument, None, None),  # Collection type
        "api::contact-us.contact-us": (ApiContactUsContactUsDocument, ["entryTitle"], None),
        "api::currency.currency": (ApiCurrencyCurrencyDocument, ["locale"], None),  # Strip locale:null
        "api::error-404.error-404": (ApiError404Error404Document, ["entryTitle"], None),
        "api::error-410.error-410": (ApiError410Error410Document, ["entryTitle"], None),
        "api::faq.faq": (ApiFaqFaqDocument, ["entryTitle"], None),
        "api::footer.footer": (ApiFooterFooterDocument, ["entryTitle"], None),
        "api::homepage.homepage": (ApiHomepageHomepageDocument, ["entryTitle"], None),
        "api::navigation.navigation": (ApiNavigationNavigationDocument, ["entryTitle"], None),
        "api::privacy.privacy": (ApiPrivacyPrivacyDocument, ["entryTitle"], None),
        "api::product.product": (ApiProductProductDocument, None, {"images": []}),  # Add empty images list
        "api::product-categories-page.product-categories-page": (
            ApiProductCategoriesPageProductCategoriesPageDocument,
            ["entryTitle"],
            None,
        ),
        "api::product-category.product-category": (ApiProductCategoryProductCategoryDocument, None, None),
        "api::profile.profile": (ApiProfileProfileDocument, ["entryTitle"], None),
        "api::term.term": (ApiTermTermDocument, ["entryTitle"], None),
        "plugin::i18n.locale": (LocaleData, None, None),
    }

    with open(entities_path, encoding="utf-8") as f:
        for line in f:
            stripped_line = line.strip()
            if not stripped_line:
                continue

            # Parse wrapper to determine entity type
            try:
                wrapper_data = json.loads(stripped_line)
                entity_type = wrapper_data.get("type", "")

                # Only process known entity types
                if entity_type not in entity_type_map:
                    continue

                model_class, strip_fields, default_fields = entity_type_map[entity_type]

                # Deserialize using Pydantic
                _, locale, entity = deserialize_entity(stripped_line, model_class, strip_fields, default_fields)

                if entity is None:
                    continue

                # Initialize nested dicts if needed
                if entity_type not in entities:
                    entities[entity_type] = {}
                if locale not in entities[entity_type]:
                    entities[entity_type][locale] = []

                entities[entity_type][locale].append(entity)

            except (json.JSONDecodeError, KeyError):
                continue

    return entities


# Load all entities from Strapi export using Pydantic validation
_ALL_ENTITIES = load_entities_from_jsonl()

# Load backend redirects from JSONL using Pydantic validation
_BACKEND_SEED_PATH = get_backend_seed_data_path()
EXPECTED_REDIRECTS: list[URLRedirect] = []
with open(_BACKEND_SEED_PATH, encoding="utf-8") as f:
    for line in f:
        stripped_line = line.strip()
        # Skip empty lines and comments
        if not stripped_line or stripped_line.startswith("#"):
            continue
        try:
            # Direct Pydantic deserialization from JSON string
            EXPECTED_REDIRECTS.append(URLRedirect.model_validate_json(stripped_line))
        except (json.JSONDecodeError, ValueError):
            # Skip invalid JSON or validation errors
            continue

# Extract locales (stored at root level, not per locale)
EXPECTED_LOCALES: list[LocaleData] = []
if "plugin::i18n.locale" in _ALL_ENTITIES:
    for locale_list in _ALL_ENTITIES["plugin::i18n.locale"].values():
        for locale_entity in locale_list:
            if isinstance(locale_entity, LocaleData):
                EXPECTED_LOCALES.append(locale_entity)

# Deduplicate locales by code
_seen_locale_codes = set()
_unique_locales = []
for locale in EXPECTED_LOCALES:
    if locale.code not in _seen_locale_codes:
        _seen_locale_codes.add(locale.code)
        _unique_locales.append(locale)
EXPECTED_LOCALES = _unique_locales

# Extract currencies (no locale field, stored at root level with locale:null stripped)
EXPECTED_CURRENCIES: list[ApiCurrencyCurrencyDocument] = []
if "api::currency.currency" in _ALL_ENTITIES:
    for currency_list in _ALL_ENTITIES["api::currency.currency"].values():
        for currency_entity in currency_list:
            if isinstance(currency_entity, ApiCurrencyCurrencyDocument):
                EXPECTED_CURRENCIES.append(currency_entity)

# Deduplicate currencies by code
_seen_currency_codes = set()
_unique_currencies = []
for currency in EXPECTED_CURRENCIES:
    if currency.code not in _seen_currency_codes:
        _seen_currency_codes.add(currency.code)
        _unique_currencies.append(currency)
EXPECTED_CURRENCIES = _unique_currencies


# Helper function to extract collection type entities
def _get_collection_entities[T: BaseModel](entity_type: str, model_class: type[T]) -> list[T]:
    """Extract all entities of a collection type."""
    entities: list[T] = []
    if entity_type in _ALL_ENTITIES:
        for locale_list in _ALL_ENTITIES[entity_type].values():
            for entity in locale_list:
                if isinstance(entity, model_class):
                    entities.append(entity)
    return entities


# Helper function to extract single type entity by locale
def _get_single_entity[T: BaseModel](entity_type: str, locale: str, model_class: type[T]) -> T | None:
    """Extract first entity of a single type for given locale."""
    if entity_type in _ALL_ENTITIES and locale in _ALL_ENTITIES[entity_type]:
        entities = _ALL_ENTITIES[entity_type][locale]
        if entities and isinstance(entities[0], model_class):
            return entities[0]
    return None


# Collection Types - Products
EXPECTED_PRODUCTS: list[ApiProductProductDocument] = _get_collection_entities(
    "api::product.product", ApiProductProductDocument
)

# Collection Types - Authors
EXPECTED_AUTHORS: list[ApiAuthorAuthorDocument] = _get_collection_entities(
    "api::author.author", ApiAuthorAuthorDocument
)

# Collection Types - Blog Posts
EXPECTED_BLOG_POSTS: list[ApiBlogPostBlogPostDocument] = _get_collection_entities(
    "api::blog-post.blog-post", ApiBlogPostBlogPostDocument
)

# Collection Types - Product Categories
EXPECTED_PRODUCT_CATEGORIES: list[ApiProductCategoryProductCategoryDocument] = _get_collection_entities(
    "api::product-category.product-category", ApiProductCategoryProductCategoryDocument
)

# Single Types - Navigation
EXPECTED_NAVIGATION_EN = _get_single_entity("api::navigation.navigation", "en", ApiNavigationNavigationDocument)
EXPECTED_NAVIGATION_IT = _get_single_entity("api::navigation.navigation", "it", ApiNavigationNavigationDocument)
EXPECTED_NAVIGATION_HE = _get_single_entity("api::navigation.navigation", "he", ApiNavigationNavigationDocument)

# Single Types - Footer
EXPECTED_FOOTER_EN = _get_single_entity("api::footer.footer", "en", ApiFooterFooterDocument)
EXPECTED_FOOTER_IT = _get_single_entity("api::footer.footer", "it", ApiFooterFooterDocument)
EXPECTED_FOOTER_HE = _get_single_entity("api::footer.footer", "he", ApiFooterFooterDocument)

# Single Types - Homepage
EXPECTED_HOMEPAGE_EN = _get_single_entity("api::homepage.homepage", "en", ApiHomepageHomepageDocument)
EXPECTED_HOMEPAGE_IT = _get_single_entity("api::homepage.homepage", "it", ApiHomepageHomepageDocument)
EXPECTED_HOMEPAGE_HE = _get_single_entity("api::homepage.homepage", "he", ApiHomepageHomepageDocument)

# Single Types - About
EXPECTED_ABOUT_EN = _get_single_entity("api::about.about", "en", ApiAboutAboutDocument)
EXPECTED_ABOUT_IT = _get_single_entity("api::about.about", "it", ApiAboutAboutDocument)
EXPECTED_ABOUT_HE = _get_single_entity("api::about.about", "he", ApiAboutAboutDocument)

# Single Types - Contact Us
EXPECTED_CONTACT_US_EN = _get_single_entity("api::contact-us.contact-us", "en", ApiContactUsContactUsDocument)
EXPECTED_CONTACT_US_IT = _get_single_entity("api::contact-us.contact-us", "it", ApiContactUsContactUsDocument)
EXPECTED_CONTACT_US_HE = _get_single_entity("api::contact-us.contact-us", "he", ApiContactUsContactUsDocument)

# Single Types - Privacy
EXPECTED_PRIVACY_EN = _get_single_entity("api::privacy.privacy", "en", ApiPrivacyPrivacyDocument)
EXPECTED_PRIVACY_IT = _get_single_entity("api::privacy.privacy", "it", ApiPrivacyPrivacyDocument)
EXPECTED_PRIVACY_HE = _get_single_entity("api::privacy.privacy", "he", ApiPrivacyPrivacyDocument)

# Single Types - Terms
EXPECTED_TERM_EN = _get_single_entity("api::term.term", "en", ApiTermTermDocument)
EXPECTED_TERM_IT = _get_single_entity("api::term.term", "it", ApiTermTermDocument)
EXPECTED_TERM_HE = _get_single_entity("api::term.term", "he", ApiTermTermDocument)

# Single Types - Error 404
EXPECTED_ERROR_404_EN = _get_single_entity("api::error-404.error-404", "en", ApiError404Error404Document)
EXPECTED_ERROR_404_IT = _get_single_entity("api::error-404.error-404", "it", ApiError404Error404Document)
EXPECTED_ERROR_404_HE = _get_single_entity("api::error-404.error-404", "he", ApiError404Error404Document)

# Single Types - Error 410
EXPECTED_ERROR_410_EN = _get_single_entity("api::error-410.error-410", "en", ApiError410Error410Document)
EXPECTED_ERROR_410_IT = _get_single_entity("api::error-410.error-410", "it", ApiError410Error410Document)
EXPECTED_ERROR_410_HE = _get_single_entity("api::error-410.error-410", "he", ApiError410Error410Document)


# Single Types - Auth Page
EXPECTED_AUTH_PAGE_EN = _get_single_entity("api::auth-page.auth-page", "en", ApiAuthPageAuthPageDocument)
EXPECTED_AUTH_PAGE_IT = _get_single_entity("api::auth-page.auth-page", "it", ApiAuthPageAuthPageDocument)
EXPECTED_AUTH_PAGE_HE = _get_single_entity("api::auth-page.auth-page", "he", ApiAuthPageAuthPageDocument)

# Single Types - Blog
EXPECTED_BLOG_EN = _get_single_entity("api::blog.blog", "en", ApiBlogBlogDocument)
EXPECTED_BLOG_IT = _get_single_entity("api::blog.blog", "it", ApiBlogBlogDocument)
EXPECTED_BLOG_HE = _get_single_entity("api::blog.blog", "he", ApiBlogBlogDocument)

# Single Types - FAQ
EXPECTED_FAQ_EN = _get_single_entity("api::faq.faq", "en", ApiFaqFaqDocument)
EXPECTED_FAQ_IT = _get_single_entity("api::faq.faq", "it", ApiFaqFaqDocument)
EXPECTED_FAQ_HE = _get_single_entity("api::faq.faq", "he", ApiFaqFaqDocument)

# Single Types - Product Categories Page
EXPECTED_PRODUCT_CATEGORIES_PAGE_EN = _get_single_entity(
    "api::product-categories-page.product-categories-page", "en", ApiProductCategoriesPageProductCategoriesPageDocument
)
EXPECTED_PRODUCT_CATEGORIES_PAGE_IT = _get_single_entity(
    "api::product-categories-page.product-categories-page", "it", ApiProductCategoriesPageProductCategoriesPageDocument
)
EXPECTED_PRODUCT_CATEGORIES_PAGE_HE = _get_single_entity(
    "api::product-categories-page.product-categories-page", "he", ApiProductCategoriesPageProductCategoriesPageDocument
)

# Single Types - Profile
EXPECTED_PROFILE_EN = _get_single_entity("api::profile.profile", "en", ApiProfileProfileDocument)
EXPECTED_PROFILE_IT = _get_single_entity("api::profile.profile", "it", ApiProfileProfileDocument)
EXPECTED_PROFILE_HE = _get_single_entity("api::profile.profile", "he", ApiProfileProfileDocument)

# Convenience constants for collection types
EXPECTED_CURRENCY_CODES = [c.code for c in EXPECTED_CURRENCIES]
EXPECTED_PRODUCT_SLUGS = [p.slug for p in EXPECTED_PRODUCTS]
EXPECTED_LOCALE_CODES = [loc.code for loc in EXPECTED_LOCALES]
EXPECTED_REDIRECT_FROM_PATHS = [r.from_path for r in EXPECTED_REDIRECTS]
EXPECTED_AUTHOR_SLUGS = [a.slug for a in EXPECTED_AUTHORS]
EXPECTED_BLOG_POST_SLUGS = [bp.slug for bp in EXPECTED_BLOG_POSTS]
EXPECTED_PRODUCT_CATEGORY_SLUGS = [pc.slug for pc in EXPECTED_PRODUCT_CATEGORIES]

# Counts for collection types
EXPECTED_CURRENCY_COUNT = len(EXPECTED_CURRENCIES)
EXPECTED_PRODUCT_COUNT = len(EXPECTED_PRODUCTS)
EXPECTED_LOCALE_COUNT = len(EXPECTED_LOCALES)
EXPECTED_REDIRECT_COUNT = len(EXPECTED_REDIRECTS)
EXPECTED_AUTHOR_COUNT = len(EXPECTED_AUTHORS)
EXPECTED_BLOG_POST_COUNT = len(EXPECTED_BLOG_POSTS)
EXPECTED_PRODUCT_CATEGORY_COUNT = len(EXPECTED_PRODUCT_CATEGORIES)

# Derived counts for products
EXPECTED_ENGLISH_PRODUCT_COUNT = sum(1 for p in EXPECTED_PRODUCTS if p.locale == "en")
EXPECTED_ITALIAN_PRODUCT_COUNT = sum(1 for p in EXPECTED_PRODUCTS if p.locale == "it")
EXPECTED_HEBREW_PRODUCT_COUNT = sum(1 for p in EXPECTED_PRODUCTS if p.locale == "he")
# Derived counts for redirects
EXPECTED_301_REDIRECT_COUNT = sum(1 for r in EXPECTED_REDIRECTS if r.status_code == 301)
EXPECTED_410_REDIRECT_COUNT = sum(1 for r in EXPECTED_REDIRECTS if r.status_code == 410)

# Derived counts for blog posts by locale
EXPECTED_ENGLISH_BLOG_POST_COUNT = sum(1 for bp in EXPECTED_BLOG_POSTS if bp.locale == "en")
EXPECTED_ITALIAN_BLOG_POST_COUNT = sum(1 for bp in EXPECTED_BLOG_POSTS if bp.locale == "it")
EXPECTED_HEBREW_BLOG_POST_COUNT = sum(1 for bp in EXPECTED_BLOG_POSTS if bp.locale == "he")

# Derived counts for authors by locale
EXPECTED_ENGLISH_AUTHOR_COUNT = sum(1 for a in EXPECTED_AUTHORS if a.locale == "en")
EXPECTED_ITALIAN_AUTHOR_COUNT = sum(1 for a in EXPECTED_AUTHORS if a.locale == "it")
EXPECTED_HEBREW_AUTHOR_COUNT = sum(1 for a in EXPECTED_AUTHORS if a.locale == "he")

# Derived counts for product categories by locale
EXPECTED_ENGLISH_PRODUCT_CATEGORY_COUNT = sum(1 for pc in EXPECTED_PRODUCT_CATEGORIES if pc.locale == "en")
EXPECTED_ITALIAN_PRODUCT_CATEGORY_COUNT = sum(1 for pc in EXPECTED_PRODUCT_CATEGORIES if pc.locale == "it")
EXPECTED_HEBREW_PRODUCT_CATEGORY_COUNT = sum(1 for pc in EXPECTED_PRODUCT_CATEGORIES if pc.locale == "he")
