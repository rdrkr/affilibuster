# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for ErrorHandlingMiddleware.

Tests exception handling and error response formatting.
"""

import json
import os
from typing import Never
from unittest.mock import patch

import pytest
from fastapi import FastAPI
from starlette.requests import Request
from starlette.testclient import TestClient

from affilibuster_backend.infrastructure.middleware.error_handler import ErrorHandlingMiddleware


def create_mock_request(method: str, path: str) -> Request:
    """Create a mock Request object for testing middleware."""
    scope = {
        "type": "http",
        "method": method,
        "path": path,
        "query_string": b"",
        "headers": [],
        "server": ("testserver", 80),
        "client": ("127.0.0.1", 8000),
        "scheme": "http",
    }
    return Request(scope)


@pytest.fixture
def app_with_error_middleware():
    """Create a FastAPI app with error handling middleware."""
    app = FastAPI()

    @app.get("/success")
    async def success():
        return {"status": "ok"}

    @app.get("/error", response_model=None)
    async def error_route() -> Never:
        raise ValueError("Test error")

    # Add middleware
    app.add_middleware(ErrorHandlingMiddleware)

    return app


@pytest.mark.unit
class TestErrorHandlingMiddlewareSuccess:
    """Test ErrorHandlingMiddleware with successful requests."""

    def test_middleware_passes_through_successful_response(self, app_with_error_middleware):
        """Test middleware allows successful responses to pass through."""
        client = TestClient(app_with_error_middleware)

        response = client.get("/success")

        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

    def test_middleware_preserves_response_headers(self, app_with_error_middleware):
        """Test middleware preserves response headers."""
        client = TestClient(app_with_error_middleware)

        response = client.get("/success")

        assert response.status_code == 200
        assert "content-type" in response.headers


@pytest.mark.unit
class TestErrorHandlingMiddlewareException:
    """Test ErrorHandlingMiddleware with exceptions."""

    def test_middleware_catches_exceptions(self, app_with_error_middleware):
        """Test middleware catches unhandled exceptions."""
        client = TestClient(app_with_error_middleware)

        response = client.get("/error")

        assert response.status_code == 500
        data = response.json()
        assert data["error"] == "Internal Server Error"
        assert data["code"] == "INTERNAL_SERVER_ERROR"

    def test_error_response_includes_required_fields(self, app_with_error_middleware):
        """Test error response includes all required fields."""
        client = TestClient(app_with_error_middleware)

        response = client.get("/error")
        data = response.json()

        assert "error" in data
        assert "message" in data
        assert "code" in data
        assert "timestamp" in data
        assert "path" in data

    def test_error_response_includes_path(self, app_with_error_middleware):
        """Test error response includes request path."""
        client = TestClient(app_with_error_middleware)

        response = client.get("/error")
        data = response.json()

        assert data["path"] == "/error"

    def test_error_response_has_iso_timestamp(self, app_with_error_middleware):
        """Test error response includes ISO format timestamp."""
        client = TestClient(app_with_error_middleware)

        response = client.get("/error")
        data = response.json()

        # Should end with Z for UTC
        assert data["timestamp"].endswith("Z")
        # Should contain T for ISO format
        assert "T" in data["timestamp"]

    def test_error_response_excludes_details_in_production(self, app_with_error_middleware):
        """Test error response excludes debug details in production."""
        with patch.dict(os.environ, {"DEBUG": "false"}):
            client = TestClient(app_with_error_middleware)

            response = client.get("/error")
            data = response.json()

            assert "details" not in data

    def test_error_response_includes_details_in_debug_mode(self, app_with_error_middleware):
        """Test error response includes debug details when DEBUG=true."""
        with patch.dict(os.environ, {"DEBUG": "true"}):
            client = TestClient(app_with_error_middleware)

            response = client.get("/error")
            data = response.json()

            assert "details" in data
            assert "exception_type" in data["details"]
            assert "exception_message" in data["details"]
            assert "ValueError" in data["details"]["exception_type"]

    def test_error_response_includes_exception_type_in_debug(self, app_with_error_middleware):
        """Test error response includes exception type in debug mode."""
        with patch.dict(os.environ, {"DEBUG": "true"}):
            client = TestClient(app_with_error_middleware)

            response = client.get("/error")
            data = response.json()

            assert data["details"]["exception_type"] == "ValueError"

    def test_error_response_includes_exception_message_in_debug(self, app_with_error_middleware):
        """Test error response includes exception message in debug mode."""
        with patch.dict(os.environ, {"DEBUG": "true"}):
            client = TestClient(app_with_error_middleware)

            response = client.get("/error")
            data = response.json()

            assert "Test error" in data["details"]["exception_message"]

    def test_error_response_is_json(self, app_with_error_middleware):
        """Test error response is valid JSON."""
        client = TestClient(app_with_error_middleware)

        response = client.get("/error")

        # Should be valid JSON
        assert response.headers["content-type"] == "application/json"
        data = response.json()
        assert isinstance(data, dict)


@pytest.mark.unit
class TestErrorHandlingMiddlewareDirectDispatch:
    """Test ErrorHandlingMiddleware using direct dispatch to cover exception paths."""

    @pytest.mark.asyncio
    async def test_error_handler_dispatch_catches_exception(self):
        """Test middleware dispatch directly catches exceptions and returns proper error response."""
        from affilibuster_backend.infrastructure.middleware.error_handler import ErrorHandlingMiddleware

        middleware = ErrorHandlingMiddleware(app=None)
        request = create_mock_request("GET", "/test")

        async def failing_call_next(_: Request) -> Never:
            raise RuntimeError("Test error")

        response = await middleware.dispatch(request, failing_call_next)

        assert response.status_code == 500
        data = json.loads(response.body.decode())
        assert data["error"] == "Internal Server Error"
        assert data["code"] == "INTERNAL_SERVER_ERROR"
        assert data["message"] == "An unexpected error occurred. Please try again later."
        assert data["path"] == "/test"
        assert "timestamp" in data

    @pytest.mark.asyncio
    async def test_error_handler_dispatch_with_debug_mode(self):
        """Test middleware dispatch includes exception details when DEBUG=true."""
        import os

        from affilibuster_backend.infrastructure.middleware.error_handler import ErrorHandlingMiddleware

        with patch.dict(os.environ, {"DEBUG": "true"}):
            middleware = ErrorHandlingMiddleware(app=None)
            request = create_mock_request("GET", "/test-debug")

            async def failing_call_next(_: Request) -> Never:
                raise ValueError("Debug mode error")

            response = await middleware.dispatch(request, failing_call_next)

            assert response.status_code == 500
            data = json.loads(response.body.decode())
            assert "details" in data
            assert data["details"]["exception_type"] == "ValueError"
            assert data["details"]["exception_message"] == "Debug mode error"

    @pytest.mark.asyncio
    async def test_error_handler_dispatch_without_debug_mode(self):
        """Test middleware dispatch excludes exception details when DEBUG=false."""
        import os

        from affilibuster_backend.infrastructure.middleware.error_handler import ErrorHandlingMiddleware

        with patch.dict(os.environ, {"DEBUG": "false"}):
            middleware = ErrorHandlingMiddleware(app=None)
            request = create_mock_request("GET", "/test-prod")

            async def failing_call_next(_: Request) -> Never:
                raise ValueError("Production error")

            response = await middleware.dispatch(request, failing_call_next)

            assert response.status_code == 500
            data = json.loads(response.body.decode())
            assert "details" not in data
            assert data["error"] == "Internal Server Error"
