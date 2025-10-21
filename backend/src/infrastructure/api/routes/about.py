# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
About page API routes - proxies to Strapi about single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's about single-type.
"""

from fastapi import APIRouter, Depends, HTTPException

from domain.use_cases.strapi_proxy import (
    StrapiProxyGetUseCase,
    StrapiProxyMutateUseCase,
)
from infrastructure.api.models.generated.models import (
    AboutGetParametersQuery,
    AboutGetResponse,
    AboutPutParametersQuery,
    AboutPutRequest,
    AboutPutResponse,
)
from infrastructure.dependencies import CacheServiceDep, StrapiRepoDep

router = APIRouter(prefix="", tags=["about"])


@router.get("/about", response_model=AboutGetResponse)
async def about_get_about(
    params: AboutGetParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get About page content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=3600)
        return await use_case.execute(
            "/about",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch about page from Strapi: {str(e)}",
        )


@router.put("/about", response_model=AboutPutResponse)
async def about_put_about(
    request: AboutPutRequest,
    params: AboutPutParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Update About page content in Strapi.
    """
    try:
        use_case = StrapiProxyMutateUseCase(strapi_repo, cache_service)
        return await use_case.put(
            "/about",
            data=request.model_dump(exclude_none=True),
            params=params.model_dump(exclude_none=True),
            invalidate_pattern="strapi:/about",
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to update about page in Strapi: {str(e)}",
        )
