# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
UserPreferences domain entity.

Reference: data-model.md:320-362
"""

from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4


@dataclass
class UserPreferences:
    """
    Stores user preferences for language prompts and currency selection.

    Business Rules:
    - expiresAt must be > updatedAt
    - sessionId is required (generated on first visit)
    - userId takes precedence over sessionId if both exist (logged-in user)
    - When currency changed, updatedAt and expiresAt refresh (extend TTL)
    - When language prompt dismissed, dismissedLanguagePrompt = true for session only
    """

    session_id: str
    selected_currency: str  # CurrencyCode
    dismissed_language_prompt: bool = False
    detected_language: str | None = None  # LanguageCode
    user_id: str | None = None
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC).replace(tzinfo=None))
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC).replace(tzinfo=None))
    expires_at: datetime = field(default_factory=lambda: datetime.now(UTC).replace(tzinfo=None) + timedelta(days=30))

    def __post_init__(self) -> None:
        """Run validation after initialization."""
        self.validate()

    def validate(self) -> None:
        """
        Validate business rules.

        Raises:
            ValueError: If any business rule is violated

        """
        # expiresAt must be > updatedAt
        if self.expires_at <= self.updated_at:
            raise ValueError("expiresAt must be greater than updatedAt")

        # sessionId is required
        if not self.session_id:
            raise ValueError("sessionId is required")

    def update_currency(self, currency_code: str) -> None:
        """
        Update selected currency and refresh TTL.

        Args:
            currency_code: New currency code to set

        """
        self.selected_currency = currency_code
        self.updated_at = datetime.now(UTC).replace(tzinfo=None)
        # Extend TTL by 30 days from now
        self.expires_at = self.updated_at + timedelta(days=30)

    def dismiss_language_prompt(self) -> None:
        """Mark language prompt as dismissed for this session."""
        self.dismissed_language_prompt = True
        self.updated_at = datetime.now(UTC).replace(tzinfo=None)
        # Extend TTL by 30 days from now
        self.expires_at = self.updated_at + timedelta(days=30)

    def is_expired(self) -> bool:
        """
        Check if preferences have expired.

        Returns:
            bool: True if current time is past expiresAt

        """
        return datetime.now(UTC).replace(tzinfo=None) > self.expires_at

    def get_effective_identifier(self) -> str:
        """
        Get the effective identifier (userId if logged in, otherwise sessionId).

        Returns:
            str: userId if present, otherwise sessionId

        """
        return self.user_id if self.user_id else self.session_id
