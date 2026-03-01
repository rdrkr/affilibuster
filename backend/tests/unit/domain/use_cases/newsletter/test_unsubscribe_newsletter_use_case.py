# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for UnsubscribeNewsletterUseCase.

Tests the use case for unsubscribing from the newsletter.
"""

from unittest.mock import AsyncMock

import pytest

from affilibuster_backend.domain.services.newsletter_service import (
    INewsletterService,
    NewsletterUnsubscribeError,
)
from affilibuster_backend.domain.use_cases.newsletter.unsubscribe_newsletter_use_case import (
    UnsubscribeNewsletterUseCase,
)


@pytest.mark.unit
class TestUnsubscribeNewsletterUseCase:
    """Test UnsubscribeNewsletterUseCase.execute() method."""

    async def test_execute_unsubscribes_and_returns_success(self) -> None:
        """Test that execute calls the newsletter service and returns success response."""
        # Arrange
        mock_service = AsyncMock(spec=INewsletterService)
        use_case = UnsubscribeNewsletterUseCase(mock_service)

        # Act
        result = await use_case.execute(email="user@example.com")

        # Assert
        assert result.success is True
        mock_service.unsubscribe.assert_called_once_with("user@example.com")

    async def test_execute_propagates_provider_error(self) -> None:
        """Test that execute propagates NewsletterUnsubscribeError from the service."""
        # Arrange
        mock_service = AsyncMock(spec=INewsletterService)
        mock_service.unsubscribe.side_effect = NewsletterUnsubscribeError("Provider failed")
        use_case = UnsubscribeNewsletterUseCase(mock_service)

        # Act & Assert
        with pytest.raises(NewsletterUnsubscribeError, match="Provider failed"):
            await use_case.execute(email="user@example.com")

        mock_service.unsubscribe.assert_called_once_with("user@example.com")
