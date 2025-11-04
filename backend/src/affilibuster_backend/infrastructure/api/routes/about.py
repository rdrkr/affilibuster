# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
About page API routes - proxies to Strapi about single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's about single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from affilibuster_backend.domain.entities.generated.models import (
    AboutGetParametersQuery,
    AboutGetResponse,
)
from affilibuster_backend.infrastructure.dependencies import GetCMSContentUseCaseDep

router = APIRouter(prefix="", tags=["about"])


@router.get("/about")
async def about_get_about(
    use_case: GetCMSContentUseCaseDep,
    params: Annotated[AboutGetParametersQuery, Depends()],
) -> AboutGetResponse:
    """
    Get About page content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/about",
            params=params,
            response_model=AboutGetResponse,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch about page from Strapi: {e!s}",
        ) from e
