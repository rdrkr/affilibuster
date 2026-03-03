# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for newsletter API routes.

Tests the newsletter subscription and unsubscription endpoints,
including GDPR consent audit trail recording.
"""

from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
from fastapi import HTTPException

from affilibuster_backend.domain.entities.generated.models import (
    ConsentAction,
    ConsentType,
    NewsletterSubscribeRequest,
    NewsletterSubscribeResponse,
    NewsletterUnsubscribeRequest,
    NewsletterUnsubscribeResponse,
    RecordConsentResponse,
)
from affilibuster_backend.domain.services.newsletter_service import (
    NewsletterSubscribeError,
    NewsletterUnsubscribeError,
)
from affilibuster_backend.domain.use_cases.consent.record_consent_use_case import RecordConsentUseCase
from affilibuster_backend.domain.use_cases.newsletter.subscribe_newsletter_use_case import (
    SubscribeNewsletterUseCase,
)
from affilibuster_backend.domain.use_cases.newsletter.unsubscribe_newsletter_use_case import (
    UnsubscribeNewsletterUseCase,
)
from affilibuster_backend.infrastructure.api.routes.newsletter import (
    subscribe_newsletter,
    unsubscribe_newsletter,
)


def _create_mock_request(client_host: str = "192.168.1.42") -> MagicMock:
    """Create a mock FastAPI Request with a client host."""
    mock_request = MagicMock()
    mock_request.client.host = client_host
    return mock_request


def _create_mock_consent_use_case() -> AsyncMock:
    """Create a mock RecordConsentUseCase that returns a success response."""
    mock = AsyncMock(spec=RecordConsentUseCase)
    mock.execute.return_value = RecordConsentResponse(
        success=True,
        consent_id=uuid4(),
        message="Consent recorded successfully",
    )
    return mock


@pytest.mark.unit
@pytest.mark.asyncio
class TestSubscribeNewsletterEndpoint:
    """Unit tests for the subscribe_newsletter endpoint."""

    async def test_subscribe_success(self) -> None:
        """Test successful newsletter subscription."""
        # Arrange
        mock_use_case = AsyncMock(spec=SubscribeNewsletterUseCase)
        mock_use_case.execute.return_value = NewsletterSubscribeResponse(success=True)
        mock_consent = _create_mock_consent_use_case()
        body = NewsletterSubscribeRequest(email="user@example.com")

        # Act
        with patch("affilibuster_backend.infrastructure.api.routes.newsletter.settings"):
            result = await subscribe_newsletter(
                body=body,
                use_case=mock_use_case,
                consent_use_case=mock_consent,
                request=_create_mock_request(),
            )

        # Assert
        assert result.success is True
        mock_use_case.execute.assert_called_once_with(email="user@example.com")

    async def test_subscribe_provider_error_returns_502(self) -> None:
        """Test that provider errors return 502 Bad Gateway."""
        # Arrange
        mock_use_case = AsyncMock(spec=SubscribeNewsletterUseCase)
        mock_use_case.execute.side_effect = NewsletterSubscribeError("Brevo API returned status 500")
        mock_consent = _create_mock_consent_use_case()
        body = NewsletterSubscribeRequest(email="user@example.com")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await subscribe_newsletter(
                body=body,
                use_case=mock_use_case,
                consent_use_case=mock_consent,
                request=_create_mock_request(),
            )

        assert exc_info.value.status_code == 502
        detail = exc_info.value.detail
        assert isinstance(detail, dict)
        assert detail["code"] == "NEWSLETTER_PROVIDER_ERROR"
        assert "Brevo API returned status 500" in detail["message"]
        assert detail["error"] == "Bad Gateway"

    async def test_subscribe_records_consent_acceptance(self) -> None:
        """Test that subscribe records GDPR consent acceptance audit trail."""
        # Arrange
        mock_use_case = AsyncMock(spec=SubscribeNewsletterUseCase)
        mock_use_case.execute.return_value = NewsletterSubscribeResponse(success=True)
        mock_consent = _create_mock_consent_use_case()
        body = NewsletterSubscribeRequest(email="user@example.com")

        # Act
        with patch("affilibuster_backend.infrastructure.api.routes.newsletter.settings"):
            await subscribe_newsletter(
                body=body,
                use_case=mock_use_case,
                consent_use_case=mock_consent,
                request=_create_mock_request(),
            )

        # Assert - consent was recorded
        mock_consent.execute.assert_called_once()
        call_kwargs = mock_consent.execute.call_args.kwargs
        assert call_kwargs["consent_request"].consent_type == ConsentType.NEWSLETTER
        assert call_kwargs["consent_request"].action == ConsentAction.ACCEPT_ALL
        assert call_kwargs["user_agent"] is None

    async def test_subscribe_does_not_record_consent_on_provider_error(self) -> None:
        """Test that consent is not recorded when the provider fails."""
        # Arrange
        mock_use_case = AsyncMock(spec=SubscribeNewsletterUseCase)
        mock_use_case.execute.side_effect = NewsletterSubscribeError("Provider error")
        mock_consent = _create_mock_consent_use_case()
        body = NewsletterSubscribeRequest(email="user@example.com")

        # Act & Assert
        with pytest.raises(HTTPException):
            await subscribe_newsletter(
                body=body,
                use_case=mock_use_case,
                consent_use_case=mock_consent,
                request=_create_mock_request(),
            )

        # Consent should NOT be recorded on failure
        mock_consent.execute.assert_not_called()

    async def test_subscribe_hashes_ip_address(self) -> None:
        """Test that client IP is hashed before passing to consent use case."""
        # Arrange
        mock_use_case = AsyncMock(spec=SubscribeNewsletterUseCase)
        mock_use_case.execute.return_value = NewsletterSubscribeResponse(success=True)
        mock_consent = _create_mock_consent_use_case()
        body = NewsletterSubscribeRequest(email="user@example.com")

        # Act
        with patch("affilibuster_backend.infrastructure.api.routes.newsletter.settings"):
            await subscribe_newsletter(
                body=body,
                use_case=mock_use_case,
                consent_use_case=mock_consent,
                request=_create_mock_request("10.0.0.1"),
            )

        # Assert - IP was hashed (not raw)
        call_kwargs = mock_consent.execute.call_args.kwargs
        assert call_kwargs["ip_address"] is not None
        assert call_kwargs["ip_address"] != "10.0.0.1"

    async def test_subscribe_passes_session_id(self) -> None:
        """Test that X-Session-Id header value is passed to consent use case."""
        # Arrange
        mock_use_case = AsyncMock(spec=SubscribeNewsletterUseCase)
        mock_use_case.execute.return_value = NewsletterSubscribeResponse(success=True)
        mock_consent = _create_mock_consent_use_case()
        body = NewsletterSubscribeRequest(email="user@example.com")

        # Act
        with patch("affilibuster_backend.infrastructure.api.routes.newsletter.settings"):
            await subscribe_newsletter(
                body=body,
                use_case=mock_use_case,
                consent_use_case=mock_consent,
                request=_create_mock_request(),
                x_session_id="sess-abc-123",
            )

        # Assert
        call_kwargs = mock_consent.execute.call_args.kwargs
        assert call_kwargs["session_id"] == "sess-abc-123"

    async def test_subscribe_succeeds_when_consent_recording_fails(self) -> None:
        """Test that subscription succeeds even if consent recording fails.

        The email has already been sent by the provider, so a consent recording
        failure must not prevent the success response from reaching the client.
        """
        # Arrange
        mock_use_case = AsyncMock(spec=SubscribeNewsletterUseCase)
        mock_use_case.execute.return_value = NewsletterSubscribeResponse(success=True)
        mock_consent = _create_mock_consent_use_case()
        mock_consent.execute.side_effect = RuntimeError("Database connection lost")
        body = NewsletterSubscribeRequest(email="user@example.com")

        # Act
        with patch("affilibuster_backend.infrastructure.api.routes.newsletter.settings"):
            result = await subscribe_newsletter(
                body=body,
                use_case=mock_use_case,
                consent_use_case=mock_consent,
                request=_create_mock_request(),
            )

        # Assert - subscription still succeeds
        assert result.success is True
        mock_use_case.execute.assert_called_once_with(email="user@example.com")

    async def test_subscribe_logs_consent_recording_failure(self) -> None:
        """Test that consent recording failures are logged for debugging."""
        # Arrange
        mock_use_case = AsyncMock(spec=SubscribeNewsletterUseCase)
        mock_use_case.execute.return_value = NewsletterSubscribeResponse(success=True)
        mock_consent = _create_mock_consent_use_case()
        mock_consent.execute.side_effect = RuntimeError("DB error")
        body = NewsletterSubscribeRequest(email="user@example.com")

        # Act
        with patch("affilibuster_backend.infrastructure.api.routes.newsletter.settings"):
            with patch("affilibuster_backend.infrastructure.api.routes.newsletter.logger") as mock_logger:
                await subscribe_newsletter(
                    body=body,
                    use_case=mock_use_case,
                    consent_use_case=mock_consent,
                    request=_create_mock_request(),
                )

        # Assert - error was logged
        mock_logger.exception.assert_called_once()
        assert "user@example.com" in mock_logger.exception.call_args[0][1]

    async def test_subscribe_handles_no_client_ip(self) -> None:
        """Test that missing client IP is handled gracefully."""
        # Arrange
        mock_use_case = AsyncMock(spec=SubscribeNewsletterUseCase)
        mock_use_case.execute.return_value = NewsletterSubscribeResponse(success=True)
        mock_consent = _create_mock_consent_use_case()
        body = NewsletterSubscribeRequest(email="user@example.com")
        mock_request = MagicMock()
        mock_request.client = None

        # Act
        with patch("affilibuster_backend.infrastructure.api.routes.newsletter.settings"):
            await subscribe_newsletter(
                body=body,
                use_case=mock_use_case,
                consent_use_case=mock_consent,
                request=mock_request,
            )

        # Assert - ip_address is None when client is missing
        call_kwargs = mock_consent.execute.call_args.kwargs
        assert call_kwargs["ip_address"] is None


@pytest.mark.unit
@pytest.mark.asyncio
class TestUnsubscribeNewsletterEndpoint:
    """Unit tests for the unsubscribe_newsletter endpoint."""

    async def test_unsubscribe_success(self) -> None:
        """Test successful newsletter unsubscription."""
        # Arrange
        mock_use_case = AsyncMock(spec=UnsubscribeNewsletterUseCase)
        mock_use_case.execute.return_value = NewsletterUnsubscribeResponse(success=True)
        mock_consent = _create_mock_consent_use_case()
        body = NewsletterUnsubscribeRequest(email="user@example.com")

        # Act
        with patch("affilibuster_backend.infrastructure.api.routes.newsletter.settings"):
            result = await unsubscribe_newsletter(
                body=body,
                use_case=mock_use_case,
                consent_use_case=mock_consent,
                request=_create_mock_request(),
            )

        # Assert
        assert result.success is True
        mock_use_case.execute.assert_called_once_with(email="user@example.com")

    async def test_unsubscribe_provider_error_returns_502(self) -> None:
        """Test that provider errors return 502 Bad Gateway."""
        # Arrange
        mock_use_case = AsyncMock(spec=UnsubscribeNewsletterUseCase)
        mock_use_case.execute.side_effect = NewsletterUnsubscribeError("Brevo API returned status 500")
        mock_consent = _create_mock_consent_use_case()
        body = NewsletterUnsubscribeRequest(email="user@example.com")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await unsubscribe_newsletter(
                body=body,
                use_case=mock_use_case,
                consent_use_case=mock_consent,
                request=_create_mock_request(),
            )

        assert exc_info.value.status_code == 502
        detail = exc_info.value.detail
        assert isinstance(detail, dict)
        assert detail["code"] == "NEWSLETTER_PROVIDER_ERROR"
        assert "Brevo API returned status 500" in detail["message"]
        assert detail["error"] == "Bad Gateway"

    async def test_unsubscribe_records_consent_revocation(self) -> None:
        """Test that unsubscribe records GDPR consent withdrawal audit trail."""
        # Arrange
        mock_use_case = AsyncMock(spec=UnsubscribeNewsletterUseCase)
        mock_use_case.execute.return_value = NewsletterUnsubscribeResponse(success=True)
        mock_consent = _create_mock_consent_use_case()
        body = NewsletterUnsubscribeRequest(email="user@example.com")

        # Act
        with patch("affilibuster_backend.infrastructure.api.routes.newsletter.settings"):
            await unsubscribe_newsletter(
                body=body,
                use_case=mock_use_case,
                consent_use_case=mock_consent,
                request=_create_mock_request(),
            )

        # Assert - consent withdrawal was recorded
        mock_consent.execute.assert_called_once()
        call_kwargs = mock_consent.execute.call_args.kwargs
        assert call_kwargs["consent_request"].consent_type == ConsentType.NEWSLETTER
        assert call_kwargs["consent_request"].action == ConsentAction.REVOKE
        assert call_kwargs["user_agent"] is None

    async def test_unsubscribe_succeeds_when_consent_recording_fails(self) -> None:
        """Test that unsubscription succeeds even if consent recording fails.

        The provider action was already completed, so a consent recording
        failure must not prevent the success response from reaching the client.
        """
        # Arrange
        mock_use_case = AsyncMock(spec=UnsubscribeNewsletterUseCase)
        mock_use_case.execute.return_value = NewsletterUnsubscribeResponse(success=True)
        mock_consent = _create_mock_consent_use_case()
        mock_consent.execute.side_effect = RuntimeError("Database connection lost")
        body = NewsletterUnsubscribeRequest(email="user@example.com")

        # Act
        with patch("affilibuster_backend.infrastructure.api.routes.newsletter.settings"):
            result = await unsubscribe_newsletter(
                body=body,
                use_case=mock_use_case,
                consent_use_case=mock_consent,
                request=_create_mock_request(),
            )

        # Assert - unsubscription still succeeds
        assert result.success is True
        mock_use_case.execute.assert_called_once_with(email="user@example.com")

    async def test_unsubscribe_logs_consent_recording_failure(self) -> None:
        """Test that consent recording failures are logged for debugging."""
        # Arrange
        mock_use_case = AsyncMock(spec=UnsubscribeNewsletterUseCase)
        mock_use_case.execute.return_value = NewsletterUnsubscribeResponse(success=True)
        mock_consent = _create_mock_consent_use_case()
        mock_consent.execute.side_effect = RuntimeError("DB error")
        body = NewsletterUnsubscribeRequest(email="user@example.com")

        # Act
        with patch("affilibuster_backend.infrastructure.api.routes.newsletter.settings"):
            with patch("affilibuster_backend.infrastructure.api.routes.newsletter.logger") as mock_logger:
                await unsubscribe_newsletter(
                    body=body,
                    use_case=mock_use_case,
                    consent_use_case=mock_consent,
                    request=_create_mock_request(),
                )

        # Assert - error was logged
        mock_logger.exception.assert_called_once()
        assert "user@example.com" in mock_logger.exception.call_args[0][1]

    async def test_unsubscribe_does_not_record_consent_on_provider_error(self) -> None:
        """Test that consent withdrawal is not recorded when the provider fails."""
        # Arrange
        mock_use_case = AsyncMock(spec=UnsubscribeNewsletterUseCase)
        mock_use_case.execute.side_effect = NewsletterUnsubscribeError("Provider error")
        mock_consent = _create_mock_consent_use_case()
        body = NewsletterUnsubscribeRequest(email="user@example.com")

        # Act & Assert
        with pytest.raises(HTTPException):
            await unsubscribe_newsletter(
                body=body,
                use_case=mock_use_case,
                consent_use_case=mock_consent,
                request=_create_mock_request(),
            )

        # Consent should NOT be recorded on failure
        mock_consent.execute.assert_not_called()
