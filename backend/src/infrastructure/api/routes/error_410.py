# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
410 error page API routes - proxies to Strapi error-410 single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's error-410 single-type.
"""

from fastapi import APIRouter, Depends, HTTPException

from domain.use_cases.strapi_proxy import (
    StrapiProxyGetUseCase,
    StrapiProxyMutateUseCase,
)
from infrastructure.api.models.generated.models import (
    Error410GetParametersQuery,
    Error410GetResponse,
    Error410PutParametersQuery,
    Error410PutRequest,
    Error410PutResponse,
)
from infrastructure.dependencies import CacheServiceDep, StrapiRepoDep

router = APIRouter(prefix="", tags=["error-410"])


@router.get("/error-410", response_model=Error410GetResponse)
async def error_410_get_error_410(
    params: Error410GetParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get 410 error page content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=3600)
        return await use_case.execute(
            "/error-410",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch 410 error page from Strapi: {str(e)}",
        )


@router.put("/error-410", response_model=Error410PutResponse)
async def error_410_put_error_410(
    request: Error410PutRequest,
    params: Error410PutParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Update 410 error page content in Strapi.
    """
    try:
        use_case = StrapiProxyMutateUseCase(strapi_repo, cache_service)
        return await use_case.put(
            "/error-410",
            data=request.model_dump(exclude_none=True),
            params=params.model_dump(exclude_none=True),
            invalidate_pattern="strapi:/error-410",
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to update 410 error page in Strapi: {str(e)}",
        )
