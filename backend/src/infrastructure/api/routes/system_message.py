# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
System message API routes - proxies to Strapi system-message single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's system-message single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from fastapi import APIRouter, Depends, HTTPException

from infrastructure.api.models.generated.models import (
    SystemMessageGetParametersQuery,
    SystemMessageGetResponse,
)
from infrastructure.dependencies import StrapiProxyGetUseCaseDep

router = APIRouter(prefix="", tags=["system-message"])


@router.get("/system-message", response_model=SystemMessageGetResponse)
async def system_message_get_system_message(
    use_case: StrapiProxyGetUseCaseDep,
    params: SystemMessageGetParametersQuery = Depends(),
):
    """
    Get System messages content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/system-message",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch system message from Strapi: {e!s}",
        )
