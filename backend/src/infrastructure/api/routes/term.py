# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Terms of service API routes - proxies to Strapi term single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's term single-type.
"""

from fastapi import APIRouter, Depends, HTTPException

from domain.use_cases.strapi_proxy import (
    StrapiProxyGetUseCase,
    StrapiProxyMutateUseCase,
)
from infrastructure.api.models.generated.models import (
    TermGetParametersQuery,
    TermGetResponse,
    TermPutParametersQuery,
    TermPutRequest,
    TermPutResponse,
)
from infrastructure.dependencies import CacheServiceDep, StrapiRepoDep

router = APIRouter(prefix="", tags=["term"])


@router.get("/term", response_model=TermGetResponse)
async def term_get_term(
    params: TermGetParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get Terms of service content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=3600)
        return await use_case.execute(
            "/term",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch terms of service from Strapi: {str(e)}",
        )


@router.put("/term", response_model=TermPutResponse)
async def term_put_term(
    request: TermPutRequest,
    params: TermPutParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Update Terms of service content in Strapi.
    """
    try:
        use_case = StrapiProxyMutateUseCase(strapi_repo, cache_service)
        return await use_case.put(
            "/term",
            data=request.model_dump(exclude_none=True),
            params=params.model_dump(exclude_none=True),
            invalidate_pattern="strapi:/term",
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to update terms of service in Strapi: {str(e)}",
        )
