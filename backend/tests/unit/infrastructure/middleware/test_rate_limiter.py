# Copyright (c) 2026 Affilibuster by Ronen Druker.

"""
Unit tests for RateLimitMiddleware.

Tests rate limiting on sensitive endpoints (GDPR Art. 32 - Security).
"""

from typing import Any

import pytest
from starlette.requests import Request
from starlette.responses import Response
from starlette.testclient import TestClient

from affilibuster_backend.infrastructure.middleware.rate_limiter import (
    RATE_LIMIT_RULES,
    RateLimitMiddleware,
    _parsed_rules,
    _storage,
)


@pytest.fixture(autouse=True)
def _clear_rate_limit_storage():
    """Reset in-memory rate limit storage between tests."""
    _storage.reset()
    yield
    _storage.reset()


@pytest.fixture
def rate_limited_app():
    """Create a FastAPI app with rate limiting middleware for testing."""
    from fastapi import FastAPI

    app = FastAPI()

    @app.post("/auth/login")
    async def login():
        return {"status": "ok"}

    @app.post("/auth/register")
    async def register():
        return {"status": "ok"}

    @app.post("/auth/forgot-password")
    async def forgot_password():
        return {"status": "ok"}

    @app.post("/consent")
    async def consent():
        return {"status": "ok"}

    @app.get("/profile/export")
    async def export_data():
        return {"status": "ok"}

    @app.post("/newsletter/subscribe")
    async def newsletter_subscribe():
        return {"status": "ok"}

    @app.post("/newsletter/unsubscribe")
    async def newsletter_unsubscribe():
        return {"status": "ok"}

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    app.add_middleware(RateLimitMiddleware)
    return app


@pytest.mark.unit
class TestRateLimitRulesConfiguration:
    """Test rate limit rules are correctly configured."""

    def test_rate_limit_rules_contains_login(self):
        """Test login endpoint has a rate limit rule."""
        assert "/auth/login" in RATE_LIMIT_RULES

    def test_rate_limit_rules_contains_register(self):
        """Test register endpoint has a rate limit rule."""
        assert "/auth/register" in RATE_LIMIT_RULES

    def test_rate_limit_rules_contains_forgot_password(self):
        """Test forgot-password endpoint has a rate limit rule."""
        assert "/auth/forgot-password" in RATE_LIMIT_RULES

    def test_rate_limit_rules_contains_consent(self):
        """Test consent endpoint has a rate limit rule."""
        assert "/consent" in RATE_LIMIT_RULES

    def test_rate_limit_rules_contains_dsar_export(self):
        """Test DSAR export endpoint has a rate limit rule."""
        assert "/profile/export" in RATE_LIMIT_RULES

    def test_rate_limit_rules_contains_newsletter_subscribe(self):
        """Test newsletter subscribe endpoint has a rate limit rule."""
        assert "/newsletter/subscribe" in RATE_LIMIT_RULES

    def test_rate_limit_rules_contains_newsletter_unsubscribe(self):
        """Test newsletter unsubscribe endpoint has a rate limit rule."""
        assert "/newsletter/unsubscribe" in RATE_LIMIT_RULES

    def test_parsed_rules_match_rate_limit_rules(self):
        """Test that parsed rules have same count as raw rules."""
        assert len(_parsed_rules) == len(RATE_LIMIT_RULES)


