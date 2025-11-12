# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Strapi Repository Implementation.

Uses httpx AsyncClient to communicate with Strapi CMS.
Handles authentication, error handling, and response mapping.
"""

import logging
from typing import Any, TypeVar, cast

import httpx
from pydantic import RootModel

from affilibuster_backend.config import settings
from affilibuster_backend.domain.entities import CMSAPIError, CMSRequest, CMSResponse
from affilibuster_backend.domain.repositories.cms_repository import ICMSRepository

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=CMSResponse)


class StrapiRepositoryImpl(ICMSRepository):
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
        # Disable SSL verification for self-signed certificates in development
        self.verify_ssl = settings.app_env == "production"

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

    def _snake_to_camel(self, snake_str: str) -> str:
        """
        Convert snake_case to camelCase.

        Args:
            snake_str: String in snake_case format

        Returns:
            String in camelCase format

        """
        components = snake_str.split("_")
        # Keep first component lowercase, capitalize the rest
        return components[0] + "".join(x.title() for x in components[1:])

    def _flatten_params(self, params: dict[str, Any], parent_key: str = "") -> dict[str, Any]:
        """
        Flatten nested dict to Strapi's bracket notation with camelCase keys.

        Converts {"pagination": {"page": 1, "page_size": 2}} to
        {"pagination[page]": 1, "pagination[pageSize]": 2}

        Note: Pydantic models use snake_case (page_size) but Strapi expects camelCase (pageSize)

        Args:
            params: Nested parameter dict
            parent_key: Parent key for recursion

        Returns:
            Flattened dict with bracket notation and camelCase keys

        """
        flat: dict[str, Any] = {}
        for key, value in params.items():
            # Convert snake_case keys to camelCase for Strapi
            camel_key = self._snake_to_camel(key)
            new_key = f"{parent_key}[{camel_key}]" if parent_key else camel_key
            if isinstance(value, dict):
                flat.update(self._flatten_params(value, new_key))
            elif isinstance(value, list) and value and isinstance(value[0], dict):
                # Handle list of dicts
                for i, item in enumerate(value):
                    flat.update(self._flatten_params(item, f"{new_key}[{i}]"))
            elif value is not None:
                flat[new_key] = value
        return flat

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
        # Use mode='json' to ensure enums serialize as strings
        # Flatten nested dicts to Strapi's bracket notation (e.g., pagination[page]=1)
        query_params: dict[str, Any] = {}
        if params is not None:
            nested_params = params.model_dump(mode="json", exclude_none=True)
            query_params = self._flatten_params(nested_params)

        try:
            async with httpx.AsyncClient(timeout=self.timeout, verify=self.verify_ssl) as client:
                response = await client.get(url, params=query_params, headers=headers)
                response.raise_for_status()
                data = response.json()

                # response_model is required for type safety
                if response_model is None:
                    msg = "response_model is required for type-safe operations"
                    raise ValueError(msg)

                # Handle RootModel types (e.g., lists) differently
                if issubclass(response_model, RootModel):
                    return cast("T", response_model(root=data))
                return cast("T", response_model(**data))
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
        # Use mode='json' to ensure enums serialize as strings
        query_params: dict[str, Any] = {}
        if params is not None:
            query_params = params.model_dump(mode="json", exclude_none=True)

        try:
            async with httpx.AsyncClient(timeout=self.timeout, verify=self.verify_ssl) as client:
                response = await client.post(url, json=request_data, params=query_params, headers=headers)
                response.raise_for_status()
                response_data = response.json()

                # response_model is required for type safety
                if response_model is None:
                    msg = "response_model is required for type-safe operations"
                    raise ValueError(msg)

                # Handle RootModel types (e.g., lists) differently
                if issubclass(response_model, RootModel):
                    return cast("T", response_model(root=response_data))
                return cast("T", response_model(**response_data))
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
