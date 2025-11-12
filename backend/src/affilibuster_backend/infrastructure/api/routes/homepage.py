# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Homepage API routes - proxies to Strapi homepage single-type.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All content data comes from Strapi's homepage single-type.
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

import json
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Request

from affilibuster_backend.domain.entities.generated.models import (
    Field7,
    HomepageGetParametersQuery,
    HomepageGetResponse,
    PopulateEnum5,
    Status1,
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

    # Handle populate (can be str or list of PopulateEnum5)
    # Try getlist() first if available, otherwise use multi_items()
    populate_values: list[str] = []
    if hasattr(request.query_params, "getlist"):
        populate_values = request.query_params.getlist("populate")
    # If getlist returned empty or not available, try multi_items as fallback
    if not populate_values:
        populate_values = [v for k, v in request.query_params.multi_items() if k == "populate"]

    populate: str | list[PopulateEnum5] | None = None
    if populate_values:
        # Convert to enum list for all cases
        populate = [PopulateEnum5(v) for v in populate_values]

    # Handle fields (list of Field7)
    # Try getlist() first if available, otherwise use multi_items()
    fields_values: list[str] = []
    if hasattr(request.query_params, "getlist"):
        fields_values = request.query_params.getlist("fields")
    # If getlist returned empty or not available, try multi_items as fallback
    if not fields_values:
        fields_values = [v for k, v in request.query_params.multi_items() if k == "fields"]

    fields: list[Field7] | None = None
    if fields_values:
        fields = [Field7(v) for v in fields_values]

    # Handle filters (dict from JSON string)
    filters: dict[str, Any] | None = None
    filters_str = query_params.get("filters")
    if filters_str:
        try:
            filters = json.loads(filters_str)
        except json.JSONDecodeError:
            filters = None

    # Handle status (Status1 enum)
    status: Status1 | None = None
    status_str = query_params.get("status")
    if status_str:
        status = Status1(status_str)

    return HomepageGetParametersQuery(
        locale=query_params.get("locale"),
        populate=populate,
        fields=fields,
        filters=filters,
        status=status,
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
