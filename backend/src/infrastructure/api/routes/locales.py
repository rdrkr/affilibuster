# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Locales API routes - proxies to Strapi i18n plugin endpoints.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
Provides information about available locales/languages in Strapi.
"""

from fastapi import APIRouter, HTTPException

from domain.use_cases.strapi_proxy import StrapiProxyGetUseCase
from infrastructure.api.models.generated.models import LocalesGetResponse
from infrastructure.dependencies import CacheServiceDep, StrapiRepoDep

router = APIRouter(prefix="", tags=["i18n"])


@router.get("/locales", response_model=LocalesGetResponse)
async def get_locales(
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get list of all available locales in Strapi.

    Returns information about all configured languages/locales in the i18n plugin.
    """
    try:
        # Use Strapi proxy use case with long cache (locales don't change often)
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=3600)
        return await use_case.execute("/i18n/locales")
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch locales from Strapi: {str(e)}",
        )
