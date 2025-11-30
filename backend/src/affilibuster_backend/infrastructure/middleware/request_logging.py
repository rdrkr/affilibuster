# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Request logging middleware.

Reference: T141 (Implement request logging middleware)
Logs all API requests with method, path, status, and duration.
"""

import logging
import time
from collections.abc import Awaitable, Callable

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all HTTP requests with structured logging.

    Logs: method, path, status code, duration, user agent.
    """

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        """
        Dispatch the request through the middleware chain.

        Logs request/response details including timing and error information.
        """
        # Record start time
        start_time = time.time()

        # Get request details
        method = request.method
        path = request.url.path
        client_host = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")

        # Log request details
        logger.debug(
            "Request: %s %s - Client: %s - User-Agent: %s",
            method,
            path,
            client_host,
            user_agent,
            extra={
                "method": method,
                "path": path,
                "client_host": client_host,
                "user_agent": user_agent,
                "headers": dict(request.headers),
            },
        )

        # Process request
        try:
            response = await call_next(request)
        except Exception as exc:
            # Calculate duration even for errors
            duration_ms = int((time.time() - start_time) * 1000)

            # Log error
            logger.exception(
                "%s %s - ERROR - %dms",
                method,
                path,
                duration_ms,
                extra={
                    "method": method,
                    "path": path,
                    "status_code": 500,
                    "duration_ms": duration_ms,
                    "client_host": client_host,
                    "user_agent": user_agent,
                    "error": str(exc),
                },
            )

            # Re-raise to let error handler middleware handle it
            raise
        else:
            status_code = response.status_code

            # Calculate duration
            duration_ms = int((time.time() - start_time) * 1000)

            # Log successful request as debug
            logger.debug(
                "Response: %s %s - Status: %d - Duration: %dms",
                method,
                path,
                status_code,
                duration_ms,
                extra={
                    "method": method,
                    "path": path,
                    "status_code": status_code,
                    "duration_ms": duration_ms,
                    "client_host": client_host,
                    "user_agent": user_agent,
                },
            )

            # Log successful request as info (access log)
            logger.info(
                "%s %s - %d - %dms",
                method,
                path,
                status_code,
                duration_ms,
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
