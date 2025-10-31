# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Content Type Builder API routes - proxies to Strapi content-type-builder endpoints.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
Provides metadata about content types configured in Strapi.
"""

from fastapi import APIRouter, Depends, HTTPException, Path

from infrastructure.api.models.generated.models import (
    ContentTypesGetParametersQuery,
)
from infrastructure.dependencies import StrapiProxyGetUseCaseDep

router = APIRouter(prefix="", tags=["content-type-builder"])


@router.get("/content-types")
async def get_content_types(
    use_case: StrapiProxyGetUseCaseDep,
    params: ContentTypesGetParametersQuery = Depends(),
):
    """
    Get list of all content types in Strapi.

    Returns metadata about all configured content types (collections or single-types).
    Requires 'kind' parameter to filter by type.
    """
    try:
        return await use_case.execute(
            "/content-type-builder/content-types",
            params=params.model_dump(mode="json", exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch content-types from Strapi: {e!s}",
        )


@router.get("/content-types/{uid}")
async def get_content_type(
    use_case: StrapiProxyGetUseCaseDep,
    uid: str = Path(..., description="Content type UID"),
):
    """
    Get a specific content type metadata by UID.

    Returns metadata about a specific configured content type.
    """
    try:
        return await use_case.execute(f"/content-type-builder/content-types/{uid}")
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch content-type {uid} from Strapi: {e!s}",
        )
