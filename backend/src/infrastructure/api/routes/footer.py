# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Footer API routes - proxies to Strapi footer single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's footer single-type.
"""

from fastapi import APIRouter, Depends, HTTPException

from domain.use_cases.strapi_proxy import (
    StrapiProxyGetUseCase,
    StrapiProxyMutateUseCase,
)
from infrastructure.api.models.generated.models import (
    FooterGetParametersQuery,
    FooterGetResponse,
    FooterPutParametersQuery,
    FooterPutRequest,
    FooterPutResponse,
)
from infrastructure.dependencies import CacheServiceDep, StrapiRepoDep

router = APIRouter(prefix="", tags=["footer"])


@router.get("/footer", response_model=FooterGetResponse)
async def footer_get_footer(
    params: FooterGetParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get Footer content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=3600)
        return await use_case.execute(
            "/footer",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch footer from Strapi: {str(e)}",
        )


@router.put("/footer", response_model=FooterPutResponse)
async def footer_put_footer(
    request: FooterPutRequest,
    params: FooterPutParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Update Footer content in Strapi.
    """
    try:
        use_case = StrapiProxyMutateUseCase(strapi_repo, cache_service)
        return await use_case.put(
            "/footer",
            data=request.model_dump(exclude_none=True),
            params=params.model_dump(exclude_none=True),
            invalidate_pattern="strapi:/footer",
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to update footer in Strapi: {str(e)}",
        )
