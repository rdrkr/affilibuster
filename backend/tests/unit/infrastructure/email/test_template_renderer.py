# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for Email Template Renderer.

Tests cover:
- Template rendering with variables
- Template loading
- Error handling for missing templates
- Variable substitution
"""

import tempfile
from pathlib import Path

import pytest

from affilibuster_backend.infrastructure.email.template_renderer import EmailTemplateRenderer


class TestEmailTemplateRenderer:
    """Test suite for email template renderer."""

    def test_render_template_with_string_variables(self):
        """Test rendering template with string variables."""
        # Arrange
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create test template
            template_path = Path(temp_dir) / "test_template.html"
            template_path.write_text("<html><body><p>Hello {{name}}, your code is {{code}}.</p></body></html>")

            renderer = EmailTemplateRenderer(templates_dir=temp_dir)

            # Act
            result = renderer.render("test_template.html", name="John", code="ABC123")

            # Assert
            assert "Hello John" in result
            assert "ABC123" in result
            assert "<html>" in result

    def test_render_template_with_numeric_variables(self):
        """Test rendering template with numeric variables."""
        # Arrange
        with tempfile.TemporaryDirectory() as temp_dir:
            template_path = Path(temp_dir) / "numeric_template.html"
            template_path.write_text("<html><body><p>Order #{{order_id}} total: ${{total}}</p></body></html>")

            renderer = EmailTemplateRenderer(templates_dir=temp_dir)

            # Act
            result = renderer.render("numeric_template.html", order_id=12345, total=99.99)

            # Assert
            assert "Order #12345" in result
            assert "$99.99" in result

    def test_render_template_with_no_variables(self):
        """Test rendering template without any variables."""
        # Arrange
        with tempfile.TemporaryDirectory() as temp_dir:
            template_path = Path(temp_dir) / "static_template.html"
            template_path.write_text("<html><body><p>Static content</p></body></html>")

            renderer = EmailTemplateRenderer(templates_dir=temp_dir)

            # Act
            result = renderer.render("static_template.html")

            # Assert
            assert "Static content" in result
            assert "<html>" in result

    def test_render_template_with_missing_variable(self):
        """Test rendering template with missing variable keeps placeholder."""
        # Arrange
        with tempfile.TemporaryDirectory() as temp_dir:
            template_path = Path(temp_dir) / "missing_var_template.html"
            template_path.write_text("<html><body><p>Hello {{name}}, {{missing}}</p></body></html>")

            renderer = EmailTemplateRenderer(templates_dir=temp_dir)

            # Act
            result = renderer.render("missing_var_template.html", name="John")

            # Assert
            assert "Hello John" in result
            # Missing variable placeholder remains
            assert "{{missing}}" in result

    def test_render_template_file_not_found(self):
        """Test rendering non-existent template raises error."""
        # Arrange
        with tempfile.TemporaryDirectory() as temp_dir:
            renderer = EmailTemplateRenderer(templates_dir=temp_dir)

            # Act & Assert
            with pytest.raises(FileNotFoundError):
                renderer.render("nonexistent_template.html")

    def test_render_template_with_special_characters(self):
        """Test rendering template with special characters in variables."""
        # Arrange
        with tempfile.TemporaryDirectory() as temp_dir:
            template_path = Path(temp_dir) / "special_chars_template.html"
            template_path.write_text("<html><body><p>Message: {{message}}</p></body></html>")

            renderer = EmailTemplateRenderer(templates_dir=temp_dir)

            # Act
            result = renderer.render(
                "special_chars_template.html",
                message="Hello! How are you? <smile>",
            )

            # Assert
            assert "Hello! How are you?" in result
            assert "<smile>" in result

    def test_render_template_with_url_variables(self):
        """Test rendering template with URL variables."""
        # Arrange
        with tempfile.TemporaryDirectory() as temp_dir:
            template_path = Path(temp_dir) / "url_template.html"
            template_path.write_text('<html><body><p>Click <a href="{{verification_url}}">here</a></p></body></html>')

            renderer = EmailTemplateRenderer(templates_dir=temp_dir)

            # Act
            result = renderer.render(
                "url_template.html",
                verification_url="https://example.com/verify?token=abc123",
            )

            # Assert
            assert "https://example.com/verify?token=abc123" in result
            assert "<a href=" in result

    def test_render_template_default_directory(self):
        """Test renderer uses template directory."""
        # Arrange
        # Navigate from /app/tests/unit/infrastructure/email/test_template_renderer.py up to /app
        templates_dir = (
            Path(__file__).parent.parent.parent.parent.parent
            / "src"
            / "affilibuster_backend"
            / "infrastructure"
            / "email"
            / "templates"
        )
        renderer = EmailTemplateRenderer(templates_dir=templates_dir)

        # Act & Assert
        # Should initialize without errors
        assert renderer is not None

    def test_render_verification_email_template(self):
        """Test rendering the actual verification email template."""
        # Arrange
        templates_dir = (
            Path(__file__).parent.parent.parent.parent.parent
            / "src"
            / "affilibuster_backend"
            / "infrastructure"
            / "email"
            / "templates"
        )
        renderer = EmailTemplateRenderer(templates_dir=templates_dir)

        # Act
        result = renderer.render(
            "verification_email.html",
            verification_url="https://example.com/verify?token=test123",
            display_name="John Doe",
        )

        # Assert
        assert "verification" in result.lower() or "verify" in result.lower()
        assert "https://example.com/verify?token=test123" in result

    def test_render_password_reset_template(self):
        """Test rendering the actual password reset template."""
        # Arrange
        templates_dir = (
            Path(__file__).parent.parent.parent.parent.parent
            / "src"
            / "affilibuster_backend"
            / "infrastructure"
            / "email"
            / "templates"
        )
        renderer = EmailTemplateRenderer(templates_dir=templates_dir)

        # Act
        result = renderer.render(
            "password_reset_email.html",
            reset_url="https://example.com/reset?token=reset123",
            display_name="Jane Smith",
        )

        # Assert
        assert "password" in result.lower() or "reset" in result.lower()
        assert "https://example.com/reset?token=reset123" in result

    def test_render_password_changed_template(self):
        """Test rendering the actual password changed confirmation template."""
        # Arrange
        templates_dir = (
            Path(__file__).parent.parent.parent.parent.parent
            / "src"
            / "affilibuster_backend"
            / "infrastructure"
            / "email"
            / "templates"
        )
        renderer = EmailTemplateRenderer(templates_dir=templates_dir)

        # Act
        result = renderer.render(
            "password_changed_email.html",
            display_name="Alice Johnson",
            changed_at="2025-11-22 10:00:00",
            ip_address="192.168.1.1",
        )

        # Assert
        assert "password" in result.lower() or "changed" in result.lower()
