# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
About page API routes - proxies to Strapi about single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's about single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from fastapi import APIRouter, Depends, HTTPException

from infrastructure.api.models.generated.models import (
    AboutGetParametersQuery,
    AboutGetResponse,
)
from infrastructure.dependencies import StrapiProxyGetUseCaseDep

router = APIRouter(prefix="", tags=["about"])


@router.get("/about", response_model=AboutGetResponse)
async def about_get_about(
    use_case: StrapiProxyGetUseCaseDep,
    params: AboutGetParametersQuery = Depends(),
):
    """
    Get About page content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/about",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch about page from Strapi: {e!s}",
        )
