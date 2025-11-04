# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Global error handling middleware.

Reference: T142 (Implement error handling middleware)
Catches all unhandled exceptions and returns standardized error responses.
"""

import logging
import os
from collections.abc import Awaitable, Callable
from datetime import UTC, datetime

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

logger = logging.getLogger(__name__)


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to catch all unhandled exceptions and return standardized error responses.

    Returns error response matching the Error schema from contracts/api-v1.yaml.
    """

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        """
        Dispatch the request through the middleware chain.

        Catches any unhandled exceptions and returns a standardized error response.
        """
        try:
            return await call_next(request)

        except Exception as exc:
            # Log the error
            logger.exception(
                "Unhandled exception in %s %s",
                request.method,
                request.scope["path"],
                extra={
                    "method": request.method,
                    "path": request.scope["path"],
                    "error_type": type(exc).__name__,
                },
            )

            # Return standardized error response
            error_response = {
                "error": "Internal Server Error",
                "message": "An unexpected error occurred. Please try again later.",
                "code": "INTERNAL_SERVER_ERROR",
                "timestamp": datetime.now(UTC).isoformat() + "Z",
                "path": request.scope["path"],
            }

            # In development, include more details
            if os.getenv("DEBUG", "false").lower() == "true":
                error_response["details"] = {
                    "exception_type": type(exc).__name__,
                    "exception_message": str(exc),
                }

            return JSONResponse(
                status_code=500,
                content=error_response,
            )
