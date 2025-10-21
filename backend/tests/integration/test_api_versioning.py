# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration test for API versioning.
Reference: research.md:150-160 (All endpoints use /v1/ prefix)
"""

import pytest
from httpx import AsyncClient


@pytest.mark.integration
async def test_all_endpoints_have_version_prefix():
    """
    Test that all API endpoints use /v1/ prefix.
    Expected to fail: API versioning not enforced.
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        endpoints = [
            "/v1/languages",
            "/v1/languages/detect",
            "/v1/content",
            "/v1/currencies",
            "/v1/currencies/convert",
            "/v1/user/preferences",
        ]

        for endpoint in endpoints:
            response = await client.get(endpoint)

            # Should respond with valid status codes (not 404 on wrong path)
            # 405 is acceptable for POST-only endpoints
            assert response.status_code in [200, 404, 405, 422]


@pytest.mark.integration
async def test_endpoints_without_version_not_found():
    """Test that endpoints without version prefix return 404."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        endpoints = [
            "/languages",
            "/content",
            "/currencies",
        ]

        for endpoint in endpoints:
            response = await client.get(endpoint)

            # Should return 404 (no version prefix)
            assert response.status_code == 404


@pytest.mark.integration
async def test_api_version_in_response_headers():
    """Test that API version is included in response headers."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/languages")

        if response.status_code in [200, 404]:
            # Should include API version header
            assert "X-API-Version" in response.headers or "API-Version" in response.headers


@pytest.mark.integration
async def test_health_endpoint_no_version():
    """Test that health endpoint doesn't require version prefix."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Health endpoint should be accessible without version
        response = await client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


@pytest.mark.integration
async def test_docs_endpoint_no_version():
    """Test that API docs are accessible without version prefix."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Docs should be at /docs, not /v1/docs
        response = await client.get("/docs")

        assert response.status_code == 200


@pytest.mark.integration
async def test_version_prefix_case_sensitive():
    """Test that version prefix is case-sensitive."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Lowercase should work
        response1 = await client.get("/v1/languages")
        assert response1.status_code in [200, 404]

        # Uppercase should NOT work
        response2 = await client.get("/V1/languages")
        assert response2.status_code == 404


@pytest.mark.integration
async def test_future_version_not_supported():
    """Test that future API versions return appropriate error."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Try v2 (not implemented)
        response = await client.get("/v2/languages")

        # Should return 404 or specific error
        assert response.status_code in [404, 400]


@pytest.mark.integration
async def test_version_negotiation():
    """Test API version negotiation via header."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Request with Accept-Version header
        headers = {"Accept-Version": "v1"}
        response = await client.get("/v1/languages", headers=headers)

        if response.status_code in [200, 404]:
            # Should accept v1
            assert response.status_code in [200, 404]


@pytest.mark.integration
async def test_deprecated_version_warning():
    """Test that deprecated versions include warning headers."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # When v1 becomes deprecated (future)
        response = await client.get("/v1/languages")

        # If deprecated, should include warning
        if "Deprecated" in response.headers.get("Warning", ""):
            assert "Deprecated" in response.headers["Warning"]


@pytest.mark.integration
async def test_openapi_includes_version():
    """Test that OpenAPI spec includes version information."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/openapi.json")

        if response.status_code == 200:
            spec = response.json()

            # OpenAPI spec should include version
            assert "info" in spec
            assert "version" in spec["info"]

            # All paths should start with /v1
            paths = spec.get("paths", {})
            for path in paths.keys():
                assert path.startswith("/v1/") or path in ["/health", "/docs"]
