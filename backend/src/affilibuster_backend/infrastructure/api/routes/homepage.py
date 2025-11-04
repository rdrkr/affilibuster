# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Homepage API routes - proxies to Strapi homepage single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's homepage single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from affilibuster_backend.domain.entities.generated.models import (
    HomepageGetParametersQuery,
    HomepageGetResponse,
)
from affilibuster_backend.infrastructure.dependencies import GetCMSContentUseCaseDep

router = APIRouter(prefix="", tags=["homepage"])


@router.get("/homepage")
async def homepage_get_homepage(
    use_case: GetCMSContentUseCaseDep,
    params: Annotated[HomepageGetParametersQuery, Depends()],
) -> HomepageGetResponse:
    """
    Get Homepage content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/homepage",
            params=params,
            response_model=HomepageGetResponse,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch homepage from Strapi: {e!s}",
        ) from e
