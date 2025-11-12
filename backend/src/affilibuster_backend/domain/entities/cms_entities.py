# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
CMS Type Unions.

Defines union types for all OpenAPI-generated CMS request and response models.
These types provide strong type safety for the generic CMS repository pattern.

NOTE: This file should be manually maintained when new endpoints are added.
"""

from typing import Any

from pydantic import BaseModel, Field

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


class CMSErrorDetails(BaseModel):
    """
    Structured error details from CMS API responses.

    Represents the error structure returned by Strapi CMS.
    Provides strong typing for error information instead of dict[str, Any].
    """

    model_config = {"extra": "allow"}  # Allow additional fields from Strapi

    message: str | None = Field(None, description="Error message from CMS")
    status: int | None = Field(None, description="HTTP status code")
    name: str | None = Field(None, description="Error name/type")
    details: dict[str, Any] | None = Field(None, description="Additional error context")


class CMSAPIError(Exception):
    """
    Raised when CMS API returns an error.

    Provides structured error information with strong typing.
    """

    def __init__(self, status_code: int, message: str, details: CMSErrorDetails | dict[str, Any] | None = None) -> None:
        """
        Initialize CMS API error.

        Args:
            status_code: HTTP status code.
            message: Error message.
            details: Structured error details from CMS response.

        """
        self.status_code = status_code
        self.message = message

        # Convert dict to CMSErrorDetails for strong typing
        if isinstance(details, dict):
            # Handle both Strapi error structure and simple message fallback
            if "error" in details:
                # Strapi wraps errors in an "error" object
                error_data = details["error"]
                if isinstance(error_data, dict):
                    self.details = CMSErrorDetails(**error_data)
                else:
                    # Error is a string or other simple type
                    self.details = CMSErrorDetails(message=str(error_data))
            else:
                # Simple dict (e.g., {"message": "..."})
                self.details = CMSErrorDetails(**details)
        elif details is None:
            self.details = CMSErrorDetails()
        else:
            self.details = details

        super().__init__(f"CMS API error ({status_code}): {message}")
