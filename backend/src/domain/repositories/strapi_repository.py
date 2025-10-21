# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Strapi CMS Repository Interface.

Defines the contract for interacting with Strapi CMS.
All Strapi communication goes through this interface to maintain
clean architecture and enable testing with mocks.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional


class IStrapiRepository(ABC):
    """
    Interface for Strapi CMS interactions.

    This repository handles all communication with the Strapi backend,
    including authentication, error handling, and response mapping.
    """

    @abstractmethod
    async def get(self, path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Send a GET request to Strapi.

        Args:
            path: API path (e.g., "/about", "/products")
            params: Query parameters (fields, populate, filters, locale, pagination, sort, etc.)

        Returns:
            Response data from Strapi

        Raises:
            StrapiAPIError: If Strapi returns an error
            ConnectionError: If connection to Strapi fails
        """
        pass

    @abstractmethod
    async def post(self, path: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send a POST request to Strapi.

        Args:
            path: API path
            data: Request payload

        Returns:
            Response data from Strapi

        Raises:
            StrapiAPIError: If Strapi returns an error
            ConnectionError: If connection to Strapi fails
        """
        pass

    @abstractmethod
    async def put(self, path: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send a PUT request to Strapi.

        Args:
            path: API path
            data: Request payload

        Returns:
            Response data from Strapi

        Raises:
            StrapiAPIError: If Strapi returns an error
            ConnectionError: If connection to Strapi fails
        """
        pass

    @abstractmethod
    async def delete(self, path: str) -> None:
        """
        Send a DELETE request to Strapi.

        Args:
            path: API path

        Raises:
            StrapiAPIError: If Strapi returns an error
            ConnectionError: If connection to Strapi fails
        """
        pass
