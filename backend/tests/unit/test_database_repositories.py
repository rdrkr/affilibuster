# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for database repository implementations.

Covers:
- CurrencyRepository with AsyncSession mocking
- LanguageRepository with AsyncSession mocking
- UserPreferencesRepository with AsyncSession mocking
"""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from domain.entities.currency import Currency
from domain.entities.language import Language
from domain.entities.user_preferences import UserPreferences
from infrastructure.database.repositories.currency_repository import (
    CurrencyRepository,
)
from infrastructure.database.repositories.language_repository import (
    LanguageRepository,
)
from infrastructure.database.repositories.preferences_repository import (
    UserPreferencesRepository,
)


class TestCurrencyRepository:
    """Test CurrencyRepository with AsyncSession mocking."""

    @pytest.fixture
    def mock_session(self):
        """Create mock AsyncSession."""
        session = MagicMock()
        session.execute = AsyncMock()
        session.flush = AsyncMock()
        return session

    @pytest.fixture
    def repository(self, mock_session):
        """Create CurrencyRepository with mock session."""
        return CurrencyRepository(mock_session)

    @pytest.fixture
    def mock_currency_model(self):
        """Create mock CurrencyModel."""
        model = MagicMock()
        model.code = "USD"
        model.name = "US Dollar"
        model.symbol = "$"
        model.decimal_places = 2
        model.symbol_position = "before"
        model.thousands_separator = ","
        model.decimal_separator = "."
        model.is_active = True
        model.sort_order = 1
        return model

    @pytest.mark.asyncio
    async def test_get_all_returns_all_currencies(self, repository, mock_session, mock_currency_model):
        """Test get_all returns all currencies."""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalars().all.return_value = [mock_currency_model]
        mock_session.execute.return_value = mock_result

        # Act
        result = await repository.get_all()

        # Assert
        assert len(result) == 1
        assert result[0].code == "USD"
        mock_session.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_by_code_returns_currency(self, repository, mock_session, mock_currency_model):
        """Test get_by_code returns currency when found."""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_currency_model
        mock_session.execute.return_value = mock_result

        # Act
        result = await repository.get_by_code("USD")

        # Assert
        assert result is not None
        assert result.code == "USD"
        mock_session.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_by_code_returns_none_when_not_found(self, repository, mock_session):
        """Test get_by_code returns None when currency not found."""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        # Act
        result = await repository.get_by_code("INVALID")

        # Assert
        assert result is None

    @pytest.mark.asyncio
    async def test_get_active_returns_only_active_currencies(self, repository, mock_session, mock_currency_model):
        """Test get_active returns only active currencies."""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalars().all.return_value = [mock_currency_model]
        mock_session.execute.return_value = mock_result

        # Act
        result = await repository.get_active()

        # Assert
        assert len(result) == 1
        assert result[0].is_active is True
        mock_session.execute.assert_called_once()

    def test_to_entity_converts_model_to_entity(self, repository, mock_currency_model):
        """Test _to_entity converts SQLAlchemy model to domain entity."""
        # Act
        entity = repository._to_entity(mock_currency_model)

        # Assert
        assert isinstance(entity, Currency)
        assert entity.code == "USD"
        assert entity.name == "US Dollar"
        assert entity.symbol == "$"

    def test_initialization_with_session(self, mock_session):
        """Test repository initialization."""
        repo = CurrencyRepository(mock_session)
        assert repo.session is mock_session


class TestLanguageRepository:
    """Test LanguageRepository with AsyncSession mocking."""

    @pytest.fixture
    def mock_session(self):
        """Create mock AsyncSession."""
        session = MagicMock()
        session.execute = AsyncMock()
        session.flush = AsyncMock()
        return session

    @pytest.fixture
    def repository(self, mock_session):
        """Create LanguageRepository with mock session."""
        return LanguageRepository(mock_session)

    @pytest.fixture
    def mock_language_model(self):
        """Create mock LanguageModel."""
        model = MagicMock()
        model.code = "en"
        model.display_name = "English"
        model.native_name = "English"
        model.direction = "ltr"
        model.url_prefix = ""
        model.default_currency = "USD"
        model.locale_code = "en-US"
        model.is_default = True
        model.is_active = True
        model.sort_order = 1
        return model

    @pytest.mark.asyncio
    async def test_get_all_returns_all_languages(self, repository, mock_session, mock_language_model):
        """Test get_all returns all languages."""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalars().all.return_value = [mock_language_model]
        mock_session.execute.return_value = mock_result

        # Act
        result = await repository.get_all()

        # Assert
        assert len(result) == 1
        assert result[0].code == "en"
        mock_session.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_by_code_returns_language(self, repository, mock_session, mock_language_model):
        """Test get_by_code returns language when found."""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_language_model
        mock_session.execute.return_value = mock_result

        # Act
        result = await repository.get_by_code("en")

        # Assert
        assert result is not None
        assert result.code == "en"
        mock_session.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_by_code_returns_none_when_not_found(self, repository, mock_session):
        """Test get_by_code returns None when language not found."""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        # Act
        result = await repository.get_by_code("INVALID")

        # Assert
        assert result is None

    @pytest.mark.asyncio
    async def test_get_default_returns_default_language(self, repository, mock_session, mock_language_model):
        """Test get_default returns the default language."""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalar_one.return_value = mock_language_model
        mock_session.execute.return_value = mock_result

        # Act
        result = await repository.get_default()

        # Assert
        assert result.code == "en"
        assert result.is_default is True
        mock_session.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_active_returns_only_active_languages(self, repository, mock_session, mock_language_model):
        """Test get_active returns only active languages."""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalars().all.return_value = [mock_language_model]
        mock_session.execute.return_value = mock_result

        # Act
        result = await repository.get_active()

        # Assert
        assert len(result) == 1
        assert result[0].is_active is True
        mock_session.execute.assert_called_once()

    def test_to_entity_converts_model_to_entity(self, repository, mock_language_model):
        """Test _to_entity converts SQLAlchemy model to domain entity."""
        # Act
        entity = repository._to_entity(mock_language_model)

        # Assert
        assert isinstance(entity, Language)
        assert entity.code == "en"
        assert entity.display_name == "English"
        assert entity.is_default is True

    def test_initialization_with_session(self, mock_session):
        """Test repository initialization."""
        repo = LanguageRepository(mock_session)
        assert repo.session is mock_session


class TestUserPreferencesRepository:
    """Test UserPreferencesRepository with AsyncSession mocking."""

    @pytest.fixture
    def mock_session(self):
        """Create mock AsyncSession."""
        session = MagicMock()
        session.execute = AsyncMock()
        session.flush = AsyncMock()
        return session

    @pytest.fixture
    def repository(self, mock_session):
        """Create UserPreferencesRepository with mock session."""
        return UserPreferencesRepository(mock_session)

    @pytest.fixture
    def mock_preferences_model(self):
        """Create mock UserPreferencesModel."""
        model = MagicMock()
        model.id = uuid4()
        model.session_id = "session-123"
        model.user_id = None
        model.selected_currency = "USD"
        model.dismissed_language_prompt = False
        model.detected_language = None
        model.created_at = datetime.now(UTC).replace(tzinfo=None)
        model.updated_at = datetime.now(UTC).replace(tzinfo=None)
        model.expires_at = datetime.now(UTC).replace(tzinfo=None) + timedelta(days=30)
        return model

    @pytest.fixture
    def sample_preferences(self):
        """Create sample UserPreferences entity."""
        return UserPreferences(session_id="session-123", selected_currency="USD")

    @pytest.mark.asyncio
    async def test_get_by_session_returns_preferences(self, repository, mock_session, mock_preferences_model):
        """Test get_by_session returns preferences when found."""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_preferences_model
        mock_session.execute.return_value = mock_result

        # Act
        result = await repository.get_by_session("session-123")

        # Assert
        assert result is not None
        assert result.session_id == "session-123"
        mock_session.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_by_session_returns_none_when_not_found(self, repository, mock_session):
        """Test get_by_session returns None when not found."""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        # Act
        result = await repository.get_by_session("nonexistent")

        # Assert
        assert result is None

    @pytest.mark.asyncio
    async def test_get_by_user_returns_preferences(self, repository, mock_session, mock_preferences_model):
        """Test get_by_user returns preferences when found."""
        # Arrange
        mock_preferences_model.user_id = "user-456"
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_preferences_model
        mock_session.execute.return_value = mock_result

        # Act
        result = await repository.get_by_user("user-456")

        # Assert
        assert result is not None
        assert result.user_id == "user-456"
        mock_session.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_by_user_returns_none_when_not_found(self, repository, mock_session):
        """Test get_by_user returns None when not found."""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        # Act
        result = await repository.get_by_user("nonexistent")

        # Assert
        assert result is None

    @pytest.mark.asyncio
    async def test_upsert_creates_or_updates_preferences(
        self, repository, mock_session, sample_preferences, mock_preferences_model
    ):
        """Test upsert creates or updates preferences."""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_preferences_model
        mock_session.execute.return_value = mock_result

        # Act
        result = await repository.upsert(sample_preferences)

        # Assert
        assert result is not None
        assert mock_session.execute.call_count == 2  # INSERT and SELECT
        mock_session.flush.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_expired_removes_expired_preferences(self, repository, mock_session):
        """Test delete_expired removes expired preferences."""
        # Arrange
        mock_result = MagicMock()
        mock_result.rowcount = 5
        mock_session.execute.return_value = mock_result

        # Act
        count = await repository.delete_expired()

        # Assert
        assert count == 5
        mock_session.execute.assert_called_once()
        mock_session.flush.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_by_session_removes_preferences(self, repository, mock_session):
        """Test delete_by_session removes preferences for a session."""
        # Arrange
        mock_result = MagicMock()
        mock_result.rowcount = 1
        mock_session.execute.return_value = mock_result

        # Act
        deleted = await repository.delete_by_session("session-123")

        # Assert
        assert deleted is True
        mock_session.execute.assert_called_once()
        mock_session.flush.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_by_session_returns_false_when_not_found(self, repository, mock_session):
        """Test delete_by_session returns False when session not found."""
        # Arrange
        mock_result = MagicMock()
        mock_result.rowcount = 0
        mock_session.execute.return_value = mock_result

        # Act
        deleted = await repository.delete_by_session("nonexistent")

        # Assert
        assert deleted is False

    def test_to_entity_converts_model_to_entity(self, repository, mock_preferences_model):
        """Test _to_entity converts SQLAlchemy model to domain entity."""
        # Act
        entity = repository._to_entity(mock_preferences_model)

        # Assert
        assert isinstance(entity, UserPreferences)
        assert entity.session_id == "session-123"
        assert entity.selected_currency == "USD"

    def test_initialization_with_session(self, mock_session):
        """Test repository initialization."""
        repo = UserPreferencesRepository(mock_session)
        assert repo.session is mock_session
