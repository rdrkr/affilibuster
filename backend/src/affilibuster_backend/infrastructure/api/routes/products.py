# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Product API routes - proxies to Strapi product collection.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All product data comes from Strapi's product collection type.
Backend is read-only for updates - mutations should happen through Strapi Admin UI.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path

from affilibuster_backend.domain.entities.generated.models import (
    ProductsGetParametersQuery,
    ProductsGetResponse,
    ProductsIdGetParametersQuery,
    ProductsIdGetResponse,
)
from affilibuster_backend.infrastructure.dependencies import (
    GetCMSContentUseCaseDep,
)

router = APIRouter(prefix="/products", tags=["product"])


@router.get("")
async def get_products(
    use_case: GetCMSContentUseCaseDep,
    params: Annotated[ProductsGetParametersQuery, Depends()],
) -> ProductsGetResponse:
    """
    List all products from Strapi product collection.

    Supports filtering, pagination, field selection, and sorting.
    """
    try:
        return await use_case.execute(
            "/products",
            params=params,
            response_model=ProductsGetResponse,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch products from Strapi: {e!s}",
        ) from e


@router.get("/{id}")
async def get_product(
    use_case: GetCMSContentUseCaseDep,
    product_id: Annotated[str, Path(alias="id", description="Product ID or slug")],
    params: Annotated[ProductsIdGetParametersQuery, Depends()],
) -> ProductsIdGetResponse:
    """
    Get a specific product by ID or slug.

    Supports field selection, population, and localization.
    """
    try:
        return await use_case.execute(
            f"/products/{product_id}",
            params=params,
            response_model=ProductsIdGetResponse,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch product from Strapi: {e!s}",
        ) from e
