# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Footer API routes - proxies to Strapi footer single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's footer single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from fastapi import APIRouter, Depends, HTTPException

from infrastructure.api.models.generated.models import (
    FooterGetParametersQuery,
    FooterGetResponse,
)
from infrastructure.dependencies import StrapiProxyGetUseCaseDep

router = APIRouter(prefix="", tags=["footer"])


@router.get("/footer", response_model=FooterGetResponse)
async def footer_get_footer(
    use_case: StrapiProxyGetUseCaseDep,
    params: FooterGetParametersQuery = Depends(),
):
    """
    Get Footer content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/footer",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch footer from Strapi: {e!s}",
        )
