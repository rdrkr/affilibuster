# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Terms of service API routes - proxies to Strapi term single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's term single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from fastapi import APIRouter, Depends, HTTPException

from infrastructure.api.models.generated.models import (
    TermGetParametersQuery,
    TermGetResponse,
)
from infrastructure.dependencies import StrapiProxyGetUseCaseDep

router = APIRouter(prefix="", tags=["term"])


@router.get("/term", response_model=TermGetResponse)
async def term_get_term(
    use_case: StrapiProxyGetUseCaseDep,
    params: TermGetParametersQuery = Depends(),
):
    """
    Get Terms of service content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/term",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch terms of service from Strapi: {e!s}",
        )
