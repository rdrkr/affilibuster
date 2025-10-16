# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for remaining use cases to reach 80% coverage.

Covers:
- ConvertCurrency use case
- UpdateUserPreferences use case
- GetUserPreferences use case
- GetLocalizedContent use case
"""

import pytest
import json
from datetime import UTC, datetime, timedelta
from uuid import uuid4
from unittest.mock import AsyncMock, MagicMock

from src.domain.use_cases.convert_currency import ConvertCurrency, ConversionResult
from src.domain.use_cases.update_user_preferences import UpdateUserPreferences
from src.domain.use_cases.get_user_preferences import GetUserPreferences
from src.domain.use_cases.get_localized_content import GetLocalizedContent, LocalizedContentResult
from src.domain.entities.user_preferences import UserPreferences
from src.domain.entities.currency import Currency


class TestConvertCurrency:
    """Test ConvertCurrency use case."""

    @pytest.fixture
    def mock_currency_repository(self):
        """Create a mock currency repository."""
        repository = MagicMock()
        repository.get_by_code = AsyncMock()
        return repository

    @pytest.fixture
    def use_case(self, mock_currency_repository):
        """Create ConvertCurrency use case."""
        return ConvertCurrency(mock_currency_repository)

    @pytest.fixture
    def mock_usd_currency(self):
        """Create mock USD currency."""
        currency = MagicMock()
        currency.code = 'USD'
        currency.format_amount = MagicMock(return_value='$100.00')
        return currency

    @pytest.fixture
    def mock_eur_currency(self):
        """Create mock EUR currency."""
        currency = MagicMock()
        currency.code = 'EUR'
        currency.format_amount = MagicMock(return_value='€92.00')
        return currency

    @pytest.mark.asyncio
    async def test_convert_usd_to_eur(self, use_case, mock_currency_repository, mock_usd_currency, mock_eur_currency):
        """Test converting USD to EUR."""
        # Arrange
        mock_currency_repository.get_by_code.side_effect = lambda code: (
            mock_usd_currency if code == 'USD' else mock_eur_currency
        )

        # Act
        result = await use_case.execute(100.0, 'USD', 'EUR')

        # Assert
        assert result is not None
        assert result.from_currency == 'USD'
        assert result.to_currency == 'EUR'
        assert result.from_amount == 100.0
        assert result.formatted == '€92.00'

    @pytest.mark.asyncio
    async def test_convert_returns_none_when_from_currency_not_found(self, use_case, mock_currency_repository):
        """Test conversion returns None when source currency doesn't exist."""
        # Arrange
        mock_currency_repository.get_by_code.return_value = None

        # Act
        result = await use_case.execute(100.0, 'INVALID', 'EUR')

        # Assert
        assert result is None

    @pytest.mark.asyncio
    async def test_convert_returns_none_when_to_currency_not_found(self, use_case, mock_currency_repository, mock_usd_currency):
        """Test conversion returns None when target currency doesn't exist."""
        # Arrange
        mock_currency_repository.get_by_code.side_effect = lambda code: (
            mock_usd_currency if code == 'USD' else None
        )

        # Act
        result = await use_case.execute(100.0, 'USD', 'INVALID')

        # Assert
        assert result is None

    @pytest.mark.asyncio
    async def test_convert_calculates_exchange_rate(self, use_case, mock_currency_repository, mock_usd_currency, mock_eur_currency):
        """Test that exchange rate is calculated correctly."""
        # Arrange
        mock_currency_repository.get_by_code.side_effect = lambda code: (
            mock_usd_currency if code == 'USD' else mock_eur_currency
        )

        # Act
        result = await use_case.execute(100.0, 'USD', 'EUR')

        # Assert
        assert result.exchange_rate == 0.92  # EUR rate / USD rate

    @pytest.mark.asyncio
    async def test_convert_formats_result_amount(self, use_case, mock_currency_repository, mock_usd_currency, mock_eur_currency):
        """Test that result amount is formatted using target currency."""
        # Arrange
        mock_currency_repository.get_by_code.side_effect = lambda code: (
            mock_usd_currency if code == 'USD' else mock_eur_currency
        )

        # Act
        result = await use_case.execute(100.0, 'USD', 'EUR')

        # Assert
        mock_eur_currency.format_amount.assert_called_once()

    def test_initialization_with_repository(self, mock_currency_repository):
        """Test use case initialization."""
        use_case = ConvertCurrency(mock_currency_repository)
        assert use_case.currency_repository is mock_currency_repository


