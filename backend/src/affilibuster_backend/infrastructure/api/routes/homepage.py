# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Homepage API routes - proxies to Strapi homepage single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's homepage single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request

from affilibuster_backend.domain.entities.generated.models import (
    HomepageGetParametersQuery,
    HomepageGetResponse,
)
from affilibuster_backend.infrastructure.dependencies import GetCMSContentUseCaseDep

router = APIRouter(prefix="", tags=["homepage"])


async def parse_homepage_query_params(request: Request) -> HomepageGetParametersQuery:
    """
    Custom dependency to parse query parameters for homepage endpoint.

    FastAPI's Depends() with Pydantic models doesn't correctly handle repeated
    query parameters (e.g., ?populate=a&populate=b) for union types that include lists.
    This function manually extracts and parses the query parameters.
    """
    query_params = dict(request.query_params)

    # Handle repeated parameters (they come as comma-separated or need special handling)
    populate = request.query_params.getlist("populate") if hasattr(request.query_params, "getlist") else None
    if not populate:
        # Fallback: get all values manually
        populate = [v for k, v in request.query_params.multi_items() if k == "populate"]

    fields = request.query_params.getlist("fields") if hasattr(request.query_params, "getlist") else None
    if not fields:
        fields = [v for k, v in request.query_params.multi_items() if k == "fields"]

    return HomepageGetParametersQuery(
        locale=query_params.get("locale"),
        populate=populate if populate else query_params.get("populate"),
        fields=fields if fields else query_params.get("fields"),
        filters=query_params.get("filters"),
        status=query_params.get("status"),
    )


@router.get("/homepage")
async def homepage_get_homepage(
    use_case: GetCMSContentUseCaseDep,
    params: Annotated[HomepageGetParametersQuery, Depends(parse_homepage_query_params)],
) -> HomepageGetResponse:
    """
    Get Homepage content from Strapi.

    Supports field selection, population, localization, filtering, and sorting.
    """
    try:
        return await use_case.execute(
            "/homepage",
            params=params,
            response_model=HomepageGetResponse,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch homepage from Strapi: {e!s}",
        ) from e
