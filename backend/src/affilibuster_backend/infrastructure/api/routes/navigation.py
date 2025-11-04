# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Navigation API routes - proxies to Strapi navigation single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's navigation single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from affilibuster_backend.domain.entities.generated.models import (
    NavigationGetParametersQuery,
    NavigationGetResponse,
)
from affilibuster_backend.infrastructure.dependencies import GetCMSContentUseCaseDep

router = APIRouter(prefix="", tags=["navigation"])


@router.get("/navigation")
async def navigation_get_navigation(
    use_case: GetCMSContentUseCaseDep,
    params: Annotated[NavigationGetParametersQuery, Depends()],
) -> NavigationGetResponse:
    """
    Get Navigation menu content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/navigation",
            params=params,
            response_model=NavigationGetResponse,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch navigation from Strapi: {e!s}",
        ) from e
