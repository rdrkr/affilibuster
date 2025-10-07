# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Global error handling middleware
Reference: T142 (Implement error handling middleware)
Catches all unhandled exceptions and returns standardized error responses
"""

import logging
from datetime import datetime
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to catch all unhandled exceptions and return standardized error responses.
    Returns error response matching the Error schema from contracts/api-v1.yaml
    """

    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response

        except Exception as exc:
            # Log the error
            logger.error(
                f"Unhandled exception in {request.method} {request.url.path}: {str(exc)}",
                exc_info=True,
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "error_type": type(exc).__name__,
                },
            )

            # Return standardized error response
            error_response = {
                "error": "Internal Server Error",
                "message": "An unexpected error occurred. Please try again later.",
                "code": "INTERNAL_SERVER_ERROR",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "path": str(request.url.path),
            }

            # In development, include more details
            import os
            if os.getenv("DEBUG", "false").lower() == "true":
                error_response["details"] = {
                    "exception_type": type(exc).__name__,
                    "exception_message": str(exc),
                }

            return JSONResponse(
                status_code=500,
                content=error_response,
            )
