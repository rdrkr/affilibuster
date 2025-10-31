# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Navigation API routes - proxies to Strapi navigation single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's navigation single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from fastapi import APIRouter, Depends, HTTPException

from infrastructure.api.models.generated.models import (
    NavigationGetParametersQuery,
    NavigationGetResponse,
)
from infrastructure.dependencies import StrapiProxyGetUseCaseDep

router = APIRouter(prefix="", tags=["navigation"])


@router.get("/navigation", response_model=NavigationGetResponse)
async def navigation_get_navigation(
    use_case: StrapiProxyGetUseCaseDep,
    params: NavigationGetParametersQuery = Depends(),
):
    """
    Get Navigation menu content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/navigation",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch navigation from Strapi: {e!s}",
        )