class TestUpdateUserPreferences:
    """Test UpdateUserPreferences use case."""

    @pytest.fixture
    def mock_preferences_repository(self):
        """Create mock preferences repository."""
        repository = MagicMock()
        repository.upsert = AsyncMock()
        return repository

    @pytest.fixture
    def mock_cache_service(self):
        """Create mock cache service."""
        cache = MagicMock()
        cache.set = AsyncMock()
        return cache

    @pytest.fixture
    def use_case(self, mock_preferences_repository, mock_cache_service):
        """Create UpdateUserPreferences use case."""
        return UpdateUserPreferences(mock_preferences_repository, mock_cache_service)

    @pytest.fixture
    def sample_preferences(self):
        """Create sample user preferences."""
        return UserPreferences(
            session_id='session-123',
            selected_currency='USD'
        )

    @pytest.mark.asyncio
    async def test_update_preferences(self, use_case, mock_preferences_repository, sample_preferences):
        """Test updating user preferences."""
        # Arrange
        mock_preferences_repository.upsert.return_value = sample_preferences

        # Act
        result = await use_case.execute(sample_preferences)

        # Assert
        mock_preferences_repository.upsert.assert_called_once()
        assert result == sample_preferences

    @pytest.mark.asyncio
    async def test_update_refreshes_timestamps(self, use_case, mock_preferences_repository, sample_preferences):
        """Test that update refreshes updated_at and expires_at."""
        # Arrange
        before = datetime.now(UTC).replace(tzinfo=None)
        mock_preferences_repository.upsert.return_value = sample_preferences

        # Act
        await use_case.execute(sample_preferences)

        after = datetime.now(UTC).replace(tzinfo=None)

        # Assert
        assert before <= sample_preferences.updated_at <= after
        assert sample_preferences.expires_at > sample_preferences.updated_at

    @pytest.mark.asyncio
    async def test_update_extends_ttl_30_days(self, use_case, mock_preferences_repository, sample_preferences):
        """Test that TTL is extended by 30 days."""
        # Arrange
        mock_preferences_repository.upsert.return_value = sample_preferences

        # Act
        await use_case.execute(sample_preferences)

        # Assert
        expected_expiry = sample_preferences.updated_at + timedelta(days=30)
        assert abs((sample_preferences.expires_at - expected_expiry).total_seconds()) < 1

    @pytest.mark.asyncio
    async def test_update_caches_preferences(self, use_case, mock_preferences_repository, mock_cache_service, sample_preferences):
        """Test that preferences are cached after update."""
        # Arrange
        mock_preferences_repository.upsert.return_value = sample_preferences

        # Act
        await use_case.execute(sample_preferences)

        # Assert
        mock_cache_service.set.assert_called_once()
        cache_key = mock_cache_service.set.call_args[0][0]
        assert cache_key == 'session:session-123:preferences'

    @pytest.mark.asyncio
    async def test_update_sets_cache_ttl_30_days(self, use_case, mock_preferences_repository, mock_cache_service, sample_preferences):
        """Test that cache TTL is set to 30 days."""
        # Arrange
        mock_preferences_repository.upsert.return_value = sample_preferences

        # Act
        await use_case.execute(sample_preferences)

        # Assert
        ttl = mock_cache_service.set.call_args[1]['ttl_seconds']
        assert ttl == 30 * 24 * 60 * 60

    def test_initialization(self, mock_preferences_repository, mock_cache_service):
        """Test use case initialization."""
        use_case = UpdateUserPreferences(mock_preferences_repository, mock_cache_service)
        assert use_case.preferences_repository is mock_preferences_repository
        assert use_case.cache_service is mock_cache_service

    def test_serialize_preferences_to_json(self, use_case, sample_preferences):
        """Test serialization of preferences to JSON."""
        # Arrange
        from datetime import UTC, datetime
        sample_preferences.id = uuid4()
        sample_preferences.created_at = datetime.now(UTC).replace(tzinfo=None)
        sample_preferences.updated_at = datetime.now(UTC).replace(tzinfo=None)
        sample_preferences.expires_at = datetime.now(UTC).replace(tzinfo=None) + timedelta(days=30)

        # Act
        result = use_case._serialize(sample_preferences)

        # Assert
        import json
        data = json.loads(result)
        assert data['id'] == str(sample_preferences.id)
        assert data['session_id'] == 'session-123'
        assert data['selected_currency'] == 'USD'

    def test_serialize_handles_none_timestamps(self, use_case):
        """Test serialization with None timestamps."""
        # Arrange
        prefs = UserPreferences(
            session_id='session-456',
            selected_currency='EUR'
        )
        prefs.created_at = None
        prefs.updated_at = None
        prefs.expires_at = None

        # Act
        result = use_case._serialize(prefs)

        # Assert
        import json
        data = json.loads(result)
        assert data['created_at'] is None
        assert data['updated_at'] is None
        assert data['expires_at'] is None

    @pytest.mark.asyncio
    async def test_update_serializes_result_for_cache(self, use_case, mock_preferences_repository, mock_cache_service, sample_preferences):
        """Test that updated preferences are serialized before caching."""
        # Arrange
        sample_preferences.id = uuid4()
        mock_preferences_repository.upsert.return_value = sample_preferences

        # Act
        await use_case.execute(sample_preferences)

        # Assert
        cache_value = mock_cache_service.set.call_args[0][1]
        import json
        data = json.loads(cache_value)
        assert 'id' in data
        assert 'session_id' in data


