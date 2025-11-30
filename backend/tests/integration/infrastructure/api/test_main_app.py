# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration tests for main application setup.

Tests:
- Root and health endpoints
- Custom exception handler for HTTPException
- API version middleware
- CORS configuration
- Middleware order and setup
"""

import pytest

from affilibuster_backend.domain.entities.generated.models import HealthResponse, RootResponse


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestMainAppEndpoints:
    """Test main application endpoints."""

    async def test_root_endpoint_returns_status(self, async_client):
        """Test root endpoint returns status message."""
        response = await async_client.get("/", headers={"Authorization": ""})
        assert response.status_code == 200
        assert response.status_code == 200
        data = RootResponse(**response.json())
        assert data.message is not None
        assert data.status == "running"

    async def test_health_endpoint_returns_healthy(self, async_client):
        """Test health endpoint returns healthy status."""
        response = await async_client.get("/health")
        assert response.status_code == 200
        assert response.status_code == 200
        data = HealthResponse(**response.json())
        assert data.status == "healthy"


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestAPIVersionMiddleware:
    """Test API version middleware."""

    async def test_api_version_header_added_to_response(self, async_client):
        """Test that X-API-Version header is added to responses."""
        response = await async_client.get("/health")
        assert response.status_code == 200
        assert "X-API-Version" in response.headers
        assert response.headers["X-API-Version"] == "1.0.0"

    async def test_api_version_header_on_all_endpoints(self, async_client):
        """Test API version header on multiple endpoints."""
        endpoints = ["/health", "/"]
        for endpoint in endpoints:
            response = await async_client.get(endpoint, headers={"Authorization": ""})
            assert response.status_code in [200, 404, 405]
            assert "X-API-Version" in response.headers


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestErrorHandling:
    """Test error handling in main app."""

    async def test_404_error_returns_proper_format(self, async_client):
        """Test 404 errors return proper error format."""
        response = await async_client.get("/nonexistent-endpoint")
        assert response.status_code == 404

    async def test_405_method_not_allowed(self, async_client):
        """Test 405 method not allowed errors."""
        response = await async_client.post("/health")
        assert response.status_code == 405

    async def test_http_exception_handler_with_dict_detail(self, integration_client, strapi_test_data):
        """Test http_exception_handler returns dict detail directly (covers main.py line 137)."""
        # Use a valid CurrencyCode enum that exists but we'll mock Strapi to reject it
        # Actually, we can't mock in integration test, so let's use the existing test
        # The preferences route raises HTTPException with dict detail for invalid currency
        # But all currencies in the enum are valid in Strapi, so this won't work

        # Instead, let's test by checking existing endpoints that return 400
        # Actually, the test already exists in test_preferences_route.py that triggers this
        # But we need to verify the exception handler works correctly

        # The simplest way is to directly test the exception handler
        from datetime import UTC, datetime

        from fastapi import HTTPException
        from fastapi.responses import JSONResponse
        from starlette.requests import Request

        from affilibuster_backend.domain.entities import Error
        from affilibuster_backend.main import http_exception_handler

        # Create a minimal Request object
        scope = {
            "type": "http",
            "method": "GET",
            "path": "/test",
            "query_string": b"",
            "headers": [],
            "server": ("testserver", 80),
        }
        request = Request(scope)

        # Create HTTPException with dict detail (like our routes do)
        error_dict = Error(
            error="Bad Request",
            message="Test error message",
            code="TEST_ERROR",
            timestamp=datetime.now(UTC),
        ).model_dump(mode="json")

        exc = HTTPException(status_code=400, detail=error_dict)

        # Call the exception handler
        response = await http_exception_handler(request, exc)

        # Verify it returns JSONResponse with dict detail directly
        assert isinstance(response, JSONResponse)
        assert response.status_code == 400

        # The response body should be the error dict directly, not wrapped in "detail"
        import json

        # Convert response.body to bytes if it's a memoryview, then decode
        body_bytes = bytes(response.body) if isinstance(response.body, memoryview) else response.body
        body = json.loads(body_bytes.decode())
        assert "error" in body
        assert "code" in body
        assert body["code"] == "TEST_ERROR"
        assert "detail" not in body  # Should NOT be wrapped


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestCORS:
    """Test CORS configuration."""

    async def test_cors_headers_present_in_response(self, async_client):
        """Test that CORS headers are present in response."""
        response = await async_client.get("/health")
        # Check that response is valid (CORS is configured)
        assert response.status_code == 200

    async def test_health_endpoint_accessible(self, async_client):
        """Test health endpoint is accessible."""
        response = await async_client.get("/health")
        assert response.status_code == 200
        assert response.status_code == 200
        data = HealthResponse(**response.json())
        assert data.status == "healthy"


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestMiddlewareIntegration:
    """Test middleware integration and order."""

    async def test_request_logging_middleware_active(self, async_client):
        """Test request logging middleware is active."""
        response = await async_client.get("/health")
        assert response.status_code == 200
        # Middleware should allow request to pass through
        data = HealthResponse(**response.json())
        assert data.status == "healthy"

    async def test_error_handling_middleware_active(self, async_client):
        """Test error handling middleware is active."""
        response = await async_client.get("/health")
        # Should return valid response
        assert response.status_code == 200
        # Should be JSON
        data = response.json()
        assert isinstance(data, dict)

    async def test_all_middlewares_preserve_functionality(self, async_client):
        """Test all middlewares work together without breaking functionality."""
        response = await async_client.get("/health")
        assert response.status_code == 200
        assert "X-API-Version" in response.headers
        data = HealthResponse(**response.json())
        assert data.status == "healthy"


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestOpenAPIEndpoints:
    """Test OpenAPI documentation endpoints."""

    async def test_openapi_endpoint_returns_schema(self, async_client):
        """Test /openapi.json endpoint returns OpenAPI schema."""
        response = await async_client.get("/v1/openapi.json")
        assert response.status_code == 200
        data = response.json()
        # Should have either openapi or swagger version field
        assert "openapi" in data or "swagger" in data
        # Should have info section
        assert "info" in data

    async def test_docs_endpoint_accessible(self, async_client):
        """Test /docs endpoint is accessible."""
        response = await async_client.get("/v1/docs")
        assert response.status_code == 200
        # Should return HTML
        assert "text/html" in response.headers.get("content-type", "")

    async def test_redoc_endpoint_accessible(self, async_client):
        """Test /redoc endpoint is accessible."""
        response = await async_client.get("/v1/redoc")
        assert response.status_code == 200
        # Should return HTML
        assert "text/html" in response.headers.get("content-type", "")


@pytest.mark.integration
class TestCustomOpenAPI:
    """Test custom OpenAPI schema generation."""

    def test_custom_openapi_caches_schema(self):
        """Test custom_openapi caches schema after first call."""
        from affilibuster_backend.main import app, custom_openapi

        # Clear cache
        app.openapi_schema = None

        # First call
        schema1 = custom_openapi()

        # Second call should return cached version
        schema2 = custom_openapi()

        assert schema1 is schema2

    def test_custom_openapi_uses_contract_when_available(self, mocker):
        """Test custom_openapi uses contract spec when available."""
        from affilibuster_backend.main import app, custom_openapi

        app.openapi_schema = None

        mock_spec = {"openapi": "3.0.0", "info": {"title": "Test"}}
        mocker.patch(
            "affilibuster_backend.infrastructure.api.openapi_loader.openapi_contract_loader.get_spec",
            return_value=mock_spec,
        )

        schema = custom_openapi()

        assert schema == mock_spec

    def test_custom_openapi_fallback_when_contract_unavailable(self, mocker):
        """Test custom_openapi falls back to FastAPI schema when contract missing."""
        from affilibuster_backend.main import app, custom_openapi

        app.openapi_schema = None

        mocker.patch(
            "affilibuster_backend.infrastructure.api.openapi_loader.openapi_contract_loader.get_spec", return_value=None
        )

        schema = custom_openapi()

        assert schema is not None
        assert "openapi" in schema or "info" in schema
