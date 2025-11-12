# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Application settings loaded from environment variables.

Uses pydantic-settings for validation and type safety.
"""

import os
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    model_config = SettingsConfigDict(
        env_file="/app/.env",
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
    postgres_backend_name: str

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

    # Email / SMTP
    smtp_host: str = "localhost"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "noreply@affilibuster.com"
    smtp_from_name: str = "Affilibuster"
    smtp_use_tls: bool = True

    # CMS Integration - Component fields for URL construction
    cms_protocol: str
    internal_cms_host: str = ""
    cms_host: str
    cms_port: int
    strapi_api_token: str

    # External Services
    exchange_rate_api_key: str
    exchange_rate_api_url: str

    # Backend API
    backend_protocol: str

    # Client
    internal_frontend_host: str
    frontend_protocol: str
    frontend_host: str
    frontend_port: int

    @property
    def database_url(self) -> str:
        """Construct database URL from components."""
        return f"{self.postgres_protocol}://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_backend_name}"

    @property
    def redis_url(self) -> str:
        """Construct Redis URL from components."""
        # When running locally (not in Docker), use localhost instead of Docker internal hostname
        is_docker = Path("/.dockerenv").exists() or os.environ.get("DOCKER_ENV") == "true"

        if is_docker:
            host = self.redis_host
        else:
            # Running locally - use localhost if redis_host is a Docker internal name
            host = "localhost" if self.redis_host in ("redis", "redis-server") else self.redis_host

        return f"{self.redis_protocol}://{host}:{self.redis_port}"

    @property
    def strapi_url(self) -> str:
        """Construct Strapi/CMS URL from components."""
        # Only use internal host when running inside Docker
        is_docker = Path("/.dockerenv").exists() or os.environ.get("DOCKER_ENV") == "true"

        if is_docker and self.internal_cms_host != "":
            return f"{self.cms_protocol}://{self.internal_cms_host}:{self.cms_port}"

        return f"{self.cms_protocol}://{self.cms_host}:{self.cms_port}"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [
            f"{self.frontend_protocol}://{self.frontend_host}:{self.frontend_port}",
            f"{self.frontend_protocol}://{self.internal_frontend_host}:{self.frontend_port}",
            # Allow host.docker.internal for Playwright tests from test-runner container
            f"{self.frontend_protocol}://host.docker.internal:{self.frontend_port}",
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
