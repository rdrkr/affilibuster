# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Use case for subscribing to the newsletter.

Proxies the subscription request to the configured newsletter provider.
"""

from affilibuster_backend.domain.entities.generated.models import (
    NewsletterSubscribeResponse,
)
from affilibuster_backend.domain.services.newsletter_service import INewsletterService


class SubscribeNewsletterUseCase:
    """
    Subscribes an email address to the newsletter.

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

    async def execute(self, *, email: str) -> NewsletterSubscribeResponse:
        """
        Execute the newsletter subscription.

        Args:
            email: Email address to subscribe.

        Returns:
            NewsletterSubscribeResponse indicating success.

        Raises:
            NewsletterSubscribeError: If the provider fails to process the subscription.

        """
        await self._newsletter_service.subscribe(email)
        return NewsletterSubscribeResponse(success=True)
