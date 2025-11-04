# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Product page template API routes - proxies to Strapi product-page single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's product-page single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from affilibuster_backend.domain.entities.generated.models import (
    ProductPageGetParametersQuery,
    ProductPageGetResponse,
)
from affilibuster_backend.infrastructure.dependencies import GetCMSContentUseCaseDep

router = APIRouter(prefix="", tags=["product-page"])


@router.get("/product-page")
async def product_page_get_product_page(
    use_case: GetCMSContentUseCaseDep,
    params: Annotated[ProductPageGetParametersQuery, Depends()],
) -> ProductPageGetResponse:
    """
    Get Product page template content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/product-page",
            params=params,
            response_model=ProductPageGetResponse,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch product page template from Strapi: {e!s}",
        ) from e
