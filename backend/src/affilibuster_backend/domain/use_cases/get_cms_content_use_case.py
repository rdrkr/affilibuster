# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Generic CMS Proxy Use Cases.

Provides reusable use cases for proxying requests to CMS.
Maintains clean architecture while avoiding code duplication for multiple endpoints.
"""

from typing import TypeVar

from affilibuster_backend.domain.entities import CMSRequest, CMSResponse
from affilibuster_backend.domain.repositories.cms_repository import ICMSRepository

T = TypeVar("T", bound=CMSResponse)


class GetCMSContentUseCase:
    """
    Generic GET proxy use case for any CMS endpoint.

    Provides a passthrough to CMS repository for read-only operations.
    """

    def __init__(self, cms_repo: ICMSRepository) -> None:
        """
        Initialize the use case.

        Args:
            cms_repo: CMS repository

        """
        self._cms = cms_repo

    async def execute(
        self,
        path: str,
        params: CMSRequest | None = None,
        response_model: type[T] | None = None,
    ) -> T:
        """
        Execute GET proxy.

        Args:
            path: CMS API path
            params: Query parameters - must be a generated ParametersQuery model
            response_model: Pydantic model to parse response into (from CMSResponse union)

        Returns:
            Data from CMS parsed into response_model

        Raises:
            CMSAPIError: If CMS request fails

        """
        # Return type is enforced by the repository interface
        return await self._cms.get(path, params, response_model)
