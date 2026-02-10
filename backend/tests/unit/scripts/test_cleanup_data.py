# Copyright (c) 2026 Affilibuster by Ronen Druker.

"""
Unit tests for the data retention cleanup script.

Tests script execution with mocked dependencies and logging output.
"""

import logging
from unittest.mock import AsyncMock, patch

import pytest

from affilibuster_backend.domain.entities.retention import RetentionResult
from affilibuster_backend.scripts.cleanup_data import run_cleanup


@pytest.mark.unit
class TestCleanupDataScript:
    """Test cleanup_data script execution."""

    @patch("affilibuster_backend.scripts.cleanup_data.settings")
    @patch("affilibuster_backend.scripts.cleanup_data.get_db_session")
    async def test_run_cleanup_executes_use_case(self, mock_get_db_session, mock_settings):
        """Test that run_cleanup instantiates repos and runs the use case."""
        mock_settings.user_retention_days = 30
        mock_settings.session_retention_days = 0

        mock_session = AsyncMock()
        mock_context = AsyncMock()
        mock_context.__aenter__.return_value = mock_session
        mock_get_db_session.return_value = mock_context

        with patch("affilibuster_backend.scripts.cleanup_data.DataRetentionUseCase") as mock_use_case_cls:
            mock_use_case = AsyncMock()
            mock_use_case.execute.return_value = RetentionResult(users_deleted=2, sessions_purged=5)
            mock_use_case_cls.return_value = mock_use_case

            await run_cleanup()

            mock_use_case.execute.assert_called_once_with(
                user_retention_days=30,
                session_retention_days=0,
            )

    @patch("affilibuster_backend.scripts.cleanup_data.settings")
    @patch("affilibuster_backend.scripts.cleanup_data.get_db_session")
    async def test_run_cleanup_logs_results(self, mock_get_db_session, mock_settings, caplog):
        """Test that run_cleanup logs the cleanup results."""
        mock_settings.user_retention_days = 30
        mock_settings.session_retention_days = 0

        mock_session = AsyncMock()
        mock_context = AsyncMock()
        mock_context.__aenter__.return_value = mock_session
        mock_get_db_session.return_value = mock_context

        with (
            patch("affilibuster_backend.scripts.cleanup_data.DataRetentionUseCase") as mock_use_case_cls,
            caplog.at_level(logging.INFO),
        ):
            mock_use_case = AsyncMock()
            mock_use_case.execute.return_value = RetentionResult(users_deleted=1, sessions_purged=3)
            mock_use_case_cls.return_value = mock_use_case

            await run_cleanup()

            assert "1 users hard-deleted" in caplog.text
            assert "3 sessions purged" in caplog.text

    @patch("affilibuster_backend.scripts.cleanup_data.settings")
    @patch("affilibuster_backend.scripts.cleanup_data.get_db_session")
    async def test_run_cleanup_with_zero_results(self, mock_get_db_session, mock_settings, caplog):
        """Test that run_cleanup handles zero results gracefully."""
        mock_settings.user_retention_days = 30
        mock_settings.session_retention_days = 0

        mock_session = AsyncMock()
        mock_context = AsyncMock()
        mock_context.__aenter__.return_value = mock_session
        mock_get_db_session.return_value = mock_context

        with (
            patch("affilibuster_backend.scripts.cleanup_data.DataRetentionUseCase") as mock_use_case_cls,
            caplog.at_level(logging.INFO),
        ):
            mock_use_case = AsyncMock()
            mock_use_case.execute.return_value = RetentionResult(users_deleted=0, sessions_purged=0)
            mock_use_case_cls.return_value = mock_use_case

            await run_cleanup()

            assert "0 users hard-deleted" in caplog.text
            assert "0 sessions purged" in caplog.text
