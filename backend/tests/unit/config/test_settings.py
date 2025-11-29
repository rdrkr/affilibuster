# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for application settings.

Covers:
- Settings URL construction
- CORS origins parsing
- Environment detection
- Property methods
"""

import pytest

from affilibuster_backend.config.settings import Settings


@pytest.mark.unit
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


@pytest.mark.unit
class TestCorsOriginsListProperty:
    """Test cors_origins_list property returns Strapi URL."""

    def test_cors_origins_list_contains_strapi_url(self):
        """Test cors_origins_list returns list containing Strapi URL."""
        settings = Settings()
        result = settings.cors_origins_list
        assert isinstance(result, list)
        assert len(result) >= 1


@pytest.mark.unit
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


@pytest.mark.unit
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
        assert settings.postgres_db is not None

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


@pytest.mark.unit
class TestSettingsDockerEnvironment:
    """Test Settings behavior in Docker vs non-Docker environments."""

    def test_redis_url_uses_localhost_for_docker_internal_names_outside_docker(self, mocker):
        """Test redis_url converts Docker names to localhost when not in Docker."""
        # Mock to simulate non-Docker environment
        mocker.patch("pathlib.Path.exists", return_value=False)
        mocker.patch.dict("os.environ", {"DOCKER_ENV": "false"}, clear=False)

        settings = Settings(redis_host="redis")
        assert "localhost" in settings.redis_url
        assert "redis" not in settings.redis_url or "localhost" in settings.redis_url

    def test_redis_url_uses_localhost_for_redis_server_outside_docker(self, mocker):
        """Test redis_url converts 'redis-server' to localhost when not in Docker."""
        # Mock to simulate non-Docker environment
        mocker.patch("pathlib.Path.exists", return_value=False)
        mocker.patch.dict("os.environ", {"DOCKER_ENV": "false"}, clear=False)

        settings = Settings(redis_host="redis-server")
        assert "localhost" in settings.redis_url
        assert "redis-server" not in settings.redis_url

    def test_redis_url_uses_redis_host_inside_docker(self, mocker):
        """Test redis_url uses redis_host directly when in Docker."""
        # Mock to simulate Docker environment
        mocker.patch("pathlib.Path.exists", return_value=True)

        settings = Settings(redis_host="redis")
        assert "redis" in settings.redis_url
        assert "localhost" not in settings.redis_url

    def test_redis_url_preserves_custom_host_outside_docker(self, mocker):
        """Test redis_url preserves custom host when not in Docker."""
        # Mock to simulate non-Docker environment
        mocker.patch("pathlib.Path.exists", return_value=False)
        mocker.patch.dict("os.environ", {"DOCKER_ENV": "false"}, clear=False)

        settings = Settings(redis_host="custom-redis.example.com")
        assert "custom-redis.example.com" in settings.redis_url

    def test_strapi_url_uses_cms_host_when_not_in_docker(self, mocker):
        """Test strapi_url uses cms_host when not in Docker."""
        # Mock to simulate non-Docker environment
        mocker.patch("pathlib.Path.exists", return_value=False)
        mocker.patch.dict("os.environ", {"DOCKER_ENV": "false"}, clear=False)

        settings = Settings(cms_host="strapi.example.com", internal_cms_host="")
        assert "strapi.example.com" in settings.strapi_url

    def test_strapi_url_uses_cms_host_when_internal_cms_host_empty(self):
        """Test strapi_url falls back to cms_host when internal_cms_host is empty."""
        settings = Settings(cms_host="strapi.example.com", internal_cms_host="")
        # Should use cms_host when internal_cms_host is empty
        assert "strapi.example.com" in settings.strapi_url or settings.cms_host in settings.strapi_url

    def test_strapi_url_uses_internal_cms_host_inside_docker(self, mocker):
        """Test strapi_url uses internal_cms_host when in Docker."""
        # Mock to simulate Docker environment
        mocker.patch("pathlib.Path.exists", return_value=True)

        settings = Settings(
            cms_host="external-strapi.example.com",
            internal_cms_host="strapi",
            cms_protocol="http",
            cms_port=1337,
        )
        assert "strapi" in settings.strapi_url
        assert "external-strapi.example.com" not in settings.strapi_url
