# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Email template rendering utility.

Renders HTML email templates with variable substitution.
Uses simple string template syntax with {{variable}} placeholders.
"""

from pathlib import Path


class EmailTemplateRenderer:
    """
    Email template renderer using string templates.

    Loads HTML templates from files and renders them with variables.
    """

    def __init__(self, templates_dir: Path | str) -> None:
        """
        Initialize template renderer.

        Args:
            templates_dir: Directory containing email template files.
        """
        self.templates_dir = Path(templates_dir) if isinstance(templates_dir, str) else templates_dir

    def render(self, template_name: str, **variables: str | float) -> str:
        """
        Render an email template with variables.

        Args:
            template_name: Name of the template file (e.g., "verification_email.html").
            **variables: Template variables to substitute.

        Returns:
            Rendered HTML string.

        Raises:
            FileNotFoundError: If template file doesn't exist.
        """
        template_path = self.templates_dir / template_name

        if not template_path.exists():
            raise FileNotFoundError(f"Template not found: {template_path}")

        # Read template
        template_content = template_path.read_text(encoding="utf-8")

        # Render with {{variable}} syntax
        for key, value in variables.items():
            template_content = template_content.replace(f"{{{{{key}}}}}", str(value))

        return template_content
