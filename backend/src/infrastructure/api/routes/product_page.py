# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Product page template API routes - proxies to Strapi product-page single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's product-page single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from fastapi import APIRouter, Depends, HTTPException

from infrastructure.api.models.generated.models import (
    ProductPageGetParametersQuery,
    ProductPageGetResponse,
)
from infrastructure.dependencies import StrapiProxyGetUseCaseDep

router = APIRouter(prefix="", tags=["product-page"])


@router.get("/product-page", response_model=ProductPageGetResponse)
async def product_page_get_product_page(
    use_case: StrapiProxyGetUseCaseDep,
    params: ProductPageGetParametersQuery = Depends(),
):
    """
    Get Product page template content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/product-page",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch product page template from Strapi: {e!s}",
        )
