# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for redirects API route.

Tests the check_redirect endpoint logic.
"""

from unittest.mock import AsyncMock

import pytest

from affilibuster_backend.domain.entities.generated.models import RedirectCheckResponse
from affilibuster_backend.domain.entities.url_redirect import URLRedirect
from affilibuster_backend.domain.use_cases.cms.get_url_redirect_use_case import GetURLRedirectUseCase
from affilibuster_backend.infrastructure.api.routes.redirects import check_redirect


@pytest.mark.unit
@pytest.mark.asyncio
class TestCheckRedirectEndpoint:
    """Unit tests for check_redirect endpoint."""

    async def test_check_redirect_returns_found_true_for_existing_redirect(self):
        """Test that check_redirect returns found=True when redirect exists."""
        # Arrange
        mock_use_case = AsyncMock(spec=GetURLRedirectUseCase)
        redirect = URLRedirect(
            from_path="/old-path",
            to_path="/new-path",
            status_code=301,
        )
        mock_use_case.execute.return_value = redirect

        # Act
        response = await check_redirect(source_url="/old-path", use_case=mock_use_case)

        # Assert
        assert isinstance(response, RedirectCheckResponse)
        assert response.found is True
        assert response.target_url == "/new-path"
        assert response.status_code == 301
        mock_use_case.execute.assert_called_once_with("/old-path")

    async def test_check_redirect_returns_found_false_for_nonexistent_redirect(self):
        """Test that check_redirect returns found=False when no redirect exists."""
        # Arrange
        mock_use_case = AsyncMock(spec=GetURLRedirectUseCase)
        mock_use_case.execute.return_value = None

        # Act
        response = await check_redirect(source_url="/nonexistent", use_case=mock_use_case)

        # Assert
        assert isinstance(response, RedirectCheckResponse)
        assert response.found is False
        assert response.target_url is None
        assert response.status_code is None
        mock_use_case.execute.assert_called_once_with("/nonexistent")

    async def test_check_redirect_handles_410_gone(self):
        """Test that check_redirect correctly handles 410 Gone status."""
        # Arrange
        mock_use_case = AsyncMock(spec=GetURLRedirectUseCase)
        redirect = URLRedirect(
            from_path="/deleted-page",
            to_path=None,
            status_code=410,
        )
        mock_use_case.execute.return_value = redirect

        # Act
        response = await check_redirect(source_url="/deleted-page", use_case=mock_use_case)

        # Assert
        assert isinstance(response, RedirectCheckResponse)
        assert response.found is True
        assert response.target_url is None
        assert response.status_code == 410
        mock_use_case.execute.assert_called_once_with("/deleted-page")
