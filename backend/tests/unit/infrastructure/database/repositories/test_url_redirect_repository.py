# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for URLRedirectRepository.

Tests database operations for URL redirect management using mocked sessions.
Reference: T145 (URL redirect handling)
"""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from affilibuster_backend.domain.entities.url_redirect import URLRedirect
from affilibuster_backend.infrastructure.database.models.url_redirect import URLRedirectModel
from affilibuster_backend.infrastructure.database.repositories.url_redirect_repository import (
    URLRedirectRepository,
)


@pytest.mark.unit
class TestURLRedirectRepositoryCreate:
    """Test URLRedirectRepository.create() method."""

    async def test_create_301_redirect(self) -> None:
        """Test creating a 301 permanent redirect."""
        mock_session = AsyncMock()

        repo = URLRedirectRepository(mock_session)

        redirect = URLRedirect(
            id=uuid4(),
            from_path="/products/old-slug",
            to_path="/products/new-slug",
            status_code=301,
            reason="slug_changed",
            created_by="admin",
            created_at=datetime.now(UTC),
        )

        result = await repo.create(redirect)

        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()
        assert result.from_path == "/products/old-slug"
        assert result.to_path == "/products/new-slug"
        assert result.status_code == 301

    async def test_create_410_gone(self) -> None:
        """Test creating a 410 Gone redirect (content deleted)."""
        mock_session = AsyncMock()

        repo = URLRedirectRepository(mock_session)

        redirect = URLRedirect(
            id=uuid4(),
            from_path="/products/deleted-product",
            to_path=None,
            status_code=410,
            reason="content_deleted",
            created_by="admin",
            created_at=datetime.now(UTC),
        )

        result = await repo.create(redirect)

        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()
        assert result.from_path == "/products/deleted-product"
        assert result.to_path is None
        assert result.status_code == 410

    async def test_create_normalizes_path(self) -> None:
        """Test that paths are normalized on create."""
        mock_session = AsyncMock()

        repo = URLRedirectRepository(mock_session)

        # Path without leading slash and with trailing slash
        redirect = URLRedirect(
            from_path="products/old-slug/",
            to_path="products/new-slug/",
            status_code=301,
        )

        result = await repo.create(redirect)

        # Should be normalized: lowercase, leading slash, no trailing slash
        assert result.from_path == "/products/old-slug"
        assert result.to_path == "/products/new-slug"


@pytest.mark.unit
class TestURLRedirectRepositoryGetByPath:
    """Test URLRedirectRepository.get_by_path() method."""

    async def test_get_by_path_returns_redirect(self) -> None:
        """Test retrieving redirect by path."""
        mock_session = AsyncMock()

        # Create mock model
        mock_model = MagicMock(spec=URLRedirectModel)
        mock_model.id = uuid4()
        mock_model.from_path = "/products/findme"
        mock_model.to_path = "/products/found"
        mock_model.status_code = 301
        mock_model.reason = None
        mock_model.created_by = None
        mock_model.created_at = datetime.now(UTC)

        # Mock the execute result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = URLRedirectRepository(mock_session)
        result = await repo.get_by_path("/products/findme")

        assert result is not None
        assert result.from_path == "/products/findme"
        assert result.to_path == "/products/found"

    async def test_get_by_path_normalizes_input(self) -> None:
        """Test that lookup path is normalized."""
        mock_session = AsyncMock()

        mock_model = MagicMock(spec=URLRedirectModel)
        mock_model.id = uuid4()
        mock_model.from_path = "/products/normalized"
        mock_model.to_path = "/products/new"
        mock_model.status_code = 301
        mock_model.reason = None
        mock_model.created_by = None
        mock_model.created_at = datetime.now(UTC)

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = URLRedirectRepository(mock_session)

        # Lookup with different formatting should normalize the input
        result = await repo.get_by_path("products/NORMALIZED/")

        assert result is not None
        # Verify the session was called (path was normalized)
        mock_session.execute.assert_called_once()

    async def test_get_by_path_returns_none_for_missing(self) -> None:
        """Test get_by_path returns None for non-existent path."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = URLRedirectRepository(mock_session)
        result = await repo.get_by_path("/nonexistent/path")

        assert result is None


