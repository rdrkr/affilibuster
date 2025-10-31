# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Locales API routes - proxies to Strapi i18n plugin endpoints.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
Provides information about available locales/languages in Strapi.
"""

from fastapi import APIRouter, HTTPException

from infrastructure.api.models.generated.models import LocalesGetResponse
from infrastructure.dependencies import StrapiProxyGetUseCaseDep

router = APIRouter(prefix="", tags=["i18n"])


@router.get("/locales", response_model=LocalesGetResponse)
async def get_locales(
    use_case: StrapiProxyGetUseCaseDep,
):
    """
    Get list of all available locales in Strapi.

    Returns information about all configured languages/locales in the i18n plugin.
    """
    try:
        return await use_case.execute("/i18n/locales")
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch locales from Strapi: {e!s}",
        )
