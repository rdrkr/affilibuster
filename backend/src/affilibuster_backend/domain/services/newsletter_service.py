# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Newsletter service interface.

Defines the contract for newsletter subscription functionality.
Following Dependency Inversion principle - use cases depend on this interface.
"""

from abc import ABC, abstractmethod


class INewsletterService(ABC):
    """
    Newsletter service interface for managing email subscriptions.

    This interface allows swapping newsletter providers (Brevo, Mailchimp, etc.)
    without changing business logic.
    """

    @abstractmethod
    async def subscribe(self, email: str) -> None:
        """
        Subscribe an email address to the newsletter.

        Args:
            email: Email address to subscribe.

        Raises:
            NewsletterSubscribeError: If the subscription fails.

        """

    @abstractmethod
    async def unsubscribe(self, email: str) -> None:
        """
        Unsubscribe an email address from the newsletter.

        Args:
            email: Email address to unsubscribe.

        Raises:
            NewsletterUnsubscribeError: If the unsubscription fails.

        """


class NewsletterSubscribeError(Exception):
    """Exception raised when newsletter subscription fails."""


class NewsletterUnsubscribeError(Exception):
    """Exception raised when newsletter unsubscription fails."""
