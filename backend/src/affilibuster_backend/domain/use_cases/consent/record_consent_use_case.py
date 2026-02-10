# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Use case for recording consent events.

Creates an immutable consent record for GDPR audit trail.
"""

from uuid import UUID

from affilibuster_backend.domain.entities.generated.models import (
    RecordConsentRequest,
    RecordConsentResponse,
)
from affilibuster_backend.domain.repositories.consent_repository import IConsentRepository


class RecordConsentUseCase:
    """
    Records a user's consent decision.

    Creates an immutable audit trail entry capturing the consent action,
    selected categories, and request metadata.
    """

    def __init__(self, consent_repository: IConsentRepository) -> None:
        """
        Initialize the use case with a consent repository.

        Args:
            consent_repository: Repository for persisting consent records.

        """
        self._consent_repository = consent_repository

    async def execute(
        self,
        *,
        consent_request: RecordConsentRequest,
        user_id: UUID | None = None,
        session_id: str | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> RecordConsentResponse:
        """
        Execute the consent recording.

        Args:
            consent_request: The consent data to record.
            user_id: Authenticated user's ID (None for anonymous users).
            session_id: Anonymous session identifier.
            ip_address: Client IP address for audit trail.
            user_agent: Client user agent string for audit trail.

        Returns:
            RecordConsentResponse with the created consent record ID.

        """
        consent_id = await self._consent_repository.create(
            consent_request=consent_request,
            user_id=user_id,
            session_id=session_id,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return RecordConsentResponse(
            success=True,
            consent_id=consent_id,
            message="Consent recorded successfully",
        )
