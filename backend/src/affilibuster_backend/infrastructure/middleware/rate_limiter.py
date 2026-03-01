# Copyright (c) 2026 Affilibuster by Ronen Druker.

"""
Rate limiting middleware for sensitive endpoints.

Protects authentication, consent, and DSAR endpoints from abuse
using per-IP rate limits (GDPR Art. 32 - Security of processing).

Uses the ``limits`` library for token-bucket rate limiting with
in-memory storage. Endpoint paths are matched against a configurable
mapping of path prefixes to rate limit strings.
"""

import logging
from collections.abc import Awaitable, Callable

from fastapi import Request
from limits import RateLimitItem, parse
from limits.storage import MemoryStorage
from limits.strategies import MovingWindowRateLimiter
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response

from affilibuster_backend.config import settings

__all__ = ["RATE_LIMIT_RULES", "RateLimitMiddleware", "settings"]

logger = logging.getLogger(__name__)

# In-memory storage for rate limit counters.
# For multi-instance deployments, replace with RedisStorage.
_storage = MemoryStorage()
_limiter = MovingWindowRateLimiter(_storage)

# Mapping of route path prefixes to rate limit strings.
# Paths are matched against the start of the request URL path.
# The root_path prefix ("/v1") is stripped by ASGI before reaching middleware.
RATE_LIMIT_RULES: dict[str, str] = {
    "/auth/login": settings.rate_limit_login,
    "/auth/register": settings.rate_limit_register,
    "/auth/forgot-password": settings.rate_limit_pw_reset,
    "/consent": settings.rate_limit_consent,
    "/profile/export": settings.rate_limit_dsar_export,
    "/newsletter/subscribe": settings.rate_limit_newsletter,
    "/newsletter/unsubscribe": settings.rate_limit_newsletter,
}

# Pre-parse rate limit items for efficient lookup
_parsed_rules: list[tuple[str, RateLimitItem]] = [
    (path, parse(limit_str)) for path, limit_str in RATE_LIMIT_RULES.items()
]


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware that enforces per-IP rate limits on sensitive endpoints."""

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        """
        Check rate limits before forwarding the request.

        Args:
            request: Incoming HTTP request.
            call_next: Next middleware or route handler.

        Returns:
            Response from downstream handler, or 429 if rate limit exceeded.
        """
        if not settings.rate_limit_enabled:
            return await call_next(request)

        path = request.url.path
        client_ip = request.client.host if request.client else "unknown"

        for rule_path, parsed_limit in _parsed_rules:
            if path == rule_path or path.startswith(rule_path + "/"):
                # Build a unique key: "ip:path_prefix"
                key = f"{client_ip}:{rule_path}"
                if not _limiter.hit(parsed_limit, key):
                    logger.warning(
                        "Rate limit exceeded for %s on %s",
                        client_ip,
                        rule_path,
                        extra={"client_host": client_ip, "path": rule_path},
                    )
                    return JSONResponse(
                        status_code=429,
                        content={
                            "error": "Too Many Requests",
                            "message": "Rate limit exceeded. Please try again later.",
                        },
                        headers={"Retry-After": "60"},
                    )
                break

        return await call_next(request)
