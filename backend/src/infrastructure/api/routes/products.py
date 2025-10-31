# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Product API routes - proxies to Strapi product collection.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All product data comes from Strapi's product collection type.
Backend is read-only for updates - mutations should happen through Strapi Admin UI.
"""

from fastapi import APIRouter, Depends, HTTPException, Path

from infrastructure.api.models.generated.models import (
    ProductsGetParametersQuery,
    ProductsGetResponse,
    ProductsIdGetParametersQuery,
    ProductsIdGetResponse,
    ProductsPostParametersQuery,
    ProductsPostRequest,
    ProductsPostResponse,
)
from infrastructure.dependencies import (
    StrapiProxyGetUseCaseDep,
    StrapiProxyPostUseCaseDep,
)

router = APIRouter(prefix="/products", tags=["product"])


@router.get("", response_model=ProductsGetResponse)
async def get_products(
    use_case: StrapiProxyGetUseCaseDep,
    params: ProductsGetParametersQuery = Depends(),
):
    """
    List all products from Strapi product collection.

    Supports filtering, pagination, field selection, and sorting.
    """
    try:
        return await use_case.execute(
            "/products",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch products from Strapi: {e!s}",
        )


@router.post("", response_model=ProductsPostResponse)
async def create_product(
    request: ProductsPostRequest,
    use_case: StrapiProxyPostUseCaseDep,
    params: ProductsPostParametersQuery = Depends(),
):
    """Create a new product in Strapi."""
    try:
        return await use_case.post(
            "/products",
            data=request.model_dump(exclude_none=True),
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to create product in Strapi: {e!s}",
        )


@router.get("/{id}", response_model=ProductsIdGetResponse)
async def get_product(
    use_case: StrapiProxyGetUseCaseDep,
    id: str = Path(..., description="Product ID or slug"),
    params: ProductsIdGetParametersQuery = Depends(),
):
    """
    Get a specific product by ID or slug.

    Supports field selection, population, and localization.
    """
    try:
        return await use_case.execute(
            f"/products/{id}",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch product from Strapi: {e!s}",
        )
