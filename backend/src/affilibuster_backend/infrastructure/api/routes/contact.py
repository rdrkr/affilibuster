# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Contact page API routes - proxies to Strapi contact single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's contact single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from affilibuster_backend.domain.entities.generated.models import (
    ContactGetParametersQuery,
    ContactGetResponse,
)
from affilibuster_backend.infrastructure.dependencies import GetCMSContentUseCaseDep

router = APIRouter(prefix="", tags=["contact"])


@router.get("/contact")
async def contact_get_contact(
    use_case: GetCMSContentUseCaseDep,
    params: Annotated[ContactGetParametersQuery, Depends()],
) -> ContactGetResponse:
    """
    Get Contact page content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/contact",
            params=params,
            response_model=ContactGetResponse,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch contact page from Strapi: {e!s}",
        ) from e
