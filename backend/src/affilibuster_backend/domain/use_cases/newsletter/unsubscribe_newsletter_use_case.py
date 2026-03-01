# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Use case for unsubscribing from the newsletter.

Proxies the unsubscription request to the configured newsletter provider.
"""

from affilibuster_backend.domain.entities.generated.models import (
    NewsletterUnsubscribeResponse,
)
from affilibuster_backend.domain.services.newsletter_service import INewsletterService


class UnsubscribeNewsletterUseCase:
    """
    Unsubscribes an email address from the newsletter.

    Delegates to the configured newsletter service provider (e.g., Brevo)
    and returns a standardized response.
    """

    def __init__(self, newsletter_service: INewsletterService) -> None:
        """
        Initialize the use case with a newsletter service.

        Args:
            newsletter_service: Service for managing newsletter subscriptions.

        """
        self._newsletter_service = newsletter_service

    async def execute(self, *, email: str) -> NewsletterUnsubscribeResponse:
        """
        Execute the newsletter unsubscription.

        Args:
            email: Email address to unsubscribe.

        Returns:
            NewsletterUnsubscribeResponse indicating success.

        Raises:
            NewsletterUnsubscribeError: If the provider fails to process the unsubscription.

        """
        await self._newsletter_service.unsubscribe(email)
        return NewsletterUnsubscribeResponse(success=True)
