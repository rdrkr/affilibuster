# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Strapi Repository Implementation.

Uses httpx AsyncClient to communicate with Strapi CMS.
Handles authentication, error handling, and response mapping.
"""

from typing import Any, TypeVar

import httpx
from pydantic import RootModel

from affilibuster_backend.config import settings
from affilibuster_backend.domain.entities import CMSAPIError, CMSRequest, CMSResponse
from affilibuster_backend.domain.repositories.cms_repository import ICMSRepository

T = TypeVar("T", bound=CMSResponse)


class StrapiRepositoryImpl(ICMSRepository):  # type: ignore[misc]
    """
    Implementation of ICMSRepository using httpx.

    Handles:
    - Building complete URLs with Strapi base URL
    - Adding authentication headers
    - Parsing responses
    - Error handling and reporting
    """

    def __init__(self, base_url: str | None = None, api_token: str | None = None) -> None:
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
            path = f"/api{path}" if path.startswith("/") else f"/api/{path}"
        return f"{self.base_url}{path}"

    async def get(
        self,
        path: str,
        params: CMSRequest | None = None,
        response_model: type[T] | None = None,
    ) -> T:
        """
        Send a GET request to Strapi.

        Args:
            path: API path (e.g., "/about", "/products")
            params: Query parameters - must be a generated ParametersQuery model
            response_model: Pydantic model to parse response into (from CMSResponse union)

        Returns:
            Response data from Strapi parsed into response_model

        Raises:
            CMSAPIError: If Strapi returns an error

        """
        url = self._build_url(path)
        headers = self._get_headers()

        # Convert BaseModel params to dict for httpx
        query_params: dict[str, Any] = {}
        if params is not None:
            query_params = params.model_dump(exclude_none=True)

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=query_params, headers=headers)
                response.raise_for_status()
                data = response.json()

                # response_model is required for type safety
                if response_model is None:
                    msg = "response_model is required for type-safe operations"
                    raise ValueError(msg)

                # Handle RootModel types (e.g., lists) differently
                if issubclass(response_model, RootModel):
                    return response_model(root=data)
                return response_model(**data)  # type: ignore[no-any-return]
        except httpx.HTTPStatusError as e:
            raise CMSAPIError(
                status_code=e.response.status_code,
                message=f"GET {path} failed",
                details=self._parse_error(e.response),
            ) from e
        except httpx.RequestError as e:
            raise CMSAPIError(
                status_code=502,
                message=f"Failed to connect to Strapi: {e!s}",
            ) from e

    async def post(
        self,
        path: str,
        data: CMSRequest,
        params: CMSRequest | None = None,
        response_model: type[T] | None = None,
    ) -> T:
        """
        Send a POST request to Strapi.

        Args:
            path: API path
            data: Request payload - must be a generated PostRequest model
            params: Query parameters - must be a generated ParametersQuery model
            response_model: Pydantic model to parse response into (from CMSResponse union)

        Returns:
            Response data from Strapi parsed into response_model

        Raises:
            CMSAPIError: If Strapi returns an error

        """
        url = self._build_url(path)
        headers = self._get_headers()

        # Convert BaseModel data to dict for httpx
        request_data = data.model_dump(exclude_none=True)

        # Convert BaseModel params to dict for httpx
        query_params: dict[str, Any] = {}
        if params is not None:
            query_params = params.model_dump(exclude_none=True)

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=request_data, params=query_params, headers=headers)
                response.raise_for_status()
                response_data = response.json()

                # response_model is required for type safety
                if response_model is None:
                    msg = "response_model is required for type-safe operations"
                    raise ValueError(msg)

                # Handle RootModel types (e.g., lists) differently
                if issubclass(response_model, RootModel):
                    return response_model(root=response_data)
                return response_model(**response_data)  # type: ignore[no-any-return]
        except httpx.HTTPStatusError as e:
            raise CMSAPIError(
                status_code=e.response.status_code,
                message=f"POST {path} failed",
                details=self._parse_error(e.response),
            ) from e
        except httpx.RequestError as e:
            raise CMSAPIError(
                status_code=502,
                message=f"Failed to connect to Strapi: {e!s}",
            ) from e

    @staticmethod
    def _parse_error(response: httpx.Response) -> dict[str, Any]:
        """Parse error details from Strapi error response."""
        try:
            error_data: dict[str, Any] = response.json()
        except Exception:  # noqa: BLE001
            # Fallback to raw text if JSON parsing fails
            return {"message": response.text}
        else:
            return error_data