@pytest.mark.unit
class TestRateLimitMiddlewareLoginEndpoint:
    """Test rate limiting on the login endpoint."""

    def test_login_requests_within_limit_succeed(self, rate_limited_app):
        """Test that requests within rate limit are allowed."""
        client = TestClient(rate_limited_app)
        response = client.post("/auth/login")
        assert response.status_code == 200

    def test_login_rate_limit_exceeded_returns_429(self, rate_limited_app):
        """Test that exceeding login rate limit returns 429."""
        client = TestClient(rate_limited_app)

        # Make requests up to the limit (5/minute)
        for _ in range(5):
            resp = client.post("/auth/login")
            assert resp.status_code == 200

        # Next request should be rate limited
        response = client.post("/auth/login")
        assert response.status_code == 429

    def test_login_rate_limit_response_body(self, rate_limited_app):
        """Test that 429 response has correct error body."""
        client = TestClient(rate_limited_app)

        for _ in range(5):
            client.post("/auth/login")

        response = client.post("/auth/login")
        body = response.json()
        assert body["error"] == "Too Many Requests"
        assert "Rate limit exceeded" in body["message"]

    def test_login_rate_limit_response_has_retry_after_header(self, rate_limited_app):
        """Test that 429 response includes Retry-After header."""
        client = TestClient(rate_limited_app)

        for _ in range(5):
            client.post("/auth/login")

        response = client.post("/auth/login")
        assert response.headers.get("Retry-After") == "60"


@pytest.mark.unit
class TestRateLimitMiddlewareRegisterEndpoint:
    """Test rate limiting on the register endpoint."""

    def test_register_rate_limit_exceeded_returns_429(self, rate_limited_app):
        """Test that exceeding register rate limit returns 429."""
        client = TestClient(rate_limited_app)

        # Register limit is 3/minute
        for _ in range(3):
            resp = client.post("/auth/register")
            assert resp.status_code == 200

        response = client.post("/auth/register")
        assert response.status_code == 429


@pytest.mark.unit
class TestRateLimitMiddlewareForgotPasswordEndpoint:
    """Test rate limiting on the forgot-password endpoint."""

    def test_forgot_password_rate_limit_exceeded_returns_429(self, rate_limited_app):
        """Test that exceeding forgot-password rate limit returns 429."""
        client = TestClient(rate_limited_app)

        # Forgot-password limit is 3/minute
        for _ in range(3):
            resp = client.post("/auth/forgot-password")
            assert resp.status_code == 200

        response = client.post("/auth/forgot-password")
        assert response.status_code == 429


@pytest.mark.unit
class TestRateLimitMiddlewareConsentEndpoint:
    """Test rate limiting on the consent endpoint."""

    def test_consent_rate_limit_exceeded_returns_429(self, rate_limited_app):
        """Test that exceeding consent rate limit returns 429."""
        client = TestClient(rate_limited_app)

        # Consent limit is 10/minute
        for _ in range(10):
            resp = client.post("/consent")
            assert resp.status_code == 200

        response = client.post("/consent")
        assert response.status_code == 429


@pytest.mark.unit
class TestRateLimitMiddlewareNewsletterSubscribeEndpoint:
    """Test rate limiting on the newsletter subscribe endpoint."""

    def test_newsletter_subscribe_rate_limit_exceeded_returns_429(self, rate_limited_app):
        """Test that exceeding newsletter subscribe rate limit returns 429."""
        client = TestClient(rate_limited_app)

        # Newsletter limit is 5/minute
        for _ in range(5):
            resp = client.post("/newsletter/subscribe")
            assert resp.status_code == 200

        response = client.post("/newsletter/subscribe")
        assert response.status_code == 429


@pytest.mark.unit
class TestRateLimitMiddlewareNewsletterUnsubscribeEndpoint:
    """Test rate limiting on the newsletter unsubscribe endpoint."""

    def test_newsletter_unsubscribe_rate_limit_exceeded_returns_429(self, rate_limited_app):
        """Test that exceeding newsletter unsubscribe rate limit returns 429."""
        client = TestClient(rate_limited_app)

        # Newsletter limit is 5/minute
        for _ in range(5):
            resp = client.post("/newsletter/unsubscribe")
            assert resp.status_code == 200

        response = client.post("/newsletter/unsubscribe")
        assert response.status_code == 429


