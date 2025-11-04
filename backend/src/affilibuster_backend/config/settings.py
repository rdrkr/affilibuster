# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Application settings loaded from environment variables.

Uses pydantic-settings for validation and type safety.
"""

import os
from pathlib import Path

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

    # CMS Integration - Component fields for URL construction
    cms_protocol: str
    internal_cms_host: str = ""
    cms_host: str
    cms_port: int
    strapi_api_token: str

    # External Services
    exchange_rate_api_key: str
    exchange_rate_api_url: str

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
        ]

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.app_env.lower() == "production"


# Global settings instance
# Settings() loads from environment variables via pydantic-settings
settings = Settings()  # type: ignore[call-arg]
