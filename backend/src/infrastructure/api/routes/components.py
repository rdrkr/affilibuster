# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Components API routes - proxies to Strapi component metadata endpoints.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
Provides metadata about components configured in Strapi.
"""

from fastapi import APIRouter, HTTPException, Path

from infrastructure.api.models.generated.models import (
    ComponentsGetResponse,
    ComponentsUidGetResponse,
)
from infrastructure.dependencies import StrapiProxyGetUseCaseDep

router = APIRouter(prefix="", tags=["content-type-builder"])


@router.get("/components", response_model=ComponentsGetResponse)
async def get_components(
    use_case: StrapiProxyGetUseCaseDep,
):
    """
    Get list of all components in Strapi.

    Returns metadata about all configured component types.
    """
    try:
        return await use_case.execute("/content-type-builder/components")
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch components from Strapi: {e!s}",
        )


@router.get("/components/{uid}", response_model=ComponentsUidGetResponse)
async def get_component(
    use_case: StrapiProxyGetUseCaseDep,
    uid: str = Path(..., description="Component UID"),
):
    """
    Get a specific component metadata by UID.

    Returns metadata about a specific configured component type.
    """
    try:
        return await use_case.execute(f"/content-type-builder/components/{uid}")
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch component {uid} from Strapi: {e!s}",
        )
