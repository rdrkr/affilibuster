# Copyright (c) 2026 Affilibuster by Ronen Druker.

"""
Unit tests for DataRetentionUseCase.

Tests the data retention cleanup logic for hard-deleting soft-deleted users
past the retention period and purging expired sessions.
"""

from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from affilibuster_backend.domain.use_cases.retention.data_retention_use_case import DataRetentionUseCase


@pytest.mark.unit
class TestDataRetentionUseCase:
    """Test DataRetentionUseCase.execute() method."""

    async def test_no_soft_deleted_users_returns_zero(self):
        """Test cleanup with no soft-deleted users returns zero users deleted."""
        user_repo = AsyncMock()
        session_repo = AsyncMock()

        user_repo.get_soft_deleted_before.return_value = []
        session_repo.delete_expired_sessions.return_value = 0

        use_case = DataRetentionUseCase(user_repo, session_repo)
        result = await use_case.execute(user_retention_days=30, session_retention_days=0)

        assert result.users_deleted == 0
        assert result.sessions_purged == 0
        user_repo.get_soft_deleted_before.assert_called_once()
        user_repo.delete.assert_not_called()
        session_repo.delete_expired_sessions.assert_called_once()

    async def test_users_past_cutoff_are_hard_deleted(self):
        """Test that soft-deleted users past the retention period are hard-deleted."""
        user_repo = AsyncMock()
        session_repo = AsyncMock()

        user_id_1 = uuid4()
        user_id_2 = uuid4()
        user_repo.get_soft_deleted_before.return_value = [user_id_1, user_id_2]
        session_repo.delete_expired_sessions.return_value = 0

        use_case = DataRetentionUseCase(user_repo, session_repo)
        result = await use_case.execute(user_retention_days=30, session_retention_days=0)

        assert result.users_deleted == 2
        assert user_repo.delete.call_count == 2
        user_repo.delete.assert_any_call(user_id_1)
        user_repo.delete.assert_any_call(user_id_2)

    async def test_users_within_retention_not_deleted(self):
        """Test that users within the retention period are not returned or deleted."""
        user_repo = AsyncMock()
        session_repo = AsyncMock()

        # No users past cutoff
        user_repo.get_soft_deleted_before.return_value = []
        session_repo.delete_expired_sessions.return_value = 0

        use_case = DataRetentionUseCase(user_repo, session_repo)
        result = await use_case.execute(user_retention_days=30, session_retention_days=0)

        assert result.users_deleted == 0
        user_repo.delete.assert_not_called()

    async def test_expired_sessions_are_purged(self):
        """Test that expired sessions are purged."""
        user_repo = AsyncMock()
        session_repo = AsyncMock()

        user_repo.get_soft_deleted_before.return_value = []
        session_repo.delete_expired_sessions.return_value = 5

        use_case = DataRetentionUseCase(user_repo, session_repo)
        result = await use_case.execute(user_retention_days=30, session_retention_days=0)

        assert result.sessions_purged == 5
        session_repo.delete_expired_sessions.assert_called_once()

    async def test_combined_cleanup(self):
        """Test cleanup with both users to delete and sessions to purge."""
        user_repo = AsyncMock()
        session_repo = AsyncMock()

        user_id = uuid4()
        user_repo.get_soft_deleted_before.return_value = [user_id]
        session_repo.delete_expired_sessions.return_value = 3

        use_case = DataRetentionUseCase(user_repo, session_repo)
        result = await use_case.execute(user_retention_days=30, session_retention_days=0)

        assert result.users_deleted == 1
        assert result.sessions_purged == 3
        user_repo.delete.assert_called_once_with(user_id)
        session_repo.delete_expired_sessions.assert_called_once()
