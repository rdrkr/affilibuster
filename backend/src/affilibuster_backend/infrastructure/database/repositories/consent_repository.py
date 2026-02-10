# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Consent repository implementation.

Persists consent records to PostgreSQL for GDPR audit trail.
"""

import uuid as uuid_module
from typing import Any

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from affilibuster_backend.domain.entities.generated.models import RecordConsentRequest
from affilibuster_backend.domain.repositories.consent_repository import IConsentRepository
from affilibuster_backend.infrastructure.database.models.consent_record import ConsentRecordModel


class ConsentRepository(IConsentRepository):
    """
    PostgreSQL implementation of the consent repository.

    Stores consent records as immutable rows in the consent_records table.
    """

    def __init__(self, session: AsyncSession) -> None:
        """
        Initialize the repository with a database session.

        Args:
            session: The async database session for persistence operations.

        """
        self._session = session

    async def create(
        self,
        *,
        consent_request: RecordConsentRequest,
        user_id: uuid_module.UUID | None = None,
        session_id: str | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> uuid_module.UUID:
        """
        Create a new consent record in the database.

        Args:
            consent_request: The consent data to record.
            user_id: Authenticated user's ID (None for anonymous users).
            session_id: Anonymous session identifier.
            ip_address: Client IP address for audit trail.
            user_agent: Client user agent string for audit trail.

        Returns:
            The UUID of the newly created consent record.

        """
        record = ConsentRecordModel(
            id=uuid_module.uuid4(),
            user_id=user_id,
            session_id=session_id,
            consent_type=consent_request.consent_type.value,
            categories=consent_request.categories.model_dump(),
            action=consent_request.action.value,
            ip_address=ip_address,
            user_agent=user_agent,
            consent_version=consent_request.consent_version,
        )

        self._session.add(record)
        await self._session.commit()
        await self._session.refresh(record)

        return record.id

    async def get_latest_by_session(self, session_id: str) -> dict[str, Any] | None:
        """
        Get the most recent consent record for a session.

        Args:
            session_id: The session identifier.

        Returns:
            The latest consent record as a dict, or None if no records found.

        """
        stmt = (
            select(ConsentRecordModel)
            .where(ConsentRecordModel.session_id == session_id)
            .order_by(ConsentRecordModel.created_at.desc())
            .limit(1)
        )
        result = await self._session.execute(stmt)
        record = result.scalar_one_or_none()

        if record is None:
            return None

        return self._to_dict(record)

    async def get_latest_by_user(self, user_id: uuid_module.UUID) -> dict[str, Any] | None:
        """
        Get the most recent consent record for a user.

        Args:
            user_id: The user's UUID.

        Returns:
            The latest consent record as a dict, or None if no records found.

        """
        stmt = (
            select(ConsentRecordModel)
            .where(ConsentRecordModel.user_id == user_id)
            .order_by(ConsentRecordModel.created_at.desc())
            .limit(1)
        )
        result = await self._session.execute(stmt)
        record = result.scalar_one_or_none()

        if record is None:
            return None

        return self._to_dict(record)

    async def get_all_by_user_id(self, user_id: uuid_module.UUID) -> list[dict[str, Any]]:
        """
        Get all consent records for a user (for DSAR export).

        Args:
            user_id: The user's UUID.

        Returns:
            All consent records for the user, ordered by creation date descending.

        """
        stmt = (
            select(ConsentRecordModel)
            .where(ConsentRecordModel.user_id == user_id)
            .order_by(ConsentRecordModel.created_at.desc())
        )
        result = await self._session.execute(stmt)
        records = result.scalars().all()

        return [self._to_dict(record) for record in records]

    async def anonymize_by_user_id(self, user_id: uuid_module.UUID) -> int:
        """
        Anonymize all consent records for a user by setting user_id to NULL.

        Preserves the audit trail while removing PII, per GDPR Art. 17(3)(e).

        Args:
            user_id: The user's UUID to anonymize.

        Returns:
            The number of records anonymized.

        """
        stmt = update(ConsentRecordModel).where(ConsentRecordModel.user_id == user_id).values(user_id=None)
        result = await self._session.execute(stmt)
        await self._session.commit()

        return result.rowcount or 0  # type: ignore[attr-defined]

    @staticmethod
    def _to_dict(record: ConsentRecordModel) -> dict[str, Any]:
        """
        Convert a ConsentRecordModel to a dictionary.

        Args:
            record: The SQLAlchemy model instance.

        Returns:
            A dictionary representation of the consent record.

        """
        return {
            "id": record.id,
            "user_id": record.user_id,
            "session_id": record.session_id,
            "consent_type": record.consent_type,
            "categories": record.categories,
            "action": record.action,
            "ip_address": record.ip_address,
            "user_agent": record.user_agent,
            "consent_version": record.consent_version,
            "created_at": record.created_at,
        }
