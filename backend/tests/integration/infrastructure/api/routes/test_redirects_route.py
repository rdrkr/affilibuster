# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration tests for URL redirects API route.

Tests the /v1/redirects/check endpoint using seeded data from data/seed-data.json.
Reference: T145 (URL redirect handling)
"""

import pytest
from httpx import AsyncClient

from affilibuster_backend.domain.entities.generated.models import RedirectCheckResponse
from tests.fixtures.expected_seed_data import (
    EXPECTED_301_REDIRECT_COUNT,
    EXPECTED_410_REDIRECT_COUNT,
    EXPECTED_REDIRECT_COUNT,
    EXPECTED_REDIRECT_FROM_PATHS,
    EXPECTED_REDIRECTS,
)


@pytest.mark.integration
@pytest.mark.requires_db
class TestRedirectsCheckEndpoint:
    """Test GET /v1/redirects/check endpoint."""

    async def test_check_returns_not_found_when_no_redirect(self, integration_client: AsyncClient) -> None:
        """Test that check returns found=false when no redirect exists."""
        response = await integration_client.get("/v1/redirects/check", params={"source_url": "/nonexistent/path"})

        assert response.status_code == 200
        data = RedirectCheckResponse(**response.json())
        assert data.found is False
        assert data.target_url is None
        assert data.status_code is None

    async def test_check_returns_301_redirect(self, integration_client: AsyncClient) -> None:
        """Test that check returns 301 redirect details when found."""
        # Use the first 301 redirect from seeded data
        redirect_301 = next(r for r in EXPECTED_REDIRECTS if r.status_code == 301)

        response = await integration_client.get("/v1/redirects/check", params={"source_url": redirect_301.from_path})

        assert response.status_code == 200
        data = RedirectCheckResponse(**response.json())
        assert data.found is True
        assert data.status_code == 301
        assert data.target_url == redirect_301.to_path

    async def test_check_returns_410_gone(self, integration_client: AsyncClient) -> None:
        """Test that check returns 410 Gone details when found."""
        # Use the first 410 redirect from seeded data
        redirect_410 = next(r for r in EXPECTED_REDIRECTS if r.status_code == 410)

        response = await integration_client.get("/v1/redirects/check", params={"source_url": redirect_410.from_path})

        assert response.status_code == 200
        data = RedirectCheckResponse(**response.json())
        assert data.found is True
        assert data.status_code == 410
        assert data.target_url is None

    async def test_check_requires_source_url_parameter(self, integration_client: AsyncClient) -> None:
        """Test that check requires the source_url parameter."""
        response = await integration_client.get("/v1/redirects/check")

        # FastAPI should return 422 for missing required parameter
        assert response.status_code == 422

    async def test_all_seeded_redirects_are_found(self, integration_client: AsyncClient) -> None:
        """Test that all seeded redirects can be found via the API."""
        for redirect in EXPECTED_REDIRECTS:
            response = await integration_client.get("/v1/redirects/check", params={"source_url": redirect.from_path})

            assert response.status_code == 200
            data = RedirectCheckResponse(**response.json())
            assert data.found is True, f"Redirect not found: {redirect.from_path}"
            assert data.status_code == redirect.status_code

    async def test_seed_data_counts_are_correct(self, integration_client: AsyncClient) -> None:
        """Verify seed data constants are correctly calculated."""
        # Verify we have the expected number of redirects
        assert len(EXPECTED_REDIRECTS) == EXPECTED_REDIRECT_COUNT
        assert len(EXPECTED_REDIRECT_FROM_PATHS) == EXPECTED_REDIRECT_COUNT

        # Verify status code counts
        actual_301_count = sum(1 for r in EXPECTED_REDIRECTS if r.status_code == 301)
        actual_410_count = sum(1 for r in EXPECTED_REDIRECTS if r.status_code == 410)

        assert actual_301_count == EXPECTED_301_REDIRECT_COUNT
        assert actual_410_count == EXPECTED_410_REDIRECT_COUNT
        assert actual_301_count + actual_410_count == EXPECTED_REDIRECT_COUNT
