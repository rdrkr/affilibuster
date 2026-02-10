# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Application settings loaded from environment variables.

Uses pydantic-settings for validation and type safety.
"""

import os
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


def _get_env_file_path() -> str:
    """
    Determine the correct .env file path based on execution environment.

    Returns:
        str: Path to .env file
    """
    # Allow explicit override via ENV_FILE environment variable
    if env_override := os.environ.get("ENV_FILE"):
        return env_override

    # Check if running in Docker
    is_docker = Path("/.dockerenv").exists() or os.environ.get("DOCKER_ENV") == "true"

    if is_docker:
        # Docker: Use /app/.env
        return "/app/.env"

    # Local development: Look for .env in repository root
    # This file is 3 levels deep: backend/src/affilibuster_backend/config/settings.py
    repo_root = Path(__file__).parent.parent.parent.parent.parent
    env_file = repo_root / ".env"

    if env_file.exists():
        return str(env_file)

    # Fallback to Docker path (will fail if not in Docker, which is expected)
    return "/app/.env"


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    model_config = SettingsConfigDict(
        env_file=_get_env_file_path(),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database - Component fields for URL construction
    postgres_protocol: str
    postgres_host: str
    postgres_port: int
    postgres_user: str
    postgres_password: str
    postgres_db: str

    # Redis - Component fields for URL construction
    redis_protocol: str
    redis_host: str
    redis_port: int
    redis_ttl_preferences: int

    # Application
    app_env: str
    debug: bool
    log_level: str

    # Security
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 7
    jwt_refresh_token_remember_me_expire_days: int = 30

    # Data Retention (GDPR Art. 5(1)(e))
    user_retention_days: int = 30
    session_retention_days: int = 0

    # Email / SMTP
    smtp_host: str = "localhost"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "noreply@thegreenbrother.com"
    smtp_from_name: str = "Affilibuster"
    smtp_use_tls: bool = True

    # CMS Integration - Component fields for URL construction
    cms_protocol: str
    cms_host: str
    cms_port: int

    # Backend API
    backend_protocol: str

    # Clients
    internal_the_green_brother_host: str
    the_green_brother_protocol: str
    the_green_brother_host: str
    the_green_brother_port: int

    @property
    def database_url(self) -> str:
        """Construct PostgreSQL database URL from components."""
        return f"{self.postgres_protocol}://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"

    @property
    def redis_url(self) -> str:
        """Construct Redis URL from components."""
        return f"{self.redis_protocol}://{self.redis_host}:{self.redis_port}"

    @property
    def strapi_url(self) -> str:
        """Construct Strapi/CMS URL from components."""
        return f"{self.cms_protocol}://{self.cms_host}:{self.cms_port}"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [
            f"{self.the_green_brother_protocol}://{self.internal_the_green_brother_host}:{self.the_green_brother_port}",
            f"{self.the_green_brother_protocol}://{self.the_green_brother_host}:{self.the_green_brother_port}",
            # Allow host.docker.internal for Playwright tests from test-runner container
            f"{self.the_green_brother_protocol}://host.docker.internal:{self.the_green_brother_port}",
            # Allow local network access for development
            f"{self.the_green_brother_protocol}://rdrkr-mbp-m1.local:{self.the_green_brother_port}",
        ]

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.app_env.lower() == "production"

    @property
    def should_use_secure_cookies(self) -> bool:
        """
        Determine if secure cookie flag should be enabled.

        Secure cookies require HTTPS protocol. This property checks if the
        backend protocol is HTTPS, indicating that SSL/TLS is configured.

        Returns:
            bool: True if HTTPS is configured, False otherwise
        """
        return self.backend_protocol.lower() == "https"

    @property
    def samesite_cookie_policy(self) -> Literal["strict", "none"]:
        """
        Determine SameSite cookie policy based on environment.

        SameSite=Strict provides better security but requires same-origin requests.
        For development and E2E testing (where frontend/backend are on different ports),
        use None to allow cross-origin AJAX requests (requires Secure=true).

        Returns:
            Literal["strict", "none"]: "strict" for production, "none" for development/testing
        """
        return "strict" if self.is_production else "none"


# Global settings instance
# Settings() loads from environment variables via pydantic-settings
settings = Settings()