@pytest.mark.unit
class TestURLRedirectRepositoryDeleteByPath:
    """Test URLRedirectRepository.delete_by_path() method."""

    async def test_delete_by_path_returns_true(self) -> None:
        """Test deleting existing redirect returns True."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.rowcount = 1
        mock_session.execute.return_value = mock_result

        repo = URLRedirectRepository(mock_session)
        result = await repo.delete_by_path("/products/to-delete")

        assert result is True
        mock_session.commit.assert_called_once()

    async def test_delete_by_path_returns_false_for_missing(self) -> None:
        """Test deleting non-existent path returns False."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.rowcount = 0
        mock_session.execute.return_value = mock_result

        repo = URLRedirectRepository(mock_session)
        result = await repo.delete_by_path("/nonexistent/path")

        assert result is False


@pytest.mark.unit
class TestURLRedirectRepositoryListAll:
    """Test URLRedirectRepository.list_all() method."""

    async def test_list_all_returns_empty_initially(self) -> None:
        """Test list_all returns empty list when no redirects exist."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_scalars = MagicMock()
        mock_scalars.all.return_value = []
        mock_result.scalars.return_value = mock_scalars
        mock_session.execute.return_value = mock_result

        repo = URLRedirectRepository(mock_session)
        result = await repo.list_all()

        assert result == []

    async def test_list_all_returns_all_redirects(self) -> None:
        """Test list_all returns all created redirects."""
        mock_session = AsyncMock()

        # Create mock models
        mock_model1 = MagicMock(spec=URLRedirectModel)
        mock_model1.id = uuid4()
        mock_model1.from_path = "/products/one"
        mock_model1.to_path = "/products/new-one"
        mock_model1.status_code = 301
        mock_model1.reason = None
        mock_model1.created_by = None
        mock_model1.created_at = datetime.now(UTC)

        mock_model2 = MagicMock(spec=URLRedirectModel)
        mock_model2.id = uuid4()
        mock_model2.from_path = "/products/two"
        mock_model2.to_path = "/products/new-two"
        mock_model2.status_code = 301
        mock_model2.reason = None
        mock_model2.created_by = None
        mock_model2.created_at = datetime.now(UTC)

        mock_result = MagicMock()
        mock_scalars = MagicMock()
        mock_scalars.all.return_value = [mock_model1, mock_model2]
        mock_result.scalars.return_value = mock_scalars
        mock_session.execute.return_value = mock_result

        repo = URLRedirectRepository(mock_session)
        result = await repo.list_all()

        assert len(result) == 2
        paths = {r.from_path for r in result}
        assert "/products/one" in paths
        assert "/products/two" in paths


@pytest.mark.unit
class TestURLRedirectRepositoryEdgeCases:
    """Test URLRedirectRepository edge cases and error handling."""

    async def test_create_with_empty_path_normalizes_to_root(self) -> None:
        """Test that empty path normalizes to root."""
        mock_session = AsyncMock()

        repo = URLRedirectRepository(mock_session)

        redirect = URLRedirect(
            from_path="",
            to_path="/products/new",
            status_code=301,
        )

        result = await repo.create(redirect)
        assert result.from_path == "/"

    async def test_create_with_uppercase_path_normalizes_to_lowercase(self) -> None:
        """Test that paths are normalized to lowercase."""
        mock_session = AsyncMock()

        repo = URLRedirectRepository(mock_session)

        redirect = URLRedirect(
            from_path="/PRODUCTS/OLD-SLUG",
            to_path="/PRODUCTS/NEW-SLUG",
            status_code=301,
        )

        result = await repo.create(redirect)
        assert result.from_path == "/products/old-slug"
        assert result.to_path == "/products/new-slug"

    async def test_get_by_path_handles_none_result(self) -> None:
        """Test get_by_path returns None for non-existent path without error."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = URLRedirectRepository(mock_session)
        result = await repo.get_by_path("/this/path/does/not/exist")

        assert result is None

    async def test_create_410_with_null_to_path(self) -> None:
        """Test creating 410 redirect with null to_path."""
        mock_session = AsyncMock()

        repo = URLRedirectRepository(mock_session)

        redirect = URLRedirect(
            from_path="/products/archived",
            to_path=None,
            status_code=410,
            reason="content_deleted",
        )

        result = await repo.create(redirect)
        assert result.to_path is None
        assert result.status_code == 410
