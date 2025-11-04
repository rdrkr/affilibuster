# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Privacy policy API routes - proxies to Strapi privacy single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's privacy single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from affilibuster_backend.domain.entities.generated.models import (
    PrivacyGetParametersQuery,
    PrivacyGetResponse,
)
from affilibuster_backend.infrastructure.dependencies import GetCMSContentUseCaseDep

router = APIRouter(prefix="", tags=["privacy"])


@router.get("/privacy")
async def privacy_get_privacy(
    use_case: GetCMSContentUseCaseDep,
    params: Annotated[PrivacyGetParametersQuery, Depends()],
) -> PrivacyGetResponse:
    """
    Get Privacy policy content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/privacy",
            params=params,
            response_model=PrivacyGetResponse,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch privacy policy from Strapi: {e!s}",
        ) from e
