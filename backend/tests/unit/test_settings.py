# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for application settings.

Covers:
- Settings URL construction
- CORS origins parsing
- Environment detection
- Property methods
"""

from config.settings import Settings


class TestSettingsInitialization:
    """Test Settings class initialization and URL construction."""

    def test_settings_has_required_fields(self):
        """Test Settings has required fields."""
        settings = Settings()
        assert settings.app_env is not None
        assert settings.debug is not None
        assert settings.jwt_secret is not None
        assert settings.postgres_host is not None

    def test_settings_database_url_construction(self):
        """Test database URL is properly constructed."""
        settings = Settings()
        assert "postgresql://" in settings.database_url
        assert settings.postgres_host in settings.database_url
        assert settings.postgres_user in settings.database_url
        assert str(settings.postgres_port) in settings.database_url

    def test_settings_redis_url_construction(self):
        """Test Redis URL is properly constructed."""
        settings = Settings()
        assert "redis://" in settings.redis_url
        assert settings.redis_host in settings.redis_url
        assert str(settings.redis_port) in settings.redis_url

    def test_settings_strapi_url_construction(self):
        """Test Strapi URL is properly constructed."""
        settings = Settings()
        assert settings.strapi_url is not None
        assert "http" in settings.strapi_url or "https" in settings.strapi_url
        assert str(settings.cms_port) in settings.strapi_url

    def test_settings_redis_ttl_preferences(self):
        """Test Redis TTL for preferences is set."""
        settings = Settings()
        assert settings.redis_ttl_preferences == 2592000  # 30 days


class TestCorsOriginsListProperty:
    """Test cors_origins_list property returns Strapi URL."""

    def test_cors_origins_list_contains_strapi_url(self):
        """Test cors_origins_list returns list containing Strapi URL."""
        settings = Settings()
        result = settings.cors_origins_list
        assert isinstance(result, list)
        assert len(result) >= 1


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
    """Test Settings configuration and component values."""

    def test_settings_database_components(self):
        """Test Settings has all database URL components."""
        settings = Settings()
        assert settings.postgres_protocol is not None
        assert settings.postgres_host is not None
        assert settings.postgres_port is not None
        assert settings.postgres_user is not None
        assert settings.postgres_password is not None
        assert settings.postgres_backend_name is not None

    def test_settings_redis_components(self):
        """Test Settings has all Redis URL components."""
        settings = Settings()
        assert settings.redis_protocol is not None
        assert settings.redis_host is not None
        assert settings.redis_port is not None

    def test_settings_strapi_components(self):
        """Test Settings has all Strapi URL components."""
        settings = Settings()
        assert settings.cms_protocol is not None
        assert settings.cms_host is not None
        assert settings.cms_port is not None
        assert settings.strapi_api_token is not None

    def test_settings_jwt_secret(self):
        """Test Settings has JWT secret configured."""
        settings = Settings()
        assert settings.jwt_secret is not None
        assert len(settings.jwt_secret) > 0

    def test_settings_log_level(self):
        """Test Settings has log level configured."""
        settings = Settings()
        assert settings.log_level is not None
        assert settings.log_level in ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
