# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Terms of service API routes - proxies to Strapi term single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's term single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from affilibuster_backend.domain.entities.generated.models import (
    TermGetParametersQuery,
    TermGetResponse,
)
from affilibuster_backend.infrastructure.dependencies import GetCMSContentUseCaseDep

router = APIRouter(prefix="", tags=["term"])


@router.get("/term")
async def term_get_term(
    use_case: GetCMSContentUseCaseDep,
    params: Annotated[TermGetParametersQuery, Depends()],
) -> TermGetResponse:
    """
    Get Terms of service content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/term",
            params=params,
            response_model=TermGetResponse,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch terms of service from Strapi: {e!s}",
        ) from e
