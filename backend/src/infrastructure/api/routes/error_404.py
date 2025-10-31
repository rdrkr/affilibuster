# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
404 error page API routes - proxies to Strapi error-404 single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's error-404 single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from fastapi import APIRouter, Depends, HTTPException

from infrastructure.api.models.generated.models import (
    Error404GetParametersQuery,
    Error404GetResponse,
)
from infrastructure.dependencies import StrapiProxyGetUseCaseDep

router = APIRouter(prefix="", tags=["error-404"])


@router.get("/error-404", response_model=Error404GetResponse)
async def error_404_get_error_404(
    use_case: StrapiProxyGetUseCaseDep,
    params: Error404GetParametersQuery = Depends(),
):
    """
    Get 404 error page content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/error-404",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch 404 error page from Strapi: {e!s}",
        )
