# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Request logging middleware.

Reference: T141 (Implement request logging middleware)
Logs all API requests with method, path, status, and duration.
IP addresses are anonymized by default for GDPR compliance (Art. 5(1)(c)).
"""

import logging
import time
from collections.abc import Awaitable, Callable

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from affilibuster_backend.config import settings
from affilibuster_backend.domain.services.ip_anonymizer import IPAnonymizer

__all__ = ["SENSITIVE_HEADERS", "RequestLoggingMiddleware", "settings"]

logger = logging.getLogger(__name__)

# Headers that contain sensitive data and must not be logged
SENSITIVE_HEADERS = frozenset({"authorization", "cookie", "x-session-id", "x-api-key", "x-csrf-token"})

# Shared IP anonymizer instance
_ip_anonymizer = IPAnonymizer()


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all HTTP requests with structured logging.

    Logs: method, path, status code, duration.
    IP addresses are anonymized by default (GDPR Art. 5(1)(c) data minimization).
    User-agent is only logged at DEBUG level to minimize PII in access logs.
    """

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        """
        Dispatch the request through the middleware chain.

        Logs request/response details including timing and error information.
        IP addresses are anonymized when anonymize_request_ips is enabled.
        """
        # Record start time
        start_time = time.time()

        # Get request details
        method = request.method
        path = request.url.path
        raw_client_host = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")

        # Anonymize IP for logging (GDPR Art. 5(1)(c))
        if settings.anonymize_request_ips and raw_client_host != "unknown":
            try:
                client_host = _ip_anonymizer.anonymize(raw_client_host)
            except ValueError:
                client_host = "invalid"
        else:
            client_host = raw_client_host

        # Log request details (DEBUG only - includes user-agent)
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
                "headers": {k: "***" if k.lower() in SENSITIVE_HEADERS else v for k, v in request.headers.items()},
            },
        )

        # Process request
        try:
            response = await call_next(request)
        except Exception as exc:
            # Calculate duration even for errors
            duration_ms = int((time.time() - start_time) * 1000)

            # Log error (no user-agent in error logs)
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
                    "error": str(exc),
                },
            )

            # Re-raise to let error handler middleware handle it
            raise
        else:
            status_code = response.status_code

            # Calculate duration
            duration_ms = int((time.time() - start_time) * 1000)

            # Log successful request as debug (includes user-agent)
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

            # Log successful request as info (access log - no user-agent for GDPR)
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
                },
            )

            return response
