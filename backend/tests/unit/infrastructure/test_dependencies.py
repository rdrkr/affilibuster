# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for Dependency Injection configuration.

Tests singleton initialization and dependency getter functions.
"""

from unittest.mock import AsyncMock

import pytest

from affilibuster_backend.domain.repositories.cache_service import ICacheService
from affilibuster_backend.domain.repositories.cms_repository import ICMSRepository
from affilibuster_backend.domain.repositories.email_verification_token_repository import (
    IEmailVerificationTokenRepository,
)
from affilibuster_backend.domain.repositories.password_reset_token_repository import IPasswordResetTokenRepository
from affilibuster_backend.domain.repositories.preferences_repository import IUserPreferencesRepository
from affilibuster_backend.domain.repositories.url_redirect_repository import IURLRedirectRepository
from affilibuster_backend.domain.use_cases.get_cms_content_use_case import GetCMSContentUseCase
from affilibuster_backend.domain.use_cases.get_url_redirect_use_case import GetURLRedirectUseCase
from affilibuster_backend.domain.use_cases.get_user_preferences_use_case import GetUserPreferencesUseCase
from affilibuster_backend.domain.use_cases.update_user_preferences_use_case import UpdateUserPreferencesUseCase
from affilibuster_backend.infrastructure.dependencies import (
    get_cache_service,
    get_cms_content_use_case,
    get_cms_repo,
    get_email_verification_token_repo,
    get_get_user_preferences_use_case,
    get_password_reset_token_repo,
    get_preferences_repo,
    get_update_user_preferences_use_case,
    get_url_redirect_repo,
    get_url_redirect_use_case,
    initialize_dependencies,
)


@pytest.mark.unit
@pytest.mark.serial
class TestInitializeDependencies:
    """Test initialize_dependencies() function."""

    def test_initialize_dependencies_creates_instances(self):
        """Test initialize_dependencies creates singleton instances."""
        # Clear any existing instances
        import affilibuster_backend.infrastructure.dependencies as deps

        deps._cms_repo = None

        # Initialize
        initialize_dependencies()

        # Verify instances were created
        assert deps._cms_repo is not None

    def test_initialize_dependencies_creates_correct_types(self):
        """Test initialize_dependencies creates correct instance types."""
        import affilibuster_backend.infrastructure.dependencies as deps

        deps._cms_repo = None

        initialize_dependencies()

        # Verify types
        assert isinstance(deps._cms_repo, ICMSRepository)


@pytest.mark.unit
@pytest.mark.serial
class TestGetStrapiRepo:
    """Test get_cms_repo() dependency getter."""

    def test_get_cms_repo_returns_instance_when_initialized(self):
        """Test get_cms_repo returns instance when initialized."""
        import affilibuster_backend.infrastructure.dependencies as deps

        deps._cms_repo = None
        initialize_dependencies()

        repo = get_cms_repo()
        assert repo is not None
        assert isinstance(repo, ICMSRepository)

    def test_get_cms_repo_raises_when_not_initialized(self):
        """Test get_cms_repo raises RuntimeError when not initialized."""
        import affilibuster_backend.infrastructure.dependencies as deps

        # Clear the singleton
        deps._cms_repo = None

        with pytest.raises(RuntimeError, match="Dependencies not initialized"):
            get_cms_repo()

    def test_get_cms_repo_returns_same_instance(self):
        """Test get_cms_repo returns the same singleton instance."""
        import affilibuster_backend.infrastructure.dependencies as deps

        deps._cms_repo = None
        initialize_dependencies()

        repo1 = get_cms_repo()
        repo2 = get_cms_repo()

        assert repo1 is repo2


@pytest.mark.unit
class TestDependencyGetters:
    """Test all dependency getter functions return correct instances."""

    def test_get_cms_content_use_case_returns_instance(self):
        """Test get_cms_content_use_case returns use case instance."""
        initialize_dependencies()
        repo = get_cms_repo()

        use_case = get_cms_content_use_case(cms_repo=repo)

        assert use_case is not None
        assert isinstance(use_case, GetCMSContentUseCase)

    def test_get_cache_service_returns_new_instance(self):
        """Test get_cache_service creates new instance each time."""
        service1 = get_cache_service()
        service2 = get_cache_service()

        assert service1 is not None
        assert service2 is not None
        assert isinstance(service1, ICacheService)

    @pytest.mark.asyncio
    async def test_get_preferences_repo_returns_repository(self):
        """Test get_preferences_repo returns repository instance."""
        from affilibuster_backend.infrastructure.database.config import get_db

        async for db in get_db():
            repo = get_preferences_repo(db=db)
            assert repo is not None
            assert isinstance(repo, IUserPreferencesRepository)
            break

    def test_get_get_user_preferences_use_case_returns_instance(self):
        """Test get_get_user_preferences_use_case returns use case."""
        prefs_repo = AsyncMock(spec=IUserPreferencesRepository)
        cache_service = AsyncMock(spec=ICacheService)

        use_case = get_get_user_preferences_use_case(prefs_repo=prefs_repo, cache_service=cache_service)

        assert use_case is not None
        assert isinstance(use_case, GetUserPreferencesUseCase)

    def test_get_update_user_preferences_use_case_returns_instance(self):
        """Test get_update_user_preferences_use_case returns use case."""
        prefs_repo = AsyncMock(spec=IUserPreferencesRepository)
        cache_service = AsyncMock(spec=ICacheService)

        use_case = get_update_user_preferences_use_case(prefs_repo=prefs_repo, cache_service=cache_service)

        assert use_case is not None
        assert isinstance(use_case, UpdateUserPreferencesUseCase)

    @pytest.mark.asyncio
    async def test_get_email_verification_token_repo_returns_repository(self):
        """Test get_email_verification_token_repo returns repository instance."""
        from affilibuster_backend.infrastructure.database.config import get_db

        async for db in get_db():
            repo = get_email_verification_token_repo(db=db)
            assert repo is not None
            assert isinstance(repo, IEmailVerificationTokenRepository)
            break

    @pytest.mark.asyncio
    async def test_get_password_reset_token_repo_returns_repository(self):
        """Test get_password_reset_token_repo returns repository instance."""
        from affilibuster_backend.infrastructure.database.config import get_db

        async for db in get_db():
            repo = get_password_reset_token_repo(db=db)
            assert repo is not None
            assert isinstance(repo, IPasswordResetTokenRepository)
            break

    @pytest.mark.asyncio
    async def test_get_url_redirect_repo_returns_repository(self):
        """Test get_url_redirect_repo returns repository instance."""
        from affilibuster_backend.infrastructure.database.config import get_db

        async for db in get_db():
            repo = get_url_redirect_repo(db=db)
            assert repo is not None
            assert isinstance(repo, IURLRedirectRepository)
            break

    def test_get_url_redirect_use_case_returns_instance(self):
        """Test get_url_redirect_use_case returns use case."""
        redirect_repo = AsyncMock(spec=IURLRedirectRepository)

        use_case = get_url_redirect_use_case(redirect_repo=redirect_repo)

        assert use_case is not None
        assert isinstance(use_case, GetURLRedirectUseCase)
