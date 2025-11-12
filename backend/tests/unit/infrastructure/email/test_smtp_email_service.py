# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for SMTP Email Service.

Tests cover:
- Email sending with TLS
- Email sending without TLS
- Error handling
"""

from unittest.mock import MagicMock, patch

import pytest

from affilibuster_backend.infrastructure.email.smtp_email_service import SMTPEmailService


@pytest.mark.asyncio
class TestSMTPEmailService:
    """Test suite for SMTP email service."""

    async def test_send_email_with_tls_success(self):
        """Test sending email with TLS enabled."""
        # Arrange
        service = SMTPEmailService(
            smtp_host="smtp.example.com",
            smtp_port=587,
            smtp_user="user@example.com",
            smtp_password="password123",
            smtp_from="noreply@example.com",
            smtp_from_name="Test Service",
            use_tls=True,
        )

        with patch("affilibuster_backend.infrastructure.email.smtp_email_service.smtplib.SMTP") as mock_smtp:
            # Mock SMTP server
            mock_server = MagicMock()
            mock_smtp.return_value.__enter__.return_value = mock_server

            # Act
            await service.send_email(
                to="recipient@example.com",
                subject="Test Email",
                html_body="<p>Test HTML</p>",
                text_body="Test Text",
            )

            # Assert
            mock_smtp.assert_called_once_with("smtp.example.com", 587)
            mock_server.starttls.assert_called_once()
            mock_server.login.assert_called_once_with("user@example.com", "password123")
            mock_server.send_message.assert_called_once()  # Changed from sendmail

    async def test_send_email_without_tls_success(self):
        """Test sending email without TLS (using SSL)."""
        # Arrange
        service = SMTPEmailService(
            smtp_host="smtp.example.com",
            smtp_port=465,
            smtp_user="user@example.com",
            smtp_password="password123",
            smtp_from="noreply@example.com",
            smtp_from_name="Test Service",
            use_tls=False,
        )

        with patch("affilibuster_backend.infrastructure.email.smtp_email_service.smtplib.SMTP_SSL") as mock_smtp_ssl:
            # Mock SMTP_SSL server
            mock_server = MagicMock()
            mock_smtp_ssl.return_value.__enter__.return_value = mock_server

            # Act
            await service.send_email(
                to="recipient@example.com",
                subject="Test Email",
                html_body="<p>Test HTML</p>",
                text_body="Test Text",
            )

            # Assert
            mock_smtp_ssl.assert_called_once_with("smtp.example.com", 465)
            mock_server.login.assert_called_once_with("user@example.com", "password123")
            mock_server.send_message.assert_called_once()  # Changed from sendmail

    async def test_send_email_html_only(self):
        """Test sending email with only HTML body."""
        # Arrange
        service = SMTPEmailService(
            smtp_host="smtp.example.com",
            smtp_port=587,
            smtp_user="user@example.com",
            smtp_password="password123",
            smtp_from="noreply@example.com",
            use_tls=True,
        )

        with patch("affilibuster_backend.infrastructure.email.smtp_email_service.smtplib.SMTP") as mock_smtp:
            mock_server = MagicMock()
            mock_smtp.return_value.__enter__.return_value = mock_server

            # Act
            await service.send_email(
                to="recipient@example.com",
                subject="Test Email",
                html_body="<p>Test HTML</p>",
                text_body=None,  # No text body
            )

            # Assert
            mock_server.send_message.assert_called_once()

    async def test_send_email_with_custom_from_name(self):
        """Test sending email with custom from name."""
        # Arrange
        service = SMTPEmailService(
            smtp_host="smtp.example.com",
            smtp_port=587,
            smtp_user="user@example.com",
            smtp_password="password123",
            smtp_from="noreply@example.com",
            smtp_from_name="Custom Service Name",
            use_tls=True,
        )

        with patch("affilibuster_backend.infrastructure.email.smtp_email_service.smtplib.SMTP") as mock_smtp:
            mock_server = MagicMock()
            mock_smtp.return_value.__enter__.return_value = mock_server

            # Act
            await service.send_email(
                to="recipient@example.com",
                subject="Test Email",
                html_body="<p>Test HTML</p>",
            )

            # Assert
            mock_server.send_message.assert_called_once()
            # Verify "From" header includes custom name
            call_args = mock_server.send_message.call_args
            message = call_args[0][0]
            assert "Custom Service Name" in message["From"]

    async def test_send_email_smtp_connection_error(self):
        """Test email sending handles SMTP connection errors."""
        # Arrange
        from affilibuster_backend.domain.services.email_service import EmailSendError

        service = SMTPEmailService(
            smtp_host="smtp.example.com",
            smtp_port=587,
            smtp_user="user@example.com",
            smtp_password="password123",
            smtp_from="noreply@example.com",
            use_tls=True,
        )

        with patch("affilibuster_backend.infrastructure.email.smtp_email_service.smtplib.SMTP") as mock_smtp:
            # Mock connection error
            mock_smtp.side_effect = ConnectionError("Failed to connect")

            # Act & Assert
            with pytest.raises(EmailSendError) as exc_info:
                await service.send_email(
                    to="recipient@example.com",
                    subject="Test Email",
                    html_body="<p>Test HTML</p>",
                )

            assert "Failed to connect" in str(exc_info.value)

    async def test_send_email_smtp_authentication_error(self):
        """Test email sending handles authentication errors."""
        # Arrange
        from affilibuster_backend.domain.services.email_service import EmailSendError

        service = SMTPEmailService(
            smtp_host="smtp.example.com",
            smtp_port=587,
            smtp_user="user@example.com",
            smtp_password="wrong_password",
            smtp_from="noreply@example.com",
            use_tls=True,
        )

        with patch("affilibuster_backend.infrastructure.email.smtp_email_service.smtplib.SMTP") as mock_smtp:
            mock_server = MagicMock()
            mock_smtp.return_value.__enter__.return_value = mock_server

            # Mock authentication error
            import smtplib

            mock_server.login.side_effect = smtplib.SMTPAuthenticationError(535, b"Authentication failed")

            # Act & Assert
            with pytest.raises(EmailSendError) as exc_info:
                await service.send_email(
                    to="recipient@example.com",
                    subject="Test Email",
                    html_body="<p>Test HTML</p>",
                )

            assert "Authentication failed" in str(exc_info.value) or "535" in str(exc_info.value)

    async def test_send_email_to_multiple_recipients(self):
        """Test sending email to recipient with display name."""
        # Arrange
        service = SMTPEmailService(
            smtp_host="smtp.example.com",
            smtp_port=587,
            smtp_user="user@example.com",
            smtp_password="password123",
            smtp_from="noreply@example.com",
            use_tls=True,
        )

        with patch("affilibuster_backend.infrastructure.email.smtp_email_service.smtplib.SMTP") as mock_smtp:
            mock_server = MagicMock()
            mock_smtp.return_value.__enter__.return_value = mock_server

            # Act
            await service.send_email(
                to="John Doe <john@example.com>",
                subject="Test Email",
                html_body="<p>Test HTML</p>",
            )

            # Assert
            mock_server.send_message.assert_called_once()
