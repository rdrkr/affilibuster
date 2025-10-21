# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
System message API routes - proxies to Strapi system-message single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's system-message single-type.
"""

from fastapi import APIRouter, Depends, HTTPException

from domain.use_cases.strapi_proxy import (
    StrapiProxyGetUseCase,
    StrapiProxyMutateUseCase,
)
from infrastructure.api.models.generated.models import (
    SystemMessageGetParametersQuery,
    SystemMessageGetResponse,
    SystemMessagePutParametersQuery,
    SystemMessagePutRequest,
    SystemMessagePutResponse,
)
from infrastructure.dependencies import CacheServiceDep, StrapiRepoDep

router = APIRouter(prefix="", tags=["system-message"])


@router.get("/system-message", response_model=SystemMessageGetResponse)
async def system_message_get_system_message(
    params: SystemMessageGetParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get System messages content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=3600)
        return await use_case.execute(
            "/system-message",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch system message from Strapi: {str(e)}",
        )


@router.put("/system-message", response_model=SystemMessagePutResponse)
async def system_message_put_system_message(
    request: SystemMessagePutRequest,
    params: SystemMessagePutParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Update System messages content in Strapi.
    """
    try:
        use_case = StrapiProxyMutateUseCase(strapi_repo, cache_service)
        return await use_case.put(
            "/system-message",
            data=request.model_dump(exclude_none=True),
            params=params.model_dump(exclude_none=True),
            invalidate_pattern="strapi:/system-message",
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to update system message in Strapi: {str(e)}",
        )
