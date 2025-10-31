# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Strapi Repository Implementation.

Uses httpx AsyncClient to communicate with Strapi CMS.
Handles authentication, error handling, and response mapping.
"""

from typing import Any

import httpx

from config import settings
from domain.repositories.strapi_repository import IStrapiRepository


class StrapiAPIError(Exception):
    """Raised when Strapi API returns an error."""

    def __init__(self, status_code: int, message: str, details: dict[str, Any] | None = None):
        """Initialize Strapi API error."""
        self.status_code = status_code
        self.message = message
        self.details = details or {}
        super().__init__(f"Strapi API error ({status_code}): {message}")


class StrapiRepositoryImpl(IStrapiRepository):
    """
    Implementation of IStrapiRepository using httpx.

    Handles:
    - Building complete URLs with Strapi base URL
    - Adding authentication headers
    - Parsing responses
    - Error handling and reporting
    """

    def __init__(self, base_url: str | None = None, api_token: str | None = None):
        """
        Initialize Strapi repository.

        Args:
            base_url: Strapi base URL (defaults to settings.strapi_url)
            api_token: Strapi API token (defaults to settings.strapi_api_token)

        """
        self.base_url = base_url or settings.strapi_url
        self.api_token = api_token or settings.strapi_api_token
        self.timeout = 30.0

    def _get_headers(self) -> dict[str, str]:
        """Get HTTP headers for Strapi requests."""
        headers: dict[str, str] = {}
        if self.api_token:
            headers["Authorization"] = f"Bearer {self.api_token}"
        return headers

    def _build_url(self, path: str) -> str:
        """Build complete URL for Strapi endpoint."""
        # Ensure path starts with /api/
        if not path.startswith("/api/"):
            if path.startswith("/"):
                path = f"/api{path}"
            else:
                path = f"/api/{path}"
        return f"{self.base_url}{path}"

    async def get(self, path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        """
        Send a GET request to Strapi.

        Args:
            path: API path (e.g., "/about", "/products")
            params: Query parameters

        Returns:
            Response data from Strapi

        Raises:
            StrapiAPIError: If Strapi returns an error

        """
        url = self._build_url(path)
        headers = self._get_headers()

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params or {}, headers=headers)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            raise StrapiAPIError(
                status_code=e.response.status_code,
                message=f"GET {path} failed",
                details=self._parse_error(e.response),
            )
        except httpx.RequestError as e:
            raise StrapiAPIError(
                status_code=502,
                message=f"Failed to connect to Strapi: {e!s}",
            )

    async def post(self, path: str, data: dict[str, Any], params: dict[str, Any] | None = None) -> dict[str, Any]:
        """
        Send a POST request to Strapi.

        Args:
            path: API path
            data: Request payload
            params: Query parameters (fields, populate, locale, status, etc.)

        Returns:
            Response data from Strapi

        Raises:
            StrapiAPIError: If Strapi returns an error

        """
        url = self._build_url(path)
        headers = self._get_headers()

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=data, params=params or {}, headers=headers)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            raise StrapiAPIError(
                status_code=e.response.status_code,
                message=f"POST {path} failed",
                details=self._parse_error(e.response),
            )
        except httpx.RequestError as e:
            raise StrapiAPIError(
                status_code=502,
                message=f"Failed to connect to Strapi: {e!s}",
            )

    @staticmethod
    def _parse_error(response: httpx.Response) -> dict[str, Any]:
        """Parse error details from Strapi error response."""
        try:
            return response.json()
        except Exception:
            return {"message": response.text}
