# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Request logging middleware
Reference: T141 (Implement request logging middleware)
Logs all API requests with method, path, status, and duration
"""

import logging
import time

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all HTTP requests with structured logging.
    Logs: method, path, status code, duration, user agent
    """

    async def dispatch(self, request: Request, call_next):
        # Record start time
        start_time = time.time()

        # Get request details
        method = request.method
        path = request.url.path
        client_host = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")

        # Process request
        try:
            response = await call_next(request)
            status_code = response.status_code

            # Calculate duration
            duration_ms = int((time.time() - start_time) * 1000)

            # Log successful request
            logger.info(
                f"{method} {path} - {status_code} - {duration_ms}ms",
                extra={
                    "method": method,
                    "path": path,
                    "status_code": status_code,
                    "duration_ms": duration_ms,
                    "client_host": client_host,
                    "user_agent": user_agent,
                },
            )

            return response

        except Exception as exc:
            # Calculate duration even for errors
            duration_ms = int((time.time() - start_time) * 1000)

            # Log error
            logger.error(
                f"{method} {path} - ERROR - {duration_ms}ms: {exc!s}",
                extra={
                    "method": method,
                    "path": path,
                    "status_code": 500,
                    "duration_ms": duration_ms,
                    "client_host": client_host,
                    "user_agent": user_agent,
                    "error": str(exc),
                },
                exc_info=True,
            )

            # Re-raise to let error handler middleware handle it
            raise
