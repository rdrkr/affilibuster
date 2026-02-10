# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for ConsentRepository.

Tests the PostgreSQL implementation of the consent repository.
"""

from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from affilibuster_backend.domain.entities.generated.models import (
    ConsentAction,
    ConsentCategories,
    ConsentType,
    RecordConsentRequest,
)
from affilibuster_backend.infrastructure.database.repositories.consent_repository import ConsentRepository


@pytest.mark.unit
@pytest.mark.asyncio
class TestConsentRepositoryCreate:
    """Test ConsentRepository.create() method."""

    async def test_create_consent_record(self) -> None:
        """Test creating a consent record with all fields."""
        # Arrange
        mock_session = AsyncMock()
        repo = ConsentRepository(mock_session)
        consent_request = RecordConsentRequest(
            consent_type=ConsentType.COOKIE,
            categories=ConsentCategories(necessary=True, analytics=True, marketing=False),
            action=ConsentAction.CUSTOM,
            consent_version="1.0",
        )

        # Act
        result = await repo.create(
            consent_request=consent_request,
            user_id=None,
            session_id="sess-abc123",
            ip_address="192.168.1.1",
            user_agent="TestAgent/1.0",
        )

        # Assert
        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once()
        assert result is not None

    async def test_create_consent_record_with_user_id(self) -> None:
        """Test creating a consent record for an authenticated user."""
        # Arrange
        mock_session = AsyncMock()
        repo = ConsentRepository(mock_session)
        user_id = uuid4()
        consent_request = RecordConsentRequest(
            consent_type=ConsentType.COOKIE,
            categories=ConsentCategories(necessary=True, analytics=False),
            action=ConsentAction.REJECT_ALL,
        )

        # Act
        result = await repo.create(
            consent_request=consent_request,
            user_id=user_id,
            session_id="sess-xyz",
        )

        # Assert
        assert result is not None
        mock_session.add.assert_called_once()
        added_model = mock_session.add.call_args[0][0]
        assert added_model.user_id == user_id

    async def test_create_consent_record_minimal_data(self) -> None:
        """Test creating a consent record with minimal required data."""
        # Arrange
        mock_session = AsyncMock()
        repo = ConsentRepository(mock_session)
        consent_request = RecordConsentRequest(
            consent_type=ConsentType.COOKIE,
            categories=ConsentCategories(necessary=True),
            action=ConsentAction.ACCEPT_ALL,
        )

        # Act
        result = await repo.create(consent_request=consent_request)

        # Assert
        assert result is not None
        added_model = mock_session.add.call_args[0][0]
        assert added_model.user_id is None
        assert added_model.session_id is None
        assert added_model.ip_address is None
        assert added_model.user_agent is None
        assert added_model.consent_version is None

    async def test_create_consent_record_stores_correct_values(self) -> None:
        """Test that the created record stores the correct consent values."""
        # Arrange
        mock_session = AsyncMock()
        repo = ConsentRepository(mock_session)
        consent_request = RecordConsentRequest(
            consent_type=ConsentType.TERMS,
            categories=ConsentCategories(necessary=True, analytics=True, marketing=True),
            action=ConsentAction.ACCEPT_ALL,
            consent_version="2.0",
        )

        # Act
        await repo.create(
            consent_request=consent_request,
            ip_address="10.0.0.1",
            user_agent="Mozilla/5.0",
        )

        # Assert
        added_model = mock_session.add.call_args[0][0]
        assert added_model.consent_type == "terms"
        assert added_model.action == "accept_all"
        assert added_model.categories == {"necessary": True, "analytics": True, "marketing": True, "functional": None}
        assert added_model.consent_version == "2.0"
        assert added_model.ip_address == "10.0.0.1"
        assert added_model.user_agent == "Mozilla/5.0"


@pytest.mark.unit
@pytest.mark.asyncio
class TestConsentRepositoryGetLatestBySession:
    """Test ConsentRepository.get_latest_by_session() method."""

    async def test_get_latest_by_session_found(self) -> None:
        """Test getting the latest consent record for an existing session."""
        # Arrange
        mock_session = AsyncMock()
        record_id = uuid4()
        mock_record = MagicMock()
        mock_record.id = record_id
        mock_record.user_id = None
        mock_record.session_id = "sess-abc"
        mock_record.consent_type = "cookie"
        mock_record.categories = {"necessary": True}
        mock_record.action = "accept_all"
        mock_record.ip_address = "192.168.1.1"
        mock_record.user_agent = "TestAgent"
        mock_record.consent_version = "1.0"
        mock_record.created_at = "2026-01-01T00:00:00"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_record
        mock_session.execute.return_value = mock_result

        repo = ConsentRepository(mock_session)

        # Act
        result = await repo.get_latest_by_session("sess-abc")

        # Assert
        assert result is not None
        assert result["id"] == record_id
        assert result["session_id"] == "sess-abc"
        assert result["consent_type"] == "cookie"
        mock_session.execute.assert_called_once()

    async def test_get_latest_by_session_not_found(self) -> None:
        """Test getting consent record for a session with no records."""
        # Arrange
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = ConsentRepository(mock_session)

        # Act
        result = await repo.get_latest_by_session("nonexistent-session")

        # Assert
        assert result is None


@pytest.mark.unit
@pytest.mark.asyncio
class TestConsentRepositoryGetLatestByUser:
    """Test ConsentRepository.get_latest_by_user() method."""

    async def test_get_latest_by_user_found(self) -> None:
        """Test getting the latest consent record for an existing user."""
        # Arrange
        mock_session = AsyncMock()
        user_id = uuid4()
        record_id = uuid4()
        mock_record = MagicMock()
        mock_record.id = record_id
        mock_record.user_id = user_id
        mock_record.session_id = None
        mock_record.consent_type = "cookie"
        mock_record.categories = {"necessary": True, "analytics": True}
        mock_record.action = "custom"
        mock_record.ip_address = "10.0.0.1"
        mock_record.user_agent = "Agent"
        mock_record.consent_version = "1.0"
        mock_record.created_at = "2026-01-01T00:00:00"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_record
        mock_session.execute.return_value = mock_result

        repo = ConsentRepository(mock_session)

        # Act
        result = await repo.get_latest_by_user(user_id)

        # Assert
        assert result is not None
        assert result["user_id"] == user_id
        assert result["consent_type"] == "cookie"

    async def test_get_latest_by_user_not_found(self) -> None:
        """Test getting consent record for a user with no records."""
        # Arrange
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = ConsentRepository(mock_session)

        # Act
        result = await repo.get_latest_by_user(uuid4())

        # Assert
        assert result is None


@pytest.mark.unit
class TestConsentRepositoryToDict:
    """Test ConsentRepository._to_dict() static method."""

    def test_to_dict_converts_all_fields(self) -> None:
        """Test that _to_dict converts all model fields to a dictionary."""
        # Arrange
        record_id = uuid4()
        user_id = uuid4()
        mock_record = MagicMock()
        mock_record.id = record_id
        mock_record.user_id = user_id
        mock_record.session_id = "sess-123"
        mock_record.consent_type = "cookie"
        mock_record.categories = {"necessary": True, "analytics": False}
        mock_record.action = "custom"
        mock_record.ip_address = "192.168.1.1"
        mock_record.user_agent = "TestAgent/2.0"
        mock_record.consent_version = "1.0"
        mock_record.created_at = "2026-02-10T10:00:00"

        # Act
        result = ConsentRepository._to_dict(mock_record)

        # Assert
        assert result["id"] == record_id
        assert result["user_id"] == user_id
        assert result["session_id"] == "sess-123"
        assert result["consent_type"] == "cookie"
        assert result["categories"] == {"necessary": True, "analytics": False}
        assert result["action"] == "custom"
        assert result["ip_address"] == "192.168.1.1"
        assert result["user_agent"] == "TestAgent/2.0"
        assert result["consent_version"] == "1.0"
        assert result["created_at"] == "2026-02-10T10:00:00"


@pytest.mark.unit
@pytest.mark.asyncio
class TestConsentRepositoryGetAllByUserId:
    """Test ConsentRepository.get_all_by_user_id() method."""

    async def test_get_all_by_user_id_returns_records(self) -> None:
        """Test getting all consent records for a user."""
        # Arrange
        mock_session = AsyncMock()
        user_id = uuid4()
        record1 = MagicMock()
        record1.id = uuid4()
        record1.user_id = user_id
        record1.session_id = "sess-1"
        record1.consent_type = "cookie"
        record1.categories = {"necessary": True}
        record1.action = "accept_all"
        record1.ip_address = "10.0.0.1"
        record1.user_agent = "Agent"
        record1.consent_version = "1.0"
        record1.created_at = "2026-02-10T10:00:00"

        record2 = MagicMock()
        record2.id = uuid4()
        record2.user_id = user_id
        record2.session_id = "sess-2"
        record2.consent_type = "terms"
        record2.categories = {"necessary": True}
        record2.action = "accept_all"
        record2.ip_address = "10.0.0.2"
        record2.user_agent = "Agent"
        record2.consent_version = "2.0"
        record2.created_at = "2026-02-11T10:00:00"

        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [record2, record1]
        mock_session.execute.return_value = mock_result

        repo = ConsentRepository(mock_session)

        # Act
        result = await repo.get_all_by_user_id(user_id)

        # Assert
        assert len(result) == 2
        assert result[0]["consent_type"] == "terms"
        assert result[1]["consent_type"] == "cookie"
        mock_session.execute.assert_called_once()

    async def test_get_all_by_user_id_returns_empty_list(self) -> None:
        """Test getting consent records for user with none."""
        # Arrange
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        mock_session.execute.return_value = mock_result

        repo = ConsentRepository(mock_session)

        # Act
        result = await repo.get_all_by_user_id(uuid4())

        # Assert
        assert result == []
        mock_session.execute.assert_called_once()


@pytest.mark.unit
@pytest.mark.asyncio
class TestConsentRepositoryAnonymizeByUserId:
    """Test ConsentRepository.anonymize_by_user_id() method."""

    async def test_anonymize_by_user_id_returns_count(self) -> None:
        """Test anonymizing consent records returns affected count."""
        # Arrange
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.rowcount = 3
        mock_session.execute.return_value = mock_result

        repo = ConsentRepository(mock_session)

        # Act
        result = await repo.anonymize_by_user_id(uuid4())

        # Assert
        assert result == 3
        mock_session.execute.assert_called_once()
        mock_session.commit.assert_called_once()

    async def test_anonymize_by_user_id_returns_zero_when_none(self) -> None:
        """Test anonymizing returns 0 when no records found."""
        # Arrange
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.rowcount = 0
        mock_session.execute.return_value = mock_result

        repo = ConsentRepository(mock_session)

        # Act
        result = await repo.anonymize_by_user_id(uuid4())

        # Assert
        assert result == 0
        mock_session.execute.assert_called_once()
        mock_session.commit.assert_called_once()
