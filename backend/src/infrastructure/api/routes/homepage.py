# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Homepage API routes - proxies to Strapi homepage single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's homepage single-type.
"""

from fastapi import APIRouter, Depends, HTTPException

from domain.use_cases.strapi_proxy import (
    StrapiProxyGetUseCase,
    StrapiProxyMutateUseCase,
)
from infrastructure.api.models.generated.models import (
    HomepageGetParametersQuery,
    HomepageGetResponse,
    HomepagePutParametersQuery,
    HomepagePutRequest,
    HomepagePutResponse,
)
from infrastructure.dependencies import CacheServiceDep, StrapiRepoDep

router = APIRouter(prefix="", tags=["homepage"])


@router.get("/homepage", response_model=HomepageGetResponse)
async def homepage_get_homepage(
    params: HomepageGetParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get Homepage content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=3600)
        return await use_case.execute(
            "/homepage",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch homepage from Strapi: {str(e)}",
        )


@router.put("/homepage", response_model=HomepagePutResponse)
async def homepage_put_homepage(
    request: HomepagePutRequest,
    params: HomepagePutParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Update Homepage content in Strapi.
    """
    try:
        use_case = StrapiProxyMutateUseCase(strapi_repo, cache_service)
        return await use_case.put(
            "/homepage",
            data=request.model_dump(exclude_none=True),
            params=params.model_dump(exclude_none=True),
            invalidate_pattern="strapi:/homepage",
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to update homepage in Strapi: {str(e)}",
        )
