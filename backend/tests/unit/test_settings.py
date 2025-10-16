# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for application settings.

Covers:
- Settings initialization
- CORS origins parsing
- Environment detection
- Property methods
"""

import pytest

from src.config.settings import Settings


class TestSettingsInitialization:
    """Test Settings class initialization."""

    def test_settings_has_default_values(self):
        """Test Settings initializes with default values."""
        settings = Settings()
        assert settings.app_env == "development"
        assert settings.debug is True
        assert settings.host == "0.0.0.0"
        assert settings.port == 8000

    def test_settings_accepts_custom_values(self):
        """Test Settings accepts custom values during initialization."""
        settings = Settings(
            app_env="production",
            debug=False,
            host="127.0.0.1",
            port=9000
        )
        assert settings.app_env == "production"
        assert settings.debug is False
        assert settings.host == "127.0.0.1"
        assert settings.port == 9000

    def test_settings_database_defaults(self):
        """Test database settings have correct defaults."""
        settings = Settings()
        assert "postgresql://" in settings.database_url
        assert settings.database_pool_size == 20
        assert settings.database_max_overflow == 10

    def test_settings_redis_defaults(self):
        """Test Redis settings have correct defaults."""
        settings = Settings()
        assert "redis://" in settings.redis_url
        assert settings.redis_ttl_preferences == 2592000  # 30 days


class TestCorsOriginsListProperty:
    """Test cors_origins_list property parsing."""

    def test_single_origin(self):
        """Test parsing single CORS origin."""
        settings = Settings(cors_origins="http://localhost:3000")
        result = settings.cors_origins_list
        assert len(result) == 1
        assert result[0] == "http://localhost:3000"

    def test_multiple_origins(self):
        """Test parsing multiple CORS origins."""
        settings = Settings(cors_origins="http://localhost:3000,http://localhost:1337")
        result = settings.cors_origins_list
        assert len(result) == 2
        assert "http://localhost:3000" in result
        assert "http://localhost:1337" in result

    def test_origins_with_whitespace(self):
        """Test parsing origins with extra whitespace."""
        settings = Settings(cors_origins="  http://localhost:3000  ,  http://localhost:1337  ")
        result = settings.cors_origins_list
        assert len(result) == 2
        assert result[0] == "http://localhost:3000"
        assert result[1] == "http://localhost:1337"

    def test_origins_with_empty_parts(self):
        """Test parsing origins with empty parts (double commas)."""
        settings = Settings(cors_origins="http://localhost:3000,,http://localhost:1337")
        result = settings.cors_origins_list
        assert len(result) == 2  # Empty parts should be filtered out
        assert "http://localhost:3000" in result
        assert "http://localhost:1337" in result

    def test_empty_origins_string(self):
        """Test parsing empty CORS origins string."""
        settings = Settings(cors_origins="")
        result = settings.cors_origins_list
        assert len(result) == 0

    def test_whitespace_only_origins(self):
        """Test parsing whitespace-only CORS origins."""
        settings = Settings(cors_origins="   ,   ,   ")
        result = settings.cors_origins_list
        assert len(result) == 0

    def test_three_origins(self):
        """Test parsing three CORS origins."""
        settings = Settings(cors_origins="http://a.com,http://b.com,http://c.com")
        result = settings.cors_origins_list
        assert len(result) == 3


class TestIsProductionProperty:
    """Test is_production property."""

    def test_is_production_true_lowercase(self):
        """Test is_production returns True for 'production'."""
        settings = Settings(app_env="production")
        assert settings.is_production is True

    def test_is_production_true_uppercase(self):
        """Test is_production returns True for 'PRODUCTION'."""
        settings = Settings(app_env="PRODUCTION")
        assert settings.is_production is True

    def test_is_production_true_mixed_case(self):
        """Test is_production returns True for 'Production'."""
        settings = Settings(app_env="Production")
        assert settings.is_production is True

    def test_is_production_false_development(self):
        """Test is_production returns False for 'development'."""
        settings = Settings(app_env="development")
        assert settings.is_production is False

    def test_is_production_false_staging(self):
        """Test is_production returns False for 'staging'."""
        settings = Settings(app_env="staging")
        assert settings.is_production is False

    def test_is_production_false_test(self):
        """Test is_production returns False for 'test'."""
        settings = Settings(app_env="test")
        assert settings.is_production is False

    def test_is_production_false_custom_env(self):
        """Test is_production returns False for custom environment."""
        settings = Settings(app_env="local")
        assert settings.is_production is False


class TestSettingsConfiguration:
    """Test Settings configuration and validation."""

    def test_settings_accepts_database_url(self):
        """Test Settings accepts custom database URL."""
        custom_url = "postgresql://user:pass@db:5432/testdb"
        settings = Settings(database_url=custom_url)
        assert settings.database_url == custom_url

    def test_settings_accepts_redis_url(self):
        """Test Settings accepts custom Redis URL."""
        custom_url = "redis://redis:6379/1"
        settings = Settings(redis_url=custom_url)
        assert settings.redis_url == custom_url

    def test_settings_accepts_strapi_config(self):
        """Test Settings accepts Strapi configuration."""
        settings = Settings(
            strapi_url="http://cms:1337",
            strapi_api_token="test-token"
        )
        assert settings.strapi_url == "http://cms:1337"
        assert settings.strapi_api_token == "test-token"

    def test_settings_accepts_jwt_secret(self):
        """Test Settings accepts JWT secret."""
        settings = Settings(jwt_secret="super-secret-key")
        assert settings.jwt_secret == "super-secret-key"

    def test_settings_log_level_default(self):
        """Test Settings has correct log level default."""
        settings = Settings()
        assert settings.log_level == "INFO"
