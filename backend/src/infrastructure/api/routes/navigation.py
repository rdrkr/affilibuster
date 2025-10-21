# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Navigation API routes - proxies to Strapi navigation single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's navigation single-type.
"""

from fastapi import APIRouter, Depends, HTTPException

from domain.use_cases.strapi_proxy import (
    StrapiProxyGetUseCase,
    StrapiProxyMutateUseCase,
)
from infrastructure.api.models.generated.models import (
    NavigationGetParametersQuery,
    NavigationGetResponse,
    NavigationPutParametersQuery,
    NavigationPutRequest,
    NavigationPutResponse,
)
from infrastructure.dependencies import CacheServiceDep, StrapiRepoDep

router = APIRouter(prefix="", tags=["navigation"])


@router.get("/navigation", response_model=NavigationGetResponse)
async def navigation_get_navigation(
    params: NavigationGetParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get Navigation menu content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=3600)
        return await use_case.execute(
            "/navigation",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch navigation from Strapi: {str(e)}",
        )


@router.put("/navigation", response_model=NavigationPutResponse)
async def navigation_put_navigation(
    request: NavigationPutRequest,
    params: NavigationPutParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Update Navigation menu content in Strapi.
    """
    try:
        use_case = StrapiProxyMutateUseCase(strapi_repo, cache_service)
        return await use_case.put(
            "/navigation",
            data=request.model_dump(exclude_none=True),
            params=params.model_dump(exclude_none=True),
            invalidate_pattern="strapi:/navigation",
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to update navigation in Strapi: {str(e)}",
        )
