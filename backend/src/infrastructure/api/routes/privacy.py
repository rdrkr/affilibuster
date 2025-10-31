# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Privacy policy API routes - proxies to Strapi privacy single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's privacy single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from fastapi import APIRouter, Depends, HTTPException

from infrastructure.api.models.generated.models import (
    PrivacyGetParametersQuery,
    PrivacyGetResponse,
)
from infrastructure.dependencies import StrapiProxyGetUseCaseDep

router = APIRouter(prefix="", tags=["privacy"])


@router.get("/privacy", response_model=PrivacyGetResponse)
async def privacy_get_privacy(
    use_case: StrapiProxyGetUseCaseDep,
    params: PrivacyGetParametersQuery = Depends(),
):
    """
    Get Privacy policy content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/privacy",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch privacy policy from Strapi: {e!s}",
        )
