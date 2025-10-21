# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Product page template API routes - proxies to Strapi product-page single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's product-page single-type.
"""

from fastapi import APIRouter, Depends, HTTPException

from domain.use_cases.strapi_proxy import (
    StrapiProxyGetUseCase,
    StrapiProxyMutateUseCase,
)
from infrastructure.api.models.generated.models import (
    ProductPageGetParametersQuery,
    ProductPageGetResponse,
    ProductPagePutParametersQuery,
    ProductPagePutRequest,
    ProductPagePutResponse,
)
from infrastructure.dependencies import CacheServiceDep, StrapiRepoDep

router = APIRouter(prefix="", tags=["product-page"])


@router.get("/product-page", response_model=ProductPageGetResponse)
async def product_page_get_product_page(
    params: ProductPageGetParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get Product page template content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=3600)
        return await use_case.execute(
            "/product-page",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch product page template from Strapi: {str(e)}",
        )


@router.put("/product-page", response_model=ProductPagePutResponse)
async def product_page_put_product_page(
    request: ProductPagePutRequest,
    params: ProductPagePutParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Update Product page template content in Strapi.
    """
    try:
        use_case = StrapiProxyMutateUseCase(strapi_repo, cache_service)
        return await use_case.put(
            "/product-page",
            data=request.model_dump(exclude_none=True),
            params=params.model_dump(exclude_none=True),
            invalidate_pattern="strapi:/product-page",
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to update product page template in Strapi: {str(e)}",
        )