@pytest.mark.unit
class TestRateLimitMiddlewareNonLimitedEndpoints:
    """Test that non-rate-limited endpoints are unaffected."""

    def test_health_endpoint_is_not_rate_limited(self, rate_limited_app):
        """Test that health endpoint is not rate limited."""
        client = TestClient(rate_limited_app)

        # Make many requests to non-limited endpoint
        for _ in range(20):
            resp = client.get("/health")
            assert resp.status_code == 200


@pytest.mark.unit
class TestRateLimitMiddlewareDisabled:
    """Test rate limiting when disabled via settings."""

    def test_disabled_rate_limiting_allows_all_requests(self, rate_limited_app, monkeypatch):
        """Test that disabled rate limiting allows unlimited requests."""
        from affilibuster_backend.infrastructure.middleware import rate_limiter

        monkeypatch.setattr(rate_limiter.settings, "rate_limit_enabled", False)

        client = TestClient(rate_limited_app)

        # Should not be limited even after many requests
        for _ in range(20):
            resp = client.post("/auth/login")
            assert resp.status_code == 200


@pytest.mark.unit
class TestRateLimitMiddlewareDirectDispatch:
    """Test RateLimitMiddleware dispatch directly for edge cases."""

    @pytest.mark.asyncio
    async def test_dispatch_with_no_client(self, monkeypatch):
        """Test middleware handles missing client info gracefully."""
        from affilibuster_backend.infrastructure.middleware import rate_limiter

        monkeypatch.setattr(rate_limiter.settings, "rate_limit_enabled", True)

        async def noop_app(scope, receive, send):
            pass

        middleware = RateLimitMiddleware(app=noop_app)

        # Create request with no client
        scope: dict[str, Any] = {
            "type": "http",
            "method": "POST",
            "path": "/auth/login",
            "query_string": b"",
            "headers": [],
            "server": ("testserver", 80),
            "client": None,
            "scheme": "http",
        }
        request = Request(scope)

        async def success_call_next(_: Request) -> Response:
            return Response(status_code=200)

        response = await middleware.dispatch(request, success_call_next)
        # Should still work using "unknown" as key
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_dispatch_rate_limits_unknown_client(self, monkeypatch):
        """Test that unknown client IPs are still rate limited."""
        from affilibuster_backend.infrastructure.middleware import rate_limiter

        monkeypatch.setattr(rate_limiter.settings, "rate_limit_enabled", True)

        _storage.reset()

        async def noop_app(scope, receive, send):
            pass

        middleware = RateLimitMiddleware(app=noop_app)

        scope: dict[str, Any] = {
            "type": "http",
            "method": "POST",
            "path": "/auth/register",
            "query_string": b"",
            "headers": [],
            "server": ("testserver", 80),
            "client": None,
            "scheme": "http",
        }
        request = Request(scope)

        async def success_call_next(_: Request) -> Response:
            return Response(status_code=200)

        # Register limit is 3/minute - exhaust it
        for _ in range(3):
            resp = await middleware.dispatch(request, success_call_next)
            assert resp.status_code == 200

        # 4th request should be limited
        resp = await middleware.dispatch(request, success_call_next)
        assert resp.status_code == 429

    @pytest.mark.asyncio
    async def test_dispatch_non_matching_path_passes_through(self, monkeypatch):
        """Test that non-matching paths are not rate limited."""
        from affilibuster_backend.infrastructure.middleware import rate_limiter

        monkeypatch.setattr(rate_limiter.settings, "rate_limit_enabled", True)

        async def noop_app(scope, receive, send):
            pass

        middleware = RateLimitMiddleware(app=noop_app)

        scope = {
            "type": "http",
            "method": "GET",
            "path": "/some/other/path",
            "query_string": b"",
            "headers": [],
            "server": ("testserver", 80),
            "client": ("127.0.0.1", 8000),
            "scheme": "http",
        }
        request = Request(scope)

        async def success_call_next(_: Request) -> Response:
            return Response(status_code=200)

        # Should always pass through regardless of count
        for _ in range(50):
            resp = await middleware.dispatch(request, success_call_next)
            assert resp.status_code == 200
