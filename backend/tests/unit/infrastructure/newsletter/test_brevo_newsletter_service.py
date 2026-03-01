# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for BrevoNewsletterService.

Tests the Brevo API integration for newsletter subscriptions (DOI) and
unsubscriptions with mocked HTTP responses.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from affilibuster_backend.domain.services.newsletter_service import (
    NewsletterSubscribeError,
    NewsletterUnsubscribeError,
)
from affilibuster_backend.infrastructure.newsletter.brevo_newsletter_service import (
    BrevoNewsletterService,
)


def _create_service(
    api_key: str = "test-key",
    list_id: int = 42,
    doi_template_id: int = 10,
    doi_redirect_url: str = "https://example.com/confirmed",
) -> BrevoNewsletterService:
    """Create a BrevoNewsletterService with test defaults."""
    return BrevoNewsletterService(
        api_key=api_key,
        list_id=list_id,
        doi_template_id=doi_template_id,
        doi_redirect_url=doi_redirect_url,
    )


def _mock_async_client(response: MagicMock | None = None, side_effect: Exception | None = None) -> AsyncMock:
    """Create a mocked httpx.AsyncClient context manager."""
    mock_client = AsyncMock()
    if side_effect:
        mock_client.post.side_effect = side_effect
    else:
        mock_client.post.return_value = response
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    return mock_client


