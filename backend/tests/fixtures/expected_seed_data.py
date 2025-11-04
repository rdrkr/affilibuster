# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Expected Seed Data for Integration Tests.

This module loads seed data from data/seed-data.json, which is the
single source of truth for both TypeScript (cms/src/seed.ts) and Python tests.

IMPORTANT: Data is loaded from data/seed-data.json at module import time.
When seed-data.json is updated, tests will automatically use the new data.

All data is validated using Pydantic models generated from OpenAPI specs,
ensuring exact match with Strapi's response structure.

Reference: cms/src/seed.ts (loads same JSON file)
"""

import json
from pathlib import Path
from typing import TypedDict

from affilibuster_backend.domain.entities.generated.models import (
    ApiAboutAboutDocument,
    ApiContactContactDocument,
    ApiError404Error404Document,
    ApiError410Error410Document,
    ApiFooterFooterDocument,
    ApiHomepageHomepageDocument,
    ApiNavigationNavigationDocument,
    ApiPrivacyPrivacyDocument,
    ApiProductPageProductPageDocument,
    ApiProductProductDocument,
    ApiSystemMessageSystemMessageDocument,
    ApiTermTermDocument,
    Currency,
)


class ExpectedLocale(TypedDict):
    """Expected locale structure from Strapi i18n plugin."""

    code: str
    name: str


def get_seed_data_path() -> Path:
    """
    Get the seed data file path following the same logic as cms/src/seed.ts.

    Returns:
        Path: Path to the seed data file, checking /data/seed-data.json first,
              then falling back to ../data/seed-data.json

    """
    docker_path = Path("/data/seed-data.json")
    local_path = Path(__file__).parent.parent.parent.parent / "data" / "seed-data.json"

    return docker_path if docker_path.exists() else local_path


# Load seed data from shared JSON file using conditional path logic
_SEED_DATA_PATH = get_seed_data_path()
with open(_SEED_DATA_PATH, encoding="utf-8") as f:
    _SEED_DATA = json.load(f)

# Extract currencies from JSON using Pydantic model validation
EXPECTED_CURRENCIES: list[Currency] = [
    Currency.model_validate(currency) for currency in _SEED_DATA["collections"]["currencies"]
]

# Extract products from JSON using Pydantic model validation
EXPECTED_PRODUCTS: list[ApiProductProductDocument] = []

# English products
for product in _SEED_DATA["collections"]["products"]["en"]:
    EXPECTED_PRODUCTS.append(ApiProductProductDocument.model_validate(product))

# Italian products
for product in _SEED_DATA["collections"]["products"]["it"]:
    EXPECTED_PRODUCTS.append(ApiProductProductDocument.model_validate(product))

# Extract single types from JSON using Pydantic model validation
# Navigation
EXPECTED_NAVIGATION_EN = ApiNavigationNavigationDocument.model_validate(_SEED_DATA["singleTypes"]["navigation"]["en"])
EXPECTED_NAVIGATION_IT = ApiNavigationNavigationDocument.model_validate(_SEED_DATA["singleTypes"]["navigation"]["it"])
EXPECTED_NAVIGATION_HE = ApiNavigationNavigationDocument.model_validate(_SEED_DATA["singleTypes"]["navigation"]["he"])

# Footer
EXPECTED_FOOTER_EN = ApiFooterFooterDocument.model_validate(_SEED_DATA["singleTypes"]["footer"]["en"])
EXPECTED_FOOTER_IT = ApiFooterFooterDocument.model_validate(_SEED_DATA["singleTypes"]["footer"]["it"])
EXPECTED_FOOTER_HE = ApiFooterFooterDocument.model_validate(_SEED_DATA["singleTypes"]["footer"]["he"])

# Homepage
EXPECTED_HOMEPAGE_EN = ApiHomepageHomepageDocument.model_validate(_SEED_DATA["singleTypes"]["homepage"]["en"])
EXPECTED_HOMEPAGE_IT = ApiHomepageHomepageDocument.model_validate(_SEED_DATA["singleTypes"]["homepage"]["it"])
EXPECTED_HOMEPAGE_HE = ApiHomepageHomepageDocument.model_validate(_SEED_DATA["singleTypes"]["homepage"]["he"])

# About
EXPECTED_ABOUT_EN = ApiAboutAboutDocument.model_validate(_SEED_DATA["singleTypes"]["about"]["en"])
EXPECTED_ABOUT_IT = ApiAboutAboutDocument.model_validate(_SEED_DATA["singleTypes"]["about"]["it"])
EXPECTED_ABOUT_HE = ApiAboutAboutDocument.model_validate(_SEED_DATA["singleTypes"]["about"]["he"])

# Contact
EXPECTED_CONTACT_EN = ApiContactContactDocument.model_validate(_SEED_DATA["singleTypes"]["contact"]["en"])
EXPECTED_CONTACT_IT = ApiContactContactDocument.model_validate(_SEED_DATA["singleTypes"]["contact"]["it"])
EXPECTED_CONTACT_HE = ApiContactContactDocument.model_validate(_SEED_DATA["singleTypes"]["contact"]["he"])

# Privacy
EXPECTED_PRIVACY_EN = ApiPrivacyPrivacyDocument.model_validate(_SEED_DATA["singleTypes"]["privacy"]["en"])
EXPECTED_PRIVACY_IT = ApiPrivacyPrivacyDocument.model_validate(_SEED_DATA["singleTypes"]["privacy"]["it"])
EXPECTED_PRIVACY_HE = ApiPrivacyPrivacyDocument.model_validate(_SEED_DATA["singleTypes"]["privacy"]["he"])

# Term
EXPECTED_TERM_EN = ApiTermTermDocument.model_validate(_SEED_DATA["singleTypes"]["term"]["en"])
EXPECTED_TERM_IT = ApiTermTermDocument.model_validate(_SEED_DATA["singleTypes"]["term"]["it"])
EXPECTED_TERM_HE = ApiTermTermDocument.model_validate(_SEED_DATA["singleTypes"]["term"]["he"])

# Product Page
EXPECTED_PRODUCT_PAGE_EN = ApiProductPageProductPageDocument.model_validate(
    _SEED_DATA["singleTypes"]["productPage"]["en"]
)
EXPECTED_PRODUCT_PAGE_IT = ApiProductPageProductPageDocument.model_validate(
    _SEED_DATA["singleTypes"]["productPage"]["it"]
)
EXPECTED_PRODUCT_PAGE_HE = ApiProductPageProductPageDocument.model_validate(
    _SEED_DATA["singleTypes"]["productPage"]["he"]
)

# Error 404
EXPECTED_ERROR_404_EN = ApiError404Error404Document.model_validate(_SEED_DATA["singleTypes"]["error404"]["en"])
EXPECTED_ERROR_404_IT = ApiError404Error404Document.model_validate(_SEED_DATA["singleTypes"]["error404"]["it"])
EXPECTED_ERROR_404_HE = ApiError404Error404Document.model_validate(_SEED_DATA["singleTypes"]["error404"]["he"])

# Error 410
EXPECTED_ERROR_410_EN = ApiError410Error410Document.model_validate(_SEED_DATA["singleTypes"]["error410"]["en"])
EXPECTED_ERROR_410_IT = ApiError410Error410Document.model_validate(_SEED_DATA["singleTypes"]["error410"]["it"])
EXPECTED_ERROR_410_HE = ApiError410Error410Document.model_validate(_SEED_DATA["singleTypes"]["error410"]["he"])

# System Message
EXPECTED_SYSTEM_MESSAGE_EN = ApiSystemMessageSystemMessageDocument.model_validate(
    _SEED_DATA["singleTypes"]["systemMessage"]["en"]
)
EXPECTED_SYSTEM_MESSAGE_IT = ApiSystemMessageSystemMessageDocument.model_validate(
    _SEED_DATA["singleTypes"]["systemMessage"]["it"]
)
EXPECTED_SYSTEM_MESSAGE_HE = ApiSystemMessageSystemMessageDocument.model_validate(
    _SEED_DATA["singleTypes"]["systemMessage"]["he"]
)

# Locales configured in Strapi i18n plugin
# These are not in seed-data.json as they're configured in Strapi settings
EXPECTED_LOCALES: list[ExpectedLocale] = [
    {"code": "en", "name": "English"},
    {"code": "it", "name": "Italian"},
    {"code": "he", "name": "Hebrew"},
]

# Convenience constants
EXPECTED_CURRENCY_CODES = [c.code for c in EXPECTED_CURRENCIES]
EXPECTED_PRODUCT_SLUGS = [p.slug for p in EXPECTED_PRODUCTS]
EXPECTED_LOCALE_CODES = [loc["code"] for loc in EXPECTED_LOCALES]

# Counts
EXPECTED_CURRENCY_COUNT = len(EXPECTED_CURRENCIES)
EXPECTED_PRODUCT_COUNT = len(EXPECTED_PRODUCTS)
EXPECTED_LOCALE_COUNT = len(EXPECTED_LOCALES)
EXPECTED_ENGLISH_PRODUCT_COUNT = sum(1 for p in EXPECTED_PRODUCTS if p.locale == "en")
EXPECTED_ITALIAN_PRODUCT_COUNT = sum(1 for p in EXPECTED_PRODUCTS if p.locale == "it")
EXPECTED_FEATURED_PRODUCT_COUNT = sum(1 for p in EXPECTED_PRODUCTS if p.featured)
