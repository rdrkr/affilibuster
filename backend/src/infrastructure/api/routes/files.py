# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Files/Upload API routes - proxies to Strapi upload plugin endpoints.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
Provides access to uploaded files from Strapi's media library.
"""

from fastapi import APIRouter, Depends, HTTPException, Path

from domain.use_cases.strapi_proxy import StrapiProxyGetUseCase
from infrastructure.api.models.generated.models import (
    FilesGetParametersQuery,
    FilesGetResponse,
    FilesIdGetParametersQuery,
    FilesIdGetResponse,
)
from infrastructure.dependencies import CacheServiceDep, StrapiRepoDep

router = APIRouter(prefix="", tags=["upload"])


@router.get("/files", response_model=FilesGetResponse)
async def get_files(
    params: FilesGetParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get list of uploaded files (media library).

    Returns paginated list of uploaded files from Strapi's media library.
    """
    try:
        # Use Strapi proxy use case (file lists may change, use moderate caching)
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=300)
        return await use_case.execute(
            "/files",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch files from Strapi: {str(e)}",
        )


@router.get("/files/{id}", response_model=FilesIdGetResponse)
async def get_file(
    id: str = Path(..., description="File ID"),
    params: FilesIdGetParametersQuery = Depends(),
    strapi_repo: StrapiRepoDep = None,
    cache_service: CacheServiceDep = None,
):
    """
    Get a specific uploaded file metadata by ID.

    Returns metadata about a specific file from Strapi's media library.
    """
    try:
        # Use Strapi proxy use case with moderate cache (file metadata may change)
        use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=300)
        return await use_case.execute(
            f"/files/{id}",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch file {id} from Strapi: {str(e)}",
        )
