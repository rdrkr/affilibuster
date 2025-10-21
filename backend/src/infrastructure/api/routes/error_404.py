# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
404 error page API routes - proxies to Strapi error-404 single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's error-404 single-type.
"""

from fastapi import APIRouter, Depends, HTTPException

from domain.use_cases.strapi_proxy import (
    StrapiProxyGetUseCase,
    StrapiProxyMutateUseCase,
)
from infrastructure.api.models.generated.models import (
    Error404GetParametersQuery,
    Error404GetResponse,
    Error404PutParametersQuery,
    Error404PutRequest,
    Error404PutResponse,
)
from infrastructure.dependencies import CacheServiceDep, StrapiRepoDep

router = APIRouter(prefix="", tags=["error-404"])


@router.get("/error-404", response_model=Error404GetResponse)
async def error_404_get_error_404(
    params: Error404GetParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get 404 error page content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=3600)
        return await use_case.execute(
            "/error-404",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch 404 error page from Strapi: {str(e)}",
        )


@router.put("/error-404", response_model=Error404PutResponse)
async def error_404_put_error_404(
    request: Error404PutRequest,
    params: Error404PutParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Update 404 error page content in Strapi.
    """
    try:
        use_case = StrapiProxyMutateUseCase(strapi_repo, cache_service)
        return await use_case.put(
            "/error-404",
            data=request.model_dump(exclude_none=True),
            params=params.model_dump(exclude_none=True),
            invalidate_pattern="strapi:/error-404",
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to update 404 error page in Strapi: {str(e)}",
        )
