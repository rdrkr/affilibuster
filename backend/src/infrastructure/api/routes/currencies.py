# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Currency API routes - proxies to Strapi currency collection.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All currency data comes from Strapi's currency collection type.
Backend is read-only for updates - mutations should happen through Strapi Admin UI.
"""

from fastapi import APIRouter, Depends, HTTPException, Path

from infrastructure.api.models.generated.models import (
    CurrenciesGetParametersQuery,
    CurrenciesGetResponse,
    CurrenciesIdGetParametersQuery,
    CurrenciesIdGetResponse,
    CurrenciesPostParametersQuery,
    CurrenciesPostRequest,
    CurrenciesPostResponse,
)
from infrastructure.dependencies import (
    StrapiProxyGetUseCaseDep,
    StrapiProxyPostUseCaseDep,
)

router = APIRouter(prefix="/currencies", tags=["currency"])


@router.get("", response_model=CurrenciesGetResponse)
async def get_currencies(
    use_case: StrapiProxyGetUseCaseDep,
    params: CurrenciesGetParametersQuery = Depends(),
):
    """
    Get all currencies from Strapi currency collection.

    Supports filtering, pagination, and field selection.
    """
    try:
        return await use_case.execute(
            "/currencies",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch currencies from Strapi: {e!s}",
        )


@router.post("", response_model=CurrenciesPostResponse)
async def create_currency(
    request: CurrenciesPostRequest,
    use_case: StrapiProxyPostUseCaseDep,
    params: CurrenciesPostParametersQuery = Depends(),
):
    """Create a new currency in Strapi."""
    try:
        return await use_case.post(
            "/currencies",
            data=request.model_dump(exclude_none=True),
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to create currency in Strapi: {e!s}",
        )


@router.get("/{id}", response_model=CurrenciesIdGetResponse)
async def get_currency(
    use_case: StrapiProxyGetUseCaseDep,
    id: str = Path(..., description="Currency ID"),
    params: CurrenciesIdGetParametersQuery = Depends(),
):
    """
    Get a specific currency by ID.

    Fetches from Strapi currency collection.
    """
    try:
        return await use_case.execute(
            f"/currencies/{id}",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch currency from Strapi: {e!s}",
        )
