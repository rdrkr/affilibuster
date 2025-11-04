# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
410 error page API routes - proxies to Strapi error-410 single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's error-410 single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from affilibuster_backend.domain.entities.generated.models import (
    Error410GetParametersQuery,
    Error410GetResponse,
)
from affilibuster_backend.infrastructure.dependencies import GetCMSContentUseCaseDep

router = APIRouter(prefix="", tags=["error-410"])


@router.get("/error-410")
async def error_410_get_error_410(
    use_case: GetCMSContentUseCaseDep,
    params: Annotated[Error410GetParametersQuery, Depends()],
) -> Error410GetResponse:
    """
    Get 410 error page content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/error-410",
            params=params,
            response_model=Error410GetResponse,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch 410 error page from Strapi: {e!s}",
        ) from e
