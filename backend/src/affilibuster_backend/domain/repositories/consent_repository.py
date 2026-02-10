# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Consent repository interface.

Defines the contract for persisting and querying consent records.
"""

from abc import ABC, abstractmethod
from typing import Any
from uuid import UUID

from affilibuster_backend.domain.entities.generated.models import RecordConsentRequest


class IConsentRepository(ABC):
    """
    Repository interface for consent record persistence.

    Provides methods for creating and querying GDPR consent records.
    All consent records are immutable (append-only) for audit compliance.
    """

    @abstractmethod
    async def create(
        self,
        *,
        consent_request: RecordConsentRequest,
        user_id: UUID | None = None,
        session_id: str | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> UUID:
        """
        Create a new consent record.

        Args:
            consent_request: The consent data to record.
            user_id: Authenticated user's ID (None for anonymous users).
            session_id: Anonymous session identifier.
            ip_address: Client IP address for audit trail.
            user_agent: Client user agent string for audit trail.

        Returns:
            The UUID of the newly created consent record.

        """

    @abstractmethod
    async def get_latest_by_session(self, session_id: str) -> dict[str, Any] | None:
        """
        Get the most recent consent record for a session.

        Args:
            session_id: The session identifier.

        Returns:
            The latest consent record as a dict, or None if no records found.

        """

    @abstractmethod
    async def get_latest_by_user(self, user_id: UUID) -> dict[str, Any] | None:
        """
        Get the most recent consent record for a user.

        Args:
            user_id: The user's UUID.

        Returns:
            The latest consent record as a dict, or None if no records found.

        """

    @abstractmethod
    async def get_all_by_user_id(self, user_id: UUID) -> list[dict[str, Any]]:
        """
        Get all consent records for a user (for DSAR export).

        Args:
            user_id: The user's UUID.

        Returns:
            All consent records for the user, ordered by creation date descending.

        """

    @abstractmethod
    async def anonymize_by_user_id(self, user_id: UUID) -> int:
        """
        Anonymize all consent records for a user by setting user_id to NULL.

        Preserves the audit trail while removing PII, per GDPR Art. 17(3)(e).

        Args:
            user_id: The user's UUID to anonymize.

        Returns:
            The number of records anonymized.

        """
