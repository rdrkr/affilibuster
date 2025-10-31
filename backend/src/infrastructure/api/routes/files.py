# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Files/Upload API routes - proxies to Strapi upload plugin endpoints.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
Provides access to uploaded files from Strapi's media library.
"""

from fastapi import APIRouter, Depends, HTTPException, Path

from infrastructure.api.models.generated.models import (
    FilesGetParametersQuery,
    FilesGetResponse,
    FilesIdGetParametersQuery,
    FilesIdGetResponse,
)
from infrastructure.dependencies import StrapiProxyGetUseCaseDep

router = APIRouter(prefix="", tags=["upload"])


@router.get("/files", response_model=FilesGetResponse)
async def get_files(
    use_case: StrapiProxyGetUseCaseDep,
    params: FilesGetParametersQuery = Depends(),
):
    """
    Get list of uploaded files (media library).

    Returns paginated list of uploaded files from Strapi's media library.
    """
    try:
        return await use_case.execute(
            "/upload/files",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch files from Strapi: {e!s}",
        )


@router.get("/files/{id}", response_model=FilesIdGetResponse)
async def get_file(
    use_case: StrapiProxyGetUseCaseDep,
    id: str = Path(..., description="File ID"),
    params: FilesIdGetParametersQuery = Depends(),
):
    """
    Get a specific uploaded file metadata by ID.

    Returns metadata about a specific file from Strapi's media library.
    """
    try:
        return await use_case.execute(
            f"/upload/files/{id}",
            params=params.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch file {id} from Strapi: {e!s}",
        )
