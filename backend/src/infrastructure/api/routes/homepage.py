# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Homepage API routes - proxies to Strapi homepage single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's homepage single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from fastapi import APIRouter, Depends, HTTPException

from infrastructure.api.models.generated.models import (
    HomepageGetParametersQuery,
    HomepageGetResponse,
)
from infrastructure.dependencies import StrapiProxyGetUseCaseDep

router = APIRouter(prefix="", tags=["homepage"])


@router.get("/homepage", response_model=HomepageGetResponse)
async def homepage_get_homepage(
    use_case: StrapiProxyGetUseCaseDep,
    params: HomepageGetParametersQuery = Depends(),
):
    """
    Get Homepage content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/homepage",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch homepage from Strapi: {e!s}",
        )
