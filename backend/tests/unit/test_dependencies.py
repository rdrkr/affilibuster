# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for Dependency Injection configuration.

Tests singleton initialization and dependency getter functions.
"""

import pytest

from domain.repositories.strapi_repository import IStrapiRepository
from infrastructure.dependencies import (
    get_strapi_repo,
    initialize_dependencies,
)


class TestInitializeDependencies:
    """Test initialize_dependencies() function."""

    def test_initialize_dependencies_creates_instances(self):
        """Test initialize_dependencies creates singleton instances."""
        # Clear any existing instances
        import infrastructure.dependencies as deps

        deps._strapi_repo = None

        # Initialize
        initialize_dependencies()

        # Verify instances were created
        assert deps._strapi_repo is not None

    def test_initialize_dependencies_creates_correct_types(self):
        """Test initialize_dependencies creates correct instance types."""
        import infrastructure.dependencies as deps

        deps._strapi_repo = None

        initialize_dependencies()

        # Verify types
        assert isinstance(deps._strapi_repo, IStrapiRepository)


class TestGetStrapiRepo:
    """Test get_strapi_repo() dependency getter."""

    def test_get_strapi_repo_returns_instance_when_initialized(self):
        """Test get_strapi_repo returns instance when initialized."""
        import infrastructure.dependencies as deps

        deps._strapi_repo = None
        initialize_dependencies()

        repo = get_strapi_repo()
        assert repo is not None
        assert isinstance(repo, IStrapiRepository)

    def test_get_strapi_repo_raises_when_not_initialized(self):
        """Test get_strapi_repo raises RuntimeError when not initialized."""
        import infrastructure.dependencies as deps

        # Clear the singleton
        deps._strapi_repo = None

        with pytest.raises(RuntimeError, match="Dependencies not initialized"):
            get_strapi_repo()

    def test_get_strapi_repo_returns_same_instance(self):
        """Test get_strapi_repo returns the same singleton instance."""
        import infrastructure.dependencies as deps

        deps._strapi_repo = None
        initialize_dependencies()

        repo1 = get_strapi_repo()
        repo2 = get_strapi_repo()

        assert repo1 is repo2
