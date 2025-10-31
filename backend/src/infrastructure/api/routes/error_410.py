# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
410 error page API routes - proxies to Strapi error-410 single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's error-410 single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from fastapi import APIRouter, Depends, HTTPException

from infrastructure.api.models.generated.models import (
    Error410GetParametersQuery,
    Error410GetResponse,
)
from infrastructure.dependencies import StrapiProxyGetUseCaseDep

router = APIRouter(prefix="", tags=["error-410"])


@router.get("/error-410", response_model=Error410GetResponse)
async def error_410_get_error_410(
    use_case: StrapiProxyGetUseCaseDep,
    params: Error410GetParametersQuery = Depends(),
):
    """
    Get 410 error page content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/error-410",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch 410 error page from Strapi: {e!s}",
        )
