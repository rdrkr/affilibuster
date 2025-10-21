# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Privacy policy API routes - proxies to Strapi privacy single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's privacy single-type.
"""

from fastapi import APIRouter, Depends, HTTPException

from domain.use_cases.strapi_proxy import (
    StrapiProxyGetUseCase,
    StrapiProxyMutateUseCase,
)
from infrastructure.api.models.generated.models import (
    PrivacyGetParametersQuery,
    PrivacyGetResponse,
    PrivacyPutParametersQuery,
    PrivacyPutRequest,
    PrivacyPutResponse,
)
from infrastructure.dependencies import CacheServiceDep, StrapiRepoDep

router = APIRouter(prefix="", tags=["privacy"])


@router.get("/privacy", response_model=PrivacyGetResponse)
async def privacy_get_privacy(
    params: PrivacyGetParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get Privacy policy content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=3600)
        return await use_case.execute(
            "/privacy",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch privacy policy from Strapi: {str(e)}",
        )


@router.put("/privacy", response_model=PrivacyPutResponse)
async def privacy_put_privacy(
    request: PrivacyPutRequest,
    params: PrivacyPutParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Update Privacy policy content in Strapi.
    """
    try:
        use_case = StrapiProxyMutateUseCase(strapi_repo, cache_service)
        return await use_case.put(
            "/privacy",
            data=request.model_dump(exclude_none=True),
            params=params.model_dump(exclude_none=True),
            invalidate_pattern="strapi:/privacy",
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to update privacy policy in Strapi: {str(e)}",
        )