class TestGetUserPreferences:
    """Test GetUserPreferences use case."""

    @pytest.fixture
    def mock_preferences_repository(self):
        """Create mock preferences repository."""
        repository = MagicMock()
        repository.get_by_session = AsyncMock()
        return repository

    @pytest.fixture
    def mock_cache_service(self):
        """Create mock cache service."""
        cache = MagicMock()
        cache.get = AsyncMock()
        cache.set = AsyncMock()
        return cache

    @pytest.fixture
    def use_case(self, mock_preferences_repository, mock_cache_service):
        """Create GetUserPreferences use case."""
        return GetUserPreferences(mock_preferences_repository, mock_cache_service)

    @pytest.fixture
    def sample_preferences(self):
        """Create sample user preferences."""
        return UserPreferences(
            session_id='session-123',
            selected_currency='USD'
        )

    @pytest.mark.asyncio
    async def test_get_from_cache_hit(self, use_case, mock_cache_service, sample_preferences):
        """Test getting preferences from cache (cache hit)."""
        # Arrange
        cached_data = json.dumps({
            'id': str(sample_preferences.id),
            'session_id': 'session-123',
            'user_id': None,
            'selected_currency': 'USD',
            'dismissed_language_prompt': False,
            'detected_language': None,
            'created_at': sample_preferences.created_at.isoformat(),
            'updated_at': sample_preferences.updated_at.isoformat(),
            'expires_at': sample_preferences.expires_at.isoformat(),
        })
        mock_cache_service.get.return_value = cached_data

        # Act
        result = await use_case.execute('session-123')

        # Assert
        assert result is not None
        assert result.session_id == 'session-123'
        mock_cache_service.get.assert_called_once_with('session:session-123:preferences')

    @pytest.mark.asyncio
    async def test_get_from_db_on_cache_miss(self, use_case, mock_cache_service, mock_preferences_repository, sample_preferences):
        """Test getting preferences from DB when cache misses."""
        # Arrange
        mock_cache_service.get.return_value = None
        mock_preferences_repository.get_by_session.return_value = sample_preferences

        # Act
        result = await use_case.execute('session-123')

        # Assert
        assert result == sample_preferences
        mock_preferences_repository.get_by_session.assert_called_once_with('session-123')

    @pytest.mark.asyncio
    async def test_get_updates_cache_on_db_hit(self, use_case, mock_cache_service, mock_preferences_repository, sample_preferences):
        """Test that cache is updated when fetched from DB."""
        # Arrange
        mock_cache_service.get.return_value = None
        mock_preferences_repository.get_by_session.return_value = sample_preferences

        # Act
        await use_case.execute('session-123')

        # Assert
        mock_cache_service.set.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_returns_none_when_not_found(self, use_case, mock_cache_service, mock_preferences_repository):
        """Test getting preferences returns None when not found."""
        # Arrange
        mock_cache_service.get.return_value = None
        mock_preferences_repository.get_by_session.return_value = None

        # Act
        result = await use_case.execute('session-999')

        # Assert
        assert result is None

    def test_initialization(self, mock_preferences_repository, mock_cache_service):
        """Test use case initialization."""
        use_case = GetUserPreferences(mock_preferences_repository, mock_cache_service)
        assert use_case.preferences_repository is mock_preferences_repository
        assert use_case.cache_service is mock_cache_service

    def test_serialize_preferences_to_json(self, use_case, sample_preferences):
        """Test serialization of preferences to JSON."""
        # Arrange
        sample_preferences.id = uuid4()
        sample_preferences.user_id = 'user-456'
        sample_preferences.detected_language = 'it'

        # Act
        result = use_case._serialize(sample_preferences)

        # Assert
        data = json.loads(result)
        assert data['id'] == str(sample_preferences.id)
        assert data['session_id'] == 'session-123'
        assert data['user_id'] == 'user-456'
        assert data['selected_currency'] == 'USD'
        assert data['detected_language'] == 'it'

    def test_deserialize_json_to_preferences(self, use_case):
        """Test deserialization of JSON to preferences."""
        # Arrange
        from datetime import UTC, datetime
        test_id = uuid4()
        test_data = json.dumps({
            'id': str(test_id),
            'session_id': 'session-789',
            'user_id': 'user-123',
            'selected_currency': 'EUR',
            'dismissed_language_prompt': True,
            'detected_language': 'he',
            'created_at': datetime.now(UTC).isoformat(),
            'updated_at': datetime.now(UTC).isoformat(),
            'expires_at': datetime.now(UTC).isoformat(),
        })

        # Act
        result = use_case._deserialize(test_data)

        # Assert
        assert result.id == test_id
        assert result.session_id == 'session-789'
        assert result.user_id == 'user-123'
        assert result.selected_currency == 'EUR'
        assert result.dismissed_language_prompt is True
        assert result.detected_language == 'he'

    def test_deserialize_handles_none_values(self, use_case):
        """Test deserialization with None values."""
        # Arrange
        test_id = uuid4()
        test_data = json.dumps({
            'id': str(test_id),
            'session_id': 'session-999',
            'user_id': None,
            'selected_currency': 'USD',
            'dismissed_language_prompt': False,
            'detected_language': None,
            'created_at': None,
            'updated_at': None,
            'expires_at': None,
        })

        # Act
        result = use_case._deserialize(test_data)

        # Assert
        assert result.user_id is None
        assert result.detected_language is None
        # Note: created_at, updated_at, expires_at are auto-generated by UserPreferences entity


