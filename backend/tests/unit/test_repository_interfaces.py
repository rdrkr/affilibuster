# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for domain repository interfaces.

Covers:
- Repository interface definitions
- Abstract method contracts
"""

import pytest
from abc import ABC

from src.domain.repositories.cache_service import ICacheService
from src.domain.repositories.content_repository import IContentRepository
from src.domain.repositories.currency_repository import ICurrencyRepository
from src.domain.repositories.language_repository import ILanguageRepository
from src.domain.repositories.preferences_repository import IUserPreferencesRepository
from src.domain.repositories.url_route_repository import IURLRouteRepository


class TestRepositoryInterfacesAreAbstract:
    """Test that repository interfaces are abstract and cannot be instantiated."""

    def test_cache_service_is_abstract(self):
        """Test ICacheService is an abstract interface."""
        with pytest.raises(TypeError):
            ICacheService()

    def test_content_repository_is_abstract(self):
        """Test IContentRepository is an abstract interface."""
        with pytest.raises(TypeError):
            IContentRepository()

    def test_currency_repository_is_abstract(self):
        """Test ICurrencyRepository is an abstract interface."""
        with pytest.raises(TypeError):
            ICurrencyRepository()

    def test_language_repository_is_abstract(self):
        """Test ILanguageRepository is an abstract interface."""
        with pytest.raises(TypeError):
            ILanguageRepository()

    def test_preferences_repository_is_abstract(self):
        """Test IUserPreferencesRepository is an abstract interface."""
        with pytest.raises(TypeError):
            IUserPreferencesRepository()

    def test_url_route_repository_is_abstract(self):
        """Test IURLRouteRepository is an abstract interface."""
        with pytest.raises(TypeError):
            IURLRouteRepository()


class TestRepositoryInterfaceInheritance:
    """Test that repository interfaces inherit from ABC."""

    def test_cache_service_inherits_abc(self):
        """Test ICacheService inherits from ABC."""
        assert issubclass(ICacheService, ABC)

    def test_content_repository_inherits_abc(self):
        """Test IContentRepository inherits from ABC."""
        assert issubclass(IContentRepository, ABC)

    def test_currency_repository_inherits_abc(self):
        """Test ICurrencyRepository inherits from ABC."""
        assert issubclass(ICurrencyRepository, ABC)

    def test_language_repository_inherits_abc(self):
        """Test ILanguageRepository inherits from ABC."""
        assert issubclass(ILanguageRepository, ABC)

    def test_preferences_repository_inherits_abc(self):
        """Test IUserPreferencesRepository inherits from ABC."""
        assert issubclass(IUserPreferencesRepository, ABC)

    def test_url_route_repository_inherits_abc(self):
        """Test IURLRouteRepository inherits from ABC."""
        assert issubclass(IURLRouteRepository, ABC)
