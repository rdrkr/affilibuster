# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for DetectUserLanguage use case.

Covers:
- Accept-Language header parsing
- Language detection with quality scores
- Fallback to default language
- Edge cases and boundary conditions
"""

import pytest
from unittest.mock import AsyncMock, MagicMock

from src.domain.use_cases.detect_user_language import DetectUserLanguage, DetectedLanguage


class TestDetectUserLanguage:
    """Test DetectUserLanguage use case."""

    @pytest.fixture
    def mock_language_repository(self):
        """Create mock language repository."""
        repository = MagicMock()
        repository.get_active = AsyncMock()
        repository.get_default = AsyncMock()
        return repository

    @pytest.fixture
    def use_case(self, mock_language_repository):
        """Create DetectUserLanguage use case."""
        return DetectUserLanguage(mock_language_repository)

    @pytest.fixture
    def mock_languages(self):
        """Create mock supported languages."""
        en = MagicMock()
        en.code = 'en'

        it = MagicMock()
        it.code = 'it'

        he = MagicMock()
        he.code = 'he'

        return [en, it, he]

    @pytest.fixture
    def mock_default_language(self):
        """Create mock default language (English)."""
        lang = MagicMock()
        lang.code = 'en'
        return lang

    @pytest.mark.asyncio
    async def test_detect_italian_from_accept_language(self, use_case, mock_language_repository, mock_languages, mock_default_language):
        """Test detecting Italian from Accept-Language header."""
        # Arrange
        mock_language_repository.get_active.return_value = mock_languages
        mock_language_repository.get_default.return_value = mock_default_language

        # Act
        result = await use_case.execute(accept_language='it-IT,it;q=0.9,en;q=0.8')

        # Assert
        assert result.language_code == 'it'
        assert result.confidence == 1.0
        assert result.fallback_used is False

    @pytest.mark.asyncio
    async def test_detect_with_quality_scores(self, use_case, mock_language_repository, mock_languages, mock_default_language):
        """Test that highest quality language is selected."""
        # Arrange
        mock_language_repository.get_active.return_value = mock_languages
        mock_language_repository.get_default.return_value = mock_default_language

        # Act - en has highest quality (0.9), it has 0.8
        result = await use_case.execute(accept_language='it;q=0.8,en;q=0.9')

        # Assert
        assert result.language_code == 'en'
        assert result.confidence == 0.9

    @pytest.mark.asyncio
    async def test_detect_extracts_base_language_code(self, use_case, mock_language_repository, mock_languages, mock_default_language):
        """Test that base language code is extracted from locale (e.g., 'it' from 'it-IT')."""
        # Arrange
        mock_language_repository.get_active.return_value = mock_languages
        mock_language_repository.get_default.return_value = mock_default_language

        # Act
        result = await use_case.execute(accept_language='it-IT')

        # Assert
        assert result.language_code == 'it'

    @pytest.mark.asyncio
    async def test_fallback_to_default_when_no_match(self, use_case, mock_language_repository, mock_languages, mock_default_language):
        """Test fallback to default language when no supported language matches."""
        # Arrange
        mock_language_repository.get_active.return_value = mock_languages
        mock_language_repository.get_default.return_value = mock_default_language

        # Act - Request French, which is not supported
        result = await use_case.execute(accept_language='fr-FR,fr;q=0.9')

        # Assert
        assert result.language_code == 'en'
        assert result.confidence == 0.5
        assert result.fallback_used is True

    @pytest.mark.asyncio
    async def test_fallback_when_no_accept_language_header(self, use_case, mock_language_repository, mock_languages, mock_default_language):
        """Test fallback to default when Accept-Language header is not provided."""
        # Arrange
        mock_language_repository.get_active.return_value = mock_languages
        mock_language_repository.get_default.return_value = mock_default_language

        # Act
        result = await use_case.execute(accept_language=None)

        # Assert
        assert result.language_code == 'en'
        assert result.fallback_used is True

    @pytest.mark.asyncio
    async def test_detect_case_insensitive(self, use_case, mock_language_repository, mock_languages, mock_default_language):
        """Test that language detection is case-insensitive."""
        # Arrange
        mock_language_repository.get_active.return_value = mock_languages
        mock_language_repository.get_default.return_value = mock_default_language

        # Act - uppercase language codes
        result = await use_case.execute(accept_language='IT-IT')

        # Assert
        assert result.language_code == 'it'

    @pytest.mark.asyncio
    async def test_parse_accept_language_with_multiple_languages(self, use_case):
        """Test parsing Accept-Language header with multiple languages."""
        # Act
        preferences = use_case._parse_accept_language('it-IT,it;q=0.9,en;q=0.8,he;q=0.7')

        # Assert
        assert len(preferences) == 4
        assert preferences[0] == ('it-IT', 1.0)
        assert preferences[1] == ('it', 0.9)
        assert preferences[2] == ('en', 0.8)
        assert preferences[3] == ('he', 0.7)

    @pytest.mark.asyncio
    async def test_parse_accept_language_sorts_by_quality(self, use_case):
        """Test that parsed languages are sorted by quality score (descending)."""
        # Act
        preferences = use_case._parse_accept_language('en;q=0.5,it;q=0.9,he;q=0.7')

        # Assert
        assert preferences[0][1] == 0.9  # Italian highest
        assert preferences[1][1] == 0.7  # Hebrew second
        assert preferences[2][1] == 0.5  # English lowest

    @pytest.mark.asyncio
    async def test_parse_accept_language_defaults_quality_to_1(self, use_case):
        """Test that languages without explicit quality default to 1.0."""
        # Act
        preferences = use_case._parse_accept_language('it-IT,en;q=0.8')

        # Assert
        assert preferences[0] == ('it-IT', 1.0)  # No q= means 1.0
        assert preferences[1] == ('en', 0.8)

    @pytest.mark.asyncio
    async def test_parse_accept_language_handles_invalid_quality(self, use_case):
        """Test that invalid quality scores default to 1.0."""
        # Act
        preferences = use_case._parse_accept_language('it;q=invalid,en;q=0.8')

        # Assert
        assert preferences[0] == ('it', 1.0)  # Invalid quality defaults to 1.0

    @pytest.mark.asyncio
    async def test_parse_accept_language_handles_whitespace(self, use_case):
        """Test that extra whitespace is handled correctly."""
        # Act
        preferences = use_case._parse_accept_language('  it-IT  ,  en;q=0.8  ')

        # Assert
        assert preferences[0] == ('it-IT', 1.0)
        assert preferences[1] == ('en', 0.8)

    @pytest.mark.asyncio
    async def test_parse_accept_language_ignores_empty_parts(self, use_case):
        """Test that empty parts in header are ignored."""
        # Act
        preferences = use_case._parse_accept_language('it-IT,,en;q=0.8')

        # Assert
        assert len(preferences) == 2  # Empty part ignored

    @pytest.mark.asyncio
    async def test_detect_hebrew_rtl_language(self, use_case, mock_language_repository, mock_languages, mock_default_language):
        """Test detecting Hebrew (RTL language)."""
        # Arrange
        mock_language_repository.get_active.return_value = mock_languages
        mock_language_repository.get_default.return_value = mock_default_language

        # Act
        result = await use_case.execute(accept_language='he-IL,he;q=0.9')

        # Assert
        assert result.language_code == 'he'
        assert result.fallback_used is False

    @pytest.mark.asyncio
    async def test_initialization_with_repository(self, mock_language_repository):
        """Test use case initialization."""
        use_case = DetectUserLanguage(mock_language_repository)
        assert use_case.language_repository is mock_language_repository

    @pytest.mark.asyncio
    async def test_detect_first_supported_language_wins(self, use_case, mock_language_repository, mock_languages, mock_default_language):
        """Test that first supported language in sorted list is selected."""
        # Arrange
        mock_language_repository.get_active.return_value = mock_languages
        mock_language_repository.get_default.return_value = mock_default_language

        # Act - Both it and en supported, it has higher quality
        result = await use_case.execute(accept_language='it;q=0.9,en;q=0.8')

        # Assert
        assert result.language_code == 'it'

    @pytest.mark.asyncio
    async def test_user_agent_parameter_accepted(self, use_case, mock_language_repository, mock_languages, mock_default_language):
        """Test that user_agent parameter is accepted (even if not used)."""
        # Arrange
        mock_language_repository.get_active.return_value = mock_languages
        mock_language_repository.get_default.return_value = mock_default_language

        # Act
        result = await use_case.execute(
            accept_language='it-IT',
            user_agent='Mozilla/5.0'
        )

        # Assert
        assert result.language_code == 'it'

    @pytest.mark.asyncio
    async def test_country_code_parameter_accepted(self, use_case, mock_language_repository, mock_languages, mock_default_language):
        """Test that country_code parameter is accepted (even if not used)."""
        # Arrange
        mock_language_repository.get_active.return_value = mock_languages
        mock_language_repository.get_default.return_value = mock_default_language

        # Act
        result = await use_case.execute(
            accept_language='it-IT',
            country_code='IT'
        )

        # Assert
        assert result.language_code == 'it'
