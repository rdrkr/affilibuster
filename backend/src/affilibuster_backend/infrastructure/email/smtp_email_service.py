# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
SMTP email service implementation.

Sends emails using SMTP protocol (simple mail transfer protocol).
Configured via environment variables.
"""

from __future__ import annotations

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from affilibuster_backend.domain.services import EmailSendError, IEmailService

logger = logging.getLogger(__name__)


class SMTPEmailService(IEmailService):
    """
    SMTP email service implementation.

    Sends emails using SMTP. Supports TLS/SSL encryption.

    Attributes:
        smtp_host: SMTP server hostname.
        smtp_port: SMTP server port.
        smtp_user: SMTP authentication username.
        smtp_password: SMTP authentication password.
        smtp_from: Sender email address.
        smtp_from_name: Sender display name.
        use_tls: Whether to use TLS encryption.
    """

    def __init__(  # noqa: PLR0913 - SMTP configuration requires all these parameters
        self,
        smtp_host: str,
        smtp_port: int,
        smtp_user: str,
        smtp_password: str,
        smtp_from: str,
        smtp_from_name: str = "Affilibuster",
        *,
        use_tls: bool = True,
    ) -> None:
        """
        Initialize SMTP email service.

        Args:
            smtp_host: SMTP server hostname.
            smtp_port: SMTP server port (typically 587 for TLS, 465 for SSL).
            smtp_user: SMTP authentication username.
            smtp_password: SMTP authentication password.
            smtp_from: Sender email address.
            smtp_from_name: Sender display name (default: "Affilibuster").
            use_tls: Whether to use TLS encryption (default: True).
        """
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.smtp_user = smtp_user
        self.smtp_password = smtp_password
        self.smtp_from = smtp_from
        self.smtp_from_name = smtp_from_name
        self.use_tls = use_tls

    async def send_email(
        self,
        to: str,
        subject: str,
        html_body: str,
        text_body: str | None = None,
    ) -> None:
        """
        Send an email via SMTP.

        Args:
            to: Recipient email address.
            subject: Email subject line.
            html_body: HTML version of the email body.
            text_body: Plain text version of the email body (optional).

        Raises:
            EmailSendError: If email sending fails.
        """
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["From"] = f"{self.smtp_from_name} <{self.smtp_from}>"
            message["To"] = to
            message["Subject"] = subject

            # Add text and HTML parts
            if text_body:
                text_part = MIMEText(text_body, "plain")
                message.attach(text_part)

            html_part = MIMEText(html_body, "html")
            message.attach(html_part)

            # Connect to SMTP server and send
            if self.use_tls:
                # Use TLS (STARTTLS)
                with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                    server.starttls()
                    server.login(self.smtp_user, self.smtp_password)
                    server.send_message(message)
            else:
                # Use SSL or no encryption
                with smtplib.SMTP_SSL(self.smtp_host, self.smtp_port) as server:
                    server.login(self.smtp_user, self.smtp_password)
                    server.send_message(message)

            logger.info("Email sent successfully to %s: %s", to, subject)

        except smtplib.SMTPException as e:
            logger.exception("SMTP error sending email to %s", to)
            raise EmailSendError(f"Failed to send email: {e}") from e
        except Exception as e:
            logger.exception("Unexpected error sending email to %s", to)
            raise EmailSendError(f"Failed to send email: {e}") from e
