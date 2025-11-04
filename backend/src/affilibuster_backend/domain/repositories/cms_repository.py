# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
CMS Repository Interface.

Defines the contract for interacting with CMS.
All communication goes through this interface to maintain
clean architecture and enable testing with mocks.
"""

from abc import ABC, abstractmethod
from typing import TypeVar

from affilibuster_backend.domain.entities import CMSRequest, CMSResponse

T = TypeVar("T", bound=CMSResponse)


class ICMSRepository(ABC):
    """
    Interface for CMS interactions.

    This repository handles all communication with the CMS backend,
    including authentication, error handling, and response mapping.
    """

    @abstractmethod
    async def get(
        self,
        path: str,
        params: CMSRequest | None = None,
        response_model: type[T] | None = None,
    ) -> T:
        """
        Send a GET request to CMS.

        Args:
            path: API path (e.g., "/about", "/products")
            params: Query parameters - must be a generated ParametersQuery model
            response_model: Pydantic model to parse response into (from CMSResponse union)

        Returns:
            Response data from CMS parsed into response_model

        Raises:
            CMSAPIError: If CMS returns an error
            ConnectionError: If connection to CMS fails

        """

    @abstractmethod
    async def post(
        self,
        path: str,
        data: CMSRequest,
        params: CMSRequest | None = None,
        response_model: type[T] | None = None,
    ) -> T:
        """
        Send a POST request to CMS.

        Args:
            path: API path
            data: Request payload - must be a generated PostRequest model
            params: Query parameters - must be a generated ParametersQuery model
            response_model: Pydantic model to parse response into (from CMSResponse union)

        Returns:
            Response data from CMS parsed into response_model

        Raises:
            CMSAPIError: If CMS returns an error
            ConnectionError: If connection to CMS fails

        """
