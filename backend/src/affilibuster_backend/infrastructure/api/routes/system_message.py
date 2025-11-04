# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
System message API routes - proxies to Strapi system-message single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's system-message single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from affilibuster_backend.domain.entities.generated.models import (
    SystemMessageGetParametersQuery,
    SystemMessageGetResponse,
)
from affilibuster_backend.infrastructure.dependencies import GetCMSContentUseCaseDep

router = APIRouter(prefix="", tags=["system-message"])


@router.get("/system-message")
async def system_message_get_system_message(
    use_case: GetCMSContentUseCaseDep,
    params: Annotated[SystemMessageGetParametersQuery, Depends()],
) -> SystemMessageGetResponse:
    """
    Get System messages content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/system-message",
            params=params,
            response_model=SystemMessageGetResponse,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch system message from Strapi: {e!s}",
        ) from e
