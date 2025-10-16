# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for simple query use cases (get_all_currencies, get_all_languages, list_content_by_language).

Covers:
- GetAllCurrencies use case
- GetAllLanguages use case
- ListContentByLanguage use case
"""

import pytest
from unittest.mock import AsyncMock, MagicMock

from src.domain.use_cases.get_all_currencies import GetAllCurrencies
from src.domain.use_cases.get_all_languages import GetAllLanguages
from src.domain.use_cases.list_content_by_language import ListContentByLanguage
from src.domain.entities.currency import Currency
from src.domain.entities.language import Language
from src.domain.repositories.content_repository import PaginatedResult


class TestGetAllCurrencies:
    """Test GetAllCurrencies use case."""

    @pytest.fixture
    def mock_currency_repository(self):
        """Create a mock currency repository."""
        repository = MagicMock()
        repository.get_active = AsyncMock()
        return repository

    @pytest.fixture
    def use_case(self, mock_currency_repository):
        """Create GetAllCurrencies use case with mock repository."""
        return GetAllCurrencies(mock_currency_repository)

    @pytest.mark.asyncio
    async def test_get_all_currencies(self, use_case, mock_currency_repository):
        """Test getting all active currencies."""
        # Arrange
        expected_currencies = [MagicMock(), MagicMock(), MagicMock()]
        mock_currency_repository.get_active.return_value = expected_currencies

        # Act
        result = await use_case.execute()

        # Assert
        assert result == expected_currencies
        mock_currency_repository.get_active.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_all_currencies_returns_repository_result(self, use_case, mock_currency_repository):
        """Test that currencies returned from repository are passed through."""
        # Arrange
        currency1 = MagicMock(sort_order=1)
        currency2 = MagicMock(sort_order=2)
        mock_currency_repository.get_active.return_value = [currency1, currency2]

        # Act
        result = await use_case.execute()

        # Assert
        assert len(result) == 2
        assert result[0] == currency1
        assert result[1] == currency2

    @pytest.mark.asyncio
    async def test_get_all_currencies_empty_list(self, use_case, mock_currency_repository):
        """Test getting currencies when none are active."""
        # Arrange
        mock_currency_repository.get_active.return_value = []

        # Act
        result = await use_case.execute()

        # Assert
        assert result == []
        assert len(result) == 0

    @pytest.mark.asyncio
    async def test_get_all_currencies_calls_repository_get_active(self, use_case, mock_currency_repository):
        """Test that execute() calls repository.get_active()."""
        # Arrange
        mock_currency_repository.get_active.return_value = []

        # Act
        await use_case.execute()

        # Assert
        mock_currency_repository.get_active.assert_called_once_with()

    def test_initialization_with_repository(self, mock_currency_repository):
        """Test use case initialization with repository."""
        use_case = GetAllCurrencies(mock_currency_repository)

        assert use_case.currency_repository is mock_currency_repository


class TestGetAllLanguages:
    """Test GetAllLanguages use case."""

    @pytest.fixture
    def mock_language_repository(self):
        """Create a mock language repository."""
        repository = MagicMock()
        repository.get_active = AsyncMock()
        return repository

    @pytest.fixture
    def use_case(self, mock_language_repository):
        """Create GetAllLanguages use case with mock repository."""
        return GetAllLanguages(mock_language_repository)

    @pytest.mark.asyncio
    async def test_get_all_languages(self, use_case, mock_language_repository):
        """Test getting all active languages."""
        # Arrange
        expected_languages = [MagicMock(), MagicMock(), MagicMock()]
        mock_language_repository.get_active.return_value = expected_languages

        # Act
        result = await use_case.execute()

        # Assert
        assert result == expected_languages
        mock_language_repository.get_active.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_all_languages_returns_repository_result(self, use_case, mock_language_repository):
        """Test that languages returned from repository are passed through."""
        # Arrange
        language1 = MagicMock(sort_order=1)
        language2 = MagicMock(sort_order=2)
        mock_language_repository.get_active.return_value = [language1, language2]

        # Act
        result = await use_case.execute()

        # Assert
        assert len(result) == 2
        assert result[0] == language1
        assert result[1] == language2

    @pytest.mark.asyncio
    async def test_get_all_languages_empty_list(self, use_case, mock_language_repository):
        """Test getting languages when none are active."""
        # Arrange
        mock_language_repository.get_active.return_value = []

        # Act
        result = await use_case.execute()

        # Assert
        assert result == []
        assert len(result) == 0

    @pytest.mark.asyncio
    async def test_get_all_languages_calls_repository_get_active(self, use_case, mock_language_repository):
        """Test that execute() calls repository.get_active()."""
        # Arrange
        mock_language_repository.get_active.return_value = []

        # Act
        await use_case.execute()

        # Assert
        mock_language_repository.get_active.assert_called_once_with()

    def test_initialization_with_repository(self, mock_language_repository):
        """Test use case initialization with repository."""
        use_case = GetAllLanguages(mock_language_repository)

        assert use_case.language_repository is mock_language_repository


class TestListContentByLanguage:
    """Test ListContentByLanguage use case."""

    @pytest.fixture
    def mock_content_repository(self):
        """Create a mock content repository."""
        repository = MagicMock()
        repository.list_by_language = AsyncMock()
        return repository

    @pytest.fixture
    def use_case(self, mock_content_repository):
        """Create ListContentByLanguage use case with mock repository."""
        return ListContentByLanguage(mock_content_repository)

    @pytest.mark.asyncio
    async def test_list_content_by_language(self, use_case, mock_content_repository):
        """Test listing content by language."""
        # Arrange
        expected_result = PaginatedResult(
            items=[],
            total=0,
            page=1,
            page_size=20
        )
        mock_content_repository.list_by_language.return_value = expected_result

        # Act
        result = await use_case.execute(language_code='en')

        # Assert
        assert result == expected_result
        mock_content_repository.list_by_language.assert_called_once_with('en', 1, 20)

    @pytest.mark.asyncio
    async def test_list_content_by_language_with_custom_pagination(self, use_case, mock_content_repository):
        """Test listing content with custom page and page_size."""
        # Arrange
        expected_result = PaginatedResult(
            items=[],
            total=0,
            page=3,
            page_size=50
        )
        mock_content_repository.list_by_language.return_value = expected_result

        # Act
        result = await use_case.execute(language_code='it', page=3, page_size=50)

        # Assert
        assert result.page == 3
        assert result.page_size == 50
        mock_content_repository.list_by_language.assert_called_once_with('it', 3, 50)

    @pytest.mark.asyncio
    async def test_list_content_by_language_default_pagination(self, use_case, mock_content_repository):
        """Test that default pagination is page=1, page_size=20."""
        # Arrange
        expected_result = PaginatedResult(
            items=[],
            total=0,
            page=1,
            page_size=20
        )
        mock_content_repository.list_by_language.return_value = expected_result

        # Act
        await use_case.execute(language_code='en')

        # Assert
        mock_content_repository.list_by_language.assert_called_once_with('en', 1, 20)

    @pytest.mark.asyncio
    async def test_list_content_by_language_different_languages(self, use_case, mock_content_repository):
        """Test listing content for different languages."""
        # Arrange
        mock_content_repository.list_by_language.return_value = PaginatedResult(
            items=[], total=0, page=1, page_size=20
        )

        # Act
        await use_case.execute(language_code='en')
        await use_case.execute(language_code='it')
        await use_case.execute(language_code='he')

        # Assert
        assert mock_content_repository.list_by_language.call_count == 3
        calls = mock_content_repository.list_by_language.call_args_list
        assert calls[0][0][0] == 'en'
        assert calls[1][0][0] == 'it'
        assert calls[2][0][0] == 'he'

    def test_initialization_with_repository(self, mock_content_repository):
        """Test use case initialization with repository."""
        use_case = ListContentByLanguage(mock_content_repository)

        assert use_case.content_repository is mock_content_repository
