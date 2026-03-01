# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for SubscribeNewsletterUseCase.

Tests the use case for subscribing to the newsletter.
"""

from unittest.mock import AsyncMock

import pytest

from affilibuster_backend.domain.services.newsletter_service import (
    INewsletterService,
    NewsletterSubscribeError,
)
from affilibuster_backend.domain.use_cases.newsletter.subscribe_newsletter_use_case import (
    SubscribeNewsletterUseCase,
)


@pytest.mark.unit
class TestSubscribeNewsletterUseCase:
    """Test SubscribeNewsletterUseCase.execute() method."""

    async def test_execute_subscribes_and_returns_success(self) -> None:
        """Test that execute calls the newsletter service and returns success response."""
        # Arrange
        mock_service = AsyncMock(spec=INewsletterService)
        use_case = SubscribeNewsletterUseCase(mock_service)

        # Act
        result = await use_case.execute(email="user@example.com")

        # Assert
        assert result.success is True
        mock_service.subscribe.assert_called_once_with("user@example.com")

    async def test_execute_propagates_provider_error(self) -> None:
        """Test that execute propagates NewsletterSubscribeError from the service."""
        # Arrange
        mock_service = AsyncMock(spec=INewsletterService)
        mock_service.subscribe.side_effect = NewsletterSubscribeError("Provider failed")
        use_case = SubscribeNewsletterUseCase(mock_service)

        # Act & Assert
        with pytest.raises(NewsletterSubscribeError, match="Provider failed"):
            await use_case.execute(email="user@example.com")

        mock_service.subscribe.assert_called_once_with("user@example.com")