@pytest.mark.unit
@pytest.mark.asyncio
class TestBrevoNewsletterServiceSubscribe:
    """Test BrevoNewsletterService.subscribe() method with DOI endpoint."""

    async def test_subscribe_success_201_doi_sent(self) -> None:
        """Test successful DOI confirmation email sent (201 response)."""
        service = _create_service()

        mock_response = MagicMock(spec=httpx.Response)
        mock_response.status_code = 201
        mock_client = _mock_async_client(response=mock_response)

        with patch(
            "affilibuster_backend.infrastructure.newsletter.brevo_newsletter_service.httpx.AsyncClient",
            return_value=mock_client,
        ):
            await service.subscribe("new@example.com")

        mock_client.post.assert_called_once_with(
            "https://api.brevo.com/v3/contacts/doubleOptinConfirmation",
            json={
                "email": "new@example.com",
                "includeListIds": [42],
                "templateId": 10,
                "redirectionUrl": "https://example.com/confirmed",
            },
            headers={
                "api-key": "test-key",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            timeout=10.0,
        )

    async def test_subscribe_204_is_not_success_for_doi(self) -> None:
        """Test that 204 response raises error for DOI endpoint (only 201 is success)."""
        service = _create_service()

        mock_response = MagicMock(spec=httpx.Response)
        mock_response.status_code = 204
        mock_client = _mock_async_client(response=mock_response)

        with patch(
            "affilibuster_backend.infrastructure.newsletter.brevo_newsletter_service.httpx.AsyncClient",
            return_value=mock_client,
        ):
            with pytest.raises(NewsletterSubscribeError, match="Brevo API returned status 204"):
                await service.subscribe("existing@example.com")

    async def test_subscribe_error_400_bad_request(self) -> None:
        """Test that 400 response raises NewsletterSubscribeError."""
        service = _create_service(list_id=1)

        mock_response = MagicMock(spec=httpx.Response)
        mock_response.status_code = 400
        mock_client = _mock_async_client(response=mock_response)

        with patch(
            "affilibuster_backend.infrastructure.newsletter.brevo_newsletter_service.httpx.AsyncClient",
            return_value=mock_client,
        ):
            with pytest.raises(NewsletterSubscribeError, match="Brevo API returned status 400"):
                await service.subscribe("bad-email")

    async def test_subscribe_error_500_server_error(self) -> None:
        """Test that 500 response raises NewsletterSubscribeError."""
        service = _create_service(list_id=1)

        mock_response = MagicMock(spec=httpx.Response)
        mock_response.status_code = 500
        mock_client = _mock_async_client(response=mock_response)

        with patch(
            "affilibuster_backend.infrastructure.newsletter.brevo_newsletter_service.httpx.AsyncClient",
            return_value=mock_client,
        ):
            with pytest.raises(NewsletterSubscribeError, match="Brevo API returned status 500"):
                await service.subscribe("user@example.com")

    async def test_subscribe_network_error(self) -> None:
        """Test that network errors raise NewsletterSubscribeError."""
        service = _create_service(list_id=1)

        mock_client = _mock_async_client(side_effect=httpx.ConnectError("Connection refused"))

        with patch(
            "affilibuster_backend.infrastructure.newsletter.brevo_newsletter_service.httpx.AsyncClient",
            return_value=mock_client,
        ):
            with pytest.raises(NewsletterSubscribeError, match="Failed to connect to Brevo"):
                await service.subscribe("user@example.com")

    async def test_subscribe_error_log_does_not_contain_response_text(self) -> None:
        """Test that error log does not leak PII from Brevo response body (GDPR Art. 5(1)(c))."""
        service = _create_service(list_id=1)

        mock_response = MagicMock(spec=httpx.Response)
        mock_response.status_code = 400
        mock_response.text = "Contact already exists with email bad@example.com"
        mock_client = _mock_async_client(response=mock_response)

        with (
            patch(
                "affilibuster_backend.infrastructure.newsletter.brevo_newsletter_service.httpx.AsyncClient",
                return_value=mock_client,
            ),
            patch("affilibuster_backend.infrastructure.newsletter.brevo_newsletter_service.logger") as mock_logger,
        ):
            with pytest.raises(NewsletterSubscribeError):
                await service.subscribe("bad@example.com")

        # Verify logger.error was called without response.text
        mock_logger.error.assert_called_once()
        log_args = mock_logger.error.call_args
        log_message = log_args[0][0] % log_args[0][1:]
        assert "bad@example.com" not in log_message
        assert "Contact already exists" not in log_message

    async def test_subscribe_uses_doi_template_id_and_redirect(self) -> None:
        """Test that DOI template ID and redirect URL are included in payload."""
        service = _create_service(doi_template_id=99, doi_redirect_url="https://site.com/done")

        mock_response = MagicMock(spec=httpx.Response)
        mock_response.status_code = 201
        mock_client = _mock_async_client(response=mock_response)

        with patch(
            "affilibuster_backend.infrastructure.newsletter.brevo_newsletter_service.httpx.AsyncClient",
            return_value=mock_client,
        ):
            await service.subscribe("user@example.com")

        call_kwargs = mock_client.post.call_args
        payload = call_kwargs.kwargs["json"]
        assert payload["templateId"] == 99
        assert payload["redirectionUrl"] == "https://site.com/done"
        assert "updateEnabled" not in payload
        assert "listIds" not in payload
        assert payload["includeListIds"] == [42]


@pytest.mark.unit
@pytest.mark.asyncio
class TestBrevoNewsletterServiceUnsubscribe:
    """Test BrevoNewsletterService.unsubscribe() method."""

    async def test_unsubscribe_success_200(self) -> None:
        """Test successful unsubscription when Brevo returns 200."""
        service = _create_service()

        mock_response = MagicMock(spec=httpx.Response)
        mock_response.status_code = 200
        mock_client = _mock_async_client(response=mock_response)

        with patch(
            "affilibuster_backend.infrastructure.newsletter.brevo_newsletter_service.httpx.AsyncClient",
            return_value=mock_client,
        ):
            await service.unsubscribe("user@example.com")

        mock_client.post.assert_called_once_with(
            "https://api.brevo.com/v3/contacts/lists/42/contacts/remove",
            json={"emails": ["user@example.com"]},
            headers={
                "api-key": "test-key",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            timeout=10.0,
        )

    async def test_unsubscribe_error_400_bad_request(self) -> None:
        """Test that 400 response raises NewsletterUnsubscribeError."""
        service = _create_service(list_id=1)

        mock_response = MagicMock(spec=httpx.Response)
        mock_response.status_code = 400
        mock_client = _mock_async_client(response=mock_response)

        with patch(
            "affilibuster_backend.infrastructure.newsletter.brevo_newsletter_service.httpx.AsyncClient",
            return_value=mock_client,
        ):
            with pytest.raises(NewsletterUnsubscribeError, match="Brevo API returned status 400"):
                await service.unsubscribe("bad@example.com")

    async def test_unsubscribe_error_500_server_error(self) -> None:
        """Test that 500 response raises NewsletterUnsubscribeError."""
        service = _create_service(list_id=1)

        mock_response = MagicMock(spec=httpx.Response)
        mock_response.status_code = 500
        mock_client = _mock_async_client(response=mock_response)

        with patch(
            "affilibuster_backend.infrastructure.newsletter.brevo_newsletter_service.httpx.AsyncClient",
            return_value=mock_client,
        ):
            with pytest.raises(NewsletterUnsubscribeError, match="Brevo API returned status 500"):
                await service.unsubscribe("user@example.com")

    async def test_unsubscribe_network_error(self) -> None:
        """Test that network errors raise NewsletterUnsubscribeError."""
        service = _create_service(list_id=1)

        mock_client = _mock_async_client(side_effect=httpx.ConnectError("Connection refused"))

        with patch(
            "affilibuster_backend.infrastructure.newsletter.brevo_newsletter_service.httpx.AsyncClient",
            return_value=mock_client,
        ):
            with pytest.raises(NewsletterUnsubscribeError, match="Failed to connect to Brevo"):
                await service.unsubscribe("user@example.com")

    async def test_unsubscribe_error_log_does_not_contain_response_text(self) -> None:
        """Test that unsubscribe error log does not leak PII (GDPR Art. 5(1)(c))."""
        service = _create_service(list_id=1)

        mock_response = MagicMock(spec=httpx.Response)
        mock_response.status_code = 404
        mock_response.text = "Contact not found: user@example.com"
        mock_client = _mock_async_client(response=mock_response)

        with (
            patch(
                "affilibuster_backend.infrastructure.newsletter.brevo_newsletter_service.httpx.AsyncClient",
                return_value=mock_client,
            ),
            patch("affilibuster_backend.infrastructure.newsletter.brevo_newsletter_service.logger") as mock_logger,
        ):
            with pytest.raises(NewsletterUnsubscribeError):
                await service.unsubscribe("user@example.com")

        mock_logger.error.assert_called_once()
        log_args = mock_logger.error.call_args
        log_message = log_args[0][0] % log_args[0][1:]
        assert "user@example.com" not in log_message
        assert "Contact not found" not in log_message
