# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Contact page API routes - proxies to Strapi contact single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's contact single-type.
"""

from fastapi import APIRouter, Depends, HTTPException

from domain.use_cases.strapi_proxy import (
    StrapiProxyGetUseCase,
    StrapiProxyMutateUseCase,
)
from infrastructure.api.models.generated.models import (
    ContactGetParametersQuery,
    ContactGetResponse,
    ContactPutParametersQuery,
    ContactPutRequest,
    ContactPutResponse,
)
from infrastructure.dependencies import CacheServiceDep, StrapiRepoDep

router = APIRouter(prefix="", tags=["contact"])


@router.get("/contact", response_model=ContactGetResponse)
async def contact_get_contact(
    params: ContactGetParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get Contact page content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=3600)
        return await use_case.execute(
            "/contact",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch contact page from Strapi: {str(e)}",
        )


@router.put("/contact", response_model=ContactPutResponse)
async def contact_put_contact(
    request: ContactPutRequest,
    params: ContactPutParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Update Contact page content in Strapi.
    """
    try:
        use_case = StrapiProxyMutateUseCase(strapi_repo, cache_service)
        return await use_case.put(
            "/contact",
            data=request.model_dump(exclude_none=True),
            params=params.model_dump(exclude_none=True),
            invalidate_pattern="strapi:/contact",
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to update contact page in Strapi: {str(e)}",
        )
