# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for GetURLRedirectUseCase.

Tests the use case for retrieving URL redirects.
Reference: T145 (URL redirect handling)
"""

from datetime import UTC, datetime
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from affilibuster_backend.domain.entities.url_redirect import URLRedirect
from affilibuster_backend.domain.use_cases.get_url_redirect_use_case import GetURLRedirectUseCase


@pytest.mark.unit
class TestGetURLRedirectUseCase:
    """Test GetURLRedirectUseCase.execute() method."""

    async def test_execute_returns_redirect_when_found(self) -> None:
        """Test that execute returns redirect when path exists."""
        # Arrange
        mock_repo = AsyncMock()
        redirect = URLRedirect(
            id=uuid4(),
            from_path="/products/old-slug",
            to_path="/products/new-slug",
            status_code=301,
            reason="slug_changed",
            created_at=datetime.now(UTC),
        )
        mock_repo.get_by_path.return_value = redirect

        use_case = GetURLRedirectUseCase(mock_repo)

        # Act
        result = await use_case.execute("/products/old-slug")

        # Assert
        assert result is not None
        assert result.from_path == "/products/old-slug"
        assert result.to_path == "/products/new-slug"
        assert result.status_code == 301
        mock_repo.get_by_path.assert_called_once_with("/products/old-slug")

    async def test_execute_returns_none_when_not_found(self) -> None:
        """Test that execute returns None when path doesn't exist."""
        # Arrange
        mock_repo = AsyncMock()
        mock_repo.get_by_path.return_value = None

        use_case = GetURLRedirectUseCase(mock_repo)

        # Act
        result = await use_case.execute("/nonexistent/path")

        # Assert
        assert result is None
        mock_repo.get_by_path.assert_called_once_with("/nonexistent/path")

    async def test_execute_returns_410_redirect(self) -> None:
        """Test that execute handles 410 Gone redirects correctly."""
        # Arrange
        mock_repo = AsyncMock()
        redirect = URLRedirect(
            id=uuid4(),
            from_path="/products/deleted",
            to_path=None,
            status_code=410,
            reason="content_deleted",
            created_at=datetime.now(UTC),
        )
        mock_repo.get_by_path.return_value = redirect

        use_case = GetURLRedirectUseCase(mock_repo)

        # Act
        result = await use_case.execute("/products/deleted")

        # Assert
        assert result is not None
        assert result.status_code == 410
        assert result.to_path is None