class TestGetLocalizedContent:
    """Test GetLocalizedContent use case."""

    @pytest.fixture
    def mock_content_repository(self):
        """Create mock content repository."""
        repository = MagicMock()
        repository.get_by_slug = AsyncMock()
        return repository

    @pytest.fixture
    def mock_language_repository(self):
        """Create mock language repository."""
        repository = MagicMock()
        repository.get_default = AsyncMock()
        return repository

    @pytest.fixture
    def use_case(self, mock_content_repository, mock_language_repository):
        """Create GetLocalizedContent use case."""
        return GetLocalizedContent(mock_content_repository, mock_language_repository)

    @pytest.fixture
    def mock_content(self):
        """Create mock content version."""
        content = MagicMock()
        content.id = uuid4()
        content.slug = 'eco-bottle'
        return content

    @pytest.fixture
    def mock_default_language(self):
        """Create mock default language."""
        lang = MagicMock()
        lang.code = 'en'
        return lang

    @pytest.mark.asyncio
    async def test_get_content_in_requested_language(self, use_case, mock_content_repository, mock_content):
        """Test getting content in requested language (no fallback)."""
        # Arrange
        mock_content_repository.get_by_slug.return_value = mock_content

        # Act
        result = await use_case.execute('it', 'eco-bottle')

        # Assert
        assert result is not None
        assert result.content == mock_content
        assert result.requested_language == 'it'
        assert result.actual_language == 'it'
        assert result.fallback_used is False

    @pytest.mark.asyncio
    async def test_get_content_fallback_to_english(self, use_case, mock_content_repository, mock_language_repository, mock_content, mock_default_language):
        """Test fallback to English when content not in requested language."""
        # Arrange
        mock_content_repository.get_by_slug.side_effect = [None, mock_content]  # First call returns None, second returns content
        mock_language_repository.get_default.return_value = mock_default_language

        # Act
        result = await use_case.execute('it', 'eco-bottle')

        # Assert
        assert result is not None
        assert result.content == mock_content
        assert result.requested_language == 'it'
        assert result.actual_language == 'en'
        assert result.fallback_used is True

    @pytest.mark.asyncio
    async def test_get_content_returns_none_when_not_found(self, use_case, mock_content_repository, mock_language_repository, mock_default_language):
        """Test returns None when content not found in any language."""
        # Arrange
        mock_content_repository.get_by_slug.return_value = None
        mock_language_repository.get_default.return_value = mock_default_language

        # Act
        result = await use_case.execute('it', 'non-existent')

        # Assert
        assert result is None

    @pytest.mark.asyncio
    async def test_get_content_calls_repository_twice_on_fallback(self, use_case, mock_content_repository, mock_language_repository, mock_content, mock_default_language):
        """Test that repository is called twice when falling back."""
        # Arrange
        mock_content_repository.get_by_slug.side_effect = [None, mock_content]
        mock_language_repository.get_default.return_value = mock_default_language

        # Act
        await use_case.execute('it', 'eco-bottle')

        # Assert
        assert mock_content_repository.get_by_slug.call_count == 2
        calls = mock_content_repository.get_by_slug.call_args_list
        assert calls[0][0] == ('it', 'eco-bottle')
        assert calls[1][0] == ('en', 'eco-bottle')

    def test_initialization(self, mock_content_repository, mock_language_repository):
        """Test use case initialization."""
        use_case = GetLocalizedContent(mock_content_repository, mock_language_repository)
        assert use_case.content_repository is mock_content_repository
        assert use_case.language_repository is mock_language_repository
