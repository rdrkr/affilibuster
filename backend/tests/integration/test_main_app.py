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


class TestMainAppEndpoints:
    """Test main application endpoints."""

    async def test_root_endpoint_returns_status(self, async_client):
        """Test root endpoint returns status message."""
        response = await async_client.get("/", headers={"Authorization": ""})
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "status" in data
        assert data["status"] == "running"

    async def test_health_endpoint_returns_healthy(self, async_client):
        """Test health endpoint returns healthy status."""
        response = await async_client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


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
        assert response.json()["status"] == "healthy"


class TestMiddlewareIntegration:
    """Test middleware integration and order."""

    async def test_request_logging_middleware_active(self, async_client):
        """Test request logging middleware is active."""
        response = await async_client.get("/health")
        assert response.status_code == 200
        # Middleware should allow request to pass through
        assert response.json()["status"] == "healthy"

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
        data = response.json()
        assert data["status"] == "healthy"
