# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Components API routes - proxies to Strapi component metadata endpoints.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
Provides metadata about components configured in Strapi.
"""

from typing import Annotated

from fastapi import APIRouter, HTTPException, Path

from affilibuster_backend.domain.entities.generated.models import (
    ComponentsGetResponse,
    ComponentsUidGetResponse,
)
from affilibuster_backend.infrastructure.dependencies import GetCMSContentUseCaseDep

router = APIRouter(prefix="", tags=["content-type-builder"])


@router.get("/components")
async def get_components(
    use_case: GetCMSContentUseCaseDep,
) -> ComponentsGetResponse:
    """
    Get list of all components in Strapi.

    Returns metadata about all configured component types.
    """
    try:
        return await use_case.execute(
            "/content-type-builder/components",
            response_model=ComponentsGetResponse,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch components from Strapi: {e!s}",
        ) from e


@router.get("/components/{uid}")
async def get_component(
    use_case: GetCMSContentUseCaseDep,
    uid: Annotated[str, Path(description="Component UID")],
) -> ComponentsUidGetResponse:
    """
    Get a specific component metadata by UID.

    Returns metadata about a specific configured component type.
    """
    try:
        return await use_case.execute(
            f"/content-type-builder/components/{uid}",
            response_model=ComponentsUidGetResponse,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch component {uid} from Strapi: {e!s}",
        ) from e
