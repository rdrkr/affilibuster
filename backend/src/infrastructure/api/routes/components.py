# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Components API routes - proxies to Strapi component metadata endpoints.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
Provides metadata about components configured in Strapi.
"""

from fastapi import APIRouter, HTTPException, Path

from domain.use_cases.strapi_proxy import StrapiProxyGetUseCase
from infrastructure.api.models.generated.models import (
    ComponentsGetResponse,
    ComponentsUidGetResponse,
)
from infrastructure.dependencies import CacheServiceDep, StrapiRepoDep

router = APIRouter(prefix="", tags=["content-type-builder"])


@router.get("/components", response_model=ComponentsGetResponse)
async def get_components(
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get list of all components in Strapi.

    Returns metadata about all configured component types.
    """
    try:
        # Use Strapi proxy use case with long cache (components don't change often)
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=7200)
        return await use_case.execute("/components")
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch components from Strapi: {str(e)}",
        )


@router.get("/components/{uid}", response_model=ComponentsUidGetResponse)
async def get_component(
    uid: str = Path(..., description="Component UID"),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get a specific component metadata by UID.

    Returns metadata about a specific configured component type.
    """
    try:
        # Use Strapi proxy use case with long cache (components don't change often)
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=7200)
        return await use_case.execute(f"/components/{uid}")
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch component {uid} from Strapi: {str(e)}",
        )
