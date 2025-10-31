# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Contact page API routes - proxies to Strapi contact single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's contact single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from fastapi import APIRouter, Depends, HTTPException

from infrastructure.api.models.generated.models import (
    ContactGetParametersQuery,
    ContactGetResponse,
)
from infrastructure.dependencies import StrapiProxyGetUseCaseDep

router = APIRouter(prefix="", tags=["contact"])


@router.get("/contact", response_model=ContactGetResponse)
async def contact_get_contact(
    use_case: StrapiProxyGetUseCaseDep,
    params: ContactGetParametersQuery = Depends(),
):
    """
    Get Contact page content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/contact",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch contact page from Strapi: {e!s}",
        )
