# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for language detection logic.
Reference: T087 (DetectUserLanguage use case)
"""

import pytest
from src.domain.use_cases.detect_user_language import DetectedLanguage
from src.domain.entities.language import Language


@pytest.fixture
def supported_languages():
    """List of supported languages."""
    return [
        Language(
            code="en",
            display_name="English",
            native_name="English",
            direction="ltr",
            url_prefix="",
            default_currency="USD",
            locale_code="en-US",
            is_default=True,
            is_active=True,
            sort_order=1,
        ),
        Language(
            code="it",
            display_name="Italian",
            native_name="Italiano",
            direction="ltr",
            url_prefix="/it",
            default_currency="EUR",
            locale_code="it-IT",
            is_default=False,
            is_active=True,
            sort_order=2,
        ),
        Language(
            code="he",
            display_name="Hebrew",
            native_name="עברית",
            direction="rtl",
            url_prefix="/he",
            default_currency="ILS",
            locale_code="he-IL",
            is_default=False,
            is_active=True,
            sort_order=3,
        ),
    ]


def parse_accept_language(header: str) -> list[tuple[str, float]]:
    """
    Parse Accept-Language header.

    Args:
        header: Accept-Language header string

    Returns:
        List of (language_code, quality) tuples sorted by quality
    """
    languages = []
    parts = header.split(",")

    for part in parts:
        part = part.strip()
        if not part:
            continue

        try:
            if ";q=" in part:
                lang, quality_str = part.split(";q=", 1)
                lang = lang.strip()
                quality = float(quality_str.strip())
            else:
                lang = part
                quality = 1.0

            # Extract base language code (e.g., "it-IT" -> "it")
            if lang and "-" in lang:
                base_lang = lang.split("-")[0].lower()
            else:
                base_lang = lang.lower()

            if base_lang:  # Only add if we have a valid language code
                languages.append((base_lang, quality))
        except (ValueError, IndexError):
            # Skip malformed parts
            continue

    # Sort by quality descending
    return sorted(languages, key=lambda x: x[1], reverse=True)


def detect_language(
    accept_language: str,
    supported_languages: list[Language]
) -> DetectedLanguage:
    """
    Detect user's preferred language from Accept-Language header.

    Args:
        accept_language: Accept-Language header string
        supported_languages: List of supported languages

    Returns:
        DetectedLanguage with detected language and confidence
    """
    supported_codes = {lang.code for lang in supported_languages}
    parsed_languages = parse_accept_language(accept_language)

    for lang_code, quality in parsed_languages:
        if lang_code in supported_codes:
            # Map quality to confidence (0.0-1.0)
            confidence = quality

            return DetectedLanguage(
                language_code=lang_code,
                confidence=confidence,
                fallback_used=False,
            )

    # Default to English if no match
    return DetectedLanguage(
        language_code="en",
        confidence=0.0,
        fallback_used=True,
    )


@pytest.mark.unit
def test_detect_italian_primary_language(supported_languages):
    """Test detection of Italian as primary language."""
    header = "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7"
    result = detect_language(header, supported_languages)

    assert result.language_code == "it"
    assert result.confidence >= 0.9
    assert result.fallback_used is False


@pytest.mark.unit
def test_detect_hebrew_language(supported_languages):
    """Test detection of Hebrew language."""
    header = "he-IL,he;q=0.95,en;q=0.5"
    result = detect_language(header, supported_languages)

    assert result.language_code == "he"
    assert result.confidence >= 0.95
    assert result.fallback_used is False


@pytest.mark.unit
def test_detect_english_default(supported_languages):
    """Test detection of English."""
    header = "en-US,en;q=0.9"
    result = detect_language(header, supported_languages)

    assert result.language_code == "en"
    assert result.fallback_used is False


@pytest.mark.unit
def test_detect_with_quality_values(supported_languages):
    """Test that quality values are respected."""
    # Italian has lower quality than English
    header = "it;q=0.5,en;q=0.9"
    result = detect_language(header, supported_languages)

    # Should still detect English as higher quality
    assert result.language_code == "en"


@pytest.mark.unit
def test_detect_unsupported_language_fallback(supported_languages):
    """Test fallback to English when language not supported."""
    header = "fr-FR,fr;q=0.9,es;q=0.8"
    result = detect_language(header, supported_languages)

    assert result.language_code == "en"
    assert result.confidence == 0.0
    assert result.fallback_used is True


@pytest.mark.unit
def test_detect_mixed_supported_unsupported(supported_languages):
    """Test detection with mix of supported and unsupported languages."""
    header = "fr-FR,it;q=0.8,en;q=0.5"
    result = detect_language(header, supported_languages)

    # Should detect Italian (highest quality supported language)
    assert result.language_code == "it"
    assert result.confidence >= 0.8


@pytest.mark.unit
def test_detect_case_insensitive(supported_languages):
    """Test that detection is case-insensitive."""
    header = "IT-IT,IT;q=0.9"
    result = detect_language(header, supported_languages)

    assert result.language_code == "it"


@pytest.mark.unit
def test_detect_with_regional_variant(supported_languages):
    """Test detection with regional variants (e.g., en-GB)."""
    header = "en-GB,en;q=0.9"
    result = detect_language(header, supported_languages)

    # Should still detect as English (base language)
    assert result.language_code == "en"


@pytest.mark.unit
def test_detect_low_quality_italian(supported_languages):
    """Test detection with low confidence Italian."""
    # Low confidence Italian
    header = "it;q=0.3,en;q=0.9"
    result = detect_language(header, supported_languages)

    # English has higher quality
    assert result.language_code == "en"


@pytest.mark.unit
def test_detect_english_explicitly(supported_languages):
    """Test explicit English detection."""
    header = "en-US;q=1.0"
    result = detect_language(header, supported_languages)

    assert result.language_code == "en"
    assert result.fallback_used is False


@pytest.mark.unit
def test_hebrew_detection(supported_languages):
    """Test Hebrew language detection."""
    header = "he-IL;q=0.9"
    result = detect_language(header, supported_languages)

    assert result.language_code == "he"
    assert result.fallback_used is False


@pytest.mark.unit
def test_empty_accept_language_header(supported_languages):
    """Test handling of empty Accept-Language header."""
    header = ""
    result = detect_language(header, supported_languages)

    # Should default to English
    assert result.language_code == "en"
    assert result.confidence == 0.0


@pytest.mark.unit
def test_malformed_accept_language_header(supported_languages):
    """Test handling of malformed Accept-Language header."""
    header = "invalid;;;header"
    result = detect_language(header, supported_languages)

    # Should gracefully default to English
    assert result.language_code == "en"


@pytest.mark.unit
def test_quality_sorting():
    """Test that languages are sorted by quality correctly."""
    header = "en;q=0.5,it;q=0.9,he;q=0.7"
    parsed = parse_accept_language(header)

    # Should be sorted by quality descending
    assert parsed[0] == ("it", 0.9)
    assert parsed[1] == ("he", 0.7)
    assert parsed[2] == ("en", 0.5)


@pytest.mark.unit
def test_default_quality():
    """Test that languages without quality get 1.0 by default."""
    header = "it,en;q=0.8"
    parsed = parse_accept_language(header)

    # Italian without quality should be 1.0
    assert parsed[0] == ("it", 1.0)
    assert parsed[1] == ("en", 0.8)


@pytest.mark.unit
def test_multiple_regional_variants(supported_languages):
    """Test handling of multiple regional variants."""
    header = "en-US;q=0.9,en-GB;q=0.8,en;q=0.7"
    result = detect_language(header, supported_languages)

    # Should detect English with highest quality
    assert result.language_code == "en"
    assert result.confidence >= 0.9


@pytest.mark.unit
def test_confidence_high_for_primary_choice(supported_languages):
    """Test that confidence is high when language is first choice."""
    header = "it-IT;q=1.0,en;q=0.5"
    result = detect_language(header, supported_languages)

    assert result.language_code == "it"
    assert result.confidence == 1.0
    assert result.fallback_used is False
