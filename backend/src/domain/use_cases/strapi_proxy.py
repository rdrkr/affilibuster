# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Generic Strapi Proxy Use Cases.

Provides reusable use cases for proxying requests to Strapi.
Maintains clean architecture while avoiding code duplication for multiple endpoints.
"""

from typing import Any

from domain.repositories.strapi_repository import IStrapiRepository


class StrapiProxyGetUseCase:
    """
    Generic GET proxy use case for any Strapi endpoint.

    Provides a passthrough to Strapi repository for read-only operations.
    """

    def __init__(self, strapi_repo: IStrapiRepository):
        """
        Initialize the use case.

        Args:
            strapi_repo: Strapi repository

        """
        self._strapi = strapi_repo

    async def execute(
        self,
        path: str,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Execute GET proxy.

        Args:
            path: Strapi API path
            params: Query parameters

        Returns:
            Data from Strapi

        Raises:
            StrapiAPIError: If Strapi request fails

        """
        return await self._strapi.get(path, params)


class StrapiProxyPostUseCase:
    """
    Generic POST proxy use case for Strapi endpoints.

    Provides a passthrough to Strapi repository for create operations.
    Backend is read-only for Strapi content - mutations should happen through Strapi Admin UI.
    """

    def __init__(self, strapi_repo: IStrapiRepository):
        """
        Initialize the use case.

        Args:
            strapi_repo: Strapi repository

        """
        self._strapi = strapi_repo

    async def post(
        self,
        path: str,
        data: dict[str, Any],
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Execute POST request.

        Args:
            path: Strapi API path
            data: Request payload
            params: Query parameters (fields, populate, locale, status, etc.)

        Returns:
            Created data from Strapi

        Raises:
            StrapiAPIError: If Strapi request fails

        """
        return await self._strapi.post(path, data, params)
