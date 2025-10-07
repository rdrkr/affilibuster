# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
DetectUserLanguage use case.

Reference: plan.md:110, quickstart.md:105-121
"""

from dataclasses import dataclass
from typing import Optional, List, Tuple
from src.domain.repositories.language_repository import ILanguageRepository


@dataclass
class DetectedLanguage:
    """Result of language detection."""
    language_code: str
    confidence: float
    fallback_used: bool = False


class DetectUserLanguage:
    """
    Use case for detecting user language from Accept-Language header.

    Parses Accept-Language header and matches to supported languages.
    """

    def __init__(self, language_repository: ILanguageRepository):
        """
        Initialize use case with repository.

        Args:
            language_repository: Language repository implementation
        """
        self.language_repository = language_repository

    async def execute(
        self,
        accept_language: Optional[str] = None,
        user_agent: Optional[str] = None,
        country_code: Optional[str] = None,
    ) -> DetectedLanguage:
        """
        Detect user language from various signals.

        Args:
            accept_language: Accept-Language header (e.g., "it-IT,it;q=0.9,en;q=0.8")
            user_agent: User-Agent header (currently not used)
            country_code: Country code from IP geolocation (currently not used)

        Returns:
            DetectedLanguage: Detected language with confidence score
        """
        # Get supported languages
        supported_languages = await self.language_repository.get_active()
        supported_codes = {lang.code for lang in supported_languages}

        # Parse Accept-Language header
        if accept_language:
            preferences = self._parse_accept_language(accept_language)

            # Find best match
            for lang_code, quality in preferences:
                # Extract base language code (e.g., "it" from "it-IT")
                base_code = lang_code.split('-')[0].lower()

                if base_code in supported_codes:
                    return DetectedLanguage(
                        language_code=base_code,
                        confidence=quality,
                        fallback_used=False
                    )

        # Fallback to default language (English)
        default_lang = await self.language_repository.get_default()
        return DetectedLanguage(
            language_code=default_lang.code,
            confidence=0.5,
            fallback_used=True
        )

    def _parse_accept_language(self, header: str) -> List[Tuple[str, float]]:
        """
        Parse Accept-Language header into list of (language, quality) tuples.

        Args:
            header: Accept-Language header value

        Returns:
            List[Tuple[str, float]]: Languages with quality scores, sorted by quality (desc)
        """
        preferences = []

        for part in header.split(','):
            part = part.strip()
            if not part:
                continue

            # Split language and quality
            if ';q=' in part:
                lang, quality_str = part.split(';q=')
                try:
                    quality = float(quality_str)
                except ValueError:
                    quality = 1.0
            else:
                lang = part
                quality = 1.0

            preferences.append((lang.strip(), quality))

        # Sort by quality (descending)
        preferences.sort(key=lambda x: x[1], reverse=True)
        return preferences
