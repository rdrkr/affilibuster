# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Session repository implementation using SQLAlchemy.

Implements ISessionRepository interface with PostgreSQL persistence.
"""

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from affilibuster_backend.domain.entities.user_session import UserSession
from affilibuster_backend.domain.repositories.session_repository import ISessionRepository
from affilibuster_backend.infrastructure.database.models.user_session import UserSessionModel


class SessionRepository(ISessionRepository):
    """PostgreSQL implementation of ISessionRepository."""

    def __init__(self, session: AsyncSession) -> None:
        """
        Initialize repository with SQLAlchemy session.

        Args:
            session: The async SQLAlchemy session for database operations.
        """
        self.session = session

    async def create(self, session_entity: UserSession) -> UserSession:
        """Create a new session in the database."""
        # Convert timezone-aware datetimes to naive
        expires_at_naive = session_entity.expires_at.replace(tzinfo=None)
        created_at_naive = session_entity.created_at.replace(tzinfo=None)

        model = UserSessionModel(
            id=session_entity.id,
            user_id=session_entity.user_id,
            token_hash=session_entity.token_hash,
            expires_at=expires_at_naive,
            remember_me=session_entity.remember_me,
            created_at=created_at_naive,
        )

        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)

        return self._to_entity(model)

    async def get_by_id(self, session_id: UUID) -> UserSession | None:
        """Retrieve a session by its unique identifier."""
        stmt = select(UserSessionModel).where(UserSessionModel.id == session_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_token_hash(self, token_hash: str) -> UserSession | None:
        """Retrieve a session by its token hash."""
        stmt = select(UserSessionModel).where(UserSessionModel.token_hash == token_hash)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_active_sessions_by_user_id(self, user_id: UUID) -> list[UserSession]:
        """Retrieve all active (non-expired) sessions for a user."""
        now_naive = datetime.now(UTC).replace(tzinfo=None)
        stmt = select(UserSessionModel).where(
            UserSessionModel.user_id == user_id, UserSessionModel.expires_at > now_naive
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    async def update(self, session_entity: UserSession) -> UserSession:
        """Update an existing session in the database."""
        stmt = select(UserSessionModel).where(UserSessionModel.id == session_entity.id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()

        if not model:
            raise ValueError(f"Session with ID {session_entity.id} does not exist")

        # Update fields (convert timezone-aware to naive)
        model.token_hash = session_entity.token_hash
        model.expires_at = session_entity.expires_at.replace(tzinfo=None)
        model.remember_me = session_entity.remember_me

        await self.session.commit()
        await self.session.refresh(model)

        return self._to_entity(model)

    async def delete(self, session_id: UUID) -> None:
        """Delete a session from the database."""
        stmt = delete(UserSessionModel).where(UserSessionModel.id == session_id)
        result = await self.session.execute(stmt)

        if result.rowcount == 0:  # type: ignore[attr-defined]
            raise ValueError(f"Session with ID {session_id} does not exist")

        await self.session.commit()

    async def delete_all_by_user_id(self, user_id: UUID) -> None:
        """Delete all sessions for a specific user."""
        stmt = delete(UserSessionModel).where(UserSessionModel.user_id == user_id)
        await self.session.execute(stmt)
        await self.session.commit()

    async def delete_expired_sessions(self) -> int:
        """Delete all expired sessions from the database."""
        now_naive = datetime.now(UTC).replace(tzinfo=None)
        stmt = delete(UserSessionModel).where(UserSessionModel.expires_at <= now_naive)
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.rowcount or 0  # type: ignore[attr-defined]

    def _to_entity(self, model: UserSessionModel) -> UserSession:
        """
        Convert SQLAlchemy model to domain entity.

        Args:
            model: The UserSessionModel to convert.

        Returns:
            UserSession domain entity with timezone-aware datetimes.
        """
        # Ensure datetimes are timezone-aware
        expires_at = model.expires_at if model.expires_at.tzinfo else model.expires_at.replace(tzinfo=UTC)
        created_at = model.created_at if model.created_at.tzinfo else model.created_at.replace(tzinfo=UTC)

        return UserSession(
            id=model.id,
            user_id=model.user_id,
            token_hash=model.token_hash,
            expires_at=expires_at,
            remember_me=model.remember_me,
            created_at=created_at,
        )
