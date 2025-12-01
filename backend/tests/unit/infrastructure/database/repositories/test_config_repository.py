# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""Unit tests for ConfigRepository."""

from unittest.mock import AsyncMock, MagicMock

import pytest
from sqlalchemy import select

from affilibuster_backend.infrastructure.database.models.api_config import ApiConfigModel
from affilibuster_backend.infrastructure.database.repositories.config_repository import ConfigRepository


class TestConfigRepository:
    """Tests for ConfigRepository."""

    @pytest.fixture
    def mock_session(self) -> AsyncMock:
        """Create mock database session."""
        session = AsyncMock()
        session.execute = AsyncMock()
        return session

    @pytest.fixture
    def config_repository(self, mock_session: AsyncMock) -> ConfigRepository:
        """Create ConfigRepository instance with mock session."""
        return ConfigRepository(mock_session)

    async def test_get_value_returns_value_when_found(
        self, config_repository: ConfigRepository, mock_session: AsyncMock
    ) -> None:
        """Test retrieving existing configuration value."""
        # Arrange
        key = "test_key"
        value = "test_value"
        # Mock the result object returned by execute
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = value
        mock_session.execute.return_value = mock_result

        # Act
        result = await config_repository.get_value(key)

        # Assert
        assert result == value
        stmt = mock_session.execute.call_args[0][0]
        assert str(stmt) == str(select(ApiConfigModel.value).where(ApiConfigModel.key == key))

    async def test_get_value_returns_none_when_not_found(
        self, config_repository: ConfigRepository, mock_session: AsyncMock
    ) -> None:
        """Test retrieving non-existent configuration value."""
        # Arrange
        key = "non_existent_key"
        # Mock the result object returned by execute
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        # Act
        result = await config_repository.get_value(key)

        # Assert
        assert result is None
        stmt = mock_session.execute.call_args[0][0]
        assert str(stmt) == str(select(ApiConfigModel.value).where(ApiConfigModel.key == key))

    async def test_get_config_returns_model(self, config_repository: ConfigRepository, mock_session: AsyncMock) -> None:
        """Test retrieving full configuration model."""
        # Arrange
        key = "test_key"
        value = "test_value"
        description = "Test Description"
        config = ApiConfigModel(key=key, value=value, description=description)
        # Mock the result object returned by execute
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = config
        mock_session.execute.return_value = mock_result

        # Act
        result = await config_repository.get_config(key)

        # Assert
        assert result is not None
        assert result.key == key
        assert result.value == value
        assert result.description == description
        stmt = mock_session.execute.call_args[0][0]
        assert str(stmt) == str(select(ApiConfigModel).where(ApiConfigModel.key == key))

    async def test_get_config_returns_none_when_not_found(
        self, config_repository: ConfigRepository, mock_session: AsyncMock
    ) -> None:
        """Test retrieving non-existent configuration model."""
        # Arrange
        key = "non_existent_key"
        # Mock the result object returned by execute
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        # Act
        result = await config_repository.get_config(key)

        # Assert
        assert result is None
        stmt = mock_session.execute.call_args[0][0]
        assert str(stmt) == str(select(ApiConfigModel).where(ApiConfigModel.key == key))
