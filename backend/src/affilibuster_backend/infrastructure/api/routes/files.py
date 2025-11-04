# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Files/Upload API routes - proxies to Strapi upload plugin endpoints.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
Provides access to uploaded files from Strapi's media library.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path

from affilibuster_backend.domain.entities.generated.models import (
    FilesGetParametersQuery,
    FilesGetResponse,
    FilesIdGetParametersQuery,
    FilesIdGetResponse,
)
from affilibuster_backend.infrastructure.dependencies import GetCMSContentUseCaseDep

router = APIRouter(prefix="", tags=["upload"])


@router.get("/files")
async def get_files(
    use_case: GetCMSContentUseCaseDep,
    params: Annotated[FilesGetParametersQuery, Depends()],
) -> FilesGetResponse:
    """
    Get list of uploaded files (media library).

    Returns paginated list of uploaded files from Strapi's media library.
    """
    try:
        return await use_case.execute(
            "/upload/files",
            params=params,
            response_model=FilesGetResponse,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch files from Strapi: {e!s}",
        ) from e


@router.get("/files/{id}")
async def get_file(
    use_case: GetCMSContentUseCaseDep,
    file_id: Annotated[str, Path(alias="id", description="File ID")],
    params: Annotated[FilesIdGetParametersQuery, Depends()],
) -> FilesIdGetResponse:
    """
    Get a specific uploaded file metadata by ID.

    Returns metadata about a specific file from Strapi's media library.
    """
    try:
        return await use_case.execute(
            f"/upload/files/{file_id}",
            params=params,
            response_model=FilesIdGetResponse,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch file {file_id} from Strapi: {e!s}",
        ) from e
