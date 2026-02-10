# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for RecordConsentUseCase.

Tests the use case for recording consent events.
"""

from unittest.mock import AsyncMock
from uuid import UUID, uuid4

import pytest

from affilibuster_backend.domain.entities.generated.models import (
    ConsentAction,
    ConsentCategories,
    ConsentType,
    RecordConsentRequest,
)
from affilibuster_backend.domain.use_cases.consent.record_consent_use_case import RecordConsentUseCase


@pytest.mark.unit
class TestRecordConsentUseCase:
    """Test RecordConsentUseCase.execute() method."""

    async def test_execute_records_consent_and_returns_response(self) -> None:
        """Test that execute creates a consent record and returns success response."""
        # Arrange
        mock_repo = AsyncMock()
        consent_id = uuid4()
        mock_repo.create.return_value = consent_id

        use_case = RecordConsentUseCase(mock_repo)
        request = RecordConsentRequest(
            consent_type=ConsentType.COOKIE,
            categories=ConsentCategories(necessary=True, analytics=True, marketing=False),
            action=ConsentAction.CUSTOM,
            consent_version="1.0",
        )

        # Act
        result = await use_case.execute(
            consent_request=request,
            user_id=None,
            session_id="sess-abc123",
            ip_address="192.168.1.1",
            user_agent="TestAgent/1.0",
        )

        # Assert
        assert result.success is True
        assert result.consent_id == consent_id
        assert result.message == "Consent recorded successfully"
        mock_repo.create.assert_called_once_with(
            consent_request=request,
            user_id=None,
            session_id="sess-abc123",
            ip_address="192.168.1.1",
            user_agent="TestAgent/1.0",
        )

    async def test_execute_with_authenticated_user(self) -> None:
        """Test that execute passes user_id for authenticated users."""
        # Arrange
        mock_repo = AsyncMock()
        consent_id = uuid4()
        user_id = uuid4()
        mock_repo.create.return_value = consent_id

        use_case = RecordConsentUseCase(mock_repo)
        request = RecordConsentRequest(
            consent_type=ConsentType.COOKIE,
            categories=ConsentCategories(necessary=True, analytics=False, marketing=False),
            action=ConsentAction.REJECT_ALL,
        )

        # Act
        result = await use_case.execute(
            consent_request=request,
            user_id=user_id,
            session_id="sess-xyz",
        )

        # Assert
        assert result.success is True
        assert isinstance(result.consent_id, UUID)
        mock_repo.create.assert_called_once_with(
            consent_request=request,
            user_id=user_id,
            session_id="sess-xyz",
            ip_address=None,
            user_agent=None,
        )

    async def test_execute_accept_all_action(self) -> None:
        """Test recording accept_all consent action."""
        # Arrange
        mock_repo = AsyncMock()
        consent_id = uuid4()
        mock_repo.create.return_value = consent_id

        use_case = RecordConsentUseCase(mock_repo)
        request = RecordConsentRequest(
            consent_type=ConsentType.COOKIE,
            categories=ConsentCategories(necessary=True, analytics=True, marketing=True),
            action=ConsentAction.ACCEPT_ALL,
        )

        # Act
        result = await use_case.execute(consent_request=request)

        # Assert
        assert result.success is True
        assert result.consent_id == consent_id

    async def test_execute_revoke_action(self) -> None:
        """Test recording revoke consent action."""
        # Arrange
        mock_repo = AsyncMock()
        consent_id = uuid4()
        mock_repo.create.return_value = consent_id

        use_case = RecordConsentUseCase(mock_repo)
        request = RecordConsentRequest(
            consent_type=ConsentType.COOKIE,
            categories=ConsentCategories(necessary=True, analytics=False, marketing=False),
            action=ConsentAction.REVOKE,
        )

        # Act
        result = await use_case.execute(consent_request=request, session_id="sess-revoke")

        # Assert
        assert result.success is True
        mock_repo.create.assert_called_once()

    async def test_execute_with_no_optional_fields(self) -> None:
        """Test recording consent with minimal data (no optional fields)."""
        # Arrange
        mock_repo = AsyncMock()
        consent_id = uuid4()
        mock_repo.create.return_value = consent_id

        use_case = RecordConsentUseCase(mock_repo)
        request = RecordConsentRequest(
            consent_type=ConsentType.COOKIE,
            categories=ConsentCategories(necessary=True),
            action=ConsentAction.REJECT_ALL,
        )

        # Act
        result = await use_case.execute(consent_request=request)

        # Assert
        assert result.success is True
        mock_repo.create.assert_called_once_with(
            consent_request=request,
            user_id=None,
            session_id=None,
            ip_address=None,
            user_agent=None,
        )

    async def test_execute_terms_consent_type(self) -> None:
        """Test recording terms and conditions consent."""
        # Arrange
        mock_repo = AsyncMock()
        consent_id = uuid4()
        mock_repo.create.return_value = consent_id

        use_case = RecordConsentUseCase(mock_repo)
        request = RecordConsentRequest(
            consent_type=ConsentType.TERMS,
            categories=ConsentCategories(necessary=True),
            action=ConsentAction.ACCEPT_ALL,
        )

        # Act
        result = await use_case.execute(consent_request=request)

        # Assert
        assert result.success is True

    async def test_execute_privacy_consent_type(self) -> None:
        """Test recording privacy policy consent."""
        # Arrange
        mock_repo = AsyncMock()
        consent_id = uuid4()
        mock_repo.create.return_value = consent_id

        use_case = RecordConsentUseCase(mock_repo)
        request = RecordConsentRequest(
            consent_type=ConsentType.PRIVACY,
            categories=ConsentCategories(necessary=True),
            action=ConsentAction.ACCEPT_ALL,
        )

        # Act
        result = await use_case.execute(consent_request=request)

        # Assert
        assert result.success is True
