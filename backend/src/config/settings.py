# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Application settings loaded from environment variables
Uses pydantic-settings for validation and type safety
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings with environment variable support"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/affilibuster"
    database_pool_size: int = 20
    database_max_overflow: int = 10

    # Redis
    redis_url: str = "redis://localhost:6379"
    redis_ttl_preferences: int = 2592000  # 30 days

    # Application
    app_env: str = "development"
    debug: bool = True
    log_level: str = "INFO"

    # Security
    jwt_secret: str = "your-secret-key-change-in-production"
    cors_origins: str = "http://localhost:3000,http://localhost:1337"

    # CMS Integration (T138)
    strapi_url: str = "http://localhost:1337"
    strapi_api_token: str = ""

    # External Services
    exchange_rate_api_key: str = ""
    exchange_rate_api_url: str = "https://api.exchangerate-api.com/v4/latest"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = True

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.app_env.lower() == "production"


# Global settings instance
settings = Settings()
