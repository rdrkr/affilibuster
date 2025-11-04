# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
CMS Type Unions.

Defines union types for all OpenAPI-generated CMS request and response models.
These types provide strong type safety for the generic CMS repository pattern.

NOTE: This file should be manually maintained when new endpoints are added.
"""

from typing import Any

from affilibuster_backend.domain.entities.generated.models import (
    # Request Parameter Types (Query Parameters)
    AboutGetParametersQuery,
    # Response Types
    AboutGetResponse,
    ComponentsGetResponse,
    ComponentsUidGetResponse,
    ContactGetParametersQuery,
    ContactGetResponse,
    CurrenciesGetParametersQuery,
    CurrenciesGetResponse,
    CurrenciesIdGetParametersQuery,
    CurrenciesIdGetResponse,
    Error404GetParametersQuery,
    Error404GetResponse,
    Error410GetParametersQuery,
    Error410GetResponse,
    FilesGetParametersQuery,
    FilesGetResponse,
    FilesIdGetParametersQuery,
    FilesIdGetResponse,
    FooterGetParametersQuery,
    FooterGetResponse,
    HomepageGetParametersQuery,
    HomepageGetResponse,
    # Request Body Types (POST)
    LanguagesDetectPostRequest,
    LanguagesGetResponse,
    LocalesGetResponse,
    NavigationGetParametersQuery,
    NavigationGetResponse,
    PrivacyGetParametersQuery,
    PrivacyGetResponse,
    ProductPageGetParametersQuery,
    ProductPageGetResponse,
    ProductsGetParametersQuery,
    ProductsGetResponse,
    ProductsIdGetParametersQuery,
    ProductsIdGetResponse,
    SystemMessageGetParametersQuery,
    SystemMessageGetResponse,
    TermGetParametersQuery,
    TermGetResponse,
)

# Union of all request parameter types (query parameters and request bodies)
CMSRequest = (
    # Query Parameters
    AboutGetParametersQuery
    | ContactGetParametersQuery
    | CurrenciesGetParametersQuery
    | CurrenciesIdGetParametersQuery
    | Error404GetParametersQuery
    | Error410GetParametersQuery
    | FilesGetParametersQuery
    | FilesIdGetParametersQuery
    | FooterGetParametersQuery
    | HomepageGetParametersQuery
    | NavigationGetParametersQuery
    | PrivacyGetParametersQuery
    | ProductPageGetParametersQuery
    | ProductsGetParametersQuery
    | ProductsIdGetParametersQuery
    | SystemMessageGetParametersQuery
    | TermGetParametersQuery
    # Request Bodies
    | LanguagesDetectPostRequest
)

# Union of all response types
CMSResponse = (
    AboutGetResponse
    | ComponentsGetResponse
    | ComponentsUidGetResponse
    | ContactGetResponse
    | CurrenciesGetResponse
    | CurrenciesIdGetResponse
    | Error404GetResponse
    | Error410GetResponse
    | FilesGetResponse
    | FilesIdGetResponse
    | FooterGetResponse
    | HomepageGetResponse
    | LanguagesGetResponse
    | LocalesGetResponse
    | NavigationGetResponse
    | PrivacyGetResponse
    | ProductPageGetResponse
    | ProductsGetResponse
    | ProductsIdGetResponse
    | SystemMessageGetResponse
    | TermGetResponse
)


class CMSAPIError(Exception):
    """Raised when CMS API returns an error."""

    def __init__(self, status_code: int, message: str, details: dict[str, Any] | None = None) -> None:
        """Initialize CMS API error."""
        self.status_code = status_code
        self.message = message
        self.details = details or {}
        super().__init__(f"CMS API error ({status_code}): {message}")
