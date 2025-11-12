# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Email service interface.

Defines the contract for email sending functionality.
Following Dependency Inversion principle - use cases depend on this interface.
"""

from abc import ABC, abstractmethod


class IEmailService(ABC):
    """
    Email service interface for sending emails.

    This interface allows swapping email providers (SMTP, SendGrid, AWS SES, etc.)
    without changing business logic.
    """

    @abstractmethod
    async def send_email(
        self,
        to: str,
        subject: str,
        html_body: str,
        text_body: str | None = None,
    ) -> None:
        """
        Send an email.

        Args:
            to: Recipient email address.
            subject: Email subject line.
            html_body: HTML version of the email body.
            text_body: Plain text version of the email body (optional, falls back to HTML).

        Raises:
            EmailSendError: If email sending fails.
        """


class EmailSendError(Exception):
    """Exception raised when email sending fails."""
