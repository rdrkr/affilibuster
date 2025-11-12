# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
URL redirect API routes.

Reference: T145 (URL redirect handling)

Provides endpoint for frontend middleware to check if a URL should be redirected.
"""

from fastapi import APIRouter

from affilibuster_backend.domain.entities.generated.models import RedirectCheckResponse
from affilibuster_backend.infrastructure.dependencies import GetURLRedirectUseCaseDep

router = APIRouter(prefix="/redirects", tags=["redirects"])


@router.get("/check")
async def check_redirect(
    source_url: str,
    use_case: GetURLRedirectUseCaseDep,
) -> RedirectCheckResponse:
    """
    Check if a URL path should be redirected.

    Args:
        source_url: The source URL path to check for redirects (e.g., "/old-page")
        use_case: Injected GetURLRedirectUseCase

    Returns:
        RedirectCheckResponse with redirect details if found

    Example:
        GET /v1/redirects/check?source_url=/old-page
        Response: {"found": true, "targetUrl": "/new-page", "statusCode": 301}

    """
    redirect = await use_case.execute(source_url)

    if redirect:
        return RedirectCheckResponse(
            found=True,
            target_url=redirect.to_path,
            status_code=redirect.status_code,
        )

    return RedirectCheckResponse(found=False)
