# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Currency API routes - proxies to Strapi currency collection.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All currency data comes from Strapi's currency collection type.
"""

from fastapi import APIRouter, Depends, HTTPException, Path

from domain.use_cases.strapi_proxy import (
    StrapiProxyGetUseCase,
    StrapiProxyMutateUseCase,
)
from infrastructure.api.models.generated.models import (
    CurrenciesGetParametersQuery,
    CurrenciesGetResponse,
    CurrenciesIdGetParametersQuery,
    CurrenciesIdGetResponse,
    CurrenciesIdPutParametersQuery,
    CurrenciesIdPutRequest,
    CurrenciesIdPutResponse,
    CurrenciesPostParametersQuery,
    CurrenciesPostRequest,
    CurrenciesPostResponse,
)
from infrastructure.dependencies import CacheServiceDep, StrapiRepoDep

router = APIRouter(prefix="/currencies", tags=["currency"])


@router.get("", response_model=CurrenciesGetResponse)
async def get_currencies(
    params: CurrenciesGetParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get all currencies from Strapi currency collection.

    Supports filtering, pagination, and field selection.
    """
    try:
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=3600)
        return await use_case.execute(
            "/currencies",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch currencies from Strapi: {str(e)}",
        )


@router.post("", response_model=CurrenciesPostResponse)
async def create_currency(
    request: CurrenciesPostRequest,
    params: CurrenciesPostParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Create a new currency in Strapi.
    """
    try:
        use_case = StrapiProxyMutateUseCase(strapi_repo, cache_service)
        return await use_case.post(
            "/currencies",
            data=request.model_dump(exclude_none=True),
            params=params.model_dump(exclude_none=True),
            invalidate_pattern="strapi:/currencies",
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to create currency in Strapi: {str(e)}",
        )


@router.get("/{id}", response_model=CurrenciesIdGetResponse)
async def get_currency(
    id: str = Path(..., description="Currency ID"),
    params: CurrenciesIdGetParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get a specific currency by ID.

    Fetches from Strapi currency collection.
    """
    try:
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=3600)
        return await use_case.execute(
            f"/currencies/{id}",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch currency from Strapi: {str(e)}",
        )


@router.put("/{id}", response_model=CurrenciesIdPutResponse)
async def update_currency(
    request: CurrenciesIdPutRequest,
    id: str = Path(..., description="Currency ID"),
    params: CurrenciesIdPutParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Update a specific currency in Strapi.
    """
    try:
        use_case = StrapiProxyMutateUseCase(strapi_repo, cache_service)
        return await use_case.put(
            f"/currencies/{id}",
            data=request.model_dump(exclude_none=True),
            params=params.model_dump(exclude_none=True),
            invalidate_pattern="strapi:/currencies",
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to update currency in Strapi: {str(e)}",
        )
