# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Product API routes - proxies to Strapi product collection.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All product data comes from Strapi's product collection type.
"""

from fastapi import APIRouter, Depends, HTTPException, Path

from domain.use_cases.strapi_proxy import (
    StrapiProxyGetUseCase,
    StrapiProxyMutateUseCase,
)
from infrastructure.api.models.generated.models import (
    ProductsGetParametersQuery,
    ProductsGetResponse,
    ProductsIdGetParametersQuery,
    ProductsIdGetResponse,
    ProductsIdPutParametersQuery,
    ProductsIdPutRequest,
    ProductsIdPutResponse,
    ProductsPostParametersQuery,
    ProductsPostRequest,
    ProductsPostResponse,
)
from infrastructure.dependencies import CacheServiceDep, StrapiRepoDep

router = APIRouter(prefix="/products", tags=["product"])


@router.get("", response_model=ProductsGetResponse)
async def get_products(
    params: ProductsGetParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    List all products from Strapi product collection.

    Supports filtering, pagination, field selection, and sorting.
    """
    try:
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=300)
        return await use_case.execute(
            "/products",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch products from Strapi: {str(e)}",
        )


@router.post("", response_model=ProductsPostResponse)
async def create_product(
    request: ProductsPostRequest,
    params: ProductsPostParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Create a new product in Strapi.
    """
    try:
        use_case = StrapiProxyMutateUseCase(strapi_repo, cache_service)
        return await use_case.post(
            "/products",
            data=request.model_dump(exclude_none=True),
            params=params.model_dump(exclude_none=True),
            invalidate_pattern="strapi:/products",
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to create product in Strapi: {str(e)}",
        )


@router.get("/{id}", response_model=ProductsIdGetResponse)
async def get_product(
    id: str = Path(..., description="Product ID or slug"),
    params: ProductsIdGetParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get a specific product by ID or slug.

    Supports field selection, population, and localization.
    """
    try:
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=300)
        return await use_case.execute(
            f"/products/{id}",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch product from Strapi: {str(e)}",
        )


@router.put("/{id}", response_model=ProductsIdPutResponse)
async def update_product(
    request: ProductsIdPutRequest,
    id: str = Path(..., description="Product ID"),
    params: ProductsIdPutParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Update an existing product in Strapi.
    """
    try:
        use_case = StrapiProxyMutateUseCase(strapi_repo, cache_service)
        return await use_case.put(
            f"/products/{id}",
            data=request.model_dump(exclude_none=True),
            params=params.model_dump(exclude_none=True),
            invalidate_pattern="strapi:/products",
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to update product in Strapi: {str(e)}",
        )
