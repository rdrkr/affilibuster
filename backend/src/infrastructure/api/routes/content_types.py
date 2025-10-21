# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Content Type Builder API routes - proxies to Strapi content-type-builder endpoints.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
Provides metadata about content types configured in Strapi.
"""

from fastapi import APIRouter, Depends, HTTPException, Path

from domain.use_cases.strapi_proxy import StrapiProxyGetUseCase
from infrastructure.api.models.generated.models import (
    ContentTypesGetParametersQuery,
    ContentTypesGetResponse,
    ContentTypesUidGetResponse,
)
from infrastructure.dependencies import CacheServiceDep, StrapiRepoDep

router = APIRouter(prefix="", tags=["content-type-builder"])


@router.get("/content-types", response_model=ContentTypesGetResponse)
async def get_content_types(
    params: ContentTypesGetParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get list of all content types in Strapi.

    Returns metadata about all configured content types (collections or single-types).
    Requires 'kind' parameter to filter by type.
    """
    try:
        # Use Strapi proxy use case with long cache (content types don't change often)
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=7200)
        return await use_case.execute(
            "/content-types",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch content-types from Strapi: {str(e)}",
        )


@router.get("/content-types/{uid}", response_model=ContentTypesUidGetResponse)
async def get_content_type(
    uid: str = Path(..., description="Content type UID"),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get a specific content type metadata by UID.

    Returns metadata about a specific configured content type.
    """
    try:
        # Use Strapi proxy use case with long cache (content types don't change often)
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=7200)
        return await use_case.execute(f"/content-types/{uid}")
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch content-type {uid} from Strapi: {str(e)}",
        )
