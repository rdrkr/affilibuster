# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Currency API routes - proxies to Strapi currency collection.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All currency data comes from Strapi's currency collection type.
Backend is read-only for updates - mutations should happen through Strapi Admin UI.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path

from affilibuster_backend.domain.entities.generated.models import (
    CurrenciesGetParametersQuery,
    CurrenciesGetResponse,
    CurrenciesIdGetParametersQuery,
    CurrenciesIdGetResponse,
)
from affilibuster_backend.infrastructure.dependencies import GetCMSContentUseCaseDep

router = APIRouter(prefix="/currencies", tags=["currency"])


@router.get("")
async def get_currencies(
    use_case: GetCMSContentUseCaseDep,
    params: Annotated[CurrenciesGetParametersQuery, Depends()],
) -> CurrenciesGetResponse:
    """
    Get all currencies from Strapi currency collection.

    Supports filtering, pagination, and field selection.
    """
    try:
        return await use_case.execute(
            "/currencies",
            params=params,
            response_model=CurrenciesGetResponse,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch currencies from Strapi: {e!s}",
        ) from e


@router.get("/{id}")
async def get_currency(
    use_case: GetCMSContentUseCaseDep,
    currency_id: Annotated[str, Path(alias="id", description="Currency ID")],
    params: Annotated[CurrenciesIdGetParametersQuery, Depends()],
) -> CurrenciesIdGetResponse:
    """
    Get a specific currency by ID.

    Fetches from Strapi currency collection.
    """
    try:
        return await use_case.execute(
            f"/currencies/{currency_id}",
            params=params,
            response_model=CurrenciesIdGetResponse,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch currency from Strapi: {e!s}",
        ) from e
