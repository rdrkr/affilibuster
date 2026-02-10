# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for consent API routes.

Tests the consent recording endpoint. Consent banner configuration
is now served by auto-generated CMS proxy routes.
"""

from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest
from fastapi import HTTPException

from affilibuster_backend.domain.entities.generated.models import (
    ConsentAction,
    ConsentCategories,
    ConsentType,
    RecordConsentRequest,
    RecordConsentResponse,
)
from affilibuster_backend.domain.use_cases.consent.record_consent_use_case import RecordConsentUseCase
from affilibuster_backend.infrastructure.api.routes.consent import record_consent


@pytest.mark.unit
@pytest.mark.asyncio
class TestRecordConsentEndpoint:
    """Unit tests for the record_consent endpoint."""

    async def test_record_consent_success(self) -> None:
        """Test successful consent recording."""
        # Arrange
        consent_id = uuid4()
        mock_use_case = AsyncMock(spec=RecordConsentUseCase)
        mock_use_case.execute.return_value = RecordConsentResponse(
            success=True,
            consent_id=consent_id,
            message="Consent recorded successfully",
        )

        body = RecordConsentRequest(
            consent_type=ConsentType.COOKIE,
            categories=ConsentCategories(necessary=True, analytics=True, marketing=False),
            action=ConsentAction.CUSTOM,
            consent_version="1.0",
        )

        mock_request = MagicMock()
        mock_request.client.host = "192.168.1.1"
        mock_request.headers.get.return_value = "TestAgent/1.0"

        # Act
        result = await record_consent(
            body=body,
            use_case=mock_use_case,
            request=mock_request,
            x_session_id="sess-abc123",
        )

        # Assert
        assert result.success is True
        assert result.consent_id == consent_id
        mock_use_case.execute.assert_called_once_with(
            consent_request=body,
            session_id="sess-abc123",
            ip_address="192.168.1.1",
            user_agent="TestAgent/1.0",
        )

    async def test_record_consent_accept_all_with_necessary_false_raises_400(self) -> None:
        """Test that accept_all action with necessary=False raises validation error."""
        # Arrange
        mock_use_case = AsyncMock(spec=RecordConsentUseCase)
        body = RecordConsentRequest(
            consent_type=ConsentType.COOKIE,
            categories=ConsentCategories(necessary=False, analytics=True, marketing=True),
            action=ConsentAction.ACCEPT_ALL,
        )
        mock_request = MagicMock()
        mock_request.client.host = "192.168.1.1"
        mock_request.headers.get.return_value = "TestAgent/1.0"

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await record_consent(
                body=body,
                use_case=mock_use_case,
                request=mock_request,
            )

        assert exc_info.value.status_code == 400
        detail = exc_info.value.detail
        assert isinstance(detail, dict)
        assert "Necessary cookies must be accepted" in detail["message"]
        mock_use_case.execute.assert_not_called()

    async def test_record_consent_accept_all_with_necessary_true_succeeds(self) -> None:
        """Test that accept_all action with necessary=True succeeds."""
        # Arrange
        consent_id = uuid4()
        mock_use_case = AsyncMock(spec=RecordConsentUseCase)
        mock_use_case.execute.return_value = RecordConsentResponse(
            success=True,
            consent_id=consent_id,
            message="Consent recorded successfully",
        )
        body = RecordConsentRequest(
            consent_type=ConsentType.COOKIE,
            categories=ConsentCategories(necessary=True, analytics=True, marketing=True),
            action=ConsentAction.ACCEPT_ALL,
        )
        mock_request = MagicMock()
        mock_request.client.host = "10.0.0.1"
        mock_request.headers.get.return_value = None

        # Act
        result = await record_consent(
            body=body,
            use_case=mock_use_case,
            request=mock_request,
        )

        # Assert
        assert result.success is True

    async def test_record_consent_without_client(self) -> None:
        """Test consent recording when request has no client info."""
        # Arrange
        consent_id = uuid4()
        mock_use_case = AsyncMock(spec=RecordConsentUseCase)
        mock_use_case.execute.return_value = RecordConsentResponse(
            success=True,
            consent_id=consent_id,
            message="Consent recorded successfully",
        )
        body = RecordConsentRequest(
            consent_type=ConsentType.COOKIE,
            categories=ConsentCategories(necessary=True),
            action=ConsentAction.REJECT_ALL,
        )
        mock_request = MagicMock()
        mock_request.client = None
        mock_request.headers.get.return_value = None

        # Act
        result = await record_consent(
            body=body,
            use_case=mock_use_case,
            request=mock_request,
        )

        # Assert
        assert result.success is True
        mock_use_case.execute.assert_called_once_with(
            consent_request=body,
            session_id=None,
            ip_address=None,
            user_agent=None,
        )

    async def test_record_consent_without_session_id(self) -> None:
        """Test consent recording without session ID header."""
        # Arrange
        consent_id = uuid4()
        mock_use_case = AsyncMock(spec=RecordConsentUseCase)
        mock_use_case.execute.return_value = RecordConsentResponse(
            success=True,
            consent_id=consent_id,
            message="Consent recorded successfully",
        )
        body = RecordConsentRequest(
            consent_type=ConsentType.COOKIE,
            categories=ConsentCategories(necessary=True),
            action=ConsentAction.REVOKE,
        )
        mock_request = MagicMock()
        mock_request.client.host = "127.0.0.1"
        mock_request.headers.get.return_value = "Agent/1.0"

        # Act
        result = await record_consent(
            body=body,
            use_case=mock_use_case,
            request=mock_request,
            x_session_id=None,
        )

        # Assert
        assert result.success is True
        mock_use_case.execute.assert_called_once_with(
            consent_request=body,
            session_id=None,
            ip_address="127.0.0.1",
            user_agent="Agent/1.0",
        )
